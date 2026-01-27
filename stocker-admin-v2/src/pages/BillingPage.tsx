import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { toast } from '@/components/ui/Toast';
import {
    Package,
    History,
    TrendingUp,
    CheckCircle2,
    MoreVertical,
    Download,
    Plus,
    LayoutDashboard,
    List,
    ArrowLeftRight,
    BarChart3,
    Receipt,
    Users,
    XCircle,
    Check
} from 'lucide-react';
import { packageService } from '@/services/packageService';
import type { PackageDto } from '@/services/packageService';
import { subscriptionService, SUBSCRIPTION_STATUS } from '@/services/subscriptionService';
import type { SubscriptionDto } from '@/services/subscriptionService';
import { invoiceService, INVOICE_STATUS } from '@/services/invoiceService';
import type { InvoiceDto } from '@/services/invoiceService';

const BillingPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [packages, setPackages] = useState<PackageDto[]>([]);
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [pkgs, invs, subs] = await Promise.all([
                packageService.getAll(),
                invoiceService.getAll(),
                subscriptionService.getAll()
            ]);
            setPackages(pkgs || []);
            setInvoices(invs || []);
            setSubscriptions(subs || []);
        } catch (error) {
            console.error('Billing verisi çekilemedi:', error);
            toast.error('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const invoiceColumns = [
        {
            header: 'Fatura No',
            accessor: (inv: InvoiceDto) => (
                <span className="text-text-main font-bold">{inv.invoiceNumber}</span>
            )
        },
        {
            header: 'Müşteri',
            accessor: (inv: InvoiceDto) => inv.tenantName,
        },
        {
            header: 'Tarih',
            accessor: (inv: InvoiceDto) => new Date(inv.invoiceDate).toLocaleDateString('tr-TR'),
        },
        {
            header: 'Tutar',
            accessor: (inv: InvoiceDto) => (
                <span className="text-text-main font-bold">
                    {inv.totalAmount.toLocaleString('tr-TR')} {inv.currency || '₺'}
                </span>
            )
        },
        {
            header: 'Durum',
            accessor: (inv: InvoiceDto) => {
                const colors: any = {
                    [INVOICE_STATUS.Odendi]: 'text-emerald-500 bg-emerald-500/10',
                    [INVOICE_STATUS.Gecikti]: 'text-rose-500 bg-rose-500/10',
                    [INVOICE_STATUS.Gonderildi]: 'text-indigo-400 bg-indigo-500/10',
                };
                const text: any = {
                    [INVOICE_STATUS.Odendi]: 'Ödendi',
                    [INVOICE_STATUS.Gecikti]: 'Gecikti',
                    [INVOICE_STATUS.Gonderildi]: 'Beklemede',
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[inv.status] || 'bg-indigo-500/5 text-text-muted'}`}>
                        {text[inv.status] || 'Bilinmiyor'}
                    </span>
                );
            }
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

    const formatLimit = (value: number | undefined, type: 'users' | 'storage' | 'api' | 'projects') => {
        if (value === undefined) return '-';
        if (value === 2147483647 || value === 99999 || value === 99999999) return 'Sınırsız';
        if (type === 'storage') return `${value} GB`;
        if (type === 'api') return value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString();
        return value.toString();
    };

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        { id: 'packages', label: 'Paketler', icon: List },
        { id: 'comparison', label: 'Karşılaştırma', icon: ArrowLeftRight },
        { id: 'analytics', label: 'Analitik', icon: BarChart3 },
        { id: 'invoices', label: 'Faturalar', icon: Receipt },
        { id: 'subscriptions', label: 'Abonelikler', icon: Users },
    ];

    // Helper to calculate revenue for a package
    const getPackageRevenue = (pkgId: string) => {
        // Simple logic: number of active subscriptions * package price
        // In a real app, this would come from backend or analyzing invoices.
        // We'll estimate based on current subscriptions.
        const subs = subscriptions.filter(s => s.packageId === pkgId && s.status === SUBSCRIPTION_STATUS.Aktif);
        const pkg = packages.find(p => p.id === pkgId);
        if (!pkg) return 0;
        return subs.length * pkg.basePrice.amount;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Paketler & Abonelikler</h2>
                    <p className="text-text-muted mt-1">Sistem planlarını, fiyatlandırmayı ve fatura geçmişini yönetin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={History}>İşlem Günlüğü</Button>
                    <Button icon={Plus} onClick={() => navigate('/billing/packages/new')}>Yeni Paket Oluştur</Button>
                </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-indigo-500/5 border-indigo-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Toplam Paket</p>
                                    <p className="text-2xl font-bold text-text-main">{packages.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-emerald-500/5 border-emerald-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aktif Abonelik</p>
                                    <p className="text-2xl font-bold text-text-main">{subscriptions.filter(s => s.status === SUBSCRIPTION_STATUS.Aktif).length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Toplam Abone</p>
                                    <p className="text-2xl font-bold text-text-main">{subscriptions.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-blue-500/5 border-blue-500/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aylık Gelir</p>
                                    <p className="text-2xl font-bold text-text-main">
                                        ₺{subscriptions
                                            .filter(s => s.status === SUBSCRIPTION_STATUS.Aktif)
                                            .reduce((acc, sub) => {
                                                const pkg = packages.find(p => p.id === sub.packageId);
                                                return acc + (pkg?.basePrice?.amount || 0);
                                            }, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Package Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <Card key={pkg.id} className="relative group overflow-hidden border-border-subtle hover:border-indigo-500/30 transition-all duration-500">
                                <div className="absolute top-0 right-0 p-4">
                                    <Package className="w-12 h-12 text-indigo-400/5 group-hover:text-indigo-500/10 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">{pkg.type}</p>
                                    <h3 className="text-2xl font-bold text-text-main mt-1">{pkg.name}</h3>
                                    <p className="text-sm text-text-muted mt-2 line-clamp-2">{pkg.description || 'Standart özellikler dahildir.'}</p>

                                    <div className="mt-8 flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-text-main">{pkg.basePrice?.amount?.toLocaleString('tr-TR') || 0}</span>
                                        <span className="text-sm font-bold text-text-muted/40 uppercase">{pkg.basePrice?.currency || '₺'} / AY</span>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-text-muted">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>{formatLimit(pkg.maxUsers, 'users')} Kullanıcı Limiti</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-text-muted">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span>{formatLimit(pkg.maxStorage, 'storage')} Depolama</span>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-border-subtle flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40">
                                                {pkg.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm">Düzenle</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <div
                            className="cursor-pointer group"
                            onClick={() => navigate('/billing/packages/new')}
                        >
                            <Card
                                className="flex flex-col items-center justify-center text-center gap-4 h-full border-dashed border-2 border-border-subtle hover:border-indigo-500/30 hover:bg-white/5 transition-all text-text-muted hover:text-text-main"
                            >
                                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Yeni Paket Ekle</h3>
                                    <p className="text-sm text-text-muted/60 mt-1">Özellikleri ve limitleri tanımlayın</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: PACKAGES (List View) */}
            {activeTab === 'packages' && (
                <Card noPadding>
                    <Table
                        columns={[
                            {
                                header: 'Paket Adı',
                                accessor: (pkg: PackageDto) => (
                                    <div className="flex flex-col">
                                        <span className="text-text-main font-bold">{pkg.name}</span>
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider">{pkg.type}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Fiyat',
                                accessor: (pkg: PackageDto) => (
                                    <span className="font-bold text-text-main">₺{pkg.basePrice?.amount?.toLocaleString()} / {pkg.billingCycle}</span>
                                )
                            },
                            {
                                header: 'Abone',
                                accessor: (pkg: PackageDto) => subscriptions.filter(s => s.packageId === pkg.id).length
                            },
                            {
                                header: 'Limitler',
                                accessor: (pkg: PackageDto) => (
                                    <div className="flex flex-col text-xs text-text-muted">
                                        <span>{formatLimit(pkg.maxUsers, 'users')} Kullanıcı</span>
                                        <span>{formatLimit(pkg.maxStorage, 'storage')}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Durum',
                                accessor: (pkg: PackageDto) => (
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${pkg.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {pkg.isActive ? 'Aktif' : 'Pasif'}
                                    </div>
                                )
                            },
                            {
                                header: '',
                                accessor: () => (
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost">Düzenle</Button>
                                        <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">Sil</Button>
                                    </div>
                                ),
                                className: 'text-right'
                            }
                        ]}
                        data={packages}
                        isLoading={isLoading}
                    />
                </Card>
            )}

            {/* TAB: COMPARISON */}
            {activeTab === 'comparison' && (
                <Card noPadding className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border-subtle bg-indigo-500/5">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted sticky left-0 bg-[#0f111a] z-10 w-48">Özellik</th>
                                {packages.map(pkg => (
                                    <th key={pkg.id} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-main text-center">
                                        {pkg.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {[
                                { label: 'Kullanıcı Sayısı', key: 'users' },
                                { label: 'Depolama', key: 'storage' },
                                { label: 'API Çağrısı', key: 'apiCalls' },
                                { label: 'Proje Sayısı', key: 'projects' },
                                { label: 'Özel Domain', key: 'customDomains' },
                                { label: 'E-posta Desteği', key: 'emailSupport' },
                                { label: 'Telefon Desteği', key: 'phoneSupport' },
                                { label: 'Öncelikli Destek', key: 'prioritySupport' },
                                { label: 'SLA', key: 'sla' },
                            ].map((feature, i) => (
                                <tr key={i} className="hover:bg-indigo-500/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-text-muted sticky left-0 bg-[#0f111a] z-10">{feature.label}</td>
                                    {packages.map(pkg => {
                                        // Map values from pkg.limits or maxUsers
                                        let val: any = '-';
                                        if (feature.key === 'users') val = pkg.maxUsers;
                                        else if (feature.key === 'storage') val = pkg.maxStorage;
                                        else if (pkg.limits) {
                                            // @ts-ignore
                                            val = pkg.limits[feature.key];
                                        }

                                        let content;
                                        if (typeof val === 'boolean') {
                                            content = val ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500/20 mx-auto" />;
                                        } else if (val === undefined) {
                                            content = <span className="text-text-muted/20">-</span>;
                                        } else if (feature.key === 'sla') {
                                            content = val ? `%${val}` : '-';
                                        } else {
                                            content = formatLimit(val, feature.key as any);
                                        }

                                        return (
                                            <td key={pkg.id} className="px-6 py-4 text-sm text-text-main text-center">
                                                {content}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Share */}
                    <Card title="Gelir Paylaşımı">
                        <div className="space-y-6">
                            {packages.map(pkg => {
                                const rev = getPackageRevenue(pkg.id);
                                const totalRev = packages.reduce((acc, p) => acc + getPackageRevenue(p.id), 0) || 1;
                                const percent = Math.round((rev / totalRev) * 100);

                                return (
                                    <div key={pkg.id}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-text-main">{pkg.name}</span>
                                            <span className="text-text-muted">₺{rev.toLocaleString()} (%{percent})</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-indigo-500/10 overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Subscriber Distribution */}
                    <Card title="Abone Dağılımı">
                        <div className="space-y-6">
                            {packages.map(pkg => {
                                const count = subscriptions.filter(s => s.packageId === pkg.id).length;
                                const total = subscriptions.length || 1;
                                const percent = Math.round((count / total) * 100);

                                return (
                                    <div key={pkg.id}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-text-main">{pkg.name}</span>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3 h-3 text-text-muted" />
                                                <span className="text-text-muted">{count} Abone (%{percent})</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-emerald-500/10 overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Popular Features (Mocked for Demo as legacy was hardcoded) */}
                    <Card title="En Popüler Özellik Kullanımı (Tahmini)">
                        <div className="space-y-6">
                            {[
                                { name: 'API Erişimi', val: 78, color: 'bg-indigo-400' },
                                { name: 'Özel Raporlar', val: 65, color: 'bg-indigo-400' },
                                { name: 'E-posta Desteği', val: 95, color: 'bg-indigo-400' },
                            ].map((f, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-text-main">{f.name}</span>
                                        <span className="text-text-muted">%{f.val}</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                        <div className={`h-full ${f.color}`} style={{ width: `${f.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Yükseltme Trendleri (Son 30 Gün)">
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-2 h-full bg-emerald-500 rounded-full min-h-[40px]" />
                                <div>
                                    <p className="text-text-main font-bold">15 kullanıcı Starter → Professional</p>
                                    <p className="text-xs text-text-muted mt-1">Bu ay içinde gerçekleşen yükseltmeler</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-2 h-full bg-blue-500 rounded-full min-h-[40px]" />
                                <div>
                                    <p className="text-text-main font-bold">8 kullanıcı Professional → Enterprise</p>
                                    <p className="text-xs text-text-muted mt-1">Yüksek hacimli veri ihtiyacı</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-2 h-full bg-rose-500 rounded-full min-h-[40px]" />
                                <div>
                                    <p className="text-text-main font-bold">3 kullanıcı Professional → Starter</p>
                                    <p className="text-xs text-text-muted mt-1">Bütçe kısıtlamaları nedeniyle</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB: INVOICES */}
            {activeTab === 'invoices' && (
                <Card noPadding className="overflow-hidden">
                    <Table
                        // @ts-ignore
                        columns={invoiceColumns}
                        data={invoices}
                        isLoading={isLoading}
                    />
                </Card>
            )}

            {/* TAB: SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
                <Card noPadding>
                    <Table
                        columns={[
                            {
                                header: 'Müşteri',
                                accessor: (sub: SubscriptionDto) => sub.tenantName
                            },
                            {
                                header: 'Paket',
                                accessor: (sub: SubscriptionDto) => {
                                    const pkg = packages.find(p => p.id === sub.packageId);
                                    return pkg ? pkg.name : sub.packageId;
                                }
                            },
                            {
                                header: 'Bitiş',
                                accessor: (sub: SubscriptionDto) => new Date(sub.currentPeriodEnd).toLocaleDateString('tr-TR')
                            },
                            {
                                header: 'Durum',
                                accessor: (sub: SubscriptionDto) => (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.status === SUBSCRIPTION_STATUS.Aktif ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {sub.status === SUBSCRIPTION_STATUS.Aktif ? 'Aktif' : 'Pasif'}
                                    </span>
                                )
                            }
                        ]}
                        data={subscriptions}
                        isLoading={isLoading}
                    />
                </Card>
            )}

        </div>
    );
};

export default BillingPage;
