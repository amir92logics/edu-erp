"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Wallet,
    MessageSquare,
    Megaphone,
    Settings,
    ShieldCheck
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Classes", href: "/admin/classes", icon: GraduationCap },
    { label: "Fee Management", href: "/admin/fees", icon: Wallet },
    { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageSquare },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ plan }: { plan: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
            <div className="p-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-400 w-8 h-8" />
                <span className="text-xl font-bold tracking-tight">EduPro ERP</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white",
                                isActive && "bg-blue-600 text-white font-medium"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1 tracking-widest uppercase font-black">Account Type</p>
                    <p className="text-sm font-black text-blue-400">{plan} EDITION</p>
                    <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-blue-500 ${plan === 'PRO' ? 'w-full' : 'w-1/2'}`}></div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
