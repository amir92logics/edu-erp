
import React from 'react';

export function SkeletonDashboard() {
    return (
        <div className="space-y-10 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-96 bg-slate-100 rounded-lg mt-2"></div>
                </div>
                <div className="h-12 w-40 bg-slate-200 rounded-2xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-slate-100 ml-auto rounded"></div>
                                <div className="h-8 w-24 bg-slate-200 ml-auto rounded-lg"></div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="h-3 w-20 bg-slate-50 rounded"></div>
                            <div className="h-2 w-16 bg-slate-50 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                    <div className="h-6 w-48 bg-slate-200 rounded mb-8"></div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="h-8 w-16 bg-slate-100 rounded-lg"></div>
                                    <div className="h-8 w-20 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 h-[300px]">
                        <div className="h-6 w-32 bg-slate-800 rounded mb-6"></div>
                        <div className="space-y-6">
                            <div className="h-4 w-40 bg-slate-800 rounded"></div>
                            <div className="h-12 w-56 bg-white/10 rounded-xl"></div>
                            <div className="h-14 w-full bg-blue-600/50 rounded-2xl mt-8"></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                        <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                    <div className="h-4 w-16 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
