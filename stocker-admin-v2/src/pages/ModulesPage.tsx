import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import {
    AppWindow,
    CheckCircle2,
    XCircle,
    Lock,
    Unlock,
    Play,
    Zap,
    AlertCircle,
    Search
} from 'lucide-react';
import { tenantService, type TenantListDto } from '@/services/tenantService';
import { tenantModuleService, type TenantModuleStatusDto, type AvailableModuleDto } from '@/services/tenantModuleService';

const ModulesPage: React.FC = () => {
    const [tenants, setTenants] = useState<TenantListDto[]>([]);
    const [isLoadingTenants, setIsLoadingTenants] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<TenantListDto | null>(null);
    const [searchTenant, setSearchTenant] = useState('');

    const [moduleStatus, setModuleStatus] = useState<TenantModuleStatusDto | null>(null);
    const [isLoadingModules, setIsLoadingModules] = useState(false);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [actionModule, setActionModule] = useState<{ module: AvailableModuleDto, action: 'activate' | 'deactivate' | 'initialize' } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadTenants();
    }, []);

    useEffect(() => {
        if (selectedTenant) {
            loadModuleStatus(selectedTenant.id);
        } else {
            setModuleStatus(null);
        }
    }, [selectedTenant]);

    const loadTenants = async () => {
        setIsLoadingTenants(true);
        try {
            const data = await tenantService.getAll({ pageNumber: 1, pageSize: 100 }); // Fetching top 100 for now
            // @ts-ignore
            const items = Array.isArray(data) ? data : (data.items || []);
            setTenants(items);
            if (items.length > 0) {
                setSelectedTenant(items[0]);
            }
        } catch (error) {
            toast.error('Tenant listesi yüklenemedi.');
        } finally {
            setIsLoadingTenants(false);
        }
    };

    const loadModuleStatus = async (tenantId: string) => {
        setIsLoadingModules(true);
        try {
            const status = await tenantModuleService.getTenantModuleStatus(tenantId);
            setModuleStatus(status);
        } catch (error) {
            toast.error('Modül durumları alınamadı.');
        } finally {
            setIsLoadingModules(false);
        }
    };

    const handleAction = (module: AvailableModuleDto, action: 'activate' | 'deactivate' | 'initialize') => {
        setActionModule({ module, action });
        setConfirmModalOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedTenant || !actionModule) return;

        setIsProcessing(true);
        try {
            let result;
            if (actionModule.action === 'activate') {
                result = await tenantModuleService.activateModule(selectedTenant.id, actionModule.module.moduleCode);
            } else if (actionModule.action === 'deactivate') {
                result = await tenantModuleService.deactivateModule(selectedTenant.id, actionModule.module.moduleCode);
            } else if (actionModule.action === 'initialize') {
                const code = actionModule.module.moduleCode.toUpperCase();
                if (code === 'CRM') result = await tenantModuleService.initializeCRMModule(selectedTenant.id);
                else if (code === 'HR') result = await tenantModuleService.initializeHRModule(selectedTenant.id);
                else if (code === 'INVENTORY') result = await tenantModuleService.initializeInventoryModule(selectedTenant.id);
                else if (code === 'SALES') result = await tenantModuleService.initializeSalesModule(selectedTenant.id);
                else result = { success: false, message: 'Bu modül için initialize desteği yok.' };
            }

            if (result && result.success) {
                toast.success(result.message || 'İşlem başarılı.');
                loadModuleStatus(selectedTenant.id);
                setConfirmModalOpen(false);
            } else {
                toast.error(result?.message || 'İşlem başarısız.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
        t.code?.toLowerCase().includes(searchTenant.toLowerCase())
    );

    const columns = [
        {
            header: 'Modül',
            accessor: (module: AvailableModuleDto) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <AppWindow className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-text-main">{module.moduleName}</p>
                        <p className="text-xs text-text-muted">{module.moduleCode}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Durum',
            accessor: (module: AvailableModuleDto) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${module.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-text-muted border-border-subtle'
                    }`}>
                    {module.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {module.isActive ? 'Aktif' : 'Pasif'}
                </div>
            )
        },
        {
            header: 'Paket Durumu',
            accessor: (module: AvailableModuleDto) => (
                <div className="flex items-center gap-2">
                    {module.isAvailableInPackage ? (
                        <span className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold">
                            <Unlock className="w-3 h-3" />
                            Erişilebilir
                        </span>
                    ) : (
                        <span className="text-rose-500 flex items-center gap-1.5 text-xs font-bold">
                            <Lock className="w-3 h-3" />
                            Pakette Yok
                        </span>
                    )}
                </div>
            )
        },
        {
            header: '',
            accessor: (module: AvailableModuleDto) => {
                const canInitialize = ['CRM', 'HR', 'INVENTORY', 'SALES'].includes(module.moduleCode.toUpperCase());

                return (
                    <div className="flex justify-end gap-2">
                        {module.isActive && canInitialize && (
                            <Button
                                size="sm"
                                variant="secondary"
                                icon={Zap}
                                onClick={() => handleAction(module, 'initialize')}
                                disabled={!module.isAvailableInPackage}
                            >
                                Başlat (Init)
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant={module.isActive ? 'ghost' : 'primary'}
                            icon={module.isActive ? XCircle : Play}
                            onClick={() => handleAction(module, module.isActive ? 'deactivate' : 'activate')}
                            disabled={!module.isAvailableInPackage}
                            className={module.isActive ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' : ''}
                        >
                            {module.isActive ? 'Kapat' : 'Aktifleştir'}
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-main">Modül Yönetimi</h1>
                    <p className="text-text-muted mt-2">Tenant bazlı modül aktivasyonu ve yapılandırması.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / Tenant Selector */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Tenant Seçimi" className="h-full">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                className="w-full bg-brand-950/50 border border-border-subtle rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                                placeholder="Tenant ara..."
                                value={searchTenant}
                                onChange={(e) => setSearchTenant(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                            {isLoadingTenants ? (
                                <p className="text-xs text-text-muted text-center py-4">Yükleniyor...</p>
                            ) : (
                                filteredTenants.map(tenant => (
                                    <button
                                        key={tenant.id}
                                        onClick={() => setSelectedTenant(tenant)}
                                        className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${selectedTenant?.id === tenant.id
                                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold'
                                            : 'bg-transparent border-transparent text-text-muted hover:bg-white/5 hover:text-text-main'
                                            }`}
                                    >
                                        <div className="truncate">{tenant.name}</div>
                                        <div className="text-[10px] opacity-60 truncate">{tenant.code}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedTenant ? (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-3xl bg-brand-950/20 border border-border-subtle">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Toplam Modül</p>
                                    <p className="text-2xl font-bold text-text-main mt-1">{moduleStatus?.modules.length || 0}</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Aktif Modül</p>
                                    <p className="text-2xl font-bold text-emerald-500 mt-1">
                                        {moduleStatus?.modules.filter(m => m.isActive).length || 0}
                                    </p>
                                </div>
                                <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                    <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Pakette Mevcut</p>
                                    <p className="text-2xl font-bold text-amber-500 mt-1">
                                        {moduleStatus?.modules.filter(m => m.isAvailableInPackage).length || 0}
                                    </p>
                                </div>
                            </div>

                            <Card title={`${selectedTenant.name} Modülleri`}>
                                <Table
                                    columns={columns}
                                    data={(moduleStatus?.modules || []).map(m => ({ ...m, id: m.moduleCode }))}
                                    isLoading={isLoadingModules}
                                />
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-border-subtle rounded-3xl bg-brand-950/10">
                            <p className="text-text-muted">Lütfen işlem yapmak için soldan bir tenant seçin.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title={
                    actionModule?.action === 'activate' ? 'Modülü Aktifleştir' :
                        actionModule?.action === 'deactivate' ? 'Modülü Kapat' : 'Modülü Başlat (Initialize)'
                }
                maxWidth="max-w-md"
            >
                <div className="space-y-6">
                    <div className={`flex items-start gap-4 p-4 rounded-xl border ${actionModule?.action === 'deactivate' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
                        }`}>
                        <AlertCircle className={`w-6 h-6 flex-shrink-0 ${actionModule?.action === 'deactivate' ? 'text-rose-500' : 'text-indigo-500'
                            }`} />
                        <div>
                            <p className="text-sm text-text-main font-bold mb-1">
                                {actionModule?.module.moduleName}
                            </p>
                            <p className="text-xs text-text-muted leading-relaxed">
                                {actionModule?.action === 'activate' && 'Bu modül tenant için erişilebilir hale gelecektir.'}
                                {actionModule?.action === 'deactivate' && 'Dikkat: Modülü kapatmak tenant verilerine erişimi kısıtlayabilir.'}
                                {actionModule?.action === 'initialize' && 'İlgili veritabanı tabloları oluşturulacak ve varsayılan ayarlar yüklenecektir.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setConfirmModalOpen(false)}>İptal</Button>
                        <Button
                            variant="primary"
                            onClick={confirmAction}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'İşleniyor...' : 'Onayla'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ModulesPage;
