import { Client, RemoteAuth } from "whatsapp-web.js";
import { db } from "./db";
import qrcode from "qrcode";
import mongoose from "mongoose";
import { MongoStore } from "wwebjs-mongo";
import fs from "fs/promises";
import path from "path";

// Global cache for WhatsApp clients to persist across HMR in dev
const clients: Record<string, Client> = (global as { whatsappClients?: Record<string, Client> }).whatsappClients || {};
(global as { whatsappClients?: Record<string, Client> }).whatsappClients = clients;

// Prevention for multiple concurrent initializations
const initializingSchools = new Set<string>();

// Ensure MongoDB is connected for RemoteAuth if using MongoDB
let storePromise: Promise<any> | null = null;
async function getMongoStore() {
    if (!process.env.MONGODB_URI) {
        console.warn("[WhatsApp] MONGODB_URI not found.");
        return null;
    }

    if (!storePromise) {
        storePromise = (async () => {
            try {
                if (mongoose.connection.readyState === 0) {
                    console.log("[WhatsApp] Connecting to MongoDB Store...");
                    await mongoose.connect(process.env.MONGODB_URI!, {
                        serverSelectionTimeoutMS: 15000,
                        connectTimeoutMS: 15000,
                    });
                }
                console.log("[WhatsApp] MongoDB Store Connected.");
                return new MongoStore({ mongoose: mongoose });
            } catch (err) {
                console.error("[WhatsApp] Failed to connect to MongoDB Store:", err);
                storePromise = null; // Allow retry
                return null;
            }
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
    if (initializingSchools.has(schoolId)) {
        console.log(`[WhatsApp] Skipping init for ${schoolId}. Initialization already in progress.`);
        return { success: true, initializing: true };
    }

    // Clear client if it exists, to be safe.
    if (clients[schoolId]) {
        console.log(`[WhatsApp] Destroying existing client for school ${schoolId} for a fresh start.`);
        try {
            await clients[schoolId].destroy();
        } catch (e) {
            console.error(`[WhatsApp] Error destroying existing client:`, e);
        }
        delete clients[schoolId];
    }

    // 🚀 CLEANUP: Remove local session directory to force fresh sync from Mongo
    // This prevents "Browser already running" or "Storage corrupted" errors
    const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `RemoteAuth-${schoolId}`);
    try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`[WhatsApp] Local session directory purged for ${schoolId}`);
    } catch (e) {
        // Directory might not exist, that's fine
    }

    initializingSchools.add(schoolId);
    console.log(`[WhatsApp] Starting initialization for school: ${schoolId}. Node: ${process.version}, fetch: ${typeof fetch}`);

    // Set initial status to INITIALIZING in DB
    await db.whatsAppSession.upsert({
        where: { schoolId },
        update: { status: "INITIALIZING", qrCode: null },
        create: { schoolId, status: "INITIALIZING" }
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // 🚀 Background process
    (async () => {
        try {
            // 1. Get Mongo Store with a timeout
            const storePromise = getMongoStore();
            const store = await Promise.race([
                storePromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("MongoStore Timeout")), 30000))
            ]) as any;

            const client = new Client({
                authStrategy: store ? new RemoteAuth({
                    clientId: schoolId,
                    store: store,
                    backupSyncIntervalMs: 300000, // Backup every 5 mins
                    dataPath: './.wwebjs_auth'
                }) : undefined,

                webVersion: '2.3000.1018903251',
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1018903251.html'
                },

                authTimeoutMs: 60000, // 60s timeout for store retrieval

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
                        '--disable-web-security'
                    ]
                }
            });

            clients[schoolId] = client;

            let isCycleFinished = false;
            const cycleTimeout = setTimeout(async () => {
                if (isCycleFinished) return;
                console.error(`[WhatsApp] Initialization CYCLE TIMED OUT for ${schoolId}`);
                await db.whatsAppSession.update({
                    where: { schoolId },
                    data: { status: "DISCONNECTED", qrCode: null }
                });
                try { await client.destroy(); } catch (e) { }
                delete clients[schoolId];
            }, 300000); // 5 minutes

            client.on('qr', async (qr) => {
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

            client.on('authenticated', () => {
                console.log(`[WhatsApp] AUTHENTICATED for ${schoolId}`);
            });

            client.on('remote_session_saved', () => {
                console.log(`[WhatsApp] REMOTE SESSION SYNCED to Mongo for ${schoolId}`);
            });

            client.on('ready', async () => {
                isCycleFinished = true;
                clearTimeout(cycleTimeout);
                console.log(`[WhatsApp] Client is READY for school: ${schoolId}`);
                await db.whatsAppSession.update({
                    where: { schoolId },
                    data: { status: "CONNECTED", qrCode: null }
                });
            });

            client.on('auth_failure', async (msg) => {
                isCycleFinished = true;
                clearTimeout(cycleTimeout);
                console.error(`[WhatsApp] AUTH FAILURE for ${schoolId}:`, msg);
                await db.whatsAppSession.update({
                    where: { schoolId },
                    data: { status: "DISCONNECTED", qrCode: null }
                });
                delete clients[schoolId];
            });

            client.on('disconnected', async (reason) => {
                console.log(`[WhatsApp] DISCONNECTED for ${schoolId}:`, reason);

                // Only mark as disconnected in DB if it's a real logout or terminal disconnect
                if (reason as any === 'LOGOUT' || reason as any === 'NAVIGATION') {
                    await db.whatsAppSession.update({
                        where: { schoolId },
                        data: { status: "DISCONNECTED", qrCode: null }
                    });
                }

                delete clients[schoolId];
                initializingSchools.delete(schoolId);

                if (reason as any !== 'NAVIGATION' && reason !== 'LOGOUT') {
                    console.log(`[WhatsApp] Attempting reconnect for ${schoolId} in 30s...`);
                    setTimeout(() => initializeWhatsApp(schoolId), 30000);
                }
            });

            console.log(`[WhatsApp] Calling client.initialize() for ${schoolId}...`);
            await client.initialize();
        } catch (err) {
            console.error(`[WhatsApp] CRITICAL ERROR in bg init for ${schoolId}:`, err);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "DISCONNECTED", qrCode: null }
            });
            if (clients[schoolId]) delete clients[schoolId];
        } finally {
            // Free the lock so another attempt can be made
            initializingSchools.delete(schoolId);
        }
    })();

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

export async function logoutWhatsApp(schoolId: string) {
    console.log(`[WhatsApp] Forcefully logging out school: ${schoolId}`);

    if (clients[schoolId]) {
        try {
            await clients[schoolId].logout();
            await clients[schoolId].destroy();
        } catch (e) {
            console.error(`[WhatsApp] Error during logout/destroy for ${schoolId}:`, e);
        }
        delete clients[schoolId];
    }

    // Clear session from database
    await db.whatsAppSession.deleteMany({
        where: { schoolId }
    });

    return { success: true };
}
