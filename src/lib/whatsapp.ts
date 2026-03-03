import { Client, RemoteAuth } from "whatsapp-web.js";
import { db } from "./db";
import qrcode from "qrcode";
import mongoose from "mongoose";
import { MongoStore } from "wwebjs-mongo";

// Global cache for WhatsApp clients to persist across HMR in dev
const clients: Record<string, Client> = (global as { whatsappClients?: Record<string, Client> }).whatsappClients || {};
(global as { whatsappClients?: Record<string, Client> }).whatsappClients = clients;

// Ensure MongoDB is connected for RemoteAuth if using MongoDB
let storePromise: Promise<any> | null = null;
async function getMongoStore() {
    if (!process.env.MONGODB_URI) {
        console.warn("[WhatsApp] MONGODB_URI not found. RemoteAuth may fail in production.");
        return null;
    }

    if (!storePromise) {
        storePromise = (async () => {
            // Check if already connected to avoid re-connecting
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(process.env.MONGODB_URI!);
            }
            return new MongoStore({ mongoose: mongoose });
        })();
    }
    return storePromise;
}

export async function getWhatsAppStatus(schoolId: string) {
    const session = await db.whatsAppSession.findUnique({
        where: { schoolId }
    });
    return session?.status || "DISCONNECTED";
}

export async function initializeWhatsApp(schoolId: string) {
    // If a client already exists, we should probably check its state.
    // To be safe and ensure "Link New Session" always works, we'll destroy and recreate.
    if (clients[schoolId]) {
        console.log(`[WhatsApp] Existing client found for school ${schoolId}. Destroying for fresh start.`);
        try {
            await clients[schoolId].destroy();
        } catch (e) {
            console.error(`[WhatsApp] Error destroying existing client:`, e);
        }
        delete clients[schoolId];
    }

    console.log(`[WhatsApp] Starting initialization for school: ${schoolId}. Node: ${process.version}, fetch: ${typeof fetch}`);

    // Set initial status to INITIALIZING in DB
    await db.whatsAppSession.upsert({
        where: { schoolId },
        update: { status: "INITIALIZING", qrCode: null },
        create: { schoolId, status: "INITIALIZING" }
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const store = await getMongoStore();

    try {
        const client = new Client({
            authStrategy: store ? new RemoteAuth({
                clientId: schoolId,
                store: store,
                backupSyncIntervalMs: 300000 // Backup every 5 mins
            }) : undefined,

            puppeteer: {
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (isProduction ? '/usr/bin/chromium' : undefined),
                handleSIGINT: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    // '--single-process', // Removed as it can be unstable
                    '--disable-web-security'
                ]
            }
        });

        clients[schoolId] = client;

        // Safety timeout: if no QR/ready in 5 mins, set status to disconnected
        let isTimedOut = false;
        const timeout = setTimeout(async () => {
            isTimedOut = true;
            const currentSession = await db.whatsAppSession.findUnique({ where: { schoolId } });
            if (currentSession?.status === "INITIALIZING" || currentSession?.status === "WAITING_FOR_SCAN") {
                console.error(`[WhatsApp] Initialization TIMED OUT for ${schoolId}`);
                await db.whatsAppSession.update({
                    where: { schoolId },
                    data: { status: "DISCONNECTED", qrCode: null }
                });
                try { await client.destroy(); } catch (e) { }
                delete clients[schoolId];
            }
        }, 300000);

        client.on('qr', async (qr) => {
            if (isTimedOut) return;
            console.log(`[WhatsApp] QR Code RECEIVED for ${schoolId}`);
            try {
                const qrImage = await qrcode.toDataURL(qr);
                await db.whatsAppSession.upsert({
                    where: { schoolId },
                    update: { qrCode: qrImage, status: "WAITING_FOR_SCAN" },
                    create: { schoolId, qrCode: qrImage, status: "WAITING_FOR_SCAN" }
                });
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

        client.on('loading_screen', (percent, message) => {
            console.log(`[WhatsApp] Loading for ${schoolId}: ${percent}% - ${message}`);
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
            delete clients[schoolId];
        });

        client.on('disconnected', async (reason) => {
            console.log(`[WhatsApp] DISCONNECTED for ${schoolId}:`, reason);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "DISCONNECTED", qrCode: null }
            });
            delete clients[schoolId];

            // Auto-reconnect after 30 seconds if it was an unexpected disconnect
            if (reason as any !== 'NAVIGATION' && reason !== 'LOGOUT') {
                console.log(`[WhatsApp] Retrying initialization for ${schoolId} in 30s...`);
                setTimeout(() => initializeWhatsApp(schoolId), 30000);
            }
        });

        console.log(`[WhatsApp] Initializing client for ${schoolId}...`);
        await client.initialize();
    } catch (err) {
        console.error(`[WhatsApp] CRITICAL ERROR during initialization for ${schoolId}:`, err);
        await db.whatsAppSession.update({
            where: { schoolId },
            data: { status: "DISCONNECTED", qrCode: null }
        });
        if (clients[schoolId]) delete clients[schoolId];
        throw err;
    }

    return { success: true };
}


export async function sendWhatsAppMessage(schoolId: string, phone: string, message: string) {
    // Ensure client is initialized
    let client = clients[schoolId];

    if (!client) {
        // Try to re-init if not running but database says it should be
        const session = await db.whatsAppSession.findUnique({ where: { schoolId } });
        if (session?.status === "CONNECTED") {
            console.log(`[WhatsApp] Silent client restoration for ${schoolId}`);
            await initializeWhatsApp(schoolId);
            return { success: false, error: "Session restoring. Please wait 10 seconds and try again." };
        }
        return { success: false, error: "WhatsApp not connected." };
    }

    try {
        // Force state check
        const state = await client.getState();
        if (state !== 'CONNECTED') {
            const session = await db.whatsAppSession.findUnique({ where: { schoolId } });

            if (state === null || state === 'OPENING') {
                if (session?.status === "WAITING_FOR_SCAN") {
                    return { success: false, error: "WhatsApp needs to be paired. Please scan the QR code in Settings." };
                }
                return { success: false, error: "WhatsApp is still initializing. Please try again in 30 seconds." };
            }

            return { success: false, error: `WhatsApp is not connected (State: ${state || 'OFFLINE'}). Current status: ${session?.status || 'UNKNOWN'}` };
        }

        let formattedPhone = phone.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "92" + formattedPhone.substring(1);
        }

        const chatId = `${formattedPhone}@c.us`;
        await client.sendMessage(chatId, message);
        return { success: true };
    } catch (err) {
        console.error("WhatsApp Send Error:", err);
        return { success: false, error: "Push failure. Peer is offline or session expired." };
    }
}
