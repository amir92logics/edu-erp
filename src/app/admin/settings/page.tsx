import { getSchoolSettings } from "@/app/actions/settings";
import {
    Building2,
    CreditCard,
    ShieldCheck,
    Zap,
} from "lucide-react";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
    const settings = await getSchoolSettings();

    if (!settings) return <div className="p-10 text-center">Settings not found.</div>;

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your institution's profile, credentials, and platform preferences.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Current Plan</p>
                        <span className="text-sm font-bold text-blue-600 underline decoration-blue-100 underline-offset-4">{settings.subscriptionPlan} Edition</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <aside className="lg:col-span-1">
                    <nav className="space-y-1.5 sticky top-24">
                        {[
                            { label: "Institution Profile", icon: Building2, active: true },
                            { label: "Payment Gateways", icon: CreditCard, active: false },
                            { label: "Security & API", icon: ShieldCheck, active: false },
                            { label: "Subscription", icon: Zap, active: false },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <SettingsForm settings={settings} />
            </div>
        </div>
    );
}
