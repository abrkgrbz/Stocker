import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
    CreditCard,
    Calendar,
    Search,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Download
} from 'lucide-react';
import { subscriptionService, type SubscriptionDto } from '@/services/subscriptionService';

const SubscriptionsPage: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionService.getAll();
            setSubscriptions(data || []);
        } catch (error) {
            console.error('Abonelikler yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
        'Active': { label: 'Aktif', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
        'Suspended': { label: 'Askıda', color: 'text-amber-400 bg-amber-500/10', icon: AlertCircle },
        'Cancelled': { label: 'İptal Edildi', color: 'text-rose-400 bg-rose-500/10', icon: XCircle },
        'Trial': { label: 'Deneme', color: 'text-indigo-400 bg-indigo-500/10', icon: Calendar },
        'Expired': { label: 'Süresi Dolmuş', color: 'text-text-muted bg-indigo-500/5', icon: AlertCircle },
    };

    const columns = [
        {
            header: 'Tenant / Müşteri',
            accessor: (sub: SubscriptionDto) => (
                <div className="flex items-center gap-4 text-text-main">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                        {sub.tenantName ? sub.tenantName.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <div>
                        <p className="text-sm font-bold">{sub.tenantName}</p>
                        <p className="text-[10px] font-bold text-text-muted/50 uppercase tracking-widest">ID: {sub.tenantId.substring(0, 8)}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Paket & Ücret',
            accessor: (sub: SubscriptionDto) => (
                <div>
                    <span className="text-sm font-bold text-text-main">{sub.packageName}</span>
                    <p className="text-xs text-text-muted">{sub.finalPrice?.toLocaleString('tr-TR')} {sub.currency} / {sub.billingCycle === 'Monthly' ? 'Ay' : 'Yıl'}</p>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (sub: SubscriptionDto) => {
                const status = statusMap[sub.status] || { label: sub.status, color: 'text-text-muted', icon: AlertCircle };
                const Icon = status.icon;
                return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
                        <Icon className="w-3 h-3" />
                        {status.label}
                    </div>
                );
            }
        },
        {
            header: 'Bitiş Tarihi',
            accessor: (sub: SubscriptionDto) => (
                <div className="flex flex-col">
                    <span className="text-xs text-text-muted font-medium">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString('tr-TR') : '-'}
                    </span>
                    {sub.autoRenew && (
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Otomatik Yenileme</span>
                    )}
                </div>
            )
        },
        {
            header: '',
            accessor: () => (
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-text-muted/20 hover:text-text-main transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            ),
            className: 'text-right'
        }
    ];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-indigo-400" />
                        Abonelik Yönetimi
                    </h2>
                    <p className="text-text-muted mt-1">Tüm tenant aboneliklerini, maliyetleri ve yenileme süreçlerini izleyin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={RefreshCw} onClick={fetchData}>Eşitle</Button>
                </div>
            </div>

            <Card noPadding className="overflow-hidden border-border-subtle backdrop-blur-3xl">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Tenant veya paket ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                        />
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={subscriptions.filter(s =>
                        s.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    isLoading={isLoading}
                />
            </Card>
        </div>
    );
};

export default SubscriptionsPage;
