"use server";

import { db } from "@/lib/db";
import { getRequiredSchoolId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { TransactionStatus } from "@prisma/client";

/**
 * Initiates a sandbox payment simulation
 */
export async function createSandboxPayment(feeId: string) {
    const schoolId = await getRequiredSchoolId();

    const fee = await db.fee.findUnique({
        where: { id: feeId, schoolId },
        include: { student: true }
    });

    if (!fee) throw new Error("Fee not found");

    // Create a transaction record in PENDING state
    const transactionRef = `SBX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = await db.transaction.create({
        data: {
            schoolId,
            studentId: fee.studentId,
            feeId: fee.id,
            transactionRef,
            amount: fee.amount.add(fee.lateFine),
            method: "SANDBOX",
            status: "PENDING",
        }
    });

    return {
        success: true,
        transactionRef: transaction.transactionRef,
        amount: transaction.amount.toString(),
        feeId: fee.id
    };
}

/**
 * Simulates a payment success/failure update
 */
export async function updateTransactionStatus(transactionRef: string, status: TransactionStatus) {
    const schoolId = await getRequiredSchoolId();

    const transaction = await db.transaction.findUnique({
        where: { transactionRef, schoolId }
    });

    if (!transaction) throw new Error("Transaction not found");

    // Start a transaction to ensure atomic update of fee and transaction status
    await db.$transaction(async (tx) => {
        await tx.transaction.update({
            where: { id: transaction.id },
            data: { status }
        });

        if (status === "SUCCESS" && transaction.feeId) {
            await tx.fee.update({
                where: { id: transaction.feeId },
                data: { status: "PAID" }
            });
        }
    });

    revalidatePath("/admin/fees");
    return { success: true };
}
