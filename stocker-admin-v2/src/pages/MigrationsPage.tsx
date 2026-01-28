import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed unused
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Switch } from '@/components/ui/Switch';
import { ScheduleMigrationModal } from '@/components/migrations/ScheduleMigrationModal';
import { MigrationPreviewModal } from '@/components/migrations/MigrationPreviewModal';
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
    History,
    Calendar as CalendarIcon,
    Settings,
    FileCode, // RotateCcw removed
    Trash2,
    Save
} from 'lucide-react';
import { useMigrations } from '@/hooks/useMigrations';
import { toast } from '@/components/ui/Toast';

const MigrationsPage: React.FC = () => {
    // const navigate = useNavigate(); // Removed unused
    const {
        tenants,
        isLoadingTenants,
        // master, // Legacy, unused in this component directly now
        applyMigration,
        isApplying,

        // Central Logic (Replaces applyAll and general status)
        centralStatus,
        isLoadingCentralStatus,
        applyCentralAll,
        isApplyingCentralAll,

        // Alerts Logic
        // alerts, // Unused
        applyAlerts,
        isApplyingAlerts,

        applyMasterMigration,
        isApplyingMaster,
        refetch,

        // New Hooks
        getHistory,
        isLoadingHistory,
        scheduled,
        isLoadingScheduled,
        deleteSchedule,
        isDeletingSchedule,
        settings,
        // isLoadingSettings, // Unused
        updateSettings,
        isUpdatingSettings,
        rollbackMigration,
        // isRollingBack // Unused
    } = useMigrations();

    // UI States
    const [activeTab, setActiveTab] = useState('overview');
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // New Modal States
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState<{ tenantId: string, moduleName: string, migrationName: string } | null>(null);

    // History Tab State
    const [selectedHistoryTenantId, setSelectedHistoryTenantId] = useState<string>('');
    const [historyData, setHistoryData] = useState<any>(null);

    // Settings Tab State
    const [settingsForm, setSettingsForm] = useState({
        autoApplyMigrations: false,
        notifyOnSuccess: false,
        notifyOnError: false, // Added to match DTO
        backupBeforeMigration: false
    });

    useEffect(() => {
        if (settings) {
            setSettingsForm(settings);
        }
    }, [settings]);

    const [confirmAction, setConfirmAction] = useState<{
        type: 'ALL' | 'MASTER' | 'ALERTS' | 'TENANT' | 'ROLLBACK' | 'DELETE_SCHEDULE',
        data?: any,
        title: string,
        message: string
    } | null>(null);

    const openDetails = (tenant: any) => {
        setSelectedTenant(tenant);
        setDetailsModalOpen(true);
    };

    const openPreview = (tenantId: string, moduleName: string, migrationName: string) => {
        setPreviewData({ tenantId, moduleName, migrationName });
        setPreviewModalOpen(true);
    };

    const loadHistory = async (tenantId: string) => {
        if (!tenantId) return;
        try {
            const data = await getHistory(tenantId);
            setHistoryData(data);
        } catch (error) {
            toast.error('Geçmiş yüklenemedi.');
        }
    };

    useEffect(() => {
        if (activeTab === 'history' && selectedHistoryTenantId) {
            loadHistory(selectedHistoryTenantId);
        }
    }, [activeTab, selectedHistoryTenantId]);

    const handleSaveSettings = async () => {
        try {
            await updateSettings(settingsForm);
            toast.success('Ayarlar güncellendi.');
        } catch (error) {
            toast.error('Ayarlar güncellenemedi.');
        }
    };

    const confirmApplyAll = () => {
        const totalPending = centralStatus?.totalPendingMigrations || 0;
        setConfirmAction({
            type: 'ALL',
            title: 'Tüm Sistem Migrationları Uygula',
            message: `Sistem genelinde ${totalPending} adet güncelleştirme (Master, Alerts ve Tenantlar) uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const confirmApplyMaster = () => {
        const pendingCount = centralStatus?.master?.pendingMigrations?.length || 0;
        setConfirmAction({
            type: 'MASTER',
            title: 'Master Migration Uygula',
            message: `Master veritabanı için ${pendingCount} adet güncelleştirme uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const confirmApplyAlerts = () => {
        const pendingCount = centralStatus?.alerts?.pendingMigrations?.length || 0;
        setConfirmAction({
            type: 'ALERTS',
            title: 'Alerts Migration Uygula',
            message: `Alerts veritabanı için ${pendingCount} adet güncelleştirme uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    const confirmApplyTenant = (tenant: any) => {
        const pendingCount = tenant.pendingMigrations?.reduce((acc: number, mod: any) => acc + mod.migrations.length, 0) || 0;
        setConfirmAction({
            type: 'TENANT',
            data: { tenantId: tenant.tenantId },
            title: 'Tenant Migration Uygula',
            message: `${tenant.tenantName} (${tenant.tenantCode}) için ${pendingCount} adet güncelleştirme uygulanacak. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };

    /*
    const confirmRollback = (tenantId: string, moduleName: string, migrationName: string) => {
        setConfirmAction({
            type: 'ROLLBACK',
            data: { tenantId, moduleName, migrationName },
            title: 'Migration Geri Al',
            message: `DİKKAT: ${migrationName} işlemi geri alınacak. Bu işlem veri kaybına neden olabilir. Devam etmek istiyor musunuz?`
        });
        setConfirmModalOpen(true);
    };
    */

    const confirmDeleteSchedule = (scheduleId: string) => {
        setConfirmAction({
            type: 'DELETE_SCHEDULE',
            data: { scheduleId },
            title: 'Zamanlamayı Sil',
            message: 'Bu planlanmış migration işlemini silmek istediğinize emin misiniz?'
        });
        setConfirmModalOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        try {
            setConfirmModalOpen(false);
            if (confirmAction.type === 'ALL') {
                const result = await applyCentralAll();
                toast.success(result.message || 'Tüm sistem güncellendi.');
            } else if (confirmAction.type === 'MASTER') {
                await applyMasterMigration();
                toast.success('Master migration başarıyla uygulandı.');
            } else if (confirmAction.type === 'ALERTS') {
                await applyAlerts();
                toast.success('Alerts migration başarıyla uygulandı.');
            } else if (confirmAction.type === 'TENANT' && confirmAction.data?.tenantId) {
                await applyMigration(confirmAction.data.tenantId);
                toast.success('Tenant migration başarıyla uygulandı.');
            } else if (confirmAction.type === 'ROLLBACK' && confirmAction.data) {
                await rollbackMigration(confirmAction.data);
                toast.success('Migration geri alındı.');
                if (selectedHistoryTenantId) loadHistory(selectedHistoryTenantId);
            } else if (confirmAction.type === 'DELETE_SCHEDULE' && confirmAction.data?.scheduleId) {
                await deleteSchedule(confirmAction.data.scheduleId);
                toast.success('Zamanlama silindi.');
            }
        } catch (error) {
            toast.error('İşlem sırasında bir hata oluştu.');
        } finally {
            setConfirmAction(null);
        }
    };

    // ... Columns definitions (same as before) ...
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
                        icon={History}
                        onClick={() => {
                            setSelectedHistoryTenantId(tenant.tenantId);
                            setActiveTab('history');
                        }}
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

    const scheduledColumns = [
        {
            accessor: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Database className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-text-main">{item.tenantName}</p>
                    </div>
                </div>
            ),
            header: 'Tenant'
        },
        {
            accessor: (item: any) => (
                <div className="text-sm font-mono text-text-muted">
                    {item.migrationName || 'Tümü'}
                    {item.moduleName && <span className="text-indigo-400"> ({item.moduleName})</span>}
                </div>
            ),
            header: 'Hedef'
        },
        {
            accessor: (item: any) => (
                <div className="flex items-center gap-2 text-sm text-text-main">
                    <CalendarIcon className="w-4 h-4 text-text-muted" />
                    {new Date(item.scheduledTime).toLocaleString('tr-TR')}
                </div>
            ),
            header: 'Zaman'
        },
        {
            accessor: (item: any) => (
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                    icon={Trash2}
                    onClick={() => confirmDeleteSchedule(item.id)}
                    disabled={isDeletingSchedule}
                >
                    Sil
                </Button>
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
                        disabled={isLoadingTenants || isLoadingCentralStatus}
                    >
                        Yenile
                    </Button>
                    <Button
                        variant="primary"
                        icon={Rocket}
                        onClick={confirmApplyAll}
                        // Use unified status check
                        disabled={isApplyingCentralAll || !centralStatus?.hasAnyPendingMigrations}
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
                    { id: 'scheduled', label: 'Zamanlanmış', icon: CalendarIcon },
                    { id: 'settings', label: 'Ayarlar', icon: Settings },
                ]}
            />

            {/* Content Switcher */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Master DB Card */}
                        <Card
                            className={`xl:col-span-1 border-2 transition-all duration-500 ${centralStatus?.master?.hasPendingMigrations ? 'border-amber-500/30 bg-amber-500/5' : 'border-border-subtle'
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
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${centralStatus?.master?.hasPendingMigrations ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {centralStatus?.master?.hasPendingMigrations ? 'Bekleyen Var' : 'Güncel'}
                                </div>
                            </div>

                            {centralStatus?.master?.hasPendingMigrations ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{centralStatus.master.pendingMigrations.length} Migration Bekliyor</span>
                                        </div>
                                        <ul className="text-xs text-text-muted space-y-1 ml-6 list-disc max-h-32 overflow-y-auto custom-scrollbar">
                                            {centralStatus.master.pendingMigrations.map((m: string, i: number) => (
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
                                    <p className="text-sm font-bold text-emerald-500 italic">Master şema güncel.</p>
                                </div>
                            )}
                        </Card>

                        {/* Alerts DB Card */}
                        <Card
                            className={`xl:col-span-1 border-2 transition-all duration-500 ${centralStatus?.alerts?.hasPendingMigrations ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border-subtle'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-lg font-bold text-text-main">Alerts Veritabanı</h3>
                                    </div>
                                    <p className="text-sm text-text-muted mb-6">Bildirim sistemi şema kontrolü.</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${centralStatus?.alerts?.hasPendingMigrations ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    {centralStatus?.alerts?.hasPendingMigrations ? 'Bekleyen Var' : 'Güncel'}
                                </div>
                            </div>

                            {centralStatus?.alerts?.hasPendingMigrations ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                        <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{centralStatus.alerts.pendingMigrations.length} Migration Bekliyor</span>
                                        </div>
                                        <ul className="text-xs text-text-muted space-y-1 ml-6 list-disc max-h-32 overflow-y-auto custom-scrollbar">
                                            {centralStatus.alerts.pendingMigrations.map((m: string, i: number) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button
                                        className="w-full"
                                        variant="primary"
                                        icon={Play}
                                        onClick={confirmApplyAlerts}
                                        disabled={isApplyingAlerts}
                                    >
                                        Alerts'i Güncelle
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center justify-center text-center opacity-50">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                                    <p className="text-sm font-bold text-emerald-500 italic">Alerts şema güncel.</p>
                                </div>
                            )}
                        </Card>

                        {/* Stats - Now using centralStatus only */}
                        <Card title="İstatistikler" className="xl:col-span-1">
                            <div className="flex flex-col gap-6 py-4">
                                <StatItem
                                    label="Toplam Tenant"
                                    value={centralStatus?.tenants?.totalTenants || tenants?.length || 0}
                                    icon={Database}
                                    color="text-indigo-400"
                                />
                                <StatItem
                                    label="Bekleyen Tenant"
                                    value={centralStatus?.tenants?.tenantsWithPendingMigrations || tenants?.filter(t => t.hasPendingMigrations).length || 0}
                                    icon={Clock}
                                    color="text-amber-500"
                                />
                                <StatItem
                                    label="Güncel Tenant"
                                    value={centralStatus?.tenants?.tenantsUpToDate || tenants?.filter(t => !t.hasPendingMigrations && !t.error).length || 0}
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
                    <Card title="Migration Geçmişi" subtitle="Tenant bazlı geçmiş işlemleri görüntüleyin">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-muted mb-2">Tenant Seçin</label>
                            <select
                                value={selectedHistoryTenantId}
                                onChange={(e) => setSelectedHistoryTenantId(e.target.value)}
                                className="w-full md:w-1/3 bg-brand-950/20 border border-border-subtle rounded-xl p-3 text-text-main focus:border-indigo-500 focus:outline-none transition-colors"
                            >
                                <option value="">Seçiniz...</option>
                                {tenants?.map((t: any) => (
                                    <option key={t.tenantId} value={t.tenantId}>{t.tenantName}</option>
                                ))}
                            </select>
                        </div>

                        {isLoadingHistory ? (
                            <div className="py-20 text-center text-text-muted">Yükleniyor...</div>
                        ) : historyData ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-brand-950/30 rounded-xl border border-border-subtle">
                                    <Database className="w-8 h-8 text-indigo-500" />
                                    <div>
                                        <p className="text-lg font-bold text-text-main">{historyData.tenantName}</p>
                                        <p className="text-sm text-text-muted">Toplam {historyData.totalMigrations} migration uygulandı</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {historyData.appliedMigrations?.map((mig: string, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-brand-950/10 rounded-lg group hover:bg-brand-950/20 transition-colors">
                                            <span className="font-mono text-sm text-text-muted">{mig}</span>
                                            {/* Assuming format Module_Name... we might need to parse to know module and name for rollback */}
                                            {/* For demo, we assume the string is safe to pass or we have logic. Rollback usually needs strict names. */}
                                            {/* Disabling rollback for now unless sure about format, or adding a button with confirmation */}
                                            {/*
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400"
                                                icon={RotateCcw}
                                                onClick={() => confirmRollback(selectedHistoryTenantId, 'Default', mig)}
                                            >
                                                Geri Al
                                            </Button>
                                            */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <History className="w-16 h-16 text-text-muted mb-4" />
                                <h3 className="text-lg font-bold text-text-main">Tenant Seçin</h3>
                                <p className="text-text-muted">Geçmişi görüntülemek için bir tenant seçin.</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'scheduled' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card
                        title="Zamanlanmış İşlemler"
                        subtitle="İleri tarihli migration planları"
                    >
                        <div className="flex justify-end mb-4">
                            <Button variant="primary" icon={Clock} onClick={() => setScheduleModalOpen(true)}>
                                Yeni Zamanla
                            </Button>
                        </div>
                        <Table
                            columns={scheduledColumns}
                            data={scheduled || []}
                            isLoading={isLoadingScheduled}
                        />
                    </Card>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card title="Ayarlar" subtitle="Migration yapılandırma ayarları">
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center justify-between p-4 bg-brand-950/20 rounded-xl border border-border-subtle">
                                <div>
                                    <h4 className="font-bold text-text-main mb-1">Otomatik Uygula</h4>
                                    <p className="text-sm text-text-muted">Yeni migrationları tenantlara otomatik uygula</p>
                                </div>
                                <Switch
                                    checked={settingsForm.autoApplyMigrations}
                                    onCheckedChange={(c) => setSettingsForm(prev => ({ ...prev, autoApplyMigrations: c }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-brand-950/20 rounded-xl border border-border-subtle">
                                <div>
                                    <h4 className="font-bold text-text-main mb-1">Başarıldığında Bildir</h4>
                                    <p className="text-sm text-text-muted">Migration işlemi başarılı olduğunda bildirim gönder</p>
                                </div>
                                <Switch
                                    checked={settingsForm.notifyOnSuccess}
                                    onCheckedChange={(c) => setSettingsForm(prev => ({ ...prev, notifyOnSuccess: c }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-brand-950/20 rounded-xl border border-border-subtle">
                                <div>
                                    <h4 className="font-bold text-text-main mb-1">Hata Durumunda Bildir</h4>
                                    <p className="text-sm text-text-muted">Migration işlemi başarısız olduğunda bildirim gönder</p>
                                </div>
                                <Switch
                                    checked={settingsForm.notifyOnError}
                                    onCheckedChange={(c) => setSettingsForm(prev => ({ ...prev, notifyOnError: c }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-brand-950/20 rounded-xl border border-border-subtle">
                                <div>
                                    <h4 className="font-bold text-text-main mb-1">Yedekle</h4>
                                    <p className="text-sm text-text-muted">Migration öncesi veritabanı yedeği al</p>
                                </div>
                                <Switch
                                    checked={settingsForm.backupBeforeMigration}
                                    onCheckedChange={(c) => setSettingsForm(prev => ({ ...prev, backupBeforeMigration: c }))}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    variant="primary"
                                    icon={Save}
                                    onClick={handleSaveSettings}
                                    disabled={isUpdatingSettings}
                                >
                                    Ayarları Kaydet
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <ScheduleMigrationModal
                isOpen={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                tenants={tenants || []}
            />

            <MigrationPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                {...previewData!}
            />

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
                                <ul className="text-xs text-text-muted space-y-1.5 list-disc pl-4 mb-3">
                                    {module.migrations.map((mig: string, j: number) => (
                                        <li key={j} className="font-mono flex items-center justify-between group">
                                            <span>{mig}</span>
                                            <button
                                                className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity"
                                                onClick={() => openPreview(selectedTenant.tenantId, module.module, mig)}
                                                title="SQL Önizle"
                                            >
                                                <FileCode className="w-3 h-3" />
                                            </button>
                                        </li>
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
                            Evet, Onayla
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
