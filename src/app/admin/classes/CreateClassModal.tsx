"use client";

import { useState } from "react";
import { Plus, GraduationCap, User, DollarSign, Loader2 } from "lucide-react";
import { createClass } from "@/app/actions/classes";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LimitExceededModal } from "@/components/ui/LimitExceededModal";

export function CreateClassModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [limitInfo, setLimitInfo] = useState<{ used: number; max: number; type: "classes" | "students" | "whatsapp" } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            teacherName: formData.get("teacherName") as string,
            monthlyFee: Number(formData.get("monthlyFee")),
        };

        try {
            const result = await createClass(data);
            if (result.success) {
                toast.success("Class created successfully!");
                setIsOpen(false);
                (e.target as HTMLFormElement).reset();
            } else if (result.limitExceeded) {
                setIsOpen(false);
                setLimitInfo({ used: result.used!, max: result.max!, type: result.type as any });
            } else {
                toast.error("Failed to create class.");
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
                <Plus size={18} />
                Create Class
            </button>

            {limitInfo && (
                <LimitExceededModal
                    isOpen={!!limitInfo}
                    onClose={() => setLimitInfo(null)}
                    type="classes"
                    used={limitInfo.used}
                    max={limitInfo.max}
                />
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader className="p-6 border-b border-slate-50">
                        <DialogTitle className="text-xl font-bold text-slate-900">Define New Class</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Class Name</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required
                                        name="name"
                                        type="text"
                                        placeholder="e.g. Class 10-A"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold border-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Teacher</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        name="teacherName"
                                        type="text"
                                        placeholder="e.g. Mr. Ahmed"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold border-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Standard Monthly Fee</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        required
                                        name="monthlyFee"
                                        type="number"
                                        placeholder="4500"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all text-sm font-semibold border-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Finalize Class"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
