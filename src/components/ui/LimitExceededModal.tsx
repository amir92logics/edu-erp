"use client";

import { XCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type LimitType = "classes" | "students" | "whatsapp";

interface LimitExceededModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: LimitType;
    used: number;
    max: number;
}

const CONFIG: Record<LimitType, { title: string; description: (max: number) => string; color: string }> = {
    classes: {
        title: "Class Limit Reached",
        description: (max) => `Your school plan allows a maximum of ${max} class${max === 1 ? "" : "es"}. You have used all available slots.`,
        color: "blue",
    },
    students: {
        title: "Student Limit Reached",
        description: (max) => `Your plan allows a maximum of ${max} active student${max === 1 ? "" : "s"}. Remove inactive students or upgrade your plan.`,
        color: "purple",
    },
    whatsapp: {
        title: "WhatsApp Quota Exhausted",
        description: (max) => `Your monthly WhatsApp notification quota of ${max} messages has been reached. The counter resets at the start of next month.`,
        color: "green",
    },
};

export function LimitExceededModal({ isOpen, onClose, type, used, max }: LimitExceededModalProps) {
    const config = CONFIG[type];

    const colorClasses = ({
        blue: { bg: "from-blue-600 to-blue-800", icon: "bg-blue-500/20 border-blue-400/30", badge: "bg-blue-100 text-blue-700 border-blue-200" },
        purple: { bg: "from-purple-600 to-purple-800", icon: "bg-purple-500/20 border-purple-400/30", badge: "bg-purple-100 text-purple-700 border-purple-200" },
        green: { bg: "from-emerald-600 to-emerald-800", icon: "bg-emerald-500/20 border-emerald-400/30", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    } as const)[config.color as "blue" | "purple" | "green"] ?? { bg: "from-slate-600 to-slate-800", icon: "bg-slate-500/20 border-slate-400/30", badge: "bg-slate-100 text-slate-700 border-slate-200" };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0">
                {/* Header */}
                <div className={`bg-gradient-to-br ${colorClasses.bg} p-7 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="relative flex flex-col items-center gap-4 text-center">
                        <div className={`w-16 h-16 ${colorClasses.icon} border rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
                            <AlertTriangle size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">{config.title}</h2>
                            <p className="text-white/70 text-xs mt-1 font-medium">Plan Limit Enforced</p>
                        </div>

                        {/* Usage bar */}
                        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                            <div
                                className="bg-white rounded-full h-2 transition-all"
                                style={{ width: "100%" }}
                            />
                        </div>
                        <p className="text-white/80 text-xs font-bold">
                            {used} / {max} used
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed text-center">
                        {config.description(max)}
                    </p>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                        <XCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium leading-snug">
                            Contact your system administrator to increase this limit or upgrade your school plan.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Got it
                        </button>
                        <a
                            href="mailto:admin@edupro.io?subject=Quota Upgrade Request"
                            className="flex-1 py-2.5 bg-white border-2 border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                        >
                            Contact Admin <ArrowUpRight size={13} />
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
