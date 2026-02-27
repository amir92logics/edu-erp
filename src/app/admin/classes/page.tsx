import { getClasses } from "@/app/actions/classes";
import { Plus, GraduationCap, Users, Bookmark } from "lucide-react";
import { CreateClassModal } from "./CreateClassModal";
import { EditClassModal } from "./EditClassModal";
import { DeleteClassButton } from "./DeleteClassButton";

export default async function ClassesPage() {
    const classes = await getClasses();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Classes</h1>
                    <p className="text-slate-500 text-sm">Define class structures and fee assignments.</p>
                </div>
                <CreateClassModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400">
                        <GraduationCap size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No classes defined yet.</p>
                        <p className="text-xs">Create your first class to start registering students.</p>
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                                    <GraduationCap size={24} />
                                </div>
                                <DeleteClassButton classId={cls.id} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">{cls.name}</h3>
                            <p className="text-sm text-slate-500 mb-6 italic underline decoration-slate-200 underline-offset-4">{cls.teacherName || "No teacher assigned"}</p>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Students</p>
                                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                        <Users size={14} className="text-blue-500" />
                                        <span>{cls._count.students}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monthly Fee</p>
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                                        <Bookmark size={14} />
                                        <span>Rs. {Number(cls.monthlyFee).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <EditClassModal cls={cls} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
