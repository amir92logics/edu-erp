import { getAdminStats } from "@/app/actions/stats";
import {
    Users,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Plus,
    ArrowRight,
    MessageSquare,
    CheckCircle2
} from "lucide-react";
import { WhatsAppStatus } from "./WhatsAppStatus";

export default async function DashboardPage() {
    const statsData = await getAdminStats();

    const summaryCards = [
        { label: "Total Students", value: statsData.studentCount.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", growth: statsData.studentGrowth },
        { label: "Monthly Revenue", value: `Rs. ${statsData.currentMonthRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", growth: statsData.revenueGrowth },
        { label: "Pending Fees", value: `${statsData.pendingCount} students`, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Recent Payments", value: `${statsData.recentTransactions.length} today`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">School Overview</h1>
                    <p className="text-slate-500">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium hover:bg-slate-50 transition-colors">
                        Generate Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-shadow">
                        <Plus size={18} />
                        Quick Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((stat, i) => (
                    <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        {stat.growth && (
                            <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${Number(stat.growth) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <TrendingUp size={12} className={Number(stat.growth) < 0 ? 'rotate-180' : ''} />
                                <span>{stat.growth}% from last month</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                        <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            View all <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 italic text-slate-400">
                                    <th className="pb-3 font-medium">Student</th>
                                    <th className="pb-3 font-medium">Method</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium text-right">Amount</th>
                                    <th className="pb-3 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {statsData.recentTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                                            No recent activity detected.
                                        </td>
                                    </tr>
                                ) : (
                                    statsData.recentTransactions.map((txn) => (
                                        <tr key={txn.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-4">
                                                <p className="font-semibold text-slate-900">{txn.studentName}</p>
                                                <p className="text-xs text-slate-500 underline decoration-slate-300">{txn.className}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase">{txn.method}</span>
                                            </td>
                                            <td className="py-4 text-slate-500">{txn.date}</td>
                                            <td className="py-4 text-right font-bold text-slate-900">Rs. {txn.amount.toLocaleString()}</td>
                                            <td className="py-4 text-right">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${txn.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 font-display tracking-tight flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        WhatsApp Gateway
                    </h2>
                    <WhatsAppStatus />
                </div>
            </div>
        </div>
    );
}
