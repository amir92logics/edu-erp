import { db } from "@/lib/db";
import {
    Zap,
    ChevronLeft,
    Save,
    LayoutDashboard,
    MessageSquare,
    CreditCard,
    Users,
    Activity
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function SchoolFeaturesPage({ params }: PageProps) {
    const schoolId = params.id;

    const school = await db.school.findUnique({
        where: { id: schoolId },
        include: { featureFlags: true }
    });

    if (!school) return notFound();

    const availableFeatures = [
        { key: "WHATSAPP_AUTOMATION", label: "WhatsApp Automation", description: "Enable automated fee reminders via WhatsApp API.", icon: MessageSquare },
        { key: "ONLINE_PAYMENTS", label: "Online Payments", description: "Allow JazzCash and Easypaisa integrations for students.", icon: CreditCard },
        { key: "ID_CARD_GENERATION", label: "ID Card Generation", description: "Generate printable student identity cards with QR codes.", icon: Users },
        { key: "SMS_NOTIFICATIONS", label: "SMS Notifications", description: "Send bulk SMS alerts for attendance and results.", icon: MessageSquare },
        { label: "Real-time Attendance", description: "Track teacher and student attendance via mobile app.", icon: Activity },
    ];

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link
                        href="/super-admin/schools"
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50"
                    >
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Feature Flags</h1>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                {school.name}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium mt-1">Gating and entitlement management for specific institution modules.</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">
                    <Save size={20} />
                    Persist Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableFeatures.map((feature, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                <feature.icon size={28} />
                            </div>
                            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer group-hover:bg-slate-300">
                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-black text-slate-900">{feature.label}</h3>
                            <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Entitlement Level</span>
                            <div className="mt-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                                {school.subscriptionPlan} PLAN
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
