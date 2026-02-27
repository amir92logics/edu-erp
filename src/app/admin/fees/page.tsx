import { getPendingFees } from "@/app/actions/fees";
import { getClasses } from "@/app/actions/classes";
import { getFeeStats } from "@/app/actions/stats";
import { GenerateFeesModal } from "./GenerateFeesModal";
import { ManualPaymentModal } from "./ManualPaymentModal";
import {
    Wallet,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";

import { ReminderButton } from "./ReminderButton";

export default async function FeesPage() {
    const pendingFees = await getPendingFees();
    const stats = await getFeeStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fee Management</h1>
                    <p className="text-slate-500 text-sm">Monitor collections and generate monthly invoices.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-semibold hover:bg-slate-50 transition-all text-slate-700">
                        <Download size={18} />
                        Export CSV
                    </button>
                    <GenerateFeesModal />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Collection (This Month)</p>
                            <h3 className="text-2xl font-bold text-slate-900">Rs. {stats.collection.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[65%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Target: Rs. {(stats.collection + stats.outstanding).toLocaleString()}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Outstanding Fees</p>
                            <h3 className="text-2xl font-bold text-slate-900">Rs. {stats.outstanding.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded inline-block">
                        {stats.pendingCount} students overdue
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Paid Today</p>
                            <h3 className="text-2xl font-bold text-slate-900">Rs. {stats.paidTodayAmount.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded inline-block">
                        {stats.paidTodayCount} transactions processed
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Pending Invoices</h2>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                            <Filter size={14} /> Filters
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Month/Year</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingFees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <CheckCircle2 size={48} className="text-emerald-500" />
                                            <p className="text-slate-500 italic font-medium">Great! There are no pending fees at the moment.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingFees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            {fee.id.substring(0, 12).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{fee.student.name}</p>
                                            <p className="text-[10px] text-slate-500">{fee.student.class?.name}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-600 uppercase">
                                            {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(fee.year, fee.month - 1))} {fee.year}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            Rs. {Number(fee.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-semibold">{new Date(fee.dueDate).toLocaleDateString()}</span>
                                                {new Date(fee.dueDate) < new Date() && (
                                                    <span className="text-[10px] text-red-500 font-bold">OVERDUE</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">
                                                PENDING
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <ReminderButton feeId={fee.id} />
                                                <ManualPaymentModal
                                                    feeId={fee.id}
                                                    amount={Number(fee.amount)}
                                                    studentName={fee.student.name}
                                                />
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
