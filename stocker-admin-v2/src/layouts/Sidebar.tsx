import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Shield,
    Box,
    BarChart3,
    ChevronRight,
    LogOut,
    Mail,
    CreditCard,
    Activity,
    Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: string;
    children?: { label: string; path: string }[];
}

const mainNav: NavItem[] = [
    { label: 'Kontrol Paneli', icon: LayoutDashboard, path: '/' },
    {
        label: 'Tenant Yönetimi',
        icon: Shield,
        path: '/tenants',
        children: [
            { label: 'Tenant Listesi', path: '/tenants' },
            { label: 'Kayıt Onayları', path: '/tenants/registrations' },
            { label: 'Abonelikler', path: '/tenants/subscriptions' },
        ]
    },
    { label: 'Faturalandırma', icon: CreditCard, path: '/billing' },
    {
        label: 'Sistem Operasyonları',
        icon: Activity,
        path: '/system',
        children: [
            { label: 'Sistem Merkezi', path: '/system' },
            { label: 'Audit Logları', path: '/system/audit-logs' },
            { label: 'Güvenlik Kasası', path: '/system/secrets' },
            { label: 'Dosya Gezgini', path: '/system/storage' },
            { label: 'Migration Yönetimi', path: '/system/migrations' },
            { label: 'API Durumu', path: '/system/api-status' },
            { label: 'Hangfire', path: '/system/hangfire' },
        ]
    },
    { label: 'Modül Marketi', icon: Box, path: '/modules' },
    { label: 'E-Posta Şablonları', icon: Mail, path: '/emails' },
    {
        label: 'Sistem Analitiği',
        icon: BarChart3,
        path: '/analytics',
        badge: 'Yeni',
        children: [
            { label: 'Performans Özeti', path: '/analytics' },
            { label: 'Raporlar', path: '/analytics/reports' },
        ]
    },
    { label: 'Sistem Ayarları', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Tenant Yönetimi', 'Sistem Operasyonları', 'Sistem Analitiği']);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-72 z-50">
            <div className="h-full glass-card flex flex-col p-6 border-border-subtle shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Brand */}
                <div className="flex items-center gap-4 px-2 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 rounded-full bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-6 h-6 text-text-main" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-text-main">Stocker</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Master Admin</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    {mainNav.map((item) => {
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

                                <AnimatePresence>
                                    {item.children && expandedItems.includes(item.label) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden ml-9 mt-1 space-y-1"
                                        >
                                            {item.children.map(child => (
                                                <button
                                                    key={child.label}
                                                    onClick={() => navigate(child.path)}
                                                    className={`w-full text-left p-2.5 text-xs font-semibold rounded-lg transition-all ${location.pathname === child.path ? 'text-indigo-400 bg-indigo-500/5' : 'text-text-muted hover:text-text-main hover:translate-x-1'
                                                        }`}
                                                >
                                                    {child.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-indigo-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-brand-950 flex items-center justify-center text-xs font-bold text-text-main transition-colors duration-300">MA</div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-main transition-colors duration-300">Master Admin</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] text-text-muted transition-colors duration-300">Online</p>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-text-muted hover:text-rose-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};
