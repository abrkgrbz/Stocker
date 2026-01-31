import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    MoreVertical,
    MessageCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Calendar
} from 'lucide-react';

const tickets = [
    { id: '#TR-2024', subject: 'Fatura görüntüleme hatası', customer: 'Ahmet Yılmaz', customerCompany: 'Yılmaz A.Ş.', priority: 'High', status: 'Open', agent: 'Selin K.', updated: '5 dk önce' },
    { id: '#TR-2023', subject: 'API anahtarı oluşturma sorunu', customer: 'Mehmet Demir', customerCompany: 'TeknoSoft', priority: 'Medium', status: 'Pending', agent: 'Caner B.', updated: '12 dk önce' },
    { id: '#TR-2022', subject: 'Kullanıcı davet e-postası gitmiyor', customer: 'Ayşe Kaya', customerCompany: 'E-Ticaret Ltd.', priority: 'Low', status: 'Resolved', agent: 'Selin K.', updated: '1 saat önce' },
    { id: '#TR-2021', subject: 'Ödeme yöntemi güncelleme', customer: 'Burak Yılmaz', customerCompany: 'Lojistik A.Ş.', priority: 'High', status: 'Open', agent: 'Unassigned', updated: '2 saat önce' },
    { id: '#TR-2020', subject: 'Mobil uygulama giriş sorunu', customer: 'Zeynep Çelik', customerCompany: 'Mobilite', priority: 'Medium', status: 'Open', agent: 'Caner B.', updated: '3 saat önce' },
    { id: '#TR-2019', subject: 'Rapor dışa aktarma hatası', customer: 'Kemal Sunal', customerCompany: 'Holding', priority: 'Low', status: 'Resolved', agent: 'Selin K.', updated: '5 saat önce' },
];

const statusColors: Record<string, string> = {
    'Open': 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    'Pending': 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    'Resolved': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
};

const priorityColors: Record<string, string> = {
    'High': 'text-rose-400',
    'Medium': 'text-amber-400',
    'Low': 'text-blue-400',
};

import { useNavigate } from 'react-router-dom';

export const TicketListPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState('All');

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Talep Yönetimi</h1>
                    <p className="text-text-muted">Tüm destek taleplerini buradan yönetebilirsiniz.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold transition-colors border border-indigo-500/20 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrele
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        Yeni Talep
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    placeholder="Talep ID, konu veya müşteri ara..."
                    className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted"
                />
            </div>

            {/* Ticket List */}
            <div className="glass-card rounded-2xl border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-500/5 border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Talep Detayı</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Müşteri</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-text-muted uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-text-muted uppercase tracking-wider">Öncelik</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Temsilci</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Eylem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {tickets.map((ticket, index) => (
                                <motion.tr
                                    key={ticket.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/help/tickets/1`)} // Using mock ID until real data
                                    className="group hover:bg-indigo-500/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-text-main group-hover:text-indigo-400 transition-colors">{ticket.subject}</span>
                                            <span className="text-xs font-mono text-text-muted mt-1">{ticket.id} • {ticket.updated}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                {ticket.customer.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-text-main">{ticket.customer}</span>
                                                <span className="text-xs text-text-muted">{ticket.customerCompany}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[ticket.status]}`}>
                                            {ticket.status === 'Open' && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {ticket.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                                            {ticket.status === 'Resolved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-bold ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {ticket.agent === 'Unassigned' ? (
                                                <span className="text-xs italic text-text-muted">Atanmamış</span>
                                            ) : (
                                                <>
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                                        {ticket.agent.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-text-main">{ticket.agent}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-text-muted hover:text-text-main transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                    <span>Toplam 24 talep gösteriliyor</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors disabled:opacity-50">Önceki</button>
                        <button className="px-3 py-1 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">Sonraki</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketListPage;
