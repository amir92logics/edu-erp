
'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    const isDatabaseError = error.message?.toLowerCase().includes('database') ||
        error.message?.toLowerCase().includes('pool') ||
        error.message?.toLowerCase().includes('connection') ||
        error.name === 'DriverAdapterError';

    return (
        <div className="bg-slate-50 min-h-screen">
            <ErrorState
                title={isDatabaseError ? "Database Connection Problem" : "Something went wrong"}
                message={isDatabaseError
                    ? "Our database is taking longer than expected to respond. This might be due to heavy traffic or temporary maintenance."
                    : "An unexpected error occurred. Our team has been notified and we're working to fix it."
                }
                type={isDatabaseError ? 'database' : 'generic'}
                reset={reset}
            />
        </div>
    );
}
