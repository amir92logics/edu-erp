"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Send, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { getFeeReminderContent, sendWhatsAppReminder } from "@/app/actions/fees";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LimitExceededModal } from "@/components/ui/LimitExceededModal";

export function ReminderModal({
    feeId,
    isOpen,
    onClose
}: {
    feeId: string,
    isOpen: boolean,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [data, setData] = useState<{ message: string, parentPhone: string, studentName: string } | null>(null);
    const [editedMessage, setEditedMessage] = useState("");
    const [limitInfo, setLimitInfo] = useState<{ used: number; max: number } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchContent();
        }
    }, [isOpen]);

    async function fetchContent() {
        setLoading(true);
        try {
            const res = await getFeeReminderContent(feeId);
            if (res.success) {
                setData({
                    message: res.message!,
                    parentPhone: res.parentPhone!,
                    studentName: res.studentName!
                });
                setEditedMessage(res.message!);
            } else {
                toast.error(res.error || "Failed to load reminder content.");
                onClose();
            }
        } catch {
            toast.error("Error loading reminder.");
            onClose();
        } finally {
            setLoading(false);
        }
    }

    async function handleSend() {
        setSending(true);
        try {
            const res = await sendWhatsAppReminder(feeId, editedMessage) as any;
            if (res.success) {
                toast.success("Reminder dispatched via WhatsApp!");
                onClose();
            } else if (res.limitExceeded) {
                setSending(false);
                setLimitInfo({ used: res.used!, max: res.max! });
            } else {
                toast.error(res.error || "Broadcast failed. Check WhatsApp connection.");
            }
        } catch {
            toast.error("Network error during broadcast.");
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-400 rounded-full blur-2xl" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <MessageSquare size={18} className="text-green-300" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black tracking-tight">WhatsApp Reminder</h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {data ? `Sending to ${data.studentName}'s parent` : "Loading recipient..."}
                                </p>
                            </div>
                        </div>

                        {/* Recipient pill */}
                        {data && (
                            <div className="relative mt-4 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <User size={12} className="text-slate-400 shrink-0" />
                                    <span className="text-xs font-bold text-white truncate">{data.studentName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-slate-400 shrink-0" />
                                    <span className="text-xs font-mono text-slate-300">{data.parentPhone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {loading ? (
                            <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                                <Loader2 size={28} className="animate-spin text-blue-500" />
                                <p className="text-xs font-bold uppercase tracking-widest">Generating Template...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Message — Edit as needed
                                    </label>
                                    <textarea
                                        value={editedMessage}
                                        onChange={(e) => setEditedMessage(e.target.value)}
                                        rows={9}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-xs font-medium leading-relaxed text-slate-700 resize-none"
                                    />
                                </div>

                                <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-amber-700 font-medium leading-snug">
                                        Keep the payment link intact. This message will be delivered with your school's identity.
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-2.5 bg-white border-2 border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || loading}
                                        className="flex-[2] py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                    >
                                        {sending
                                            ? <Loader2 className="animate-spin" size={15} />
                                            : <><CheckCircle2 size={14} /> Send Reminder</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {limitInfo && (
                <LimitExceededModal
                    isOpen={!!limitInfo}
                    onClose={() => setLimitInfo(null)}
                    type="whatsapp"
                    used={limitInfo.used}
                    max={limitInfo.max}
                />
            )}
        </>
    );
}
