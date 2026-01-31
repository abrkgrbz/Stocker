import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    MoreVertical,
    Building2,
    Mail,
    Phone,
    Calendar,
    Star,
    ArrowUpRight
} from 'lucide-react';

const customers = [
    { id: 1, name: 'Ahmet Yılmaz', company: 'Yılmaz A.Ş.', email: 'ahmet@yilmaz.com', phone: '+90 555 123 45 67', plan: 'Enterprise', openTickets: 2, ltv: '$12,450', status: 'Active' },
    { id: 2, name: 'Mehmet Demir', company: 'TeknoSoft', email: 'mehmet@teknosoft.com', phone: '+90 555 987 65 43', plan: 'Pro', openTickets: 0, ltv: '$4,200', status: 'Active' },
    { id: 3, name: 'Ayşe Kaya', company: 'E-Ticaret Ltd.', email: 'ayse@eticaret.com', phone: '+90 555 111 22 33', plan: 'Startup', openTickets: 1, ltv: '$850', status: 'Inactive' },
    { id: 4, name: 'Zeynep Çelik', company: 'Mobilite', email: 'zeynep@mobilite.com', phone: '+90 555 444 55 66', plan: 'Pro', openTickets: 3, ltv: '$5,600', status: 'Active' },
    { id: 5, name: 'Ali Veli', company: 'İnşaat Yapı', email: 'ali@insaat.com', phone: '+90 555 777 88 99', plan: 'Enterprise', openTickets: 0, ltv: '$18,900', status: 'Active' },
];

export const CustomerListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Müşteriler</h1>
                    <p className="text-text-muted">Destek hizmeti alan müşterilerin listesi.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold transition-colors border border-indigo-500/20 flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtrele
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        Müşteri Ekle
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    placeholder="Müşteri adı, şirket veya e-posta ara..."
                    className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Customer List */}
            <div className="glass-card rounded-2xl border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-500/5 border-b border-border-subtle">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Müşteri</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">İletişim</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-text-muted uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-text-muted uppercase tracking-wider">Açık Talepler</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-text-muted uppercase tracking-wider">LTV</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">Eylem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {customers.map((customer, index) => (
                                <motion.tr
                                    key={customer.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/help/customers/${customer.id}`)}
                                    className="group hover:bg-indigo-500/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main group-hover:text-indigo-400 transition-colors">{customer.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-text-muted">
                                                    <Building2 className="w-3 h-3" />
                                                    {customer.company}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <Mail className="w-3 h-3 text-indigo-400" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <Phone className="w-3 h-3 text-indigo-400" />
                                                {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`
                                            px-2 py-1 rounded-lg text-xs font-bold border
                                            ${customer.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                customer.plan === 'Pro' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                                        `}>
                                            {customer.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${customer.openTickets > 0 ? 'text-rose-400' : 'text-text-muted'}`}>
                                            {customer.openTickets}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-emerald-400">{customer.ltv}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-text-muted hover:text-text-main transition-colors">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerListPage;
