"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId, getRequiredSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { WhatsappQueueStatus } from "@prisma/client";
import { processWhatsAppQueue } from "@/lib/whatsapp-worker";
import { revalidatePath } from "next/cache";
import { getWhatsAppStatus } from "@/lib/whatsapp";

/**
 * Checks the current technical connection status of the WhatsApp client.
 */
export async function getWhatsAppConnectionStatus() {
    const schoolId = await getRequiredSchoolId();
    return await getWhatsAppStatus(schoolId);
}

/**
 * Retrieves the current status of the WhatsApp notification queue for the school.
 */
export async function getWhatsAppQueueStatus() {
    const schoolId = await getRequiredSchoolId();

    const stats = await db.whatsappQueue.groupBy({
        by: ['status'],
        where: { schoolId },
        _count: { id: true }
    });

    const total = await db.whatsappQueue.count({ where: { schoolId } });

    const counts = stats.reduce((acc, curr) => {
        acc[curr.status as string] = curr._count.id;
        return acc;
    }, {} as Record<string, number>);

    const sent = counts[WhatsappQueueStatus.SENT] || 0;
    const failed = counts[WhatsappQueueStatus.FAILED] || 0;
    const processing = counts[WhatsappQueueStatus.PROCESSING] || 0;
    const pending = counts[WhatsappQueueStatus.PENDING] || 0;
    const paused = counts[WhatsappQueueStatus.PAUSED] || 0;

    const remaining = total - sent - failed;
    const isRunning = pending > 0 || processing > 0;

    return {
        total,
        sent,
        failed,
        remaining,
        processing,
        pending,
        paused,
        isRunning,
        isCompleted: (sent + failed) === total && total > 0,
        estimatedMinutes: Math.ceil(remaining * 0.15) // Estimated based on 9 seconds average per msg
    };
}

/**
 * Switches the school's blocked/paused messages to PENDING status to allow the worker to pick them up.
 */
export async function startWhatsAppQueue() {
    const session = await getRequiredSession();
    const schoolId = session.schoolId!;

    // Start by moving messages from PAUSED to PENDING
    await db.whatsappQueue.updateMany({
        where: {
            schoolId,
            status: WhatsappQueueStatus.PAUSED
        },
        data: { status: WhatsappQueueStatus.PENDING }
    });

    await createAuditLog({
        userId: session.userId,
        schoolId,
        action: "WHATSAPP_QUEUE_START",
        entityType: "WHATSAPP_QUEUE",
        metadata: { timestamp: new Date() }
    });

    // Proactively pulse the worker once to trigger immediate movement
    // The background job/cron will handle the rest.
    processWhatsAppQueue(schoolId).catch(console.error);

    revalidatePath("/admin/fees");
    return { success: true };
}

/**
 * Halts existing PENDING messages by moving them to PAUSED.
 */
export async function pauseWhatsAppQueue() {
    const session = await getRequiredSession();
    const schoolId = session.schoolId!;

    await db.whatsappQueue.updateMany({
        where: {
            schoolId,
            status: WhatsappQueueStatus.PENDING
        },
        data: { status: WhatsappQueueStatus.PAUSED }
    });

    await createAuditLog({
        userId: session.userId,
        schoolId,
        action: "WHATSAPP_QUEUE_PAUSE",
        entityType: "WHATSAPP_QUEUE"
    });

    revalidatePath("/admin/fees");
    return { success: true };
}

/**
 * Removes all pending or paused messages from the queue.
 */
export async function cancelWhatsAppQueue() {
    const session = await getRequiredSession();
    const schoolId = session.schoolId!;

    await db.whatsappQueue.deleteMany({
        where: {
            schoolId,
            status: { in: [WhatsappQueueStatus.PENDING, WhatsappQueueStatus.PAUSED] }
        }
    });

    await createAuditLog({
        userId: session.userId,
        schoolId,
        action: "WHATSAPP_QUEUE_CANCEL",
        entityType: "WHATSAPP_QUEUE"
    });

    revalidatePath("/admin/fees");
    return { success: true };
}

/**
 * Manual pulse to process a small batch immediately (used for UI 'Pulse' if no cron is active).
 */
export async function pulseQueue() {
    const schoolId = await getRequiredSchoolId();
    return await processWhatsAppQueue(schoolId, 5);
}
