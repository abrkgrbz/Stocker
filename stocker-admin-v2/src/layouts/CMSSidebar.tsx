import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Layers,
    PenTool,
    Book,
    Image as ImageIcon,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Globe
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { tokenStorage } from '../utils/tokenStorage';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
    badge?: string;
}

const cmsNav: NavItem[] = [
    { label: 'Genel Bakış', icon: LayoutDashboard, path: '/cms' },
    { label: 'Sayfa Yönetimi', icon: Layers, path: '/cms/pages' },
    { label: 'Blog & Yazılar', icon: PenTool, path: '/cms/blog' },
    { label: 'Dokümantasyon', icon: Book, path: '/cms/docs' },
    { label: 'Medya', icon: ImageIcon, path: '/cms/media' },
    { label: 'Ayarlar', icon: Settings, path: '/cms/settings' },
];

export const CMSSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path: string) => {
        if (path === '/cms') return location.pathname === '/cms';
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        tokenStorage.clearToken();
        navigate('/login');
    };

    return (
        <motion.div
            className={`h-screen relative flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'
                } bg-brand-950 border-border-subtle`}
            initial={false}
            animate={{ width: collapsed ? 80 : 288 }}
        >
            {/* Header / Brand */}
            <div className="h-20 flex items-center px-6 border-b border-border-subtle relative">
                <div
                    className="flex items-center gap-3 cursor-pointer overflow-hidden"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                        <Globe className="w-6 h-6 text-white" />
                    </div>

                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex flex-col"
                            >
                                <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    CMS
                                </span>
                                <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                                    İçerik Yönetimi
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-900 border border-border-subtle rounded-full flex items-center justify-center text-text-muted hover:text-white transition-colors z-50 shadow-xl"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
                {cmsNav.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <motion.div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`
                                relative flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                                ${active
                                    ? 'bg-indigo-500/10 text-white'
                                    : 'text-text-muted hover:text-white hover:bg-white/5'
                                }
                            `}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {active && (
                                <motion.div
                                    layoutId="activeCmsTab"
                                    className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                                <item.icon
                                    size={20}
                                    className={`
                                        transition-colors duration-200
                                        ${active ? 'text-indigo-400' : 'group-hover:text-indigo-400'}
                                    `}
                                />

                                {!collapsed && (
                                    <span className="font-medium text-sm whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}

                                {item.badge && !collapsed && (
                                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/20">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-brand-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border-subtle shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border-subtle space-y-2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`
                        w-full flex items-center rounded-xl transition-colors border border-transparent
                        ${collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                        text-text-muted hover:text-white hover:bg-white/5
                    `}
                >
                    <ChevronLeft size={20} />
                    {!collapsed && <span className="font-medium text-sm">Ana Panele Dön</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center rounded-xl transition-colors border border-transparent
                        ${collapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'}
                        text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20
                    `}
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="font-medium text-sm">Çıkış Yap</span>}
                </button>
            </div>
        </motion.div>
    );
};
