import { getAllSchools } from "@/app/actions/platform";
import {
    Plus,
    Search,
    Users,
    ArrowUpRight,
    ShieldCheck
} from "lucide-react";
import { SchoolActions } from "./SchoolActions";
import { OnboardSchoolModal } from "./OnboardSchoolModal";

export default async function SuperAdminSchoolsPage() {
    const schools = await getAllSchools();

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
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter institutions by name, slug or ID..."
                            className="w-full pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-sm font-medium"
                        />
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
                            {schools.map((school: any) => (
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
                                                school.status === 'SUSPENDED' ? 'bg-red-500' :
                                                    'bg-amber-500'
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
