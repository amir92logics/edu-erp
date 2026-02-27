import { db } from "@/lib/db";
import {
    TrendingUp,
    CreditCard,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from "lucide-react";

export default async function RevenuePage() {
    const transactions = await db.transaction.findMany({
        include: {
            school: { select: { name: true } },
            student: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 30
    });

    const [totalRevenue, activeSchoolCount] = await Promise.all([
        db.transaction.aggregate({
            where: { status: "SUCCESS" },
            _sum: { amount: true }
        }),
        db.school.count({ where: { status: "ACTIVE" } })
    ]);

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Treasury</h1>
                    <p className="text-slate-500 font-medium mt-1">Global transaction tracking and commission analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">
                        Financial Reports
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross Volume (LTD)</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-2">Rs. {(Number(totalRevenue._sum.amount) || 0).toLocaleString()}</h3>
                    <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <ArrowUpRight size={18} />
                        <span>Platform performance snapshot</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard size={80} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Commission (2.5%)</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-2">Rs. {(Number(totalRevenue._sum.amount || 0) * 0.025).toLocaleString()}</h3>
                    <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-sm">
                        <TrendingUp size={18} />
                        <span>Calculated commission</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Calendar size={80} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Subscriptions</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-2">{activeSchoolCount} Schools</h3>
                    <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <ArrowUpRight size={18} />
                        <span>Real-time platform growth</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Recent Global Transactions</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by TXN ID..."
                                className="pl-12 pr-5 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl outline-none transition-all text-sm font-medium w-64"
                            />
                        </div>
                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                <th className="px-8 py-5">TXN Reference</th>
                                <th className="px-8 py-5">Institution</th>
                                <th className="px-8 py-5">Student</th>
                                <th className="px-8 py-5">Amount</th>
                                <th className="px-8 py-5">Method</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                                        No financial throughput detected yet.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 font-mono text-xs font-bold text-blue-600 uppercase tracking-tighter">
                                            {txn.transactionRef}
                                        </td>
                                        <td className="px-8 py-6 font-bold text-slate-900">
                                            {txn.school.name}
                                        </td>
                                        <td className="px-8 py-6 text-slate-600">
                                            {txn.student.name}
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-900">
                                            Rs. {Number(txn.amount).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-medium">
                                            {txn.method}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                txn.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
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
        </div>
    );
}
