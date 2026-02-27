"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    School,
    CreditCard,
    ShieldCheck,
    Settings,
    Users,
    Activity,
    LogOut
} from "lucide-react";
import { logout } from "@/app/actions/auth";

const superAdminMenuItems = [
    { label: "Dashboard", href: "/super-admin", icon: BarChart3 },
    { label: "Partner Schools", href: "/super-admin/schools", icon: School },
    { label: "Revenue & Billing", href: "/super-admin/revenue", icon: CreditCard },
    { label: "System Audit", href: "/super-admin/audit", icon: Activity },
    { label: "Platform Settings", href: "/super-admin/settings", icon: Settings },
];

export function SuperAdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-68 bg-slate-950 text-white min-h-screen flex flex-col border-r border-slate-800">
            <div className="p-8 flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <div>
                    <span className="text-lg font-black tracking-tight block leading-none">EduPro ERP</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Core Platform</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                {superAdminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-900 hover:text-white group",
                                isActive && "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-semibold"
                            )}
                        >
                            <Icon size={18} className={cn("transition-colors", isActive ? "text-blue-400" : "group-hover:text-white")} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-slate-900">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
