import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LifeBuoy,
    Book,
    Users,
    Settings,
    MessageCircle,
    ChevronRight,
    LogOut,
    ArrowLeft
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: string;
    children?: { label: string; path: string }[];
}

const helpNav: NavItem[] = [
    { label: 'Genel Bakış', icon: LayoutDashboard, path: '/help' },
    {
        label: 'Talep Yönetimi',
        icon: MessageCircle,
        path: '/help/tickets',
        badge: '12',
    },
    { label: 'Bilgi Bankası', icon: Book, path: '/help/kb' },
    { label: 'Müşteriler', icon: Users, path: '/help/customers' },
    { label: 'Ayarlar', icon: Settings, path: '/help/settings' },
];

export const HelpSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    const isActive = (path: string) => {
        if (path === '/help') return location.pathname === '/help';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-72 z-50">
            <div className="h-full glass-card flex flex-col p-6 border-border-subtle shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Brand */}
                <div className="flex items-center gap-4 px-2 mb-10 cursor-pointer" onClick={() => navigate('/help')}>
                    <div className="w-10 h-10 rounded-full bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <LifeBuoy className="w-6 h-6 text-text-main" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-text-main">Stocker</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Destek Merkezi</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {helpNav.map((item) => {
                        const isItemActive = isActive(item.path);

                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => {
                                        if (item.children) {
                                            toggleExpand(item.label);
                                        } else {
                                            navigate(item.path);
                                        }
                                    }}
                                    className={`
                    w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group
                    ${isItemActive ? 'bg-indigo-500/10 text-text-main shadow-inner' : 'text-text-muted hover:text-text-main hover:bg-indigo-500/5'}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 transition-colors ${isItemActive ? 'text-indigo-400' : 'group-hover:text-indigo-400/60'}`} />
                                        <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    {item.children && (
                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedItems.includes(item.label) ? 'rotate-90' : ''}`} />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </nav>

                {/* Back to Suite */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-text-muted hover:text-text-main hover:bg-indigo-500/5 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-semibold">Ana Ekrana Dön</span>
                    </button>

                    <div className="flex items-center justify-between p-2 mt-4 rounded-2xl bg-indigo-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-brand-950 flex items-center justify-center text-xs font-bold text-text-main">SA</div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-main">Support Admin</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] text-text-muted">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
