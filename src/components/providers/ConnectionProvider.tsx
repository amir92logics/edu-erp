
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ErrorState } from '../ui/error-state';

interface ConnectionContextType {
    isOnline: boolean;
}

const ConnectionContext = createContext<ConnectionContextType>({ isOnline: true });

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Handle client-side online/offline status
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <ErrorState
                    title="You're currently offline"
                    message="It looks like you've lost your internet connection. Please check your network cables or Wi-Fi and try again."
                    type="connection"
                    reset={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <ConnectionContext.Provider value={{ isOnline }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export const useConnection = () => useContext(ConnectionContext);
