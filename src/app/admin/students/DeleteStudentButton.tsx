"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteStudent } from "@/app/actions/students";
import { toast } from "sonner";

export function DeleteStudentButton({ studentId }: { studentId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const result = await deleteStudent(studentId);
            if (result.success) {
                toast.success("Student deleted successfully");
            } else {
                toast.error("Failed to delete student");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Student"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
    );
}
