"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";

interface PaymentButtonsProps {
    feeId: string;
    amount: number;
    studentName: string;
}

type PaymentState = "idle" | "loading" | "success" | "failed";

export function PaymentButtons({ feeId, amount, studentName }: PaymentButtonsProps) {
    const [state, setState] = useState<PaymentState>("idle");
    const [activeMethod, setActiveMethod] = useState<string | null>(null);
    const [txRef, setTxRef] = useState<string | null>(null);

    async function handlePay(method: string) {
        setState("loading");
        setActiveMethod(method);

        try {
            const res = await fetch("/api/payments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feeId, method }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Payment failed.");
            }

            // --- SANDBOX: synchronous result ---
            if (method === "SANDBOX") {
                if (data.success) {
                    setState("success");
                    setTxRef(data.transactionRef);
                } else {
                    setState("failed");
                }
                return;
            }

            // --- JAZZCASH / EASYPAISA: form POST to gateway ---
            if (data.action && data.params) {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = data.action;
                form.style.display = "none";

                Object.entries(data.params as Record<string, string>).forEach(([key, value]) => {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                // Page navigates away — keep spinner
                return;
            }

            throw new Error("Unexpected payment response.");
        } catch (err: any) {
            console.error(err);
            setState("failed");
        }
    }

    if (state === "success") {
        return (
            <div className="text-center space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            Rs. {amount.toLocaleString()} paid by <strong>{studentName}</strong>
                        </p>
                    </div>
                </div>

                {txRef && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</p>
                        <p className="font-mono text-sm font-bold text-slate-800 mt-1 break-all">{txRef}</p>
                    </div>
                )}

                <p className="text-xs text-slate-400 font-medium italic">
                    Your fee record has been automatically updated. This page can be closed.
                </p>
            </div>
        );
    }

    if (state === "failed") {
        return (
            <div className="text-center space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                        <XCircle size={40} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Payment Failed</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            The transaction could not be completed. Please try again.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => { setState("idle"); setActiveMethod(null); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                    <RefreshCcw size={16} /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* JazzCash */}
            <button
                onClick={() => handlePay("JAZZCASH")}
                disabled={state === "loading"}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {state === "loading" && activeMethod === "JAZZCASH"
                    ? <Loader2 className="animate-spin" size={20} />
                    : <><span>Pay via JazzCash</span> <ArrowRight size={18} /></>
                }
            </button>

            {/* Easypaisa */}
            <button
                onClick={() => handlePay("EASYPAISA")}
                disabled={state === "loading"}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-base shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {state === "loading" && activeMethod === "EASYPAISA"
                    ? <Loader2 className="animate-spin" size={20} />
                    : <><span>Pay via Easypaisa</span> <ArrowRight size={18} /></>
                }
            </button>

            {/* Sandbox Demo */}
            <div className="pt-2 border-t border-slate-100">
                <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">
                    Sandbox / Demo
                </p>
                <button
                    onClick={() => handlePay("SANDBOX")}
                    disabled={state === "loading"}
                    className="w-full py-3.5 bg-purple-600/10 border-2 border-dashed border-purple-300 text-purple-700 rounded-2xl font-bold text-sm hover:bg-purple-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {state === "loading" && activeMethod === "SANDBOX"
                        ? <Loader2 className="animate-spin" size={16} />
                        : <><span>Simulate Payment</span></>
                    }
                </button>
            </div>
        </div>
    );
}
