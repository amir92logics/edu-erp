"use client";

import { useState, useEffect, useCallback } from "react";
import {
    MessageSquare,
    Play,
    Pause,
    XOctagon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Clock,
    Zap
} from "lucide-react";
import {
    getWhatsAppQueueStatus,
    startWhatsAppQueue,
    pauseWhatsAppQueue,
    cancelWhatsAppQueue,
    getWhatsAppConnectionStatus,
    pulseQueue
} from "@/app/actions/whatsapp-queue";
import { toast } from "sonner";

export function WhatsAppNotificationControl() {
    const [status, setStatus] = useState<any>(null);
    const [connection, setConnection] = useState<string>("DISCONNECTED");
    const [loading, setLoading] = useState(false);
    const [pulsing, setPulsing] = useState(false);

    const fetchStatus = useCallback(async () => {
        const [qRes, cRes] = await Promise.all([
            getWhatsAppQueueStatus(),
            getWhatsAppConnectionStatus()
        ]);
        setStatus(qRes);
        setConnection(cRes);
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    async function handleStart() {
        if (connection !== "CONNECTED") {
            toast.error("WhatsApp is not connected. Please connect in WhatsApp Settings.");
            return;
        }
        setLoading(true);
        const res = await startWhatsAppQueue();
        if (res.success) {
            toast.success("Notification queue started.");
            fetchStatus();
        }
        setLoading(false);
    }

    async function handlePause() {
        setLoading(true);
        const res = await pauseWhatsAppQueue();
        if (res.success) {
            toast.success("Queue paused.");
            fetchStatus();
        }
        setLoading(false);
    }

    async function handleCancel() {
        if (!confirm("Are you sure you want to clear all pending notifications?")) return;
        setLoading(true);
        const res = await cancelWhatsAppQueue();
        if (res.success) {
            toast.success("Queue cancelled.");
            fetchStatus();
        }
        setLoading(false);
    }

    async function handlePulse() {
        setPulsing(true);
        const res = await pulseQueue();
        if (res.success) {
            toast.success(`Processed batch of ${res.processed} messages.`);
            fetchStatus();
        } else {
            toast.error(res.error || "Pulse failed.");
        }
        setPulsing(false);
    }

    if (!status || status.total === 0) return null;

    const progress = Math.round(((status.sent + status.failed) / status.total) * 100);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">WhatsApp Notification Queue</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${connection === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Status: {connection}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status.isRunning ? (
                        <button
                            onClick={handlePause}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-all border border-amber-200"
                        >
                            <Pause size={14} /> Pause Queue
                        </button>
                    ) : (
                        !status.isCompleted && (
                            <button
                                onClick={handleStart}
                                disabled={loading || connection !== 'CONNECTED'}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
                            >
                                <Play size={14} /> Start Notifications
                            </button>
                        )
                    )}

                    {(status.pending > 0 || status.paused > 0) && (
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all"
                        >
                            <XOctagon size={14} /> Cancel
                        </button>
                    )}

                    {!status.isCompleted && (
                        <button
                            onClick={handlePulse}
                            disabled={pulsing || connection !== 'CONNECTED'}
                            title="Manually process a batch"
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center"
                        >
                            <Zap size={14} className={pulsing ? "animate-bounce" : ""} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-xl font-bold text-slate-900">{status.total}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Sent</p>
                        <p className="text-xl font-bold text-emerald-700">{status.sent}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Failed</p>
                        <p className="text-xl font-bold text-red-700">{status.failed}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Remaining</p>
                        <p className="text-xl font-bold text-blue-700">{status.remaining}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-wider">Overall Progress</span>
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000 ease-in-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Status Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-300" />
                            <span>ETR: {status.estimatedMinutes} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <RefreshCw size={12} className={`text-slate-300 ${status.isRunning ? 'animate-spin' : ''}`} />
                            <span>Auto-poll: Active</span>
                        </div>
                    </div>

                    {status.isCompleted ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <CheckCircle2 size={12} /> Task Finished
                        </div>
                    ) : (
                        status.isRunning && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                <Loader2 size={12} className="animate-spin" /> Processing Bulk Messages
                            </div>
                        )
                    )}
                </div>

                {connection !== "CONNECTED" && !status.isCompleted && (
                    <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                        <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">WhatsApp Disconnected</p>
                            <p className="text-xs text-rose-600 mt-1 font-medium leading-relaxed">
                                The queue cannot process messages while WhatsApp is offline. Please scan the QR code in <a href="/admin/whatsapp" className="font-bold underline">WhatsApp Settings</a> to resume.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
