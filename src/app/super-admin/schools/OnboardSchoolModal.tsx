"use client";

import { useState } from "react";
import { Plus, Building2, Globe, CreditCard, Loader2 } from "lucide-react";
import { onboardSchool } from "@/app/actions/platform";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function OnboardSchoolModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            slug: formData.get("slug") as string,
            subscriptionPlan: formData.get("plan") as string,
        };

        try {
            const result = await onboardSchool(data);
            if (result.success) {
                toast.success("School onboarded successfully!");
                setIsOpen(false);
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error("Failed to onboard school.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
            >
                <Plus size={20} />
                Onboard School
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader className="p-8 border-b border-slate-50">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">New Institution</DialogTitle>
                        <p className="text-slate-500 font-medium">Register a fresh school to the network.</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">School Legal Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        name="name"
                                        type="text"
                                        placeholder="e.g. Oxford Public School"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-bold border-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">System Slug (Identity)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        name="slug"
                                        type="text"
                                        placeholder="oxford-public"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all text-sm font-bold border-2"
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available at: slug.edupro.io</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Provisioning Tier</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <select
                                        name="plan"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none appearance-none transition-all text-sm font-bold border-2 cursor-pointer"
                                    >
                                        <option value="BASIC">Basic Edition</option>
                                        <option value="PRO">Pro Edition</option>
                                        <option value="ENTERPRISE">Enterprise Edition</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Deploy Institution
                                </>
                            )}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
