import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { getSchoolPlan, getSchoolName } from "@/app/actions/settings";

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
        <div className="flex h-screen bg-slate-50">
            <Sidebar plan={plan} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar schoolName={schoolName} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
