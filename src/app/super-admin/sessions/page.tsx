import { Activity, ShieldAlert, Zap } from "lucide-react";
import { getSchoolSessions } from "@/app/actions/platform";
import { SessionList } from "./SessionList";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
    const schoolsWithSessions = await getSchoolSessions();

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Gateway Sessions</h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" /> System Instance Overview
                    </p>
                </div>

                <div className="p-4 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-900/10 flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl text-blue-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Instances</p>
                        <p className="text-xl font-black">{schoolsWithSessions.length} Active</p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-6 border-l-4 border-l-blue-600 shadow-sm">
                <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm shrink-0">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h4 className="font-black text-blue-900 tracking-tight text-lg mb-1 uppercase">Platform Integrity Control</h4>
                    <p className="text-blue-700/80 text-sm leading-relaxed font-medium">
                        Terminating a session will immediately disconnect the WhatsApp instance on the server and clear all session data from the environment.
                        The school admin will need to re-authenticate manually if they wish to bridge the connection again.
                    </p>
                </div>
            </div>

            <SessionList initialSessions={schoolsWithSessions} />
        </div>
    );
}
