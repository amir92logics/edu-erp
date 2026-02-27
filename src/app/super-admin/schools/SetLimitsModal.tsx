"use client";

import { useState } from "react";
import { Settings2, Loader2, Hash } from "lucide-react";
import { updateSchoolLimits } from "@/app/actions/quota";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SetLimitsModalProps {
    school: {
        id: string;
        name: string;
        maxClasses: number | null;
        maxStudents: number | null;
        maxWhatsappPerMonth: number | null;
        _count: { classes: number; students: number };
    };
}

export function SetLimitsModal({ school }: SetLimitsModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [maxClasses, setMaxClasses] = useState(school.maxClasses?.toString() ?? "");
    const [maxStudents, setMaxStudents] = useState(school.maxStudents?.toString() ?? "");
    const [maxWhatsapp, setMaxWhatsapp] = useState(school.maxWhatsappPerMonth?.toString() ?? "");

    async function handleSave() {
        setLoading(true);
        try {
            await updateSchoolLimits(school.id, {
                maxClasses: maxClasses === "" ? null : Number(maxClasses),
                maxStudents: maxStudents === "" ? null : Number(maxStudents),
                maxWhatsappPerMonth: maxWhatsapp === "" ? null : Number(maxWhatsapp),
            });
            toast.success("Quota limits updated!");
            setIsOpen(false);
        } catch {
            toast.error("Failed to update limits.");
        } finally {
            setLoading(false);
        }
    }

    const LimitField = ({
        label,
        sublabel,
        value,
        onChange,
        used,
    }: {
        label: string;
        sublabel: string;
        value: string;
        onChange: (v: string) => void;
        used: number;
    }) => {
        const max = value === "" ? null : Number(value);
        const pct = max !== null && max > 0 ? Math.min((used / max) * 100, 100) : 0;
        const isOver = max !== null && used >= max;

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-xs font-black text-slate-700">{label}</label>
                        <p className="text-[10px] text-slate-400">{sublabel}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isOver ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {used} used
                    </span>
                </div>
                <div className="relative flex items-center gap-3">
                    <Hash size={14} className="text-slate-400 shrink-0" />
                    <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Unlimited"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <span className="text-[10px] text-slate-400 font-bold w-16 shrink-0">
                        {value === "" ? "∞ unlimited" : `max ${value}`}
                    </span>
                </div>
                {max !== null && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
                <Settings2 size={16} />
                Set Usage Limits
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400 rounded-full blur-2xl" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                                <Settings2 size={18} className="text-blue-300" />
                            </div>
                            <div>
                                <h2 className="text-base font-black tracking-tight">Usage Limits</h2>
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-56">{school.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        <p className="text-xs text-slate-500 font-medium leading-snug">
                            Set hard limits for this school. Leave blank for <strong>unlimited</strong>.
                            School admin will see a popup when they hit any limit.
                        </p>

                        <div className="space-y-5 divide-y divide-slate-100">
                            <LimitField
                                label="Maximum Classes"
                                sublabel="Total active class sections allowed"
                                value={maxClasses}
                                onChange={setMaxClasses}
                                used={school._count.classes}
                            />
                            <div className="pt-5">
                                <LimitField
                                    label="Maximum Students"
                                    sublabel="Total enrolled students allowed"
                                    value={maxStudents}
                                    onChange={setMaxStudents}
                                    used={school._count.students}
                                />
                            </div>
                            <div className="pt-5">
                                <LimitField
                                    label="WhatsApp Messages / Month"
                                    sublabel="Notifications (reminders + announcements)"
                                    value={maxWhatsapp}
                                    onChange={setMaxWhatsapp}
                                    used={0}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2.5 bg-white border-2 border-slate-200 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-[2] py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={15} /> : "Save Limits"}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
