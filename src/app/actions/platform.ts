"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";

const OnboardSchoolSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    subscriptionPlan: z.string().default("BASIC"),
});

export async function getAllSchools() {
    return await db.school.findMany({
        include: {
            _count: {
                select: { users: true, students: true, classes: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

import { getRequiredSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";

export async function onboardSchool(formData: z.infer<typeof OnboardSchoolSchema>) {
    const session = await getRequiredSession();
    const validated = OnboardSchoolSchema.parse(formData);

    const school = await db.school.create({
        data: {
            ...validated,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    await createAuditLog({
        userId: session.userId,
        action: "ONBOARD_SCHOOL",
        entityType: "SCHOOL",
        entityId: school.id,
        metadata: { name: school.name }
    });

    revalidatePath("/super-admin/schools");
    return { success: true, school };
}

export async function toggleSchoolStatus(schoolId: string, status: SubscriptionStatus) {
    const session = await getRequiredSession();

    await db.school.update({
        where: { id: schoolId },
        data: { status },
    });

    await createAuditLog({
        userId: session.userId,
        action: "TOGGLE_SCHOOL_STATUS",
        entityType: "SCHOOL",
        entityId: schoolId,
        metadata: { status }
    });

    revalidatePath("/super-admin/health");
    revalidatePath("/super-admin/schools");
    return { success: true };
}
