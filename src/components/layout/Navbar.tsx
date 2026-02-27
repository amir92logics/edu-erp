"use client";

import { Bell, Search, UserCircle } from "lucide-react";

export function Navbar() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-md w-96">
                <Search className="text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search students, invoices, settings..."
                    className="bg-transparent border-none outline-none text-sm w-full"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-600 hover:text-slate-900 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-semibold">City High School</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <UserCircle className="text-slate-400 w-9 h-9" />
                </div>
            </div>
        </header>
    );
}
