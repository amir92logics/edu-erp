import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { getSchoolPlan, getSchoolName } from "@/app/actions/settings";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [plan, schoolName] = await Promise.all([
        getSchoolPlan(),
        getSchoolName(),
    ]);

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <Sidebar plan={plan} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Navbar schoolName={schoolName} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
