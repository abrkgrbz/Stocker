import { motion, type HTMLMotionProps } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: LucideIcon;
    isLoading?: boolean;
    children?: ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    isLoading,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-2xl';

    const variants = {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20',
        secondary: 'bg-brand-800 text-text-main hover:bg-brand-700 border border-border-subtle',
        outline: 'bg-transparent border border-border-subtle text-text-main hover:bg-brand-800',
        ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-brand-800',
        danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        xl: 'px-10 py-5 text-lg',
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            <span className="whitespace-nowrap">
                {children}
            </span>
        </motion.button>
    );
}
