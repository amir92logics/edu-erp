"use client";

import { useState } from "react";
import {
    Building2,
    CreditCard,
    Save,
    Mail,
    Phone as PhoneIcon,
    MapPin,
    Globe,
    Loader2
} from "lucide-react";
import { updateSchoolProfile, updateMerchantCredentials } from "@/app/actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                name: formData.get("name") as string,
                contactEmail: formData.get("contactEmail") as string,
                contactPhone: formData.get("contactPhone") as string,
                address: formData.get("address") as string,
            };
            const result = await updateSchoolProfile(data);
            if (result.success) {
                toast.success("Profile updated successfully");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveMerchant(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const data = {
                jazzCashMerchantId: formData.get("jazzCashMerchantId") as string,
                jazzCashSalt: formData.get("jazzCashSalt") as string,
            };
            const result = await updateMerchantCredentials(data);
            if (result.success) {
                toast.success("Merchant credentials updated");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update credentials");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="lg:col-span-3 space-y-12">
            {/* Institution Profile */}
            <form onSubmit={handleSaveProfile} className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Institution Profile</h2>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Institution Name</label>
                        <input
                            required
                            name="name"
                            defaultValue={settings.name}
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-slate-800 shadow-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Public Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="contactEmail"
                                type="email"
                                defaultValue={settings.contactEmail || ''}
                                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-medium text-slate-700 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                name="contactPhone"
                                defaultValue={settings.contactPhone || ''}
                                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-medium text-slate-700 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Postal Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                            <textarea
                                required
                                name="address"
                                rows={3}
                                defaultValue={settings.address || ''}
                                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none font-medium text-slate-700 resize-none shadow-sm"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </form>

            {/* Payment Gateways */}
            <form onSubmit={handleSaveMerchant} className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm space-y-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 font-bold">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Payment Gateways</h2>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Credentials
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-200/60 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-red-600 font-black italic">JC</div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter">JazzCash Merchant</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">
                                Active Integration
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Merchant ID</label>
                                <input
                                    name="jazzCashMerchantId"
                                    type="password"
                                    defaultValue={settings.jazzCashMerchantId || ''}
                                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-mono shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Secret Salt</label>
                                <input
                                    name="jazzCashSalt"
                                    type="password"
                                    defaultValue={settings.jazzCashSalt || ''}
                                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm font-mono shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-200/60 opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 font-black italic">EP</div>
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter">Easypaisa Merchant</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">Under Maintenance</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium italic">Easypaisa integration is currently being optimized for the next update.</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
