import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send,
    Paperclip,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Building2,
    Mail,
    Phone,
    Calendar,
    ArrowLeft
} from 'lucide-react';

const mockTicket = {
    id: '#TR-2024',
    subject: 'Fatura görüntüleme hatası',
    status: 'Open',
    priority: 'High',
    created: '26 Oca 2024, 14:30',
    customer: {
        name: 'Ahmet Yılmaz',
        company: 'Yılmaz A.Ş.',
        email: 'ahmet@yilmaz.com',
        phone: '+90 555 123 45 67',
        plan: 'Enterprise',
        ltv: '$12,450'
    },
    messages: [
        {
            id: 1,
            sender: 'customer',
            name: 'Ahmet Yılmaz',
            time: '14:30',
            content: 'Merhaba, son kestiğim faturayı görüntülemek istediğimde 404 hatası alıyorum. Acil desteğinizi rica ederim.'
        },
        {
            id: 2,
            sender: 'agent',
            name: 'Selin K.',
            time: '14:35',
            content: 'Merhaba Ahmet Bey, yaşadığınız sorun için üzgünüz. Teknik ekibimiz incelemeye başladı. Fatura numarasını iletebilir misiniz?'
        },
        {
            id: 3,
            sender: 'customer',
            name: 'Ahmet Yılmaz',
            time: '14:36',
            content: 'FTR-2024001 numaralı fatura.'
        }
    ]
};

export const TicketDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        // Mock send logic
        mockTicket.messages.push({
            id: mockTicket.messages.length + 1,
            sender: 'agent',
            name: 'Ben',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: newMessage
        });
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col glass-card rounded-2xl border border-border-subtle overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-border-subtle bg-indigo-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/help/tickets')}
                            className="p-2 hover:bg-indigo-500/10 rounded-lg text-text-muted hover:text-text-main transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-text-main">{mockTicket.subject}</h2>
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                                    {mockTicket.priority}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                                <span className="font-mono">{mockTicket.id}</span>
                                <span>•</span>
                                <span>{mockTicket.created}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold transition-colors border border-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Çözüldü Olarak İşaretle
                        </button>
                        <button className="p-2 text-text-muted hover:text-text-main hover:bg-indigo-500/10 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-brand-950/50">
                    {mockTicket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 max-w-3xl ${msg.sender === 'agent' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                ${msg.sender === 'agent' ? 'bg-indigo-500 text-white' : 'bg-brand-800 text-text-muted'}
                            `}>
                                {msg.name.charAt(0)}
                            </div>
                            <div className={`
                                p-4 rounded-2xl text-sm leading-relaxed
                                ${msg.sender === 'agent'
                                    ? 'bg-indigo-500/10 text-text-main border border-indigo-500/20 rounded-tr-none'
                                    : 'bg-brand-800/50 text-text-main border border-border-subtle rounded-tl-none'}
                            `}>
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <span className={`font-bold ${msg.sender === 'agent' ? 'text-indigo-400' : 'text-text-muted'}`}>
                                        {msg.name}
                                    </span>
                                    <span className="text-[10px] text-text-muted opacity-50">{msg.time}</span>
                                </div>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-brand-950 border-t border-border-subtle">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Bir yanıt yazın... (Enter gönderir)"
                            className="w-full bg-brand-900 border border-border-subtle rounded-xl py-3 pl-4 pr-24 text-sm text-text-main focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-text-muted"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" className="p-1.5 text-text-muted hover:text-indigo-400 hover:bg-brand-800 rounded-lg transition-colors">
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="w-80 flex flex-col gap-6">
                {/* Ticket Info */}
                <div className="glass-card p-5 rounded-2xl border border-border-subtle">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Talep Detayları</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Durum</span>
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                                <AlertCircle className="w-3 h-3" />
                                {mockTicket.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Atanan</span>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                                    S
                                </div>
                                <span className="text-sm text-text-main">Selin K.</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted"> departman</span>
                            <span className="text-sm text-text-main">Teknik Destek</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="glass-card p-5 rounded-2xl border border-border-subtle">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Müşteri Bilgileri</h3>
                    <div className="flex items-center gap-3 mb-4 p-3 bg-brand-900/50 rounded-xl border border-border-subtle">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                            {mockTicket.customer.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-main">{mockTicket.customer.name}</p>
                            <p className="text-xs text-text-muted flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {mockTicket.customer.company}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <span>{mockTicket.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-muted">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            <span>{mockTicket.customer.phone}</span>
                        </div>
                        <div className="h-px bg-border-subtle my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">Mevcut Plan</span>
                            <span className="text-xs font-bold text-text-main">{mockTicket.customer.plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">Toplam Değer (LTV)</span>
                            <span className="text-xs font-bold text-emerald-400">{mockTicket.customer.ltv}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/help/customers/1')}
                        className="w-full mt-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-800 text-text-muted hover:text-text-main text-xs font-bold transition-all border border-border-subtle hover:border-indigo-500/20"
                    >
                        Müşteri Profilini Görüntüle
                    </button>
                </div>

                {/* Shared Files - Placeholder */}
                <div className="glass-card p-5 rounded-2xl border border-border-subtle flex-1">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Paylaşılan Dosyalar</h3>
                    <div className="flex flex-col items-center justify-center h-24 text-text-muted opacity-50 border-2 border-dashed border-border-subtle rounded-xl">
                        <Paperclip className="w-6 h-6 mb-2" />
                        <span className="text-xs">Dosya yok</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;
