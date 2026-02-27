"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteClass } from "@/app/actions/classes";
import { toast } from "sonner";

export function DeleteClassButton({ classId }: { classId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this class? This action cannot be undone and is only possible if no students are assigned.")) return;

        setLoading(true);
        try {
            const result = await deleteClass(classId);
            if (result.success) {
                toast.success("Class deleted successfully");
            } else {
                toast.error("Failed to delete class");
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
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Class"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    );
}
