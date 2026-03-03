"use client";

import { useState } from "react";
import { Smartphone, ShieldAlert, Trash2, Zap, Search, Activity, ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";
import { terminateSchoolSession } from "@/app/actions/platform";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SessionList({ initialSessions }: { initialSessions: any[] }) {
    const [sessions, setSessions] = useState(initialSessions);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const filtered = sessions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase())
    );

    async function handleTerminate(schoolId: string) {
        if (!confirm("Are you sure? This will disconnect their WhatsApp immediately and clear all session data.")) return;

        setLoading(schoolId);
        try {
            const res = await terminateSchoolSession(schoolId);
            if (res.success) {
                toast.success("Session terminated successfully.");
                setSessions(prev => prev.filter(s => s.id !== schoolId));
                router.refresh();
            } else {
                toast.error("Failed to terminate session.");
            }
        } catch (e) {
            toast.error("An error occurred.");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-8">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search by school name or instance slug..."
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filtered.map((school) => {
                    const session = school.whatsappSessions[0];
                    return (
                        <div key={school.id} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
                                <Zap size={200} />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center font-black text-blue-600 text-2xl shadow-sm group-hover:bg-white transition-colors">
                                        {school.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{school.name}</h3>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${session?.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                session?.status === 'WAITING_FOR_SCAN' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}>
                                                {session?.status || 'DISCONNECTED'}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 font-medium text-xs mt-1.5 flex items-center gap-2">
                                            <Activity size={12} className="text-blue-500" />
                                            Active since {new Date(session?.createdAt || school.createdAt).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-4 mt-4">
                                            <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Slug</p>
                                                <p className="text-xs font-bold text-slate-700">{school.slug}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Plan</p>
                                                <p className="text-xs font-bold text-slate-700">{school.subscriptionPlan}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden lg:block mr-4">
                                        <div className="flex items-center gap-2 justify-end mb-1">
                                            <Smartphone size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway Health</span>
                                        </div>
                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${session?.status === 'CONNECTED' ? 'w-full bg-emerald-500' : 'w-1/3 bg-amber-500'}`}></div>
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading === school.id}
                                        onClick={() => handleTerminate(school.id)}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        {loading === school.id ? (
                                            "Purging..."
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Terminate Session
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                                        <ShieldAlert size={14} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 leading-none uppercase tracking-widest">
                                        Management action will be logged in system audit trail.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={`/super-admin/audit?schoolId=${school.id}`}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                                    >
                                        <FileText size={12} />
                                        View Logs
                                    </Link>
                                    <Link
                                        href={`/super-admin/schools?search=${school.slug}`}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                                    >
                                        <ArrowUpRight size={12} />
                                        Platform Page
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No active sessions found</h3>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
