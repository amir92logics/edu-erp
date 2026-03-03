"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, CheckCircle2, QrCode } from "lucide-react";
import { initWhatsAppSession, getWhatsAppState } from "@/app/actions/whatsapp";
import { toast } from "sonner";

export function WhatsAppStatus() {
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [autoInitAttempted, setAutoInitAttempted] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        async function fetchStatus() {
            const data = await getWhatsAppState();
            setState(data);

            // 🚀 Auto-init if disconnected or no session exists (only once per mount)
            if ((!data || data.status === "DISCONNECTED") && !autoInitAttempted) {
                setAutoInitAttempted(true);
                handleInit();
            }

            // Always poll until connected to catch background updates
            if (data?.status !== "CONNECTED") {
                if (!interval) {
                    interval = setInterval(fetchStatus, 3000);
                }
            } else {
                clearInterval(interval);
            }
        }

        fetchStatus();
        return () => clearInterval(interval);
    }, [autoInitAttempted]);

    async function handleInit() {
        if (loading) return;
        setLoading(true);
        try {
            const res = await initWhatsAppSession();
            if (res.success) {
                // Background initialization started
            }
        } catch (e) {
            toast.error("Failed to start session.");
        } finally {
            setLoading(false);
        }
    }

    if (state?.status === "CONNECTED") {
        return (
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-white border border-emerald-200 rounded-full flex items-center justify-center mb-4 shadow-sm text-emerald-600">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-emerald-900">WhatsApp Active</h3>
                <p className="text-xs text-emerald-600 mt-1">Ready to send automated reminders.</p>
                <div className="mt-4 px-2 py-1 bg-emerald-100/50 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Live Connection</span>
                </div>
            </div>
        );
    }

    const isInitializing = state?.status === "INITIALIZING" || loading;

    return (
        <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="bg-slate-50 p-2 rounded-xl mb-4 min-w-[192px] min-h-[192px] flex items-center justify-center border border-slate-100 relative group overflow-hidden">
                {state?.qrCode ? (
                    <img src={state.qrCode} alt="WhatsApp QR" className="w-48 h-48 animate-in zoom-in duration-500" />
                ) : (
                    <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-300">
                        <Loader2 size={48} className="animate-spin text-blue-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-4 animate-pulse">
                            Initializing...
                        </p>
                    </div>
                )}

                {isInitializing && state?.qrCode && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                )}
            </div>

            <h3 className="font-bold text-slate-900 tracking-tight">
                {state?.status === "WAITING_FOR_SCAN" ? "Scan Required" : "Gateway Syncing"}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[200px]">
                {state?.status === "WAITING_FOR_SCAN"
                    ? "Open WhatsApp > Linked Devices > Link a Device."
                    : "Connecting to secure instance. This may take a moment..."}
            </p>

            {state?.status === "WAITING_FOR_SCAN" && (
                <div className="mt-6 w-full space-y-3">
                    <div className="px-3 py-1.5 bg-blue-50 rounded-full flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={14} />
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Awaiting Link Request</span>
                    </div>

                    <button
                        disabled={isInitializing}
                        onClick={handleInit}
                        className="w-full py-2.5 border-2 border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                    >
                        {isInitializing ? "Refreshing..." : "Reset if Stuck"}
                    </button>
                </div>
            )}
        </div>
    );
}

