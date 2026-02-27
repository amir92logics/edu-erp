"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SchoolProfileSchema = z.object({
    name: z.string().min(2),
    address: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
});

const MerchantSettingsSchema = z.object({
    jazzCashMerchantId: z.string().optional(),
    jazzCashPassword: z.string().optional(),
    jazzCashSalt: z.string().optional(),
    easypaisaMerchantId: z.string().optional(),
    easypaisaHashKey: z.string().optional(),
});

export async function getSchoolSettings() {
    const schoolId = await getRequiredSchoolId();
    return await db.school.findUnique({
        where: { id: schoolId },
    });
}

export async function updateSchoolProfile(formData: z.infer<typeof SchoolProfileSchema>) {
    const schoolId = await getRequiredSchoolId();
    const validated = SchoolProfileSchema.parse(formData);

    await db.school.update({
        where: { id: schoolId },
        data: validated,
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function updateMerchantCredentials(formData: z.infer<typeof MerchantSettingsSchema>) {
    const schoolId = await getRequiredSchoolId();
    const validated = MerchantSettingsSchema.parse(formData);

    await db.school.update({
        where: { id: schoolId },
        data: validated,
    });

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function getSchoolPlan() {
    const schoolId = await getRequiredSchoolId();
    const school = await db.school.findUnique({
        where: { id: schoolId },
        select: { subscriptionPlan: true }
    });
    return school?.subscriptionPlan || "BASIC";
}
