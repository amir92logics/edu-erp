import { db } from "./db";
import { sendWhatsAppMessage } from "./whatsapp";
import { incrementWhatsappUsage, getSchoolQuota } from "@/app/actions/quota";
import { WhatsappQueueStatus } from "@prisma/client";

/**
 * Worker to process a batch of pending/retrying WhatsApp messages.
 * Designed to be called by a cron job or background process.
 */
export async function processWhatsAppQueue(schoolId: string, batchSize: number = 10) {
    // 1. Check if school has active WhatsApp session and is approved
    const school = await db.school.findUnique({
        where: { id: schoolId },
        select: {
            isWhatsAppApproved: true,
            status: true,
            maxWhatsappPerDay: true,
            whatsappSentToday: true,
            whatsappDayResetAt: true
        }
    });

    if (!school?.isWhatsAppApproved) {
        return { success: false, error: "WhatsApp not approved for this school" };
    }

    if (school.status === "SUSPENDED") {
        return { success: false, error: "School subscription suspended" };
    }

    // 2. Daily Cap Check & Auto-Reset
    const now = new Date();
    const dayResetAt = new Date(school.whatsappDayResetAt);
    const needsDayReset = now.toDateString() !== dayResetAt.toDateString();

    let sentToday = school.whatsappSentToday;
    if (needsDayReset) {
        await db.school.update({
            where: { id: schoolId },
            data: { whatsappSentToday: 0, whatsappDayResetAt: now }
        });
        sentToday = 0;
    }

    if (school.maxWhatsappPerDay !== null && sentToday >= school.maxWhatsappPerDay) {
        return { success: false, error: "Daily WhatsApp quota exceeded" };
    }

    // 3. Monthly Quota Check
    const quota = await getSchoolQuota(schoolId);
    if (quota.whatsapp.exceeded) {
        return { success: false, error: "Monthly WhatsApp quota exceeded" };
    }

    // 4. Fetch Batch
    const batch = await db.whatsappQueue.findMany({
        where: {
            schoolId,
            status: { in: [WhatsappQueueStatus.PENDING, WhatsappQueueStatus.FAILED] },
            retryCount: { lt: 3 },
            scheduledAt: { lte: now }
        },
        take: batchSize,
        orderBy: { createdAt: "asc" }
    });

    if (batch.length === 0) {
        return { success: true, processed: 0, message: "No pending messages" };
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const job of batch) {
        // Double check daily cap inside loop to be precise
        if (school.maxWhatsappPerDay !== null && (sentToday + processedCount) >= school.maxWhatsappPerDay) {
            break;
        }

        // Mark as processing
        await db.whatsappQueue.update({
            where: { id: job.id },
            data: { status: WhatsappQueueStatus.PROCESSING }
        });

        // 🎲 Randomized Message Variation (Anti-Block)
        const randomizedMessage = randomizeTemplate(job.message);

        // 🕒 Anti-Block Delay (5-15 seconds)
        const delay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
        await new Promise(resolve => setTimeout(resolve, delay));

        const result = await sendWhatsAppMessage(schoolId, job.phoneNumber, randomizedMessage);

        if (result.success) {
            await db.whatsappQueue.update({
                where: { id: job.id },
                data: {
                    status: WhatsappQueueStatus.SENT,
                    sentAt: new Date(),
                    errorMessage: null
                }
            });
            await incrementWhatsappUsage(schoolId);
            await db.school.update({
                where: { id: schoolId },
                data: { whatsappSentToday: { increment: 1 } }
            });
            processedCount++;
        } else {
            // Exponential Backoff logic: increment retry count and push scheduledAt further
            const nextRetry = new Date(Date.now() + Math.pow(2, job.retryCount + 1) * 60000); // 2, 4, 8 minutes
            await db.whatsappQueue.update({
                where: { id: job.id },
                data: {
                    status: WhatsappQueueStatus.FAILED,
                    retryCount: { increment: 1 },
                    scheduledAt: nextRetry,
                    errorMessage: result.error
                }
            });
            failedCount++;
        }
    }

    return { success: true, processed: processedCount, failed: failedCount };
}

/**
 * Applies slight randomized variations to common fee templates to avoid "duplicate content" blocks.
 */
function randomizeTemplate(message: string): string {
    const greetings = ["Dear Parent,", "Hi Parent,", "AOA Parent,", "Respected Parent,"];
    const endings = ["Thank you.", "Regards,", "Best regards,", "School Office.", "Please pay promptly."];

    // Check if the current message starts with a standard greeting
    let processed = message;

    // Example: Replace "Dear Parent," with a random one
    if (processed.includes("Dear Parent,")) {
        processed = processed.replace("Dear Parent,", greetings[Math.floor(Math.random() * greetings.length)]);
    }

    // Optionally append a random ending if not present
    if (Math.random() > 0.5) {
        processed += "\n\n" + endings[Math.floor(Math.random() * endings.length)];
    }

    return processed;
}
