import { getStudents } from "@/app/actions/students";
import { Plus, Search, Filter, Phone } from "lucide-react";
import Link from "next/link";
import { DeleteStudentButton } from "./DeleteStudentButton";
import { EditStudentModal } from "./EditStudentModal";
import { Student, Class } from "@prisma/client";

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams.q || "";
    const students = await getStudents(query);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Students</h1>
                    <p className="text-slate-500 text-sm">Manage student registrations and profiles.</p>
                </div>
                <Link
                    href="/admin/students/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200"
                >
                    <Plus size={18} />
                    Register Student
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <form className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            name="q"
                            defaultValue={query}
                            type="text"
                            placeholder="Search by name, roll no or phone..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        />
                    </form>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white bg-white transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                <th className="px-6 py-4">Student Info</th>
                                <th className="px-6 py-4">Roll Number</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">Parent Phone</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student: StudentWithClass) => (
                                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {student.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{student.name}</p>
                                                    <p className="text-[10px] text-slate-400">ID: {student.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {student.rollNumber || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                                                {student.class?.name || "Unassigned"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Phone size={14} className="text-slate-400" />
                                                {student.parentPhone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                ACTIVE
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <EditStudentModal student={student} />
                                                <DeleteStudentButton studentId={student.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                    <p>Showing {students.length} students</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
