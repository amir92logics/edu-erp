"use client";

import { useState } from "react";
import { MessageSquare, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { ReminderModal } from "./ReminderModal";

export function ReminderButton({ feeId }: { feeId: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-all"
                title="Send WhatsApp Reminder"
            >
                <MessageSquare size={18} />
            </button>

            <ReminderModal
                feeId={feeId}
                isOpen={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}
