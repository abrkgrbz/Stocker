import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    className={`
            w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-4 px-6
            text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/10
            transition-all duration-300
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-rose-500/50' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs font-medium text-rose-500 ml-1">{error}</p>
            )}
        </div>
    );
};
