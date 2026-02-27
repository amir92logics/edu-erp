import {
    Settings as SettingsIcon,
    Save,
    Bell,
    Shield,
    Zap,
    MessageSquare,
    DollarSign
} from "lucide-react";

export default function PlatformSettingsPage() {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Configuration</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage global system parameters and regional configurations.</p>
                </div>
                <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all">
                    <Save size={20} />
                    Apply Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <nav className="space-y-2">
                    {[
                        { label: "General System", icon: SettingsIcon, active: true },
                        { label: "Security & Auth", icon: Shield },
                        { label: "Payment Gateways", icon: DollarSign },
                        { label: "Communication", icon: MessageSquare },
                        { label: "API & Webhooks", icon: Zap },
                        { label: "Notifications", icon: Bell },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${item.active
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Global Parameters</h2>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Service Maintenance</label>
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-700">Maintenance Mode</p>
                                            <p className="text-xs text-slate-400 mt-1">Disable school access globally</p>
                                        </div>
                                        <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Platform Fee (%)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            defaultValue="2.5"
                                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl outline-none transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Default Trial Period (Days)</label>
                                <input
                                    type="number"
                                    defaultValue="30"
                                    className="w-48 px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-2xl outline-none transition-all text-sm font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-50">Legal & Transparency</h2>
                        <div className="space-y-6">
                            {[
                                "Privacy Operations Protocol",
                                "EULA Master Template",
                                "Data Processing Agreement (DPA)"
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-slate-100 transition-colors">
                                    <span className="text-sm font-bold text-slate-700">{doc}</span>
                                    <Zap className="text-slate-300 group-hover:text-amber-500 transition-colors" size={18} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
