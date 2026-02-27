"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSchoolStatus } from "@/app/actions/platform";
import {
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    Settings,
    SlidersHorizontal,
    Trash2,
    Loader2
} from "lucide-react";
import { SubscriptionStatus } from "@prisma/client";
import { toast } from "sonner";
import { SetLimitsModal } from "./SetLimitsModal";

interface SchoolActionsProps {
    schoolId: string;
    currentStatus: SubscriptionStatus;
    school: {
        id: string;
        name: string;
        maxClasses: number | null;
        maxStudents: number | null;
        maxWhatsappPerMonth: number | null;
        _count: { classes: number; students: number };
    };
}

export function SchoolActions({ schoolId, currentStatus, school }: SchoolActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleStatusToggle(newStatus: SubscriptionStatus) {
        setLoading(true);
        try {
            const result = await toggleSchoolStatus(schoolId, newStatus);
            if (result.success) {
                toast.success(`School status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-20 overflow-hidden py-2 animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</p>
                        </div>

                        <button
                            disabled={loading || currentStatus === "ACTIVE"}
                            onClick={() => handleStatusToggle("ACTIVE")}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                        >
                            <ShieldCheck size={18} />
                            Activate Institution
                        </button>

                        <button
                            disabled={loading || currentStatus === "SUSPENDED"}
                            onClick={() => handleStatusToggle("SUSPENDED")}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <ShieldAlert size={18} />
                            Suspend Access
                        </button>

                        <SetLimitsModal school={school} />

                        <div className="h-px bg-slate-50 my-1" />

                        <Link
                            href={`/super-admin/schools/${schoolId}/features`}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Settings size={18} />
                            Configure Features
                        </Link>

                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors">
                            <Trash2 size={18} />
                            Archive Data
                        </button>

                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-blue-600" size={20} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
