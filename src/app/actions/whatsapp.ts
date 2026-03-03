"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { initializeWhatsApp } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function initWhatsAppSession() {
    const schoolId = await getRequiredSchoolId();

    // The logic is moved inside initializeWhatsApp to handle backgrounding properly.
    // We just trigger it and return success immediately so the UI can start polling.
    await initializeWhatsApp(schoolId);

    revalidatePath("/admin/whatsapp");
    return { success: true };
}

export async function getWhatsAppState() {
    const schoolId = await getRequiredSchoolId();

    return await db.whatsAppSession.findUnique({
        where: { schoolId }
    });
}
