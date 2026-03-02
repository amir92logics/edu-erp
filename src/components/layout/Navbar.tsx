"use client";

import { Bell, LogOut, UserCircle, X, AlertTriangle } from "lucide-react";
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Logout confirmation"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-150">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="text-red-500" size={28} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Sign Out?</h2>
                        <p className="text-sm text-slate-500 mt-1.5">
                            You will be redirected to the login page.
                            Any unsaved changes will be lost.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isPending}
                            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-red-100"
                        >
                            {isPending ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogOut size={14} />
                                    Sign Out
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Navbar({ schoolName = "School Admin" }: { schoolName?: string }) {
    const [showModal, setShowModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleLogoutConfirm() {
        startTransition(async () => {
            await logout();
            // Hard navigation to clear all client-side state and Next.js cache
            window.location.href = "/";
        });
    }

    return (
        <>
            <LogoutConfirmModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleLogoutConfirm}
                isPending={isPending}
            />

            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30">
                {/* Left: school name */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none truncate max-w-[200px]">{schoolName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">School Management Portal</p>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-5">
                    {/* Notifications */}
                    <button
                        className="relative text-slate-500 hover:text-slate-900 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                    </button>

                    {/* Divider */}
                    <span className="w-px h-6 bg-slate-200" />

                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <UserCircle className="text-slate-400 w-8 h-8" />
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800 leading-none">
                                Administrator
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">School Admin</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                        aria-label="Sign out"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>
        </>
    );
}
