"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId, getRequiredSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ── Schemas ────────────────────────────────────────────────────────────────────

const SchoolProfileSchema = z.object({
    name: z.string().min(2, "Name is required"),
    address: z.string().optional(),
    contactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
});

const MerchantSettingsSchema = z.object({
    jazzCashMerchantId: z.string().optional(),
    jazzCashPassword: z.string().optional(),
    jazzCashSalt: z.string().optional(),
    easypaisaMerchantId: z.string().optional(),
    easypaisaHashKey: z.string().optional(),
});

const WhatsAppSettingsSchema = z.object({
    // WhatsApp is approved by super-admin; school admin can only read this.
    // This schema validates any future per-school WA settings.
    isWhatsAppApproved: z.boolean().optional(),
});

const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(6),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// ── Actions ────────────────────────────────────────────────────────────────────

export async function getSchoolSettings() {
    const schoolId = await getRequiredSchoolId();
    return await db.school.findUnique({
        where: { id: schoolId },
    });
}

export async function updateSchoolProfile(
    formData: z.infer<typeof SchoolProfileSchema>
) {
    const schoolId = await getRequiredSchoolId();
    const validated = SchoolProfileSchema.parse(formData);

    await db.school.update({
        where: { id: schoolId },
        data: {
            name: validated.name,
            address: validated.address || null,
            contactEmail: validated.contactEmail || null,
            contactPhone: validated.contactPhone || null,
        },
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function updateMerchantCredentials(
    formData: z.infer<typeof MerchantSettingsSchema>
) {
    const schoolId = await getRequiredSchoolId();
    const validated = MerchantSettingsSchema.parse(formData);

    await db.school.update({
        where: { id: schoolId },
        data: validated,
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function changePassword(
    formData: z.infer<typeof ChangePasswordSchema>
): Promise<{ success: boolean; error?: string }> {
    const session = await getRequiredSession();
    const validated = ChangePasswordSchema.safeParse(formData);

    if (!validated.success) {
        const firstError = validated.error.errors[0]?.message;
        return { success: false, error: firstError || "Validation failed." };
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return { success: false, error: "User not found." };

    const passwordMatch = await bcrypt.compare(
        validated.data.currentPassword,
        user.password
    );
    if (!passwordMatch) {
        return { success: false, error: "Current password is incorrect." };
    }

    const hashedNewPassword = await bcrypt.hash(validated.data.newPassword, 12);
    await db.user.update({
        where: { id: session.userId },
        data: { password: hashedNewPassword },
    });

    return { success: true };
}

export async function getSchoolName(): Promise<string> {
    try {
        const schoolId = await getRequiredSchoolId();
        const school = await db.school.findUnique({
            where: { id: schoolId },
            select: { name: true },
        });
        return school?.name || "School Admin";
    } catch {
        return "School Admin";
    }
}

export async function getSchoolPlan() {
    const schoolId = await getRequiredSchoolId();
    const school = await db.school.findUnique({
        where: { id: schoolId },
        select: { subscriptionPlan: true, status: true, trialEndsAt: true },
    });
    return {
        plan: school?.subscriptionPlan || "BASIC",
        status: school?.status || "TRIAL",
        trialEndsAt: school?.trialEndsAt,
    };
}
