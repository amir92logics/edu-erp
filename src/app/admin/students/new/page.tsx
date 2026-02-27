"use client";

import { useState, useEffect } from "react";
import { addStudent } from "@/app/actions/students";
import { getClasses } from "@/app/actions/classes";
import { useRouter } from "next/navigation";
import {
    UserPlus,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Phone,
    User,
    Hash,
    GraduationCap
} from "lucide-react";
import Link from "next/link";
import { LimitExceededModal } from "@/components/ui/LimitExceededModal";

export default function NewStudentPage() {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [limitInfo, setLimitInfo] = useState<{ used: number; max: number } | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const data = await getClasses();
            setClasses(data);
        }
        fetchData();
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            rollNumber: formData.get("rollNumber") as string,
            parentPhone: formData.get("parentPhone") as string,
            classId: formData.get("classId") as string,
        };

        const result = await addStudent(data);

        if (result.success) {
            router.push("/admin/students");
        } else if (result.limitExceeded) {
            setLoading(false);
            setLimitInfo({ used: result.used!, max: result.max! });
        } else {
            setLoading(false);
            alert("Error adding student. Please check the data.");
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {limitInfo && (
                <LimitExceededModal
                    isOpen={!!limitInfo}
                    onClose={() => setLimitInfo(null)}
                    type="students"
                    used={limitInfo.used}
                    max={limitInfo.max}
                />
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/students"
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register Student</h1>
                        <p className="text-slate-500 text-sm font-medium">Capture essential details for the new academic record.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Student Name */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="e.g. Abdullah Khan"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Roll Number */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Roll Number</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="rollNumber"
                                    type="text"
                                    placeholder="e.g. 2024-001"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Parent Phone */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Parent Phone (WhatsApp)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    name="parentPhone"
                                    type="text"
                                    required
                                    placeholder="e.g. 03001234567"
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Class Assignment */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assign to Class</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    name="classId"
                                    required
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-bold text-slate-800 appearance-none shadow-sm"
                                >
                                    <option value="">Select a class...</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} (Fee: Rs. {Number(cls.monthlyFee).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/students"
                        className="px-8 py-3.5 text-slate-500 font-bold hover:text-slate-900 transition-all"
                    >
                        Discard
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Register Enrollment</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
