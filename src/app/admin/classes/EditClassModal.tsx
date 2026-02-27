"use client";

import { useState } from "react";
import { Settings2, GraduationCap, User, Bookmark, Loader2, Save } from "lucide-react";
import { updateClass } from "@/app/actions/classes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditClassModal({ cls }: { cls: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
            const result = await updateClass(cls.id, data);
            if (result.success) {
                toast.success("Class structure updated!");
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update class.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
            >
                <Settings2 size={14} /> Edit Structure
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <DialogTitle className="text-xl font-bold text-slate-900">Edit Class Structure</DialogTitle>
                        <p className="text-sm text-slate-500">Update configuration for {cls.name}.</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <GraduationCap size={14} /> Class Name
                                </label>
                                <input
                                    required
                                    name="name"
                                    defaultValue={cls.name}
                                    placeholder="e.g. Grade 10-A"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <User size={14} /> Class Teacher
                                </label>
                                <input
                                    name="teacherName"
                                    defaultValue={cls.teacherName || ""}
                                    placeholder="e.g. Mr. Ahmed Khan"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Bookmark size={14} /> Monthly Fee (PKR)
                                </label>
                                <input
                                    required
                                    type="number"
                                    name="monthlyFee"
                                    defaultValue={Number(cls.monthlyFee)}
                                    placeholder="e.g. 5000"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
