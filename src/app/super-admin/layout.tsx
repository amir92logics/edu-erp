import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { SuperAdminNavbar } from "@/components/layout/SuperAdminNavbar";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

export const dynamic = "force-dynamic";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <SuperAdminSidebar />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <SuperAdminNavbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
