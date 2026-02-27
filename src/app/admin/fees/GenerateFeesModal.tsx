"use client";

import { useState } from "react";
import { Wallet, Calendar, Loader2 } from "lucide-react";
import { generateMonthlyFees } from "@/app/actions/fees";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function GenerateFeesModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const now = new Date();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const month = Number(formData.get("month"));
        const year = Number(formData.get("year"));

        try {
            const result = await generateMonthlyFees(month, year);
            if (result.success) {
                toast.success(`Generated ${result.count} fee records!`);
                setIsOpen(false);
            } else {
                toast.error("Failed to generate fees.");
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
                <Wallet size={18} />
                Generate Monthly Fees
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader className="p-6 border-b border-slate-50 bg-slate-50">
                        <DialogTitle className="text-xl font-bold text-slate-900">Batch Invoicing</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            This action will generate pending fee records for all active students based on their class fee structure.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Month</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <select
                                        name="month"
                                        defaultValue={now.getMonth() + 1}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold appearance-none shadow-sm"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, i))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <select
                                        name="year"
                                        defaultValue={now.getFullYear()}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-bold appearance-none shadow-sm"
                                    >
                                        <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
                                        <option value={now.getFullYear()}>{now.getFullYear()}</option>
                                        <option value={now.getFullYear() + 1}>{now.getFullYear() + 1}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                            <Wallet className="text-amber-600 shrink-0" size={20} />
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Duplicates will not be created. Fee records already existing for this month/year will be skipped.
                            </p>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Initiate Generation"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
