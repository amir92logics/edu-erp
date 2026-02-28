import { Client, LocalAuth } from "whatsapp-web.js";
import { db } from "./db";
import qrcode from "qrcode";
import path from "path";

// Global cache for WhatsApp clients to persist across HMR in dev
const clients: Record<string, Client> = (global as { whatsappClients?: Record<string, Client> }).whatsappClients || {};
(global as { whatsappClients?: Record<string, Client> }).whatsappClients = clients;

export async function getWhatsAppStatus(schoolId: string) {
    const session = await db.whatsAppSession.findUnique({
        where: { schoolId }
    });
    return session?.status || "DISCONNECTED";
}

export async function initializeWhatsApp(schoolId: string) {
    if (clients[schoolId]) {
        console.log(`[WhatsApp] Destroying existing client for ${schoolId}`);
        try {
            await clients[schoolId].destroy();
        } catch (e) {
            console.error(`[WhatsApp] Error destroying client:`, e);
        }
        delete clients[schoolId];
    }

    console.log(`[WhatsApp] Initializing for school: ${schoolId}`);

    const dataPath = path.resolve(process.cwd(), '.wwebjs_auth');
    console.log(`[WhatsApp] Auth path: ${dataPath}`);

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: schoolId,
            dataPath: dataPath
        }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js'
        },
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ]
        }
    });

    clients[schoolId] = client;

    // Safety timeout: if no QR/ready in 2 mins, set status to disconnected
    const timeout = setTimeout(async () => {
        const currentSession = await db.whatsAppSession.findUnique({ where: { schoolId } });
        if (currentSession?.status === "INITIALIZING") {
            console.error(`[WhatsApp] Initialization timed out for ${schoolId}`);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "DISCONNECTED" }
            });
            try { await client.destroy(); } catch (e) { }
            delete clients[schoolId];
        }
    }, 120000);

    client.on('qr', async (qr) => {
        clearTimeout(timeout);
        console.log(`[WhatsApp] QR Code RECEIVED for ${schoolId}`);
        try {
            const qrImage = await qrcode.toDataURL(qr);
            await db.whatsAppSession.upsert({
                where: { schoolId },
                update: { qrCode: qrImage, status: "WAITING_FOR_SCAN" },
                create: { schoolId, qrCode: qrImage, status: "WAITING_FOR_SCAN" }
            });
            console.log(`[WhatsApp] QR Code SAVED to DB for ${schoolId}`);
        } catch (err) {
            console.error("[WhatsApp] Error saving QR Code:", err);
        }
    });

    client.on('ready', async () => {
        clearTimeout(timeout);
        console.log(`[WhatsApp] Client is READY for school: ${schoolId}`);
        await db.whatsAppSession.update({
            where: { schoolId },
            data: { status: "CONNECTED", qrCode: null }
        });
    });

    client.on('authenticated', () => {
        console.log(`[WhatsApp] AUTHENTICATED for ${schoolId}`);
    });

    client.on('auth_failure', async (msg) => {
        clearTimeout(timeout);
        console.error(`[WhatsApp] AUTH FAILURE for ${schoolId}:`, msg);
        await db.whatsAppSession.update({
            where: { schoolId },
            data: { status: "DISCONNECTED", qrCode: null }
        });
    });

    client.on('disconnected', async (reason) => {
        console.log(`[WhatsApp] DISCONNECTED for ${schoolId}:`, reason);
        await db.whatsAppSession.update({
            where: { schoolId },
            data: { status: "DISCONNECTED", qrCode: null }
        });
        delete clients[schoolId];
    });

    console.log(`[WhatsApp] Calling client.initialize() for ${schoolId}...`);
    client.initialize().then(() => {
        console.log(`[WhatsApp] client.initialize() resolved for ${schoolId}`);
    }).catch(async (err) => {
        clearTimeout(timeout);
        console.error("[WhatsApp] Initialization Error:", err);
        await db.whatsAppSession.update({
            where: { schoolId },
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
