import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    ChevronLeft,
    Globe,
    ShieldCheck,
    Users,
    Server,
    CreditCard,
    Mail,
    Phone,
    Building2,
    Activity,
    Database,
    History,
    CheckCircle2,
    XCircle,
    ExternalLink,
    MoreVertical,
    Calendar,
    MapPin,
    Hash,
    HeartPulse,
    AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tenantService, type TenantDto, type TenantStatisticsDto } from '@/services/tenantService';
import { tenantHealthService, type TenantHealthDto, type HealthHistoryDto } from '@/services/tenantHealthService';

const TenantDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'history' | 'health'>('overview');
    const [health, setHealth] = useState<TenantHealthDto | null>(null);
    const [healthHistory, setHealthHistory] = useState<HealthHistoryDto[]>([]);

    const { data: tenant, isLoading: isLoadingTenant } = useQuery({
        queryKey: ['tenant', id],
        queryFn: () => tenantService.getById(id!),
        enabled: !!id,
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['tenant-stats', id],
        queryFn: () => tenantService.getByIdStatistics(id!),
        enabled: !!id,
    });

    React.useEffect(() => {
        if (activeTab === 'health' && id) {
            fetchHealthData(id);
        }
    }, [activeTab, id]);

    const fetchHealthData = async (tenantId: string) => {
        try {
            const [hData, hHistory] = await Promise.all([
                tenantHealthService.getLatest(tenantId),
                tenantHealthService.getHistory(tenantId)
            ]);
            setHealth(hData);
            setHealthHistory(hHistory || []);
        } catch (error) {
            console.error('Health data fetch failed', error);
        }
    };

    if (isLoadingTenant || isLoadingStats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted font-bold italic">Tenant bulunamadı.</p>
                <Button className="mt-4" onClick={() => navigate('/tenants')}>Listeye Dön</Button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: Activity },
        { id: 'company', label: 'Şirket Bilgileri', icon: Building2 },
        { id: 'history', label: 'Aktivite Geçmişi', icon: History },
        { id: 'health', label: 'Sağlık & İzleme', icon: HeartPulse }
    ] as const;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/tenants')}
                        className="p-2.5 rounded-2xl bg-indigo-500/5 text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-border-subtle"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight text-text-main">{tenant.name}</h2>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tenant.isActive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                                {tenant.isActive ? 'Aktif' : 'Pasif'}
                            </div>
                        </div>
                        <p className="text-text-muted mt-1 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-widest">{tenant.code}</span>
                            {/* Domain removed from DTO, using hardcoded pattern or settings? Assuming tenant.name as placeholder for now if no domain field */}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={ExternalLink}>Giriş Yap</Button>
                    <Button icon={MoreVertical} variant="ghost" className="p-3" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-indigo-500/5 border-indigo-500/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Kullanıcılar</p>
                            <p className="text-2xl font-bold text-text-main">{stats?.totalUsers || 0} / {stats?.activeUsers ? `(${stats.activeUsers} aktif)` : '-'}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Depolama</p>
                            <p className="text-2xl font-bold text-text-main">{stats?.storageUsedGB ? stats.storageUsedGB.toFixed(2) : '0'} GB</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Paket</p>
                            <p className="text-2xl font-bold text-text-main">{tenant.subscription?.packageName || 'Standart'}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-indigo-500/10 border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Abonelik Durumu</p>
                            <p className="text-xl font-bold text-indigo-400 capitalize">
                                {tenant.subscription?.status || '-'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-indigo-500/5 border border-border-subtle rounded-3xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-bold transition-all
                            ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            <Card title="Tenant Detayları" subtitle="Temel konfigürasyon ve kimlik bilgileri">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 p-4">
                                    <DetailItem icon={Hash} label="Tenant ID" value={tenant.id} isCode />
                                    {/* Subdomain not explicitly in DTO but might be derived or in settings? */}
                                    <DetailItem icon={ShieldCheck} label="Paket Seviyesi" value={tenant.subscription?.packageName || '-'} />
                                    <DetailItem icon={Calendar} label="Oluşturulma Tarihi" value={tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                                    <DetailItem icon={Activity} label="Son Aktivite" value={stats?.lastActivityDate ? new Date(stats.lastActivityDate).toLocaleString('tr-TR') : 'Yok'} />
                                </div>
                            </Card>

                            <Card title="Modül Kullanımı" subtitle="Aktif modül sayıları">
                                <div className="space-y-4">
                                    {stats?.moduleUsage && Object.entries(stats.moduleUsage).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-text-muted capitalize">{key}</span>
                                            <span className="text-sm font-bold text-text-main">{value}</span>
                                        </div>
                                    ))}
                                    {(!stats?.moduleUsage || Object.keys(stats.moduleUsage).length === 0) && (
                                        <p className="text-text-muted text-sm italic">Modül kullanım verisi bulunamadı.</p>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'company' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card title="İletişim Bilgileri">
                                <div className="space-y-6">
                                    <DetailItem icon={Mail} label="E-posta" value={tenant.contactEmail || '-'} />
                                    <DetailItem icon={Phone} label="Telefon" value={tenant.contactPhone || '-'} />
                                    <DetailItem icon={MapPin} label="Adres" value={`${tenant.address || ''} ${tenant.city || ''} ${tenant.country || ''}`} />
                                    <DetailItem icon={Hash} label="Vergi No" value={tenant.taxNumber || '-'} />
                                </div>
                            </Card>
                            <Card title="Bölgesel Ayarlar">
                                <div className="space-y-6">
                                    <DetailItem icon={Globe} label="Para Birimi" value={tenant.settings?.currency || '-'} />
                                    <DetailItem icon={Activity} label="Zaman Dilimi" value={tenant.settings?.timezone || '-'} />
                                    <DetailItem icon={Calendar} label="Tarih Formatı" value={tenant.settings?.dateFormat || '-'} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <Card title="Aktivite Geçmişi" subtitle="Son işlemleri takip edin">
                            <div className="text-center py-6 text-text-muted">
                                <p>Aktivite geçmişi entegrasyonu yapım aşamasında.</p>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'health' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className={`border-l-4 ${health?.isHealthy ? 'border-emerald-500 bg-emerald-500/5' : 'border-rose-500 bg-rose-500/5'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-full ${health?.isHealthy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            <HeartPulse className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-text-main">{health?.isHealthy ? 'Sistem Sağlıklı' : 'Sorun Tespit Edildi'}</h3>
                                            <p className="text-sm text-text-muted mt-1">Son kontrol: {health?.lastCheck ? new Date(health.lastCheck).toLocaleTimeString() : '-'}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-indigo-500/5 border-indigo-500/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                                            <Activity className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-text-main">{health?.responseTimeMs || 0} ms</h3>
                                            <p className="text-sm text-text-muted mt-1">Ortalama Yanıt Süresi</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <Card title="Hızlı İşlemler">
                        <div className="space-y-2">
                            <ActionButton icon={ShieldCheck} label="Durumu Değiştir" />
                            <ActionButton icon={CreditCard} label="Abonelik Yönetimi" />
                            {/* <ActionButton icon={Database} label="Yedek Al" /> */}
                            <div className="pt-4 mt-4 border-t border-border-subtle">
                                <ActionButton icon={XCircle} label="Tenantı Sil" variant="danger" />
                            </div>
                        </div>
                    </Card>

                    <Card title="Abonelik Bitiş" className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Bitiş Tarihi</span>
                                <span className="text-sm font-bold text-white">
                                    {tenant.subscription?.endDate ? new Date(tenant.subscription.endDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                                </span>
                            </div>
                            <p className="text-[10px] text-text-muted font-medium text-center italic">
                                {tenant.subscription?.autoRenew ? 'Otomatik yenileme açık.' : 'Otomatik yenileme kapalı.'}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, isCode, link }: any) => (
    <div className="space-y-1.5 group">
        <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-text-muted/40 group-hover:text-indigo-400 transition-colors" />
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{label}</p>
        </div>
        {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-2">
                {value} <ExternalLink className="w-3 h-3" />
            </a>
        ) : (
            <p className={`text-sm font-bold text-text-main/80 ${isCode ? 'font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-lg w-fit' : ''}`}>
                {value}
            </p>
        )}
    </div>
);

const ActionButton = ({ icon: Icon, label, variant = 'default' }: any) => (
    <button className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border
        ${variant === 'danger'
            ? 'bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10'
            : 'bg-indigo-500/5 border-border-subtle text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10'}
    `}>
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

export default TenantDetailPage;

