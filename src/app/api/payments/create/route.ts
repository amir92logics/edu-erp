import { db } from "@/lib/db";
import { PaymentService } from "@/lib/payments/service";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/create
 * Creates a payment link or processes a sandbox transaction
 */
export async function POST(request: Request) {
    try {
        const { feeId, method } = await request.json();

        // 1. Get Fee and Student details
        const fee = await db.fee.findUnique({
            where: { id: feeId },
            include: {
                student: true,
                school: true
            }
        });

        if (!fee) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

        const school = fee.school;

        // 2. Handle Sandbox Mode
        if (method === "SANDBOX") {
            const result = await PaymentService.simulatePayment(Number(fee.amount));

            // Update DB if successful
            if (result.success) {
                await db.$transaction([
                    db.transaction.create({
                        data: {
                            schoolId: school.id,
                            studentId: fee.studentId,
                            feeId: fee.id,
                            amount: fee.amount,
                            transactionRef: result.transactionRef,
                            method: "SANDBOX",
                            status: "SUCCESS"
                        }
                    }),
                    db.fee.update({
                        where: { id: fee.id },
                        data: { status: "PAID" }
                    })
                ]);
            }

            return NextResponse.json(result);
        }

        // 3. JazzCash Integration Logic
        if (method === "JAZZCASH") {
            if (!school.jazzCashMerchantId || !school.jazzCashPassword || !school.jazzCashSalt) {
                return NextResponse.json({ error: "School merchant credentials not configured" }, { status: 400 });
            }

            const transactionRef = `JC-${Date.now()}`;
            const params: Record<string, string> = {
                pp_MerchantID: school.jazzCashMerchantId,
                pp_Password: school.jazzCashPassword,
                pp_Amount: (Number(fee.amount) * 100).toString(), // convert to cents
                pp_TxnRefNo: transactionRef,
                pp_TxnCurrency: "PKR",
                pp_TxnDateTime: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14),
                pp_BillReference: fee.id,
                pp_Description: `School Fee - ${fee.student.name}`,
                pp_ReturnURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/jazzcash`,
            };

            const secureHash = PaymentService.generateJazzCashHash(params, school.jazzCashSalt);
            params.pp_SecureHash = secureHash;

            // In production, we would return the params for a form POST redirect
            return NextResponse.json({
                action: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform",
                params
            });
        }

        // 4. Easypaisa Integration Logic
        if (method === "EASYPAISA") {
            if (!school.easypaisaMerchantId || !school.easypaisaHashKey) {
                return NextResponse.json({ error: "School Easypaisa credentials not configured" }, { status: 400 });
            }

            const transactionRef = `EP-${Date.now()}`;
            const amount = Number(fee.amount).toFixed(2);

            // For Easypaisa, parameters are often passed in a specific order for hashing
            const params: Record<string, string> = {
                storeId: school.easypaisaMerchantId,
                orderId: transactionRef,
                transactionAmount: amount,
                mobileNum: fee.student.parentPhone,
                emailAddr: school.contactEmail || "school@erp.com",
                transactionType: "MA", // Mobile Account
                tokenExpiry: "30",
                bankId: "",
                productId: fee.id,
                postBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/easypaisa`,
            };

            // Hashing logic for Easypaisa (Simplified example based on standard flows)
            const sortedValues = Object.keys(params).sort().map(k => params[k]).join("&");
            const secureHash = PaymentService.generateEasypaisaHash(sortedValues, school.easypaisaHashKey);
            params.hash = secureHash;

            return NextResponse.json({
                action: "https://sandbox.easypay.com.pk/checkout/index.php",
                params
            });
        }

        return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });

    } catch (error) {
        console.error("Payment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
