'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Bell,
    Search,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    ClipboardList,
    Briefcase
} from 'lucide-react';

interface LoginShowcaseProps {
    transparent?: boolean;
    theme?: 'dark' | 'light';
}

export default function LoginShowcase({ transparent = false, theme = 'dark' }: LoginShowcaseProps) {
    const isLight = theme === 'light';

    return (
        <div className={`relative w-full h-full flex flex-col justify-center items-center p-12 overflow-hidden ${transparent ? '' : 'bg-[#0F172A]'}`}>
            {/* Background Atmosphere */}
            {!transparent && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
                </div>
            )}

            {/* 3D Container */}
            <div className="relative z-10 w-full max-w-4xl [perspective:2000px]">
                <motion.div
                    initial={{ rotateX: 20, rotateY: -15, scale: 0.9, opacity: 0 }}
                    animate={{ rotateX: 10, rotateY: -10, scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`relative backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden ring-1 
                        ${isLight
                            ? 'bg-white/95 border-slate-200/80 ring-slate-900/5 shadow-slate-900/10'
                            : 'bg-slate-900/40 border-white/10 ring-white/5'}`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Window Controls */}
                    <div className={`h-10 flex items-center px-4 gap-2 border-b ${isLight ? 'bg-gradient-to-b from-slate-50 to-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>

                    {/* App Content */}
                    <div className="flex h-[500px]">
                        {/* Sidebar */}
                        <div className={`w-64 border-r p-4 flex flex-col gap-1 ${isLight ? 'bg-slate-50/60 border-slate-200' : 'bg-slate-900/60 border-white/5'}`}>
                            <div className="flex items-center gap-2 px-3 py-2 mb-6">
                                <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-bold text-white text-xs">S</div>
                                <span className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Stocker Panel</span>
                            </div>

                            {[
                                { icon: LayoutDashboard, label: 'Genel Bakış', active: true },
                                { icon: Package, label: 'Envanter' },
                                { icon: ShoppingCart, label: 'Satış' },
                                { icon: ClipboardList, label: 'Satın Alma' },
                                { icon: Users, label: 'CRM' },
                                { icon: BarChart3, label: 'Finans' },
                                { icon: Briefcase, label: 'İnsan Kaynakları' },
                                { icon: Settings, label: 'Ayarlar' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors 
                                        ${item.active
                                            ? (isLight ? 'bg-slate-900 text-white' : 'bg-white/10 text-white')
                                            : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400')}`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className={`flex-1 flex flex-col ${isLight ? 'bg-gradient-to-br from-slate-50/50 to-white' : 'bg-slate-900/20'}`}>
                            {/* Header */}
                            <div className={`h-16 border-b flex items-center justify-between px-6 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                                <h2 className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>Finansal Durum</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            className={`rounded-full pl-9 pr-4 py-1.5 text-xs w-48 focus:outline-none 
                                                ${isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-white/5 border border-white/5 text-slate-300'}`}
                                        />
                                    </div>
                                    <Bell className="w-4 h-4 text-slate-400" />
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border ${isLight ? 'border-white shadow-sm' : 'border-white/20'}`} />
                                </div>
                            </div>

                            {/* Dashboard Grid */}
                            <div className="p-6 grid grid-cols-2 gap-6 overflow-hidden">
                                {/* Chart Card */}
                                <div className={`col-span-2 border rounded-xl p-5 ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/40 border-white/5'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-xs text-slate-400 mb-1">Toplam Ciro (Aylık)</div>
                                            <div className={`text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                                ₺842.500
                                                <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded flex items-center gap-1 font-medium">
                                                    <ArrowUpRight className="w-3 h-3" /> %12
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className={`px-3 py-1 rounded-md text-xs ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-300'}`}>Günlük</div>
                                            <div className="px-3 py-1 bg-indigo-500 rounded-md text-xs text-white">Aylık</div>
                                        </div>
                                    </div>

                                    {/* Abstract Chart Representation */}
                                    <div className="h-40 flex items-end justify-between gap-2 px-1">
                                        {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                                                className={`w-full rounded-t-sm relative group ${isLight ? 'bg-slate-200 group-hover:bg-indigo-400' : 'bg-gradient-to-t from-indigo-500/50 to-indigo-400/80'}`}
                                            >
                                                {/* Only apply gradient/solid logic difference if needed, keeping simple class switch */}
                                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 ${isLight ? 'bg-slate-900 text-white' : 'bg-slate-800 text-white border border-white/10'}`}>
                                                    ₺{(h * 9.5).toFixed(0)}K
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Transaction List */}
                                <div className={`col-span-2 lg:col-span-1 border rounded-xl p-5 ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/40 border-white/5'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>Son İşlemler</h3>
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { title: 'Trendyol Hakediş', date: 'Bugün, 14:30', amount: '+₺14.250', type: 'in' },
                                            { title: 'AWS Servisleri', date: 'Dün, 09:12', amount: '-$140.00', type: 'out' },
                                            { title: 'MNG Kargo', date: '24 Ocak', amount: '-₺3.420', type: 'out' },
                                        ].map((tx, i) => (
                                            <div key={i} className={`flex items-center justify-between p-2 rounded transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {tx.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{tx.title}</div>
                                                        <div className="text-xs text-slate-500">{tx.date}</div>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-medium ${tx.type === 'in' ? 'text-emerald-400' : (isLight ? 'text-slate-600' : 'text-slate-300')}`}>
                                                    {tx.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="col-span-2 lg:col-span-1 grid grid-rows-2 gap-4">
                                    <div className={`border rounded-xl p-4 flex flex-col justify-center ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/40 border-white/5'}`}>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                                            <Package className="w-3 h-3" /> Kritik Stok
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>12</div>
                                            <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">Acil Sipariş</div>
                                        </div>
                                    </div>
                                    <div className={`border rounded-xl p-4 flex flex-col justify-center ${isLight ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-800/40 border-white/5'}`}>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                                            <Users className="w-3 h-3" /> Yeni Üye
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>+48</div>
                                            <div className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Bu Hafta</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                </motion.div>



            </div>
        </div>
    );
}
