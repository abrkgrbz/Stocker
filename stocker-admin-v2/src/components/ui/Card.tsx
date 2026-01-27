import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    className = '',
    noPadding = false
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card overflow-hidden ${className}`}
        >
            {(title || subtitle) && (
                <div className="px-8 py-6 border-b border-border-subtle bg-indigo-500/[0.01]">
                    {title && <h3 className="text-lg font-bold text-text-main tracking-tight">{title}</h3>}
                    {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-8'}>
                {children}
            </div>
        </motion.div>
    );
};
