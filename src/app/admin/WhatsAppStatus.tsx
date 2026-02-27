"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, CheckCircle2, QrCode } from "lucide-react";
import { initWhatsAppSession, getWhatsAppState } from "@/app/actions/whatsapp";
import { toast } from "sonner";

export function WhatsAppStatus() {
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        async function fetchStatus() {
            const data = await getWhatsAppState();
            setState(data);

            // If waiting for scan, poll frequently
            if (data?.status === "WAITING_FOR_SCAN" || data?.status === "INITIALIZING") {
                if (!interval) {
                    interval = setInterval(fetchStatus, 3000);
                }
            } else {
                clearInterval(interval);
            }
        }

        fetchStatus();
        return () => clearInterval(interval);
    }, []);

    async function handleInit() {
        setLoading(true);
        try {
            const res = await initWhatsAppSession();
            if (res.success) {
                toast.success("Initializing session...");
            }
        } catch (e) {
            toast.error("Failed to start session.");
        } finally {
            setLoading(false);
        }
    }

    if (state?.status === "CONNECTED") {
        return (
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
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

    if (state?.status === "WAITING_FOR_SCAN" && state.qrCode) {
        return (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-2 rounded-xl mb-4">
                    <img src={state.qrCode} alt="WhatsApp QR" className="w-48 h-48" />
                </div>
                <h3 className="font-bold text-slate-900">Scan Required</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Open WhatsApp &gt; Linked Devices &gt; Link a Device.</p>
                <div className="mt-4 px-3 py-1.5 bg-blue-50 rounded-full flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={14} />
                    <span className="text-[10px] font-bold text-blue-700">Waiting for Authentication...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                {state?.status === "INITIALIZING" || loading ? (
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                ) : (
                    <MessageSquare size={32} />
                )}
            </div>
            <h3 className="font-bold text-slate-900">
                {state?.status === "INITIALIZING" || loading ? "Initializing..." : "Disconnected"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                Connect your WhatsApp account to enable automated fee reminders.
            </p>
            <button
                disabled={loading || state?.status === "INITIALIZING"}
                onClick={handleInit}
                className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all shadow-lg"
            >
                {state?.status === "INITIALIZING" || loading ? "Spinning up..." : "Link New Session"}
            </button>
        </div>
    );
}
