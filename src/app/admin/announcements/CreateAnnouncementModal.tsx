"use client";

import { useState, useRef } from "react";
import { Plus, Send, Loader2, MessageSquare, Users, Layers, ChevronRight, AlertCircle, Megaphone } from "lucide-react";
import { createAnnouncement, getFormalAnnouncementTemplate } from "@/app/actions/announcements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LimitExceededModal } from "@/components/ui/LimitExceededModal";

export function CreateAnnouncementModal({ classes }: { classes: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"FORM" | "PREVIEW">("FORM");
    const [whatsappPreview, setWhatsappPreview] = useState("");
    const [targetType, setTargetType] = useState<"ALL" | "CLASS">("ALL");
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [limitInfo, setLimitInfo] = useState<{ used: number; max: number; type: "whatsapp" | "classes" | "students" } | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    function handleClose() {
        setIsOpen(false);
        setStep("FORM");
        setWhatsappEnabled(false);
        setTargetType("ALL");
    }

    async function handleProceed(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (whatsappEnabled) {
            setLoading(true);
            try {
                const formData = new FormData(e.currentTarget);
                const template = await getFormalAnnouncementTemplate(
                    formData.get("title") as string,
                    formData.get("content") as string
                );
                setWhatsappPreview(template);
                setStep("PREVIEW");
            } catch {
                toast.error("Failed to generate preview.");
            } finally {
                setLoading(false);
            }
        } else {
            submitAnnouncement(new FormData(e.currentTarget));
        }
    }

    async function submitAnnouncement(formData: FormData, customWhatsapp?: string) {
        setLoading(true);
        try {
            const result = await createAnnouncement({
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                targetType: formData.get("targetType") as "ALL" | "CLASS",
                targetId: formData.get("targetId") as string || undefined,
                sentViaWhatsApp: whatsappEnabled,
                whatsappMessage: customWhatsapp,
            });
            if (result.success) {
                toast.success("Announcement published!");
                handleClose();
                router.refresh();
            } else if (result.limitExceeded) {
                setLoading(false);
                setLimitInfo({ used: result.used!, max: result.max!, type: result.type as any });
            } else {
                toast.error("Failed to publish.");
            }
        } catch {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
            >
                <Plus size={16} />
                New Announcement
            </button>

            {limitInfo && (
                <LimitExceededModal
                    isOpen={!!limitInfo}
                    onClose={() => setLimitInfo(null)}
                    type={limitInfo.type}
                    used={limitInfo.used}
                    max={limitInfo.max}
                />
            )}

            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-md p-0">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-400 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-400 rounded-full blur-2xl" />
                        </div>
                        <div className="relative flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <Megaphone size={18} className="text-blue-300" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black tracking-tight">
                                    {step === "FORM" ? "New Announcement" : "WhatsApp Preview"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {step === "FORM" ? "Broadcast to your school community" : "Review before sending"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {step === "FORM" ? (
                        <form ref={formRef} onSubmit={handleProceed} className="p-5 space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                                <input
                                    required
                                    name="title"
                                    placeholder="e.g. Annual Sports Day 2025"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</label>
                                <textarea
                                    required
                                    name="content"
                                    rows={3}
                                    placeholder="Write your announcement here..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium resize-none placeholder:text-slate-400"
                                />
                            </div>

                            {/* Audience */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audience</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { val: "ALL", label: "All Students", icon: <Users size={14} /> },
                                        { val: "CLASS", label: "Specific Class", icon: <Layers size={14} /> },
                                    ].map(({ val, label, icon }) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setTargetType(val as "ALL" | "CLASS")}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${targetType === val
                                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                                }`}
                                        >
                                            {icon} {label}
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" name="targetType" value={targetType} />
                            </div>

                            {/* Class selector (conditional) */}
                            {targetType === "CLASS" && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Class</label>
                                    <select
                                        name="targetId"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-semibold appearance-none"
                                    >
                                        <option value="">Choose a class...</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* WhatsApp toggle */}
                            <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${whatsappEnabled ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg ${whatsappEnabled ? "bg-green-500" : "bg-slate-300"} transition-colors`}>
                                        <MessageSquare size={12} className="text-white" />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold ${whatsappEnabled ? "text-green-800" : "text-slate-600"}`}>WhatsApp Blast</p>
                                        <p className={`text-[10px] ${whatsappEnabled ? "text-green-600" : "text-slate-400"}`}>
                                            {whatsappEnabled ? "Will notify parents" : "Disabled"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${whatsappEnabled ? "bg-green-500" : "bg-slate-200"}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${whatsappEnabled ? "translate-x-5" : ""}`} />
                                </button>
                                <input type="hidden" name="sentViaWhatsApp" value={whatsappEnabled ? "on" : "off"} />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                            >
                                {loading
                                    ? <Loader2 className="animate-spin" size={16} />
                                    : whatsappEnabled
                                        ? <><ChevronRight size={16} /> Preview & Send</>
                                        : <><Send size={16} /> Publish Now</>
                                }
                            </button>
                        </form>
                    ) : (
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Message</label>
                                <textarea
                                    value={whatsappPreview}
                                    onChange={(e) => setWhatsappPreview(e.target.value)}
                                    rows={9}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium leading-relaxed text-slate-700 resize-none"
                                />
                                <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-700 font-medium leading-snug">
                                        Review carefully before sending. This will be delivered to all parents in the selected group.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep("FORM")}
                                    className="flex-1 py-2.5 bg-white border-2 border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => submitAnnouncement(new FormData(formRef.current!), whatsappPreview)}
                                    disabled={loading}
                                    className="flex-[2] py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Broadcast to Parents</>}
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
