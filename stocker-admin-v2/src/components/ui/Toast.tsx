import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, type ToastType } from '../../hooks/useToast';
import {
    CheckCircle2,
    AlertCircle,
    XCircle,
    Info,
    X
} from 'lucide-react';

const icons: Record<ToastType, any> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const colors: Record<ToastType, string> = {
    success: 'text-emerald-400 bg-brand-950/95 border-emerald-500/30 shadow-emerald-500/10',
    error: 'text-rose-400 bg-brand-950/95 border-rose-500/30 shadow-rose-500/10',
    warning: 'text-amber-400 bg-brand-950/95 border-amber-500/30 shadow-amber-500/10',
    info: 'text-indigo-400 bg-brand-950/95 border-indigo-500/30 shadow-indigo-500/10',
};

export const ToastContainer: React.FC = () => {
    const { toasts, dismiss } = useToast();

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 w-80 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className={`
                                pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md
                                ${colors[toast.type]}
                            `}
                        >
                            <div className="mt-0.5">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-text-main leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => dismiss(toast.id)}
                                className="mt-0.5 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export const toast = {
    success: (message: string, duration?: number) => useToast.getState().show(message, 'success', duration),
    error: (message: string, duration?: number) => useToast.getState().show(message, 'error', duration),
    warning: (message: string, duration?: number) => useToast.getState().show(message, 'warning', duration),
    info: (message: string, duration?: number) => useToast.getState().show(message, 'info', duration),
    show: (message: string, type: ToastType = 'info', duration?: number) => useToast.getState().show(message, type, duration),
};
