import { getAllSchools } from "@/app/actions/platform";
import {
    Search,
    Users,
    ArrowUpRight,
    ShieldCheck,
    X,
    SlidersHorizontal,
} from "lucide-react";
import { SchoolActions } from "./SchoolActions";
import { OnboardSchoolModal } from "./OnboardSchoolModal";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "TRIAL", label: "Trial" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "CANCELLED", label: "Cancelled" },
];

export default async function SuperAdminSchoolsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const status = params.status || "";

    const schools = await getAllSchools(query, status);
    const hasFilters = Boolean(query || status);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institution Registry</h1>
                    <p className="text-slate-500 font-medium">Global management of all schools connected to the EduPro network.</p>
                </div>
                <OnboardSchoolModal />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                    <form method="GET" className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                name="q"
                                defaultValue={query}
                                type="text"
                                placeholder="Filter by name or slug..."
                                className="w-full pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="relative">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <select
                                name="status"
                                defaultValue={status}
                                className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-sm font-medium appearance-none cursor-pointer"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-100"
                        >
                            Search
                        </button>

                        {hasFilters && (
                            <Link
                                href="/super-admin/schools"
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors font-semibold"
                            >
                                <X size={14} /> Clear
                            </Link>
                        )}
                    </form>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            {query && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                                    <Search size={10} /> &quot;{query}&quot;
                                </span>
                            )}
                            {status && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                                    ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        status === "SUSPENDED" ? "bg-red-50 text-red-700 border-red-100" :
                                            status === "TRIAL" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                "bg-slate-50 text-slate-700 border-slate-100"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full
                                        ${status === "ACTIVE" ? "bg-emerald-500" :
                                            status === "SUSPENDED" ? "bg-red-500" :
                                                status === "TRIAL" ? "bg-amber-500" : "bg-slate-400"}`} />
                                    {status}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            {schools.length} institution{schools.length !== 1 ? "s" : ""}{hasFilters ? " found" : " total"}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                <th className="px-8 py-5">Institution</th>
                                <th className="px-8 py-5">Subdomain</th>
                                <th className="px-8 py-5">Registration</th>
                                <th className="px-8 py-5">Metrics</th>
                                <th className="px-8 py-5">Stability</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {schools.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <Search size={40} className="text-slate-300" />
                                            <p className="text-slate-500 font-semibold">
                                                {hasFilters ? "No institutions match your search criteria." : "No institutions found."}
                                            </p>
                                            {hasFilters && (
                                                <Link href="/super-admin/schools" className="text-xs text-blue-600 hover:underline font-bold opacity-100">
                                                    Clear filters
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school: any) => (
                                    <tr key={school.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-blue-600 text-lg group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                    {school.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight">{school.name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{school.subscriptionPlan} VERSION</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-mono text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit cursor-pointer hover:bg-blue-600 hover:text-white transition-all">
                                                {school.slug}.edupro.io
                                                <ArrowUpRight size={14} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-medium">
                                            {new Date(school.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                                    <Users size={14} className="text-slate-400" />
                                                    {school._count.students}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                                                    <ShieldCheck size={14} className="text-slate-400" />
                                                    {school._count.users}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${school.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    school.status === 'SUSPENDED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-emerald-500' :
                                                        school.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}></div>
                                                {school.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <SchoolActions schoolId={school.id} currentStatus={school.status} school={school} />
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
