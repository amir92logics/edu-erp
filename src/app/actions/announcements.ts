"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRequiredSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getSchoolQuota, incrementWhatsappUsage } from "./quota";

const AnnouncementSchema = z.object({
    title: z.string().min(2),
    content: z.string().min(5),
    targetType: z.enum(["ALL", "CLASS"]),
    targetId: z.string().optional(),
    sentViaWhatsApp: z.boolean().default(false),
    whatsappMessage: z.string().optional(),
});

export async function getAnnouncements() {
    const schoolId = await getRequiredSchoolId();

    return await db.announcement.findMany({
        where: { schoolId },
        orderBy: { createdAt: "desc" },
    });
}

export async function getFormalAnnouncementTemplate(title: string, content: string) {
    const schoolId = await getRequiredSchoolId();
    const school = await db.school.findUnique({ where: { id: schoolId } });

    const message = `*OFFICIAL ANNOUNCEMENT*\n\nDear Parents/Guardians,\n\n*${school?.name}* would like to inform you regarding the following update:\n\n*Subject:* ${title}\n\n${content}\n\nFor any queries, please feel free to contact the school administration.\n\nSincerely,\n*Principal's Office*\n${school?.name}`;

    return message;
}

export async function createAnnouncement(formData: z.infer<typeof AnnouncementSchema>) {
    const session = await getRequiredSession();
    const schoolId = session.schoolId!;

    const validated = AnnouncementSchema.parse(formData);

    // 1. Quota Check for WhatsApp Broadcast
    let phones: string[] = [];
    if (validated.sentViaWhatsApp) {
        // Pre-fetch recipients for count check
        const recipients = await db.student.findMany({
            where: {
                schoolId,
                ...(validated.targetType === "CLASS" ? { classId: validated.targetId } : {})
            },
            select: { parentPhone: true }
        });
        phones = [...new Set(recipients.map((r: { parentPhone: string }) => r.parentPhone))];

        const quota = await getSchoolQuota(schoolId);
        if (quota.whatsapp.max !== null && (quota.whatsapp.used + phones.length) > quota.whatsapp.max) {
            return {
                success: false,
                limitExceeded: true,
                type: "whatsapp" as const,
                used: quota.whatsapp.used,
                max: quota.whatsapp.max,
                required: phones.length
            };
        }
    }

    const announcement = await db.announcement.create({
        data: {
            title: validated.title,
            content: validated.content,
            targetType: validated.targetType,
            targetId: validated.targetId,
            sentViaWhatsApp: validated.sentViaWhatsApp,
            schoolId,
        },
    });

    await createAuditLog({
        userId: session.userId,
        schoolId,
        action: "CREATE_ANNOUNCEMENT",
        entityType: "ANNOUNCEMENT",
        entityId: announcement.id,
        metadata: { title: announcement.title, target: announcement.targetType }
    });

    if (validated.sentViaWhatsApp && phones.length > 0) {
        const message = validated.whatsappMessage || `*Announcement from your School:*\n\n*${validated.title}*\n\n${validated.content}`;

        // Send messages and increment usage
        // We do this sequentially or in chunks to avoid overwhelming the WhatsApp client
        // For simplicity in this logic, we'll use Promise.all but increment for each
        Promise.all(phones.map(async (phone) => {
            const res = await sendWhatsAppMessage(schoolId, phone, message);
            if (res.success) {
                await incrementWhatsappUsage(schoolId);
            }
            return res;
        })).then(results => {
            const count = results.filter(r => r.success).length;
            console.log(`Broadcast: ${count}/${phones.length} successful `);
        }).catch(e => console.error("Broadcast failed", e));
    }

    revalidatePath("/admin/announcements");
    return { success: true, announcement };
}
