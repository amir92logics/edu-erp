"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await login({ email, password });
            console.log("Login client result:", result);

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else if (result.redirect) {
                console.log("Redirecting to:", result.redirect);
                // Ensure redirect happens
                window.location.href = result.redirect;
            } else {
                setLoading(false);
                setError("Unknown response from server");
            }
        } catch (e: any) {
            console.error("Client login error:", e);
            setError("Connection error. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">EduPro ERP</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage your institution</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="admin@school.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-blue-600 hover:underline">Forgot password?</a>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500">
                            Need a demo? <a href="#" className="text-blue-600 font-bold hover:underline">Contact Sales</a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-8">
                    © 2026 EduPro SaaS Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
