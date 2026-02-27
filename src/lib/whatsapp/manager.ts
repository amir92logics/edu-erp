import { db } from "@/lib/db";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";

/**
 * WhatsApp Manager
 * Manages whatsapp-web.js instances for different schools.
 * Note: In a production environment with many schools, this should be 
 * offloaded to a separate worker process or microservice.
 */
export class WhatsAppManager {
    private static clients: Map<string, Client> = new Map();

    /**
     * Initializes a session for a school
     */
    static async initializeSession(schoolId: string) {
        // 1. Check if school is approved
        const school = await db.school.findUnique({ where: { id: schoolId } });
        if (!school?.isWhatsAppApproved) {
            throw new Error("WhatsApp feature not approved for this school.");
        }

        // 2. If client already exists and is initializing, don't start another
        if (this.clients.has(schoolId)) {
            const existingClient = this.clients.get(schoolId)!;
            try {
                // If it's already connected or trying to, we might want to reset or ignore
                // For now, let's just destroy and restart to be sure
                await existingClient.destroy();
            } catch (e) {
                console.error("Error destroying existing client:", e);
            }
        }

        // 3. Create new client instance
        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: `school_${schoolId}`,
                dataPath: "./.wwebjs_auth"
            }),
            puppeteer: {
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
                headless: true,
            }
        });

        // 4. Setup Event Listeners
        client.on("qr", async (qr) => {
            console.log(`QR received for school ${schoolId}`);
            const qrBase64 = await qrcode.toDataURL(qr);
            await db.whatsAppSession.upsert({
                where: { schoolId },
                update: { qrCode: qrBase64, status: "DISCONNECTED" },
                create: { schoolId, qrCode: qrBase64, status: "DISCONNECTED" }
            });
        });

        client.on("ready", async () => {
            console.log(`WhatsApp ready for school ${schoolId}`);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "CONNECTED", qrCode: null }
            });
        });

        client.on("authenticated", () => {
            console.log(`Authenticated for school ${schoolId}`);
        });

        client.on("auth_failure", async (msg) => {
            console.error(`Auth failure for school ${schoolId}:`, msg);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "FAILED", qrCode: null }
            });
        });

        client.on("disconnected", async (reason) => {
            console.log(`Disconnected for school ${schoolId}:`, reason);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "DISCONNECTED", qrCode: null }
            });
            this.clients.delete(schoolId);
        });

        // 5. Store and initialize
        this.clients.set(schoolId, client);

        await db.whatsAppSession.upsert({
            where: { schoolId },
            update: { status: "LOADING", qrCode: null },
            create: { schoolId, status: "LOADING" }
        });

        client.initialize().catch(async (err) => {
            console.error(`Failed to initialize WhatsApp for school ${schoolId}:`, err);
            await db.whatsAppSession.update({
                where: { schoolId },
                data: { status: "FAILED" }
            });
            this.clients.delete(schoolId);
        });
    }

    /**
     * Sends a message via an active session
     */
    static async sendMessage(schoolId: string, to: string, message: string) {
        let client = this.clients.get(schoolId);

        // If client not in memory, try to initialize it (it should use LocalAuth to restore session)
        if (!client) {
            await this.initializeSession(schoolId);
            // Wait a bit for it to potentially reconnect? 
            // In a better architecture, we'd wait for 'ready' or use a queue.
            throw new Error("WhatsApp session initializing. Please try again in a moment.");
        }

        const state = await client.getState();
        if (state !== "CONNECTED") {
            throw new Error(`WhatsApp not connected (State: ${state}).`);
        }

        // Format number: should be in format '923001234567@c.us'
        const chatId = to.includes("@c.us") ? to : `${to.replace(/\D/g, "")}@c.us`;

        const response = await client.sendMessage(chatId, message);

        return { success: true, messageId: response.id._serialized };
    }

    /**
     * Gets current session status from DB (utility)
     */
    static async getSessionStatus(schoolId: string) {
        return await db.whatsAppSession.findUnique({
            where: { schoolId }
        });
    }
}
