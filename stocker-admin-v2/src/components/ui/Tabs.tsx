import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: React.ElementType<{ className?: string }>;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`flex items-center gap-2 p-1 bg-brand-950/50 border border-border-subtle rounded-2xl w-fit ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                            flex items-center gap-2 outline-none
                            ${isActive ? 'text-white' : 'text-text-muted hover:text-text-main'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                style={{ originY: "0px" }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-current'}`} />}
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
