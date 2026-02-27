import { MessageSquare, Smartphone, Send, AlertTriangle, ShieldCheck } from "lucide-react";
import { WhatsAppStatus } from "../WhatsAppStatus";

export default async function WhatsAppPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Gateway</h1>
                <p className="text-slate-500 font-medium tracking-tight">Direct communication bridge for parent notifications and fee alerts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm sticky top-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Smartphone size={20} className="text-blue-600" />
                            Session Management
                        </h2>

                        <WhatsAppStatus />

                        <div className="mt-8 space-y-4 pt-8 border-t border-slate-50">
                            <div className="flex items-center justify-between text-[10px] p-3 bg-blue-50 text-blue-700 rounded-xl font-black uppercase tracking-widest leading-none">
                                <span>Platform Tier</span>
                                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md">Enterprise</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                End-to-end Encrypted
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Send size={20} />
                            </div>
                            Smart Broadcaster
                        </h2>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Audience</label>
                                    <select className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl outline-none transition-all text-sm font-bold shadow-sm appearance-none cursor-pointer">
                                        <option>All Enrolled Students</option>
                                        <option>Outstanding Fee Balance Only</option>
                                        <option>Graduating Class 2024</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Messaging Template</label>
                                    <select className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl outline-none transition-all text-sm font-bold shadow-sm appearance-none cursor-pointer">
                                        <option>Monthly Fee Reminder (Standard)</option>
                                        <option>Holiday Notification</option>
                                        <option>Urgent Security Update</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Payload</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl outline-none transition-all text-sm font-medium resize-none shadow-sm"
                                    placeholder="Type your message here..."
                                    defaultValue={`Hello! This is a reminder regarding {student_name}'s monthly fee. Please ensure payment is made by the due date.`}
                                ></textarea>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {["{student_name}", "{amount}", "{month}", "{school_name}"].map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md cursor-pointer hover:bg-slate-200 transition-colors uppercase tracking-widest">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-2xl flex items-center justify-between gap-6 shadow-2xl shadow-slate-900/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Compliance Check</p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[300px] mt-1">Broadcasts must adhere to local anti-spam regulations. High report rates may result in session suspension.</p>
                                    </div>
                                </div>
                                <button className="px-8 py-3.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                    Push Notification
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
