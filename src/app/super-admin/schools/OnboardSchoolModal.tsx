"use client";

import { useState } from "react";
import { Plus, Building2, Globe, CreditCard, Loader2, Mail, Lock, Zap, Activity } from "lucide-react";
import { onboardSchool } from "@/app/actions/platform";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function OnboardSchoolModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => data[key] = value);

        try {
            const result = await onboardSchool(data);
            if (result.success) {
                toast.success("School and Admin account created successfully!");
                setIsOpen(false);
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error(result.error || "Failed to onboard school.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-blue-600 text-white rounded-2xl sm:rounded-xl text-sm font-bold shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
            >
                <Plus size={20} />
                <span>Deploy New Institution</span>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-3xl p-0">
                    <div className="bg-slate-900 px-8 py-10 text-white sticky top-0 z-10">
                        <DialogTitle className="text-3xl font-black tracking-tight leading-none mb-2">Institution Onboarding</DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">Provision a fresh multi-tenant node and admin credentials.</DialogDescription>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Section 1: Identity & Entity */}
                        <div className="md:col-span-2 flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                            <Building2 className="text-blue-600" size={18} />
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Organization Details</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Legal Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required name="name" placeholder="e.g. Oxford High" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Slug (Tenancy)</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required name="slug" placeholder="oxford-high" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required type="email" name="schoolEmail" placeholder="admin@oxford.edu" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        {/* Section 2: Administrative Login */}
                        <div className="md:col-span-2 flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                            <Lock className="text-orange-500" size={18} />
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Admin Credentials</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Login Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required type="email" name="adminEmail" placeholder="principal@domain.com" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password (Min 8 characters)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required type="password" name="adminPassword" minLength={8} placeholder="••••••••" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        {/* Section 3: Provisioning Limits */}
                        <div className="md:col-span-2 flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                            <Zap className="text-blue-500" size={18} />
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Resource Allocation</h3>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subscription Tier</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <select name="subscriptionPlan" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all appearance-none cursor-pointer">
                                    <option value="BASIC">Basic Edition</option>
                                    <option value="PRO">Pro Edition</option>
                                    <option value="ENTERPRISE">Enterprise Edition</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daily WhatsApp Limit</label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input required type="number" name="maxWhatsappPerDay" defaultValue={100} className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all" />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Status</label>
                            <div className="relative">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <select name="status" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none text-sm font-bold border-2 transition-all appearance-none cursor-pointer">
                                    <option value="TRIAL">Active Trial (30 Days)</option>
                                    <option value="ACTIVE">Paid Subscriber</option>
                                    <option value="SUSPENDED">Suspended / Pending Payment</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Plus size={20} /> Deploy Multi-Tenant Node
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
