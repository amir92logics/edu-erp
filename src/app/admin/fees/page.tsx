import { getPendingFees } from "@/app/actions/fees";
import { getFeeStats } from "@/app/actions/stats";
import { GenerateFeesModal } from "./GenerateFeesModal";
import { ManualPaymentModal } from "./ManualPaymentModal";
import {
    Calendar,
    Download,
    CheckCircle2,
    Clock,
    Search,
    X,
    SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { ReminderButton } from "./ReminderButton";
import { WhatsAppNotificationControl } from "./WhatsAppNotificationControl";

const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

export default async function FeesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; month?: string; year?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const month = params.month || "";
    const year = params.year || "";

    const [pendingFees, stats] = await Promise.all([
        getPendingFees(query, month, year),
        getFeeStats(),
    ]);

    const hasFilters = Boolean(query || month || year);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

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

            {/* Stats Cards */}
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
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                        Target: Rs. {(stats.collection + stats.outstanding).toLocaleString()}
                    </p>
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

            <WhatsAppNotificationControl />

            {/* Pending Invoices Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Pending Invoices</h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {pendingFees.length} record{pendingFees.length !== 1 ? "s" : ""}{hasFilters ? " (filtered)" : ""}
                        </span>
                    </div>

                    {/* Filter Row */}
                    <form method="GET" className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                            <input
                                name="q"
                                defaultValue={query}
                                type="text"
                                placeholder="Search by student name or roll no..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div className="relative">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                            <select
                                name="month"
                                defaultValue={month}
                                className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="">All Months</option>
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                            <select
                                name="year"
                                defaultValue={year}
                                className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="">All Years</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-100"
                        >
                            Filter
                        </button>

                        {hasFilters && (
                            <Link
                                href="/admin/fees"
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                            >
                                <X size={14} /> Clear
                            </Link>
                        )}
                    </form>

                    {hasFilters && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {query && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold">
                                    <Search size={10} /> &quot;{query}&quot;
                                </span>
                            )}
                            {month && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-semibold">
                                    📅 {MONTHS.find((m) => m.value === month)?.label}
                                </span>
                            )}
                            {year && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold">
                                    📆 {year}
                                </span>
                            )}
                        </div>
                    )}
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
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <CheckCircle2 size={48} className="text-emerald-500" />
                                            <p className="text-slate-500 italic font-medium">
                                                {hasFilters ? "No invoices match the current filters." : "Great! There are no pending fees at the moment."}
                                            </p>
                                            {hasFilters && (
                                                <Link href="/admin/fees" className="text-xs text-blue-600 hover:underline font-semibold opacity-100">
                                                    Clear filters
                                                </Link>
                                            )}
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
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold">PENDING</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <ReminderButton feeId={fee.id} />
                                                <ManualPaymentModal feeId={fee.id} amount={Number(fee.amount)} studentName={fee.student.name} />
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
