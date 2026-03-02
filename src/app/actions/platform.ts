"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SubscriptionStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getRequiredSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { getPlanDefaults } from "@/lib/plan-config";

const OnboardSchoolSchema = z.object({
    name: z.string().min(2, "School name is too short"),
    slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    schoolEmail: z.string().email("Invalid school contact email"),
    adminEmail: z.string().email("Invalid admin email"),
    adminPassword: z.string().min(8, "Password must be at least 8 characters"),
    subscriptionPlan: z.string().default("BASIC"),
    maxWhatsappPerMonth: z.number().int().optional().nullable(),
    maxWhatsappPerDay: z.number().int().optional().nullable(),
    status: z.nativeEnum(SubscriptionStatus).default("TRIAL"),
});

export async function getAllSchools(query: string = "", status: string = "") {
    return await db.school.findMany({
        where: {
            ...(status ? { status: status as any } : {}),
            ...(query
                ? {
                    OR: [
                        { name: { contains: query } },
                        { slug: { contains: query } },
                    ],
                }
                : {}),
        },
        include: {
            _count: {
                select: { users: true, students: true, classes: true }
            }
        },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Enhanced onboarding: creates school and the initial admin user in a single transaction.
 */
export async function onboardSchool(data: any) {
    const session = await getRequiredSession();

    // Convert status for Zod if it's a raw string from form
    const validated = OnboardSchoolSchema.parse({
        ...data,
        maxWhatsappPerMonth: data.maxWhatsappPerMonth ? parseInt(data.maxWhatsappPerMonth) : null,
        maxWhatsappPerDay: data.maxWhatsappPerDay ? parseInt(data.maxWhatsappPerDay) : null
    });

    // 1. Uniqueness Checks
    const existingUser = await db.user.findUnique({ where: { email: validated.adminEmail } });
    if (existingUser) return { success: false, error: "Admin email already exists in system" };

    const existingSlug = await db.school.findUnique({ where: { slug: validated.slug } });
    if (existingSlug) return { success: false, error: "Slug is already taken by another institution" };

    const defaults = getPlanDefaults(validated.subscriptionPlan);
    const maxWhatsappPerDay = validated.maxWhatsappPerDay ?? defaults.maxWhatsappPerDay;

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(validated.adminPassword, 12);

    try {
        const result = await db.$transaction(async (tx) => {
            // 3. Create School
            const school = await tx.school.create({
                data: {
                    name: validated.name,
                    slug: validated.slug,
                    contactEmail: validated.schoolEmail,
                    subscriptionPlan: validated.subscriptionPlan,
                    maxWhatsappPerMonth: validated.maxWhatsappPerMonth,
                    maxWhatsappPerDay: maxWhatsappPerDay,
                    status: validated.status,
                    trialEndsAt: validated.status === "TRIAL" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                },
            });

            // 4. Create Admin User
            await tx.user.create({
                data: {
                    email: validated.adminEmail,
                    password: hashedPassword,
                    name: "Administrator",
                    role: Role.SCHOOL_ADMIN,
                    schoolId: school.id
                }
            });

            return school;
        });

        await createAuditLog({
            userId: session.userId,
            action: "ONBOARD_SCHOOL",
            entityType: "SCHOOL",
            entityId: result.id,
            metadata: { name: result.name, adminEmail: validated.adminEmail }
        });

        revalidatePath("/super-admin/schools");
        return { success: true, schoolId: result.id };
    } catch (error) {
        console.error("Onboarding transaction failed:", error);
        return { success: false, error: "Internal database error during creation." };
    }
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
