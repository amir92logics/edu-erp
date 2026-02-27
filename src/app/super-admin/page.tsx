import {
    School,
    CreditCard,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    Plus,
    ArrowRight
} from "lucide-react";
import { db } from "@/lib/db";
import { OnboardSchoolModal } from "./schools/OnboardSchoolModal";

export default async function SuperAdminDashboard() {
    // 1. Fetch real platform data
    const [schoolCount, activeSubscriptions, totalStudents, lastMonthRevenue] = await Promise.all([
        db.school.count(),
        db.school.count({ where: { status: "ACTIVE" } }),
        db.student.count(),
        db.transaction.aggregate({
            where: {
                status: "SUCCESS",
                createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
            },
            _sum: { amount: true }
        })
    ]);

    const stats = [
        { label: "Partner Schools", value: schoolCount.toString(), icon: School, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Students", value: totalStudents.toLocaleString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Active Subs", value: activeSubscriptions.toString(), icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Monthly Revenue", value: `Rs. ${(lastMonthRevenue._sum.amount || 0).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    const recentSchools = await db.school.findMany({
        take: 4,
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Insights</h1>
                    <p className="text-slate-500 font-medium mt-1">Global performance metrics for EduPro SaaS network.</p>
                </div>
                <OnboardSchoolModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black mt-2 text-slate-900">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                <Search size={12} /> Live Tracking
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Real-time Data</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Recent School Deployments</h2>
                        <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            Manage Pipeline <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentSchools.map((school, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-blue-600 text-lg shadow-sm">
                                        {school.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-none">{school.name}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono tracking-tighter">{school.slug}.edupro.io</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Plan</p>
                                        <p className="text-xs font-bold text-slate-700">{school.subscriptionPlan}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black px-3 py-1 rounded-full border ${school.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            school.status === 'SUSPENDED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {school.status}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-bold italic">
                                            {new Date(school.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <ArrowUpRight className="text-slate-300" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CreditCard size={120} />
                        </div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                            Revenue Real-time
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Commission Earnings</p>
                                <h3 className="text-4xl font-black mt-2">Rs. {(Number(lastMonthRevenue._sum.amount || 0) * 0.025).toLocaleString()}</h3>
                                <p className="text-xs text-slate-400 mt-1 italic">Calculated at 2.5% platform fee</p>
                            </div>
                            <div className="pt-6 border-t border-slate-800">
                                <button className="w-full py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
                                    Settlement Report
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Service Health</h2>
                        <div className="space-y-4">
                            {[
                                { label: "Auth Gateway", status: "Healthy" },
                                { label: "Payment Webhooks", status: "Healthy" },
                                { label: "WA Instance Manager", status: "Healthy" },
                            ].map((service, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{service.label}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${service.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {service.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
