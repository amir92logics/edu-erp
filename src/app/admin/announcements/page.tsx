import { getAnnouncements } from "@/app/actions/announcements";
import { getClasses } from "@/app/actions/classes";
import {
    Megaphone,
    Plus,
    Send,
    MessageSquare,
    History,
    Users,
    Layers,
    ArrowRight
} from "lucide-react";

import { CreateAnnouncementModal } from "./CreateAnnouncementModal";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();
    const classes = await getClasses();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                    <p className="text-slate-500 text-sm">Broadcast news and updates to your school community.</p>
                </div>
                <CreateAnnouncementModal classes={classes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center p-10 flex flex-col items-center justify-center min-h-[400px]">
                        {announcements.length === 0 ? (
                            <>
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                    <Megaphone size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No Announcements Yet</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm">Share your first update with students and parents to keep everyone informed.</p>
                                <button className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                    Create First Announcement
                                </button>
                            </>
                        ) : (
                            <div className="w-full text-left space-y-4">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <History size={20} className="text-slate-400" />
                                    Recent History
                                </h2>
                                {announcements.map((item) => (
                                    <div key={item.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.targetType === 'ALL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                    }`}>
                                                    {item.targetType === 'ALL' ? 'Broadcast' : 'Class-wise'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {item.sentViaWhatsApp && (
                                                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black">
                                                    <MessageSquare size={12} /> WHATSAPP SENT
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">{item.content}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button className="text-xs font-bold text-slate-400 hover:text-slate-900">Edit</button>
                                                <button className="text-xs font-bold text-red-400 hover:text-red-600">Delete</button>
                                            </div>
                                            <button className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all group-hover:scale-110">
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Send size={20} className="text-blue-600" />
                            Quick Analytics
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600">Reach</span>
                                </div>
                                <span className="font-bold text-slate-900">Auto-tracked</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <MessageSquare size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600">WA Delivery</span>
                                </div>
                                <span className="font-bold text-slate-900">Live</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Targeting by Class</h4>
                            <div className="space-y-3">
                                {classes.slice(0, 3).map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between group cursor-pointer">
                                        <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">{cls.name}</span>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded italic">Broadcast active</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-xl shadow-slate-200">
                        <Layers className="text-blue-400 mb-4" size={32} />
                        <h3 className="font-bold text-lg mb-2">Pro Feature: Campaigns</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6">Schedule recurring announcements and track engagement metrics per student parent.</p>
                        <button className="w-full py-2.5 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors active:scale-95 shadow-lg shadow-blue-500/20">
                            Upgrade to Enterprise
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
