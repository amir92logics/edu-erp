"use client";

import { useState } from "react";
import { UserCheck, User, Hash, Phone, Loader2, Save } from "lucide-react";
import { updateStudent } from "@/app/actions/students";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function EditStudentModal({ student }: { student: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            rollNumber: formData.get("rollNumber") as string || undefined,
            parentPhone: formData.get("parentPhone") as string,
            classId: student.classId, // Maintain class association
        };

        try {
            const result = await updateStudent(student.id, data);
            if (result.success) {
                toast.success("Student profile updated!");
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to update student.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit Profile"
            >
                <UserCheck size={16} />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Edit Student</DialogTitle>
                            <p className="text-sm text-slate-500">Update information for {student.name}.</p>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </label>
                                <input
                                    required
                                    name="name"
                                    defaultValue={student.name}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Hash size={14} /> Roll Number (Optional)
                                </label>
                                <input
                                    name="rollNumber"
                                    defaultValue={student.rollNumber || ""}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Phone size={14} /> Parent Phone
                                </label>
                                <input
                                    required
                                    name="parentPhone"
                                    defaultValue={student.parentPhone}
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
