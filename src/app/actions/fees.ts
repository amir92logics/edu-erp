"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getSchoolQuota, incrementWhatsappUsage } from "./quota";

export async function generateMonthlyFees(month: number, year: number) {
    const schoolId = await getRequiredSchoolId();

    // 1. Get all active students
    const students = await db.student.findMany({
        where: { schoolId, status: "ACTIVE" },
        include: { class: true }
    });

    let generatedCount = 0;

    // 2. Create Fee records for each student
    for (const student of students) {
        if (!student.classId || !student.class) continue;

        // Check if fee already exists
        const existing = await db.fee.findFirst({
            where: {
                studentId: student.id,
                month,
                year,
                schoolId
            }
        });

        if (existing) continue;

        await db.fee.create({
            data: {
                schoolId,
                studentId: student.id,
                month,
                year,
                amount: student.class.monthlyFee,
                dueDate: new Date(year, month - 1, 10), // 10th of the month
                status: "PENDING"
            }
        });
        generatedCount++;
    }

    revalidatePath("/admin/fees");
    return { success: true, count: generatedCount };
}

export async function getPendingFees() {
    const schoolId = await getRequiredSchoolId();

    return await db.fee.findMany({
        where: { schoolId, status: "PENDING" },
        include: {
            student: {
                include: { class: true }
            }
        },
        orderBy: { dueDate: "asc" }
    });
}

import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function getFeeReminderContent(feeId: string) {
    const schoolId = await getRequiredSchoolId();

    const fee = await db.fee.findUnique({
        where: { id: feeId },
        include: { student: { include: { class: true } }, school: true }
    });

    if (!fee) return { error: "Fee not found" };

    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(fee.year, fee.month - 1));
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    // Clean URL — no query params so WhatsApp renders it as a clickable link
    const payLink = `${baseUrl}/pay/${fee.id}`;

    const totalAmount = Number(fee.amount) + Number(fee.lateFine);
    const hasFine = Number(fee.lateFine) > 0;

    // WhatsApp renders bare URLs as clickable links only when:
    // 1. The URL has NO surrounding bold/italic markers
    // 2. It appears on its own line
    const message = `*Dear Parent/Guardian,*

This is a formal fee reminder from *${fee.school.name}*.

*Student Details:*
• Name: ${fee.student.name}
• Roll No: ${fee.student.rollNumber || 'N/A'}
• Class: ${fee.student.class?.name || 'N/A'}
• Student ID: ${fee.student.id.substring(0, 10).toUpperCase()}

*Fee Summary — ${monthName} ${fee.year}:*
• Fee Amount: Rs. ${Number(fee.amount).toLocaleString()}${hasFine ? `\n• Late Fine: Rs. ${Number(fee.lateFine).toLocaleString()}` : ''}
• Total Due: Rs. ${totalAmount.toLocaleString()}
• Due Date: ${new Date(fee.dueDate).toLocaleDateString('en-PK')}

To pay online via JazzCash or Easypaisa, tap the link below:
${payLink}

The link opens a secure payment page — no app download needed.

For queries, contact school administration.

Regards,
*${fee.school.name}*`;

    return {
        success: true,
        message,
        parentPhone: fee.student.parentPhone,
        studentName: fee.student.name
    };
}

export async function sendWhatsAppReminder(feeId: string, message: string) {
    const schoolId = await getRequiredSchoolId();

    // 1. Quota Check
    const quota = await getSchoolQuota(schoolId);
    if (quota.whatsapp.max !== null && quota.whatsapp.used >= quota.whatsapp.max) {
        return {
            success: false,
            limitExceeded: true,
            type: "whatsapp" as const,
            used: quota.whatsapp.used,
            max: quota.whatsapp.max
        };
    }

    const fee = await db.fee.findUnique({
        where: { id: feeId },
        include: { student: true }
    });

    if (!fee) return { error: "Fee not found" };

    const res = await sendWhatsAppMessage(schoolId, fee.student.parentPhone, message);
    if (res.success) {
        await incrementWhatsappUsage(schoolId);
    }
    return res;
}

import { getRequiredSession } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";

export async function recordManualPayment(feeId: string, amount: number, method: string) {
    const session = await getRequiredSession();
    const schoolId = session.schoolId!;

    const fee = await db.fee.findUnique({
        where: { id: feeId },
        include: { student: true }
    });

    if (!fee) return { error: "Fee not found" };

    // Update Fee status
    await db.fee.update({
        where: { id: feeId },
        data: { status: "PAID" }
    });

    // Create Transaction record
    const txn = await db.transaction.create({
        data: {
            schoolId,
            studentId: fee.studentId,
            feeId: fee.id,
            amount,
            method,
            status: "SUCCESS",
            transactionRef: `MAN-${Date.now()}-${feeId.substring(0, 4)}`
        }
    });

    await createAuditLog({
        userId: session.userId,
        schoolId,
        action: "RECORD_PAYMENT",
        entityType: "TRANSACTION",
        entityId: txn.id,
        metadata: { amount, method, student: fee.student.name }
    });

    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
}
