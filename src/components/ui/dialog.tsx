"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => { },
});

export function Dialog({ children, open = false, onOpenChange = () => { } }: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            <AnimatePresence>{open && children}</AnimatePresence>
        </DialogContext.Provider>
    );
}

export function DialogContent({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const { onOpenChange } = React.useContext(DialogContext);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onOpenChange(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className={cn(
                    "relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]",
                    className
                )}
                {...(props as any)}
            >
                {/* Close Button Trigger Area (Floating) */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-6 top-6 z-20 p-2 text-slate-400 hover:text-slate-900 bg-white/50 backdrop-blur-sm rounded-xl transition-all hover:shadow-lg active:scale-90"
                >
                    <X size={20} />
                </button>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

export function DialogHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
            {...props}
        />
    );
}

export function DialogFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    );
}

export function DialogTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-lg font-semibold leading-none tracking-tight",
                className
            )}
            {...props}
        />
    );
}

export function DialogDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-slate-500", className)}
            {...props}
        />
    );
}
