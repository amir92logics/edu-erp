"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Returns the current quota usage for a school.
 * Called server-side before creating classes, students, or sending WhatsApp messages.
 */
export async function getSchoolQuota(schoolId: string) {
    const school = await db.school.findUnique({
        where: { id: schoolId },
        select: {
            maxClasses: true,
            maxStudents: true,
            maxWhatsappPerMonth: true,
            whatsappSentThisMonth: true,
            whatsappMonthResetAt: true,
            _count: { select: { classes: true, students: true } }
        }
    });

    if (!school) throw new Error("School not found");

    // Auto-reset WhatsApp counter if we've crossed into a new calendar month
    const now = new Date();
    const resetAt = new Date(school.whatsappMonthResetAt);
    const needsReset =
        now.getFullYear() > resetAt.getFullYear() ||
        now.getMonth() > resetAt.getMonth();

    let whatsappSent = school.whatsappSentThisMonth;
    if (needsReset) {
        await db.school.update({
            where: { id: schoolId },
            data: { whatsappSentThisMonth: 0, whatsappMonthResetAt: now }
        });
        whatsappSent = 0;
    }

    return {
        classes: {
            used: school._count.classes,
            max: school.maxClasses,
            exceeded: school.maxClasses !== null && school._count.classes >= school.maxClasses
        },
        students: {
            used: school._count.students,
            max: school.maxStudents,
            exceeded: school.maxStudents !== null && school._count.students >= school.maxStudents
        },
        whatsapp: {
            used: whatsappSent,
            max: school.maxWhatsappPerMonth,
            exceeded: school.maxWhatsappPerMonth !== null && whatsappSent >= school.maxWhatsappPerMonth
        }
    };
}

/**
 * Super admin: update quota limits for a school.
 */
export async function updateSchoolLimits(schoolId: string, limits: {
    maxClasses: number | null;
    maxStudents: number | null;
    maxWhatsappPerMonth: number | null;
}) {
    await db.school.update({
        where: { id: schoolId },
        data: {
            maxClasses: limits.maxClasses,
            maxStudents: limits.maxStudents,
            maxWhatsappPerMonth: limits.maxWhatsappPerMonth,
        }
    });

    revalidatePath("/super-admin/schools");
    return { success: true };
}

/**
 * Increment WhatsApp sent counter for a school (called after a successful send).
 */
export async function incrementWhatsappUsage(schoolId: string) {
    await db.school.update({
        where: { id: schoolId },
        data: { whatsappSentThisMonth: { increment: 1 } }
    });
}
