import { db } from "@/lib/db";
import {
    History,
    Search,
    Filter,
    Download,
    User as UserIcon,
    Globe,
    Lock
} from "lucide-react";

export default async function AuditLogsPage() {
    const logs = await db.auditLog.findMany({
        include: {
            school: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Audit logs</h1>
                    <p className="text-slate-500 font-medium mt-1">Immutable record of all critical platform activities.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Security Events", value: "0", icon: Lock, color: "text-blue-600" },
                    { label: "Admin Actions", value: logs.length.toString(), icon: UserIcon, color: "text-indigo-600" },
                    { label: "Cross-Tenant Access", value: "0", icon: Globe, color: "text-emerald-600" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-12 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-sm font-medium w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                            <Filter size={18} />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Issuer</th>
                                <th className="px-8 py-5">Institution</th>
                                <th className="px-8 py-5">Action</th>
                                <th className="px-8 py-5">Entity</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                                        <History size={48} className="mx-auto mb-4 opacity-10" />
                                        No audit entries discovered in the current cycle.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 font-mono text-xs text-slate-500">
                                            {log.createdAt.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-700">
                                            {log.userId || "SYSTEM"}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                {log.school?.name || "PLATFORM"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-slate-900">{log.action}</span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500">
                                            {log.entityType} ({log.entityId || "N/A"})
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Success</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
