import { db } from "@/lib/db";
import { PaymentService } from "@/lib/payments/service";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/webhook/easypaisa
 * Handles Easypaisa payment notifications
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 1. Find school via order identifier (stored in productId or orderId)
        const feeId = data.productId;
        const fee = await db.fee.findUnique({
            where: { id: feeId },
            include: { school: true }
        });

        if (!fee || !fee.school.easypaisaHashKey) {
            return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
        }

        // 2. Verify Hash (Order of fields matters for Easypaisa)
        const receivedHash = data.hash;
        const params = { ...data };
        delete params.hash;

        const sortedValues = Object.keys(params).sort().map(k => params[k]).join("&");
        const calculatedHash = PaymentService.generateEasypaisaHash(sortedValues, fee.school.easypaisaHashKey);

        if (calculatedHash !== receivedHash) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // 3. Update Status
        const responseCode = data.respCode;
        const isSuccess = responseCode === "0000"; // Easypaisa success code

        await db.$transaction([
            db.transaction.upsert({
                where: { transactionRef: data.orderId },
                update: { status: isSuccess ? "SUCCESS" : "FAILED", gatewayResponse: data },
                create: {
                    schoolId: fee.schoolId,
                    studentId: fee.studentId,
                    feeId: fee.id,
                    amount: fee.amount,
                    transactionRef: data.orderId,
                    method: "EASYPAISA",
                    status: isSuccess ? "SUCCESS" : "FAILED",
                    gatewayResponse: data
                }
            }),
            ...(isSuccess ? [
                db.fee.update({
                    where: { id: fee.id },
                    data: { status: "PAID" as const }
                })
            ] : [])
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Easypaisa Webhook Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
