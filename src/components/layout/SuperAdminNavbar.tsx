"use client";

import { Bell, LogOut, UserCircle, X, AlertTriangle, ShieldAlert } from "lucide-react";
import { useState, useTransition } from "react";
import { logout } from "@/app/actions/auth";

function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isPending,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-150">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <X size={16} />
                </button>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="text-red-500" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Sign Out?</h2>
                        <p className="text-sm text-slate-500 mt-1.5">You will be redirected to the login page.</p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button onClick={onClose} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">Cancel</button>
                        <button onClick={onConfirm} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-red-100">
                            {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogOut size={14} /> Sign Out</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SuperAdminNavbar() {
    const [showModal, setShowModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleLogoutConfirm() {
        startTransition(async () => {
            await logout();
            window.location.href = "/";
        });
    }

    return (
        <>
            <LogoutConfirmModal isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={handleLogoutConfirm} isPending={isPending} />
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-10 sticky top-0 z-30">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium font-sans">
                    <ShieldAlert className="text-blue-600" size={18} />
                    <span className="text-slate-900 font-bold">Platform Admin</span>
                    <span className="text-slate-300">/</span>
                    <span>Infrastructure</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        SYSTEM ONLINE
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>
        </>
    );
}
