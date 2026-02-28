"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { initializeWhatsApp } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function initWhatsAppSession() {
    const schoolId = await getRequiredSchoolId();

    // 1. Mark status as loading
    await db.whatsAppSession.upsert({
        where: { schoolId },
        update: { status: "INITIALIZING", qrCode: null },
        create: { schoolId, status: "INITIALIZING" }
    });

    // 2. Clear old state if any from the background process
    // (Actual initialization is handled by lib/whatsapp)
    await initializeWhatsApp(schoolId);

    revalidatePath("/admin");
    return { success: true };
}

export async function getWhatsAppState() {
    const schoolId = await getRequiredSchoolId();

    return await db.whatsAppSession.findUnique({
        where: { schoolId }
    });
}
