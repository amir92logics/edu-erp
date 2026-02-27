import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";

export const dynamic = "force-dynamic";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50">
            <SuperAdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="text-slate-900 font-bold">Platform Admin</span>
                        <span className="text-slate-300">/</span>
                        <span>Infrastructure</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            SYSTEM ONLINE
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
