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
    Hash
} from 'lucide-react';
import { useTenantDetail } from '@/hooks/useTenantDetail';

const TenantDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: tenant, isLoading } = useTenantDetail(id);
    const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'usage' | 'history'>('overview');

    if (isLoading) {
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
        { id: 'company', label: 'Şirket & Sahip', icon: Building2 },
        { id: 'usage', label: 'Kullanım & Limitler', icon: Server },
        { id: 'history', label: 'Aktivite Geçmişi', icon: History }
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
                            <span className="opacity-20">•</span>
                            <span className="text-xs font-medium">{tenant.domain}</span>
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
                            <p className="text-2xl font-bold text-text-main">{tenant.users} / {tenant.maxUsers}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-500 group-hover:opacity-100 opacity-20" style={{ width: `${(tenant.users / tenant.maxUsers) * 100}%` }} />
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Depolama</p>
                            <p className="text-2xl font-bold text-text-main">{tenant.storage} / {tenant.maxStorage} GB</p>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500 group-hover:opacity-100 opacity-20" style={{ width: `${(tenant.storage / tenant.maxStorage) * 100}%` }} />
                </Card>

                <Card className="bg-amber-500/5 border-amber-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Paket</p>
                            <p className="text-2xl font-bold text-text-main">{tenant.packageName}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-indigo-500/10 border-indigo-500/20 shadow-xl shadow-indigo-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aylık Ücret</p>
                            <p className="text-2xl font-bold text-indigo-400">
                                {tenant.billing?.currency || '₺'}{tenant.billing?.amount?.toLocaleString() || '0'}
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
                        onClick={() => setActiveTab(tab.id)}
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
                                    <DetailItem icon={Globe} label="Subdomain" value={`${tenant.subdomain || '-'}.stocker.app`} link={tenant.subdomain ? `https://${tenant.subdomain}.stocker.app` : undefined} />
                                    <DetailItem icon={ShieldCheck} label="Paket Seviyesi" value={tenant.packageName || '-'} />
                                    <DetailItem icon={Calendar} label="Oluşturulma Tarihi" value={tenant.createdDate ? new Date(tenant.createdDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                                    <DetailItem icon={Database} label="Veritabanı Bölgesi" value={tenant.database?.region || 'Europe-West'} />
                                    <DetailItem icon={Activity} label="Son Aktivite" value={tenant.lastActive ? new Date(tenant.lastActive).toLocaleString('tr-TR') : 'Yok'} />
                                </div>
                            </Card>

                            <Card title="Limit Kullanımı" subtitle="Paket bazlı kaynak tüketimi">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <UsageBar title="API Çağrıları" used={tenant.limits?.apiCalls?.used || 0} max={tenant.limits?.apiCalls?.max || 1} unit="çağrı" />
                                    <UsageBar title="Bant Genişliği" used={tenant.limits?.bandwidth?.used || 0} max={tenant.limits?.bandwidth?.max || 1} unit="GB" color="bg-emerald-500" />
                                    <UsageBar title="E-posta Gönderimi" used={tenant.limits?.emailsSent?.used || 0} max={tenant.limits?.emailsSent?.max || 1} unit="adet" color="bg-amber-500" />
                                    <UsageBar title="Özel Domain" used={tenant.limits?.customDomains?.used || 0} max={tenant.limits?.customDomains?.max || 1} unit="adet" color="bg-rose-500" />
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'company' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card title="Şirket Bilgileri">
                                <div className="space-y-6">
                                    <DetailItem icon={Building2} label="Resmi Ad" value={tenant.company?.name || '-'} />
                                    <DetailItem icon={Hash} label="Vergi Numarası" value={tenant.company?.taxNumber || '-'} />
                                    <DetailItem icon={MapPin} label="Adres" value={tenant.company ? `${tenant.company.address || ''}, ${tenant.company.city || ''}, ${tenant.company.country || ''}` : '-'} />
                                </div>
                            </Card>
                            <Card title="Sahip Bilgileri">
                                <div className="space-y-6">
                                    <DetailItem icon={Users} label="Ad Soyad" value={tenant.owner ? `${tenant.owner.firstName || ''} ${tenant.owner.lastName || ''}` : '-'} />
                                    <DetailItem icon={Mail} label="E-posta" value={tenant.owner?.email || '-'} />
                                    <DetailItem icon={Phone} label="Telefon" value={tenant.owner?.phone || '-'} />
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <Card title="Aktivite Geçmişi" subtitle="Son işlemleri takip edin">
                            <div className="space-y-6 py-4">
                                <TimelineItem
                                    icon={CheckCircle2}
                                    title="Paket yükseltildi"
                                    description="Professional → Enterprise"
                                    time="2 saat önce"
                                    color="text-emerald-400"
                                />
                                <TimelineItem
                                    icon={ShieldCheck}
                                    title="Durum Değiştirildi"
                                    description="Tenant durumu pasiften aktife çekildi"
                                    time="5 saat önce"
                                    color="text-indigo-400"
                                />
                                <TimelineItem
                                    icon={Users}
                                    title="Kullanıcı Limiti Arttırıldı"
                                    description="+50 yeni kullanıcı alanı eklendi"
                                    time="1 gün önce"
                                    color="text-amber-400"
                                />
                            </div>
                        </Card>
                    )}
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <Card title="Hızlı İşlemler">
                        <div className="space-y-2">
                            <ActionButton icon={ShieldCheck} label="Durumu Değiştir" />
                            <ActionButton icon={CreditCard} label="Fatura Oluştur" />
                            <ActionButton icon={Database} label="Yedek Al" />
                            <ActionButton icon={History} label="Tüm Logları Gör" />
                            <div className="pt-4 mt-4 border-t border-border-subtle">
                                <ActionButton icon={XCircle} label="Tenantı Sil" variant="danger" />
                            </div>
                        </div>
                    </Card>

                    <Card title="Abonelik Durumu" className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Sonraki Ödeme</span>
                                <span className="text-sm font-bold text-white">
                                    {tenant.billing?.nextBillingDate ? new Date(tenant.billing.nextBillingDate).toLocaleDateString('tr-TR') : '-'}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-indigo-500/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[65%]" />
                            </div>
                            <p className="text-[10px] text-text-muted font-medium text-center italic">
                                {tenant.billing?.nextBillingDate ? 'Aboneliğin yenilenmesine az kaldı.' : 'Abonelik bilgisi bulunamadı.'}
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

const UsageBar = ({ title, used, max, unit, color = 'bg-indigo-500' }: any) => {
    const percentage = Math.round((used / max) * 100);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</p>
                <p className="text-[10px] font-bold text-text-main">{used.toLocaleString()} / {max.toLocaleString()} {unit}</p>
            </div>
            <div className="h-2 w-full bg-indigo-500/5 rounded-full overflow-hidden border border-border-subtle/30">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};

const TimelineItem = ({ icon: Icon, title, description, time, color }: any) => (
    <div className="flex gap-4 group">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500/5 flex items-center justify-center border border-border-subtle/50 group-hover:border-indigo-500/30 transition-all ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 border-b border-border-subtle/30 pb-4 group-last:border-0">
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-text-main">{title}</p>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">{time}</span>
            </div>
            <p className="text-xs text-text-muted/70 mt-1">{description}</p>
        </div>
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
