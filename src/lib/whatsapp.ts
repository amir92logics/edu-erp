import { Client, LocalAuth } from "whatsapp-web.js";
import { db } from "./db";
import qrcode from "qrcode";

// Global cache for WhatsApp clients to persist across HMR in dev
const clients: Record<string, Client> = (global as { whatsappClients?: Record<string, Client> }).whatsappClients || {};
(global as { whatsappClients?: Record<string, Client> }).whatsappClients = clients;

export async function getWhatsAppStatus(schoolId: string) {
    const session = await db.whatsAppSession.findFirst({
        where: { schoolId }
    });
    return session?.status || "DISCONNECTED";
}

export async function initializeWhatsApp(schoolId: string) {
    if (clients[schoolId]) {
        try {
            await clients[schoolId].destroy();
        } catch (e) { }
        delete clients[schoolId];
    }

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: schoolId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    clients[schoolId] = client;

    client.on('qr', async (qr) => {
        const qrImage = await qrcode.toDataURL(qr);
        await db.whatsAppSession.upsert({
            where: { id: schoolId }, // Using schoolId as session ID for unique constraint check
            update: { qrCode: qrImage, status: "WAITING_FOR_SCAN" },
            create: { id: schoolId, schoolId, qrCode: qrImage, status: "WAITING_FOR_SCAN" }
        });
    });

    client.on('ready', async () => {
        await db.whatsAppSession.update({
            where: { id: schoolId },
            data: { status: "CONNECTED", qrCode: null }
        });
        console.log(`WhatsApp Ready for school: ${schoolId}`);
    });

    client.on('disconnected', async () => {
        await db.whatsAppSession.update({
            where: { id: schoolId },
            data: { status: "DISCONNECTED", qrCode: null }
        });
        delete clients[schoolId];
    });

    client.initialize().catch(async (err) => {
        console.error("WhatsApp Init Error:", err);
        await db.whatsAppSession.update({
            where: { id: schoolId },
            data: { status: "DISCONNECTED" }
        });
    });

    return { success: true };
}

export async function sendWhatsAppMessage(schoolId: string, phone: string, message: string) {
    const client = clients[schoolId];
    if (!client) {
        // Try to re-init if not running but supposed to be
        const session = await db.whatsAppSession.findFirst({ where: { schoolId } });
        if (session?.status === "CONNECTED") {
            // Re-initializing might take time, messaging will fail this time
            return { success: false, error: "Session re-initializing. Peer is offline." };
        }
        return { success: false, error: "WhatsApp not connected." };
    }

    try {
        // Format phone: remove leading +, 0, and ensure it's in international format
        let formattedPhone = phone.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "92" + formattedPhone.substring(1); // Default to PK
        }

        const chatId = `${formattedPhone}@c.us`;
        await client.sendMessage(chatId, message);
        return { success: true };
    } catch (err) {
        console.error("WhatsApp Send Error:", err);
        return { success: false, error: "Message failed." };
    }
}
