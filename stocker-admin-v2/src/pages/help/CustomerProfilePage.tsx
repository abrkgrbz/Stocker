import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Mail,
    Phone,
    Globe,
    Calendar,
    CreditCard,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    MoreHorizontal,
    MessageCircle
} from 'lucide-react';

const customerData = {
    id: 1,
    name: 'Ahmet Yılmaz',
    company: 'Yılmaz A.Ş.',
    email: 'ahmet@yilmaz.com',
    phone: '+90 555 123 45 67',
    website: 'www.yilmazas.com',
    location: 'İstanbul, Türkiye',
    joinedDate: '12 Oca 2023',
    plan: {
        name: 'Enterprise',
        price: '$199/ay',
        status: 'Active',
        nextBilling: '12 Şub 2024'
    },
    stats: {
        totalTickets: 45,
        openTickets: 2,
        avgResponseTime: '15dk',
        csatScore: '4.8/5'
    }
};

const ticketHistory = [
    { id: '#TR-2024', subject: 'Fatura görüntüleme hatası', status: 'Open', priority: 'High', date: '26 Oca 2024' },
    { id: '#TR-2020', subject: 'Kullanıcı ekleme sorunu', status: 'Resolved', priority: 'Medium', date: '15 Oca 2024' },
    { id: '#TR-1985', subject: 'API entegrasyon desteği', status: 'Resolved', priority: 'Low', date: '10 Ara 2023' },
];

export const CustomerProfilePage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/help/customers')}
                    className="p-2 hover:bg-indigo-500/10 rounded-lg text-text-muted hover:text-text-main transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Müşteri Profili</h1>
                    <p className="text-text-muted">Müşteri detayları ve geçmiş işlemleri.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Info */}
                <div className="space-y-6">
                    {/* Main Profile Card */}
                    <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 mb-4">
                                <div className="w-full h-full rounded-full bg-brand-950 flex items-center justify-center text-3xl font-bold text-text-main">
                                    {customerData.name.charAt(0)}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{customerData.name}</h2>
                            <p className="text-text-muted flex items-center gap-1.5 mt-1">
                                <Building2 className="w-4 h-4" />
                                {customerData.company}
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Mesaj Gönder
                                </button>
                                <button className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors border border-indigo-500/20">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border-subtle">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-indigo-400" />
                                <span className="text-text-main">{customerData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-indigo-400" />
                                <span className="text-text-main">{customerData.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Globe className="w-4 h-4 text-indigo-400" />
                                <span className="text-text-main">{customerData.website}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-indigo-400" />
                                <span className="text-text-main">Katılım: {customerData.joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Plan Info */}
                    <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Abonelik Detayları</h3>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-indigo-400">{customerData.plan.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                    {customerData.plan.status}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-text-main mb-1">{customerData.plan.price}</div>
                            <div className="text-xs text-text-muted">Sonraki ödeme: {customerData.plan.nextBilling}</div>
                        </div>
                        <button className="w-full py-2 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 text-sm font-semibold transition-colors border border-indigo-500/20 flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Aboneliği Yönet
                        </button>
                    </div>
                </div>

                {/* Right Column - Stats & History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-border-subtle">
                            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Toplam Talep</div>
                            <div className="text-2xl font-bold text-text-main">{customerData.stats.totalTickets}</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-border-subtle">
                            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Açık Talepler</div>
                            <div className="text-2xl font-bold text-rose-400">{customerData.stats.openTickets}</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-border-subtle">
                            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Ort. Yanıt</div>
                            <div className="text-2xl font-bold text-indigo-400">{customerData.stats.avgResponseTime}</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-border-subtle">
                            <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Memnuniyet</div>
                            <div className="text-2xl font-bold text-emerald-400">{customerData.stats.csatScore}</div>
                        </div>
                    </div>

                    {/* Ticket History */}
                    <div className="glass-card rounded-2xl border border-border-subtle overflow-hidden">
                        <div className="p-6 border-b border-border-subtle flex justify-between items-center">
                            <h3 className="font-bold text-text-main">Talep Geçmişi</h3>
                            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Tümünü Gör</button>
                        </div>
                        <div className="divide-y divide-border-subtle">
                            {ticketHistory.map((ticket) => (
                                <div key={ticket.id} className="p-4 hover:bg-indigo-500/5 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate(`/help/tickets/${ticket.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${ticket.status === 'Open' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {ticket.status === 'Open' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-text-main">{ticket.subject}</h4>
                                            <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                                                <span className="font-mono">{ticket.id}</span>
                                                <span>•</span>
                                                <span>{ticket.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${ticket.priority === 'High' ? 'bg-rose-500/10 text-rose-400' :
                                            ticket.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {ticket.priority}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
