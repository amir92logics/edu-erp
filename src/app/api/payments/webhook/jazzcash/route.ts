import { db } from "@/lib/db";
import { PaymentService } from "@/lib/payments/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = value.toString(); });

    const billReference = data["pp_BillReference"];

    // 1. Find school via bill reference
    const fee = await db.fee.findUnique({
        where: { id: billReference },
        include: { school: true }
    });

    if (!fee || !fee.school.jazzCashSalt) {
        return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    // 2. Verify Hash
    const isValid = PaymentService.verifyJazzCashHash(data, fee.school.jazzCashSalt);
    if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Update Status
    const responseCode = data["pp_ResponseCode"];
    const isSuccess = responseCode === "000";

    await db.$transaction([
        db.transaction.upsert({
            where: { transactionRef: data["pp_TxnRefNo"] },
            update: { status: isSuccess ? "SUCCESS" : "FAILED", gatewayResponse: data },
            create: {
                schoolId: fee.schoolId,
                studentId: fee.studentId,
                feeId: fee.id,
                amount: fee.amount,
                transactionRef: data["pp_TxnRefNo"],
                method: "JAZZCASH",
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

    const redirectBase = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${billReference}`;
    return NextResponse.redirect(`${redirectBase}?status=${isSuccess ? 'success' : 'failed'}`);
}
