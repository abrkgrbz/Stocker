import React from 'react';
import { motion } from 'framer-motion';
import {
    MessageCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    TrendingUp,
    MoreHorizontal
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock data
const ticketStats = [
    { label: 'Açık Talepler', value: '24', change: '+4', color: 'text-rose-400', icon: MessageCircle },
    { label: 'Çözülenler', value: '142', change: '+18', color: 'text-emerald-400', icon: CheckCircle2 },
    { label: 'Ort. Yanıt Süresi', value: '14dk', change: '-2dk', color: 'text-indigo-400', icon: Clock },
    { label: 'SLA İhlali', value: '1', change: '0', color: 'text-amber-400', icon: AlertCircle },
];

const chartData = [
    { name: 'Pzt', tickets: 40 },
    { name: 'Sal', tickets: 30 },
    { name: 'Çar', tickets: 20 },
    { name: 'Per', tickets: 27 },
    { name: 'Cum', tickets: 18 },
    { name: 'Cmt', tickets: 23 },
    { name: 'Paz', tickets: 34 },
];

const recentTickets = [
    { id: '#TR-2024', subject: 'Fatura görüntüleme hatası', user: 'Ahmet Yılmaz', priority: 'High', status: 'Open', time: '5 dk önce' },
    { id: '#TR-2023', subject: 'API anahtarı oluşturma', user: 'Mehmet Demir', priority: 'Medium', status: 'Pending', time: '12 dk önce' },
    { id: '#TR-2022', subject: 'Kullanıcı davet sorunu', user: 'Ayşe Kaya', priority: 'Low', status: 'Resolved', time: '1 saat önce' },
];

export const HelpPage: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Genel Bakış</h1>
                    <p className="text-text-muted">Destek merkezi durum özeti ve istatistikler.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        Yeni Talep Oluştur
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ticketStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl border border-border-subtle"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-indigo-500/10 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-text-main mb-1">{stat.value}</h3>
                        <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-card p-6 rounded-2xl border border-border-subtle"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text-main">Haftalık Talep Hacmi</h3>
                        <button className="p-2 text-text-muted hover:text-text-main">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6366f1" strokeOpacity={0.1} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTickets)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Tickets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 rounded-2xl border border-border-subtle"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-text-main">Son Talepler</h3>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Tümü</button>
                    </div>
                    <div className="space-y-4">
                        {recentTickets.map((ticket) => (
                            <div key={ticket.id} className="group p-4 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/5 hover:border-indigo-500/20 transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-mono font-bold text-indigo-400">{ticket.id}</span>
                                    <span className="text-[10px] font-bold text-text-muted">{ticket.time}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-text-main mb-1 group-hover:text-indigo-300 transition-colors">{ticket.subject}</h4>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-text-muted">{ticket.user}</span>
                                    <span className={`
                                        px-2 py-0.5 rounded-full font-bold
                                        ${ticket.priority === 'High' ? 'bg-rose-500/20 text-rose-400' :
                                            ticket.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}
                                    `}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HelpPage;
