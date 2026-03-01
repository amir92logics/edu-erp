import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import {
    ShieldCheck,
    Calendar,
    User,
    Building2,
    Hash,
    GraduationCap,
    Phone,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { PaymentButtons } from "./PaymentButtons";

export default async function PaymentPage({
    params,
    searchParams,
}: {
    params: Promise<{ feeId: string }>;
    searchParams: Promise<{ status?: string }>;
}) {
    const { feeId } = await params;
    const { status: returnStatus } = await searchParams;

    const fee = await db.fee.findUnique({
        where: { id: feeId },
        include: {
            student: { include: { class: true } },
            school: true,
            transactions: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!fee) return notFound();

    const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        new Date(fee.year, fee.month - 1)
    );

    const totalAmount = Number(fee.amount) + Number(fee.lateFine);
    const isPaid = fee.status === "PAID";

    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="text-slate-400">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-md space-y-5">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3 shadow-xl shadow-blue-400/30">
                        <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fee Payment Portal</h1>
                    <p className="text-slate-500 text-sm mt-1">Secure payment for <span className="font-bold text-slate-700">{fee.school.name}</span></p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

                    {/* Amount Banner */}
                    <div className={`p-6 text-center relative overflow-hidden ${isPaid ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-slate-900 to-blue-900"}`}>
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white rounded-full" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full" />
                        </div>
                        <div className="relative">
                            {isPaid ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 size={36} className="text-white" />
                                    <p className="text-white font-black text-xl">Already Paid</p>
                                    <p className="text-emerald-200 text-sm">This fee has been settled</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount Due</p>
                                    <div className="text-white font-black text-5xl flex items-start justify-center gap-1">
                                        <span className="text-xl mt-2 text-slate-300">Rs.</span>
                                        {totalAmount.toLocaleString()}
                                    </div>
                                    {Number(fee.lateFine) > 0 && (
                                        <p className="text-amber-400 text-xs font-bold mt-2">
                                            Includes Rs. {Number(fee.lateFine).toLocaleString()} late fine
                                        </p>
                                    )}
                                    <p className="text-slate-400 text-xs mt-1">{monthName} {fee.year} • Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="px-6 pt-4 pb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Details</p>
                        <InfoRow icon={<User size={15} />} label="Full Name" value={fee.student.name} />
                        <InfoRow icon={<Hash size={15} />} label="Student ID" value={fee.student.id.substring(0, 12).toUpperCase()} />
                        {fee.student.rollNumber && (
                            <InfoRow icon={<Hash size={15} />} label="Roll Number" value={fee.student.rollNumber} />
                        )}
                        <InfoRow icon={<GraduationCap size={15} />} label="Class" value={fee.student.class?.name ?? "N/A"} />
                        <InfoRow icon={<Phone size={15} />} label="Parent Contact" value={fee.student.parentPhone} />
                        <InfoRow icon={<Building2 size={15} />} label="Institution" value={fee.school.name} />
                        <InfoRow icon={<Calendar size={15} />} label="Billing Period" value={`${monthName} ${fee.year}`} />
                    </div>

                    {/* Fee Reference */}
                    <div className="mx-6 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Reference ID</p>
                        <p className="font-mono text-xs text-slate-600 font-bold mt-0.5 break-all">{fee.id}</p>
                    </div>

                    {/* Gateway Status Banner (after redirect back from JazzCash/Easypaisa) */}
                    {returnStatus === "success" && !isPaid && (
                        <div className="mx-6 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex gap-2">
                            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 font-medium">Payment received — status is being confirmed via webhook. Please allow a moment.</p>
                        </div>
                    )}
                    {returnStatus === "failed" && (
                        <div className="mx-6 mb-4 p-3 bg-red-50 rounded-xl border border-red-200 flex gap-2">
                            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 font-medium">The transaction was declined by the gateway. Please retry with a different method.</p>
                        </div>
                    )}

                    {/* Payment Actions */}
                    <div className="p-6 pt-2">
                        {isPaid ? (
                            <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                <span className="text-emerald-700 font-bold text-sm">No payment required</span>
                            </div>
                        ) : (
                            <PaymentButtons
                                feeId={fee.id}
                                amount={totalAmount}
                                studentName={fee.student.name}
                            />
                        )}
                    </div>
                </div>

                {/* Security Footer */}
                <p className="text-center text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    🔒 SSL Secured &amp; PCI DSS Compliant • EduPro SaaS Platform
                </p>
            </div>
        </div>
    );
}
