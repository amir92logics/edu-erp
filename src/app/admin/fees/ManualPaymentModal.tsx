"use client";

import { useState } from "react";
import { CreditCard, DollarSign, Loader2, ArrowUpRight } from "lucide-react";
import { recordManualPayment } from "@/app/actions/fees";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ManualPaymentModal({ feeId, amount, studentName }: { feeId: string, amount: number, studentName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const method = formData.get("method") as string;
        const finalAmount = Number(formData.get("amount"));

        try {
            const result = await recordManualPayment(feeId, finalAmount, method);
            if (result.success) {
                toast.success("Payment recorded successfully!");
                setIsOpen(false);
            } else {
                toast.error("Failed to record payment.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-full text-blue-600 transition-colors bg-blue-50/50"
                title="Record manual payment"
            >
                <ArrowUpRight size={18} />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader className="p-6 border-b border-slate-50">
                        <DialogTitle className="text-xl font-bold text-slate-900">Record Payment</DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Capture details for {studentName}</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 text-left">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Payment Method</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <select
                                        name="method"
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold appearance-none shadow-sm"
                                    >
                                        <option value="CASH">Physical Cash</option>
                                        <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                                        <option value="CHECK">Certified Check</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount Paid (Rs.)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required
                                        name="amount"
                                        type="number"
                                        defaultValue={amount}
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold border-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Finalize Receipt"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
