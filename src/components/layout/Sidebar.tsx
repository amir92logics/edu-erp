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
    ShieldCheck,
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
            {/* Brand */}
            <div className="p-6 flex items-center gap-2 border-b border-slate-800">
                <ShieldCheck className="text-blue-400 w-8 h-8 flex-shrink-0" />
                <span className="text-xl font-bold tracking-tight">EduPro ERP</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === "/admin"
                            ? pathname === "/admin" || pathname === "/admin/dashboard"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white",
                                isActive && "bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20"
                            )}
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Copyright — sticky at bottom, no promotional content */}
            <div className="p-4 border-t border-slate-800 mt-auto">
                <p className="text-center text-slate-400 text-xs leading-relaxed">
                    © 2026 AM Business Automation
                </p>
            </div>
        </aside>
    );
}
