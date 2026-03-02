import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { SuperAdminNavbar } from "@/components/layout/SuperAdminNavbar";

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
                <SuperAdminNavbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
