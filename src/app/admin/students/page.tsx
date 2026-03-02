import { getStudents } from "@/app/actions/students";
import { getClasses } from "@/app/actions/classes";
import { Plus, Search, Phone, Users, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { DeleteStudentButton } from "./DeleteStudentButton";
import { EditStudentModal } from "./EditStudentModal";
import { Student, Class } from "@prisma/client";

type StudentWithClass = Student & { class: Class | null };

export default async function StudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; classId?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const classId = params.classId || "";

    const [students, classes] = await Promise.all([
        getStudents(query, classId),
        getClasses(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage student registrations and profiles.</p>
                </div>
                <Link
                    href="/admin/students/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl sm:rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    <span>Register Student</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <form className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3" method="GET">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            <input
                                name="q"
                                defaultValue={query}
                                type="text"
                                placeholder="Search by name, roll no or phone..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium h-10"
                            />
                        </div>

                        {/* Class filter */}
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            <select
                                name="classId"
                                defaultValue={classId}
                                className="w-full pl-8 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer h-10"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 lg:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/10 h-10"
                            >
                                Search
                            </button>

                            {(query || classId) && (
                                <Link
                                    href="/admin/students"
                                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5 h-10"
                                >
                                    <X size={14} />
                                    <span className="hidden sm:inline">Clear</span>
                                </Link>
                            )}
                        </div>
                    </form>
                </div>

                {/* Active filter pills */}
                {(query || classId) && (
                    <div className="px-4 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active filters:</span>
                        {query && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-full text-xs font-semibold shadow-sm">
                                <Search size={10} /> &quot;{query}&quot;
                            </span>
                        )}
                        {classId && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-purple-700 border border-purple-200 rounded-full text-xs font-semibold shadow-sm">
                                <Users size={10} /> {classes.find(c => c.id === classId)?.name || "Class"}
                            </span>
                        )}
                    </div>
                )}

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
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Users size={24} className="text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 font-medium">
                                                {query || classId ? "No students match the current filters." : "No students found."}
                                            </p>
                                            {(query || classId) && (
                                                <Link href="/admin/students" className="text-xs text-blue-600 hover:underline font-semibold">
                                                    Clear filters
                                                </Link>
                                            )}
                                        </div>
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
                    <p>
                        Showing <span className="font-bold text-slate-700">{students.length}</span> student{students.length !== 1 ? "s" : ""}
                        {(query || classId) && <span className="text-blue-600 font-semibold"> (filtered)</span>}
                    </p>
                </div>
            </div>
        </div>
    );
}
