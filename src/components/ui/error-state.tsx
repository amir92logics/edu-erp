
import React from 'react';
import { Database, AlertCircle, RefreshCcw, Home, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
    title?: string;
    message?: string;
    type?: 'database' | 'connection' | 'generic';
    reset?: () => void;
}

export function ErrorState({
    title = "System is temporarily unavailable",
    message = "We're having trouble connecting to our services. This might be due to scheduled maintenance or a connection hiccup.",
    type = 'generic',
    reset
}: ErrorStateProps) {

    const Icon = type === 'database' ? Database : type === 'connection' ? WifiOff : AlertCircle;

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full">
                <div className="relative mb-8 flex justify-center">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center">
                        <Icon className="text-blue-600" size={48} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                        <AlertCircle size={16} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                    {title}
                </h1>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {reset && (
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <RefreshCcw size={20} /> Try Again
                        </button>
                    )}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Home size={20} /> Back to Home
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Technical Details
                    </p>
                    <p className="text-[10px] font-mono text-slate-300 mt-2 break-all">
                        {type === 'database' ? 'ERR_DB_POOL_TIMEOUT' : 'ERR_NETWORK_DISRUPTED'}
                    </p>
                </div>
            </div>
        </div>
    );
}
