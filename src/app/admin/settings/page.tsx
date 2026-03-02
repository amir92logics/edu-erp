import { getSchoolSettings } from "@/app/actions/settings";
import { SettingsTabs } from "./SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await getSchoolSettings();

    if (!settings) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">Settings not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="border-b border-slate-200 pb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Settings
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Manage your institution profile, payment gateways, and account
                    security.
                </p>
            </div>

            <SettingsTabs settings={settings} />
        </div>
    );
}
