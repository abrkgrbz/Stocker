import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import {
    Database,
    Play,
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowRightLeft,
    Rocket,
    Eye,
    LayoutDashboard,
    List,
    History
} from 'lucide-react';
import { useMigrations } from '@/hooks/useMigrations';
import { toast } from '@/components/ui/Toast';

const MigrationsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        tenants,
        isLoadingTenants,
        master,
        applyMigration,
        isApplying,
        applyAllMigrations,
        isApplyingAll,
        applyMasterMigration,
        isApplyingMaster,
        refetch
    } = useMigrations();

    // UI States
    const [activeTab, setActiveTab] = useState('overview');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'ALL' | 'MASTER' | 'TENANT',
        tenantId?: string,
        title: string,
        message: string
    } | null>(null);

    const openDetails = (tenant: any) => {
        setSelectedTenant(tenant);
        setDetailsModalOpen(true);
    };

    const confirmApplyAll = () => {
        const pendingCount = tenants?.filter(t => t.hasPendingMigrations).length || 0;
        setConfirmAction({
            type: 'ALL',
            title: 'Tüm Migrationları Uygula',
            message: `${pendingCount} adet tenant için bekleyen güncelleştirmeler uygulanacak. Bu işlem veritabanı şemalarını değiştirecektir. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const confirmApplyMaster = () => {
        const pendingCount = master?.pendingMigrations?.length || 0;
        setConfirmAction({
            type: 'MASTER',
            title: 'Master Migration Uygula',
            message: `Master veritabanı için ${pendingCount} adet güncelleştirme uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const confirmApplyTenant = (tenant: any) => {
        const pendingCount = tenant.pendingMigrations?.reduce((acc: number, mod: any) => acc + mod.migrations.length, 0) || 0;
        setConfirmAction({
            type: 'TENANT',
            tenantId: tenant.tenantId,
            title: 'Tenant Migration Uygula',
            message: `${tenant.tenantName} (${tenant.tenantCode}) için ${pendingCount} adet güncelleştirme uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        try {
            setConfirmModalOpen(false);
            if (confirmAction.type === 'ALL') {
                await applyAllMigrations();
                toast.success('Tüm migrationlar başarıyla uygulandı.');
            } else if (confirmAction.type === 'MASTER') {
                await applyMasterMigration();
                toast.success('Master migration başarıyla uygulandı.');
            } else if (confirmAction.type === 'TENANT' && confirmAction.tenantId) {
                await applyMigration(confirmAction.tenantId);
                toast.success('Tenant migration başarıyla uygulandı.');
            }
        } catch (error) {
            toast.error('Migration işlemi sırasında bir hata oluştu.');
        } finally {
            setConfirmAction(null);
        }
    };

    const columns = [
        {
            accessor: (tenant: any) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tenant.hasPendingMigrations ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Database className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-main">{tenant.tenantName}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tenant.tenantCode}</p>
                    </div>
                </div>
            ),
            header: 'Tenant'
        },
        {
            accessor: (tenant: any) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tenant.error ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    tenant.hasPendingMigrations ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                    {tenant.error ? (
                        <>
                            <AlertCircle className="w-3 h-3" />
                            Hata
                        </>
                    ) : tenant.hasPendingMigrations ? (
                        <>
                            <Clock className="w-3 h-3" />
                            Bekliyor
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-3 h-3" />
                            Güncel
                        </>
                    )}
                </div>
            ),
            header: 'Durum'
        },
        {
            accessor: (tenant: any) => {
                const count = tenant.pendingMigrations?.reduce((acc: number, mod: any) => acc + mod.migrations.length, 0) || 0;
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${count > 0 ? 'text-amber-500' : 'text-text-muted'}`}>
                            {count} Migrations
                        </span>
                        {count > 0 && (
                            <button
                                onClick={() => openDetails(tenant)}
                                className="p-1 hover:bg-white/10 rounded-lg text-text-muted hover:text-indigo-400 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
            header: 'Bekleyen'
        },
        {
            accessor: (tenant: any) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Clock}
                        onClick={() => navigate(`/system/migrations/${tenant.tenantId}`)}
                    >
                        Geçmiş
                    </Button>
                    {tenant.hasPendingMigrations && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={Play}
                            onClick={() => confirmApplyTenant(tenant)}
                            disabled={isApplying}
                        >
                            Uygula
                        </Button>
                    )}
                </div>
            ),
            header: ''
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main">Migration Yönetimi</h1>
                    <p className="text-text-muted mt-2">Sistem ve tenant veritabanı şemalarını senkronize edin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        icon={RefreshCcw}
                        onClick={() => refetch()}
                        disabled={isLoadingTenants}
                    >
                        Yenile
                    </Button>
                    <Button
                        variant="primary"
                        icon={Rocket}
                        onClick={confirmApplyAll}
                        // Button enables if any tenant has pending migrations
                        disabled={isApplyingAll || !tenants?.some(t => t.hasPendingMigrations)}
                    >
                        Tümünü Uygula
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
                    { id: 'tenants', label: 'Tenant Listesi', icon: List },
                    { id: 'history', label: 'Geçmiş', icon: History },
                ]}
            />

            {/* Content Switcher */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <Card
                            className={`xl:col-span-1 border-2 transition-all duration-500 ${master?.hasPendingMigrations ? 'border-amber-500/30 bg-amber-500/5' : 'border-border-subtle'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-lg font-bold text-text-main">Master Veritabanı</h3>
                                    </div>
                                    <p className="text-sm text-text-muted mb-6">Master şema güncelliği kontrol edilir.</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${master?.hasPendingMigrations ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {master?.hasPendingMigrations ? 'Bekleyen Var' : 'Güncel'}
                                </div>
                            </div>

                            {master?.hasPendingMigrations ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{master.pendingMigrations.length} Migration Bekliyor</span>
                                        </div>
                                        <ul className="text-xs text-text-muted space-y-1 ml-6 list-disc max-h-32 overflow-y-auto custom-scrollbar">
                                            {master.pendingMigrations.map((m, i) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="primary"
                                        icon={Play}
                                        onClick={confirmApplyMaster}
                                        disabled={isApplyingMaster}
                                    >
                                        Master'ı Güncelle
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center justify-center text-center opacity-50">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                                    <p className="text-sm font-bold text-emerald-500 italic">Sistem şeması güncel.</p>
                                </div>
                            )}
                        </Card>

                        {/* Stats */}
                        <Card title="İstatistikler" className="xl:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                                <StatItem
                                    label="Toplam Tenant"
                                    value={tenants?.length || 0}
                                    icon={Database}
                                    color="text-indigo-400"
                                />
                                <StatItem
                                    label="Bekleyen Tenant"
                                    value={tenants?.filter(t => t.hasPendingMigrations).length || 0}
                                    icon={Clock}
                                    color="text-amber-500"
                                />
                                <StatItem
                                    label="Güncel Tenant"
                                    value={tenants?.filter(t => !t.hasPendingMigrations && !t.error).length || 0}
                                    icon={CheckCircle2}
                                    color="text-emerald-500"
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'tenants' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card title="Tenant Migration Durumları" subtitle="Tenant bazlı bekleyen veritabanı değişiklikleri">
                        <div className="mb-6 flex gap-4">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-indigo-500" />
                                <input
                                    placeholder="Tenant ara..."
                                    className="w-full bg-brand-950/50 border border-border-subtle rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <Button variant="outline" icon={Filter} className="px-6 rounded-2xl border-border-subtle">Filtrele</Button>
                        </div>

                        <Table
                            columns={columns}
                            data={(tenants || []).map(t => ({ ...t, id: t.tenantId }))}
                            isLoading={isLoadingTenants}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <History className="w-16 h-16 text-text-muted mb-4" />
                        <h3 className="text-lg font-bold text-text-main">Henüz Geçmiş Yok</h3>
                        <p className="text-text-muted">Migration geçmişi burada listelenecek.</p>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                title={`${selectedTenant?.tenantName || 'Tenant'} - Bekleyen Migrationlar`}
            >
                <div>
                    {selectedTenant?.pendingMigrations?.map((module: any, i: number) => (
                        <div key={i} className="mb-4 last:mb-0">
                            <h4 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">{module.module}</h4>
                            <div className="bg-brand-950/30 rounded-xl border border-border-subtle p-3">
                                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4">
                                    {module.migrations.map((mig: string, j: number) => (
                                        <li key={j} className="font-mono">{mig}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                    {!selectedTenant?.pendingMigrations?.length && (
                        <div className="text-center py-8 text-text-muted italic">
                            Görüntülenecek migration bulunamadı.
                        </div>
                    )}
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title={confirmAction?.title || 'Onay'}
                maxWidth="max-w-md"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                        <p className="text-sm text-text-main leading-relaxed">
                            {confirmAction?.message}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmModalOpen(false)}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="primary"
                            icon={Rocket}
                            onClick={handleConfirm}
                        >
                            Evet, Uygula
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="p-6 rounded-3xl bg-brand-950/20 border border-border-subtle flex items-center gap-4">
        <div className={`p-4 rounded-2xl bg-white/5 ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{label}</p>
            <p className="text-2xl font-bold text-text-main mt-1">{value}</p>
        </div>
    </div>
);

export default MigrationsPage;
