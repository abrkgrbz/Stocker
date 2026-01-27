import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Shield,
    Mail,
    Bell,
    Database,
    Globe,
    Lock,
    RefreshCw,
    HardDrive,
    Activity,
    Server,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Eye
} from 'lucide-react';
import { settingsService, type SettingsDto } from '@/services/settingsService';
import { systemService, type DockerStats, type SystemError, type ErrorStatistics } from '@/services/systemService';
import { toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<SettingsDto | null>(null);
    const [_isLoading, setIsLoading] = useState(true);

    // System Management State
    const [dockerStats, setDockerStats] = useState<DockerStats | null>(null);
    const [isDockerLoading, setIsDockerLoading] = useState(false);
    const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
    const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
    const [isErrorsLoading, setIsErrorsLoading] = useState(false);
    const [_isCleaning, setIsCleaning] = useState(false);
    const [selectedError, setSelectedError] = useState<SystemError | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'system-management') {
            fetchDockerStats();
            fetchSystemErrors();
        }
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await settingsService.getAll();
            setSettings(data);
        } catch (error) {
            console.error('Ayarlar yüklenemedi:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDockerStats = async () => {
        setIsDockerLoading(true);
        try {
            const stats = await systemService.getDockerStats();
            setDockerStats(stats);
        } catch (error) {
            toast.error('Docker istatistikleri alınamadı');
        } finally {
            setIsDockerLoading(false);
        }
    };

    const fetchSystemErrors = async () => {
        setIsErrorsLoading(true);
        try {
            const [errors, stats] = await Promise.all([
                systemService.getSystemErrors({ page: 1, pageSize: 20 }),
                systemService.getErrorStatistics()
            ]);
            setSystemErrors(errors);
            setErrorStats(stats);
        } catch (error) {
            toast.error('Hata kayıtları alınamadı');
        } finally {
            setIsErrorsLoading(false);
        }
    };

    const handleDockerCleanup = async (type: 'images' | 'containers' | 'volumes' | 'build-cache' | 'all') => {
        setIsCleaning(true);
        try {
            let result;
            if (type === 'images') result = await systemService.cleanDockerImages();
            else if (type === 'containers') result = await systemService.cleanDockerContainers();
            else if (type === 'volumes') result = await systemService.cleanDockerVolumes();
            else if (type === 'build-cache') result = await systemService.cleanDockerBuildCache();
            else result = await systemService.cleanAllDocker();

            if (result.success) {
                toast.success(result.message);
                fetchDockerStats();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Temizlik işlemi başarısız');
        } finally {
            setIsCleaning(false);
        }
    };

    const handleResolveError = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await systemService.resolveError(id);
            toast.success('Hata çözüldü olarak işaretlendi');
            fetchSystemErrors();
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const handleDeleteError = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await systemService.deleteError(id);
            toast.success('Hata silindi');
            fetchSystemErrors();
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const tabs = [
        { id: 'general', label: 'Genel', icon: Globe },
        { id: 'security', label: 'Güvenlik', icon: Shield },
        { id: 'email', label: 'E-Posta', icon: Mail },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'backup', label: 'Yedekleme', icon: Database },
        { id: 'system-management', label: 'Sistem Yönetimi', icon: Server },
    ];

    const errorColumns = [
        {
            header: 'Seviye',
            accessor: (e: any) => (
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${e.level === 'error' ? 'bg-rose-500/10 text-rose-500' :
                    e.level === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-sky-500/10 text-sky-500'
                    }`}>
                    {e.level}
                </span>
            )
        },
        {
            header: 'Kaynak',
            accessor: (e: any) => <span className="text-xs font-mono text-indigo-400">{e.source}</span>
        },
        {
            header: 'Mesaj',
            accessor: (e: any) => <span className="text-sm truncate max-w-[300px] block" title={e.message}>{e.message}</span>
        },
        {
            header: 'Zaman',
            accessor: (e: any) => <span className="text-xs text-text-muted">{new Date(e.timestamp).toLocaleString('tr-TR')}</span>
        },
        {
            header: '',
            accessor: (e: any) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => setSelectedError(e)}
                    />
                    {!e.resolved && (
                        <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle2}
                            onClick={(ev) => handleResolveError(e.id, ev)}
                        />
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className='text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                        icon={Trash2}
                        onClick={(ev) => handleDeleteError(e.id, ev)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 text-text-main">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-text-main">Sistem Ayarları</h2>
                <p className="text-text-muted mt-1">Platformun global parametrelerini ve güvenlik protokollerini yapılandırın.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                                ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-text-muted hover:text-text-main hover:bg-indigo-500/5'}
                            `}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-sm font-semibold">{tab.label}</span>
                        </button>
                    ))}

                    <div className="pt-6 mt-6 border-t border-border-subtle space-y-4">
                        <div className="px-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Hızlı İşlemler</p>
                        </div>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-amber-500 hover:bg-amber-500/5 transition-all">
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-semibold">Önbelleği Temizle</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-all">
                            <HardDrive className="w-4 h-4" />
                            <span className="text-sm font-semibold">Sunucuyu Yeniden Başlat</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    <Card className="p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-main">Genel Yapılandırma</h3>
                                        <p className="text-sm text-text-muted">Site kimliği ve temel erişim ayarları.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Site Adı</label>
                                        <input
                                            type="text"
                                            defaultValue={settings?.general?.siteName || 'Stocker'}
                                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 px-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Yönetici E-Postası</label>
                                        <input
                                            type="email"
                                            defaultValue={settings?.general?.adminEmail || 'admin@stocker.app'}
                                            className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 px-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                        />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                                    <Button>Değişiklikleri Kaydet</Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-main">Güvenlik Politikaları</h3>
                                        <p className="text-sm text-text-muted">Şifre gereksinimleri ve kimlik doğrulama yöntemleri.</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                        <div>
                                            <span className="text-sm font-medium text-text-main block">Şifre Politikasını Dayat</span>
                                            <span className="text-xs text-text-muted">Min 8 karakter, rakam ve sembol zorunluluğu.</span>
                                        </div>
                                        <button
                                            onClick={() => setSettings(prev => prev ? ({ ...prev, security: { ...prev.security, enforcePasswordPolicy: !prev.security.enforcePasswordPolicy } }) : null)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${settings?.security.enforcePasswordPolicy ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings?.security.enforcePasswordPolicy ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                        <div>
                                            <span className="text-sm font-medium text-text-main block">İki Adımlı Doğrulamayı Zorunlu Tut</span>
                                            <span className="text-xs text-text-muted">Yöneticiler için 2FA zorunlu olur.</span>
                                        </div>
                                        <button
                                            onClick={() => setSettings(prev => prev ? ({ ...prev, security: { ...prev.security, enableTwoFactor: !prev.security.enableTwoFactor } }) : null)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${settings?.security.enableTwoFactor ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings?.security.enableTwoFactor ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Min. Şifre Uzunluğu</label>
                                            <input
                                                type="number"
                                                value={settings?.security.minPasswordLength || 8}
                                                onChange={(e) => setSettings(prev => prev ? ({ ...prev, security: { ...prev.security, minPasswordLength: parseInt(e.target.value) } }) : null)}
                                                className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 px-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Oturum Zaman Aşımı (dk)</label>
                                            <input
                                                type="number"
                                                value={settings?.security.sessionTimeout || 30}
                                                onChange={(e) => setSettings(prev => prev ? ({ ...prev, security: { ...prev.security, sessionTimeout: parseInt(e.target.value) } }) : null)}
                                                className="w-full bg-indigo-500/5 border border-border-subtle rounded-2xl py-3 px-6 text-sm text-text-main focus:outline-none focus:border-indigo-500/30 transition-all placeholder:text-text-muted/40"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
                                        <Button onClick={async () => {
                                            if (!settings) return;
                                            try {
                                                await settingsService.updateSecurity(settings.security);
                                                toast.success('Güvenlik ayarları kaydedildi');
                                            } catch (error) {
                                                toast.error('Kaydetme başarısız');
                                            }
                                        }}>Değişiklikleri Kaydet</Button>
                                    </div>

                                    <div className="h-px bg-border-subtle my-8" />

                                    {/* Personal 2FA Settings */}
                                    <TwoFactorSettings />
                                </div>
                            </div>
                        )}

                        {activeTab === 'system-management' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Docker Management Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                                <Database className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-text-main">Docker Yönetimi</h3>
                                                <p className="text-sm text-text-muted">Container, image ve volume verilerini yönetin.</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" icon={RefreshCw} onClick={fetchDockerStats} disabled={isDockerLoading}>Yenile</Button>
                                    </div>

                                    {isDockerLoading && !dockerStats ? (
                                        <div className="text-center py-10 text-text-muted">Yükleniyor...</div>
                                    ) : dockerStats ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Container</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-emerald-400">{dockerStats.containers.running}</span>
                                                        <span className="text-sm font-bold text-text-muted">/ {dockerStats.containers.total}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Image</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-text-main">{dockerStats.images.total}</span>
                                                        <span className="text-xs text-text-muted">({dockerStats.images.size})</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Volume</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-text-main">{dockerStats.volumes.total}</span>
                                                        <span className="text-xs text-text-muted">({dockerStats.volumes.size})</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-border-subtle">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Network</p>
                                                    <span className="text-2xl font-bold text-text-main">{dockerStats.networks}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-subtle">
                                                <Button size="sm" variant="secondary" className="hover:text-rose-400" icon={Trash2} onClick={() => handleDockerCleanup('build-cache')}>Cache Temizle</Button>
                                                <Button size="sm" variant="secondary" className="hover:text-rose-400" icon={Trash2} onClick={() => handleDockerCleanup('images')}>Image Temizle</Button>
                                                <Button size="sm" variant="secondary" className="hover:text-rose-400" icon={Trash2} onClick={() => handleDockerCleanup('volumes')}>Volume Temizle</Button>
                                                <Button size="sm" variant="primary" className="bg-rose-500 hover:bg-rose-600 text-white border-none" icon={AlertCircle} onClick={() => handleDockerCleanup('all')}>Tam Temizlik</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4 text-rose-500 bg-rose-500/10 rounded-xl">Bilgiler alınamadı.</div>
                                    )}
                                </div>

                                <div className="h-px bg-border-subtle" />

                                {/* Error Monitoring Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-text-main">Hata İzleme</h3>
                                                <p className="text-sm text-text-muted">Sistem genelindeki hataları ve uyarıları izleyin.</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" icon={RefreshCw} onClick={fetchSystemErrors} disabled={isErrorsLoading}>Yenile</Button>
                                    </div>

                                    {errorStats && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card noPadding className="p-4 bg-rose-500/5 border-rose-500/20">
                                                <div className="flex items-center gap-3 text-rose-500">
                                                    <AlertCircle className="w-5 h-5" />
                                                    <span className="text-sm font-bold">Kritik Hatalar</span>
                                                </div>
                                                <p className="text-2xl font-bold text-rose-500 mt-2">{errorStats.criticalErrors}</p>
                                            </Card>
                                            <Card noPadding className="p-4 bg-amber-500/5 border-amber-500/20">
                                                <div className="flex items-center gap-3 text-amber-500">
                                                    <Activity className="w-5 h-5" />
                                                    <span className="text-sm font-bold">Çözülmemiş</span>
                                                </div>
                                                <p className="text-2xl font-bold text-amber-500 mt-2">{errorStats.unresolvedErrors}</p>
                                            </Card>
                                            <Card noPadding className="p-4 bg-indigo-500/5 border-indigo-500/20">
                                                <div className="flex items-center gap-3 text-indigo-400">
                                                    <Server className="w-5 h-5" />
                                                    <span className="text-sm font-bold">Toplam Kayıt</span>
                                                </div>
                                                <p className="text-2xl font-bold text-indigo-400 mt-2">{errorStats.totalErrors}</p>
                                            </Card>
                                        </div>
                                    )}

                                    <Table
                                        columns={errorColumns as any}
                                        data={systemErrors}
                                        isLoading={isErrorsLoading}
                                        pagination={{
                                            currentPage: 1,
                                            pageSize: 20,
                                            totalCount: systemErrors.length, // Simplified pagination for now
                                            totalPages: 1,
                                            onPageChange: () => { }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Fallback for empty/unimplemented tabs */}
                        {['email', 'notifications', 'backup'].includes(activeTab) && (
                            <div className="text-center py-20 text-text-muted">
                                <div className="p-4 bg-indigo-500/5 rounded-full w-fit mx-auto mb-4">
                                    <Globe className="w-8 h-8 text-indigo-400 opacity-50" />
                                </div>
                                <h3 className="text-lg font-bold text-text-main">Bu sekme yapım aşamasında</h3>
                                <p className="text-sm mt-2">Bu özellik yakında eklenecek.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Error Detail Modal */}
            <Modal
                isOpen={!!selectedError}
                onClose={() => setSelectedError(null)}
                title="Hata Detayı"
            >
                {selectedError && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedError.level === 'error' ? 'bg-rose-500/10 text-rose-500' :
                                selectedError.level === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-sky-500/10 text-sky-500'
                                }`}>
                                {selectedError.level}
                            </span>
                            <span className="text-xs text-text-muted">{new Date(selectedError.timestamp).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Mesaj</label>
                            <div className="mt-1 p-3 bg-indigo-500/5 rounded-lg text-sm text-text-main font-mono border border-border-subtle">
                                {selectedError.message}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Kaynak</label>
                            <div className="mt-1 text-sm text-text-main font-mono">
                                {selectedError.source}
                            </div>
                        </div>

                        {selectedError.stackTrace && (
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Stack Trace</label>
                                <div className="mt-1 p-3 bg-gray-900 rounded-lg text-xs text-emerald-400 font-mono overflow-x-auto max-h-[300px]">
                                    <pre>{selectedError.stackTrace}</pre>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setSelectedError(null)}>Kapat</Button>
                            {!selectedError.resolved && (
                                <Button
                                    variant="primary"
                                    icon={CheckCircle2}
                                    onClick={(ev) => {
                                        handleResolveError(selectedError.id, ev);
                                        setSelectedError(null);
                                    }}
                                >
                                    Çözüldü İşaretle
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SettingsPage;
