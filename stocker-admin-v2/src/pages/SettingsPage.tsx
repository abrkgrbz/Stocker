import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Shield,
    Mail,
    Globe,
    RefreshCw,
    HardDrive,
    Server,
    CheckCircle2,
    CreditCard,
    DollarSign,
    RotateCcw,
    Eye
} from 'lucide-react';
import { settingsService, type SettingsDto } from '@/services/settingsService';
import { systemService, type DockerStats, type SystemError } from '@/services/systemService';
import { toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState<SettingsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // System Management State
    const [dockerStats, setDockerStats] = useState<DockerStats | null>(null);
    const [isDockerLoading, setIsDockerLoading] = useState(false);

    const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
    const [isErrorsLoading, setIsErrorsLoading] = useState(false);
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

    const handleSave = async (tab: 'general' | 'security' | 'email' | 'billing') => {
        if (!settings) return;
        try {
            if (tab === 'general') await settingsService.updateGeneral(settings.general);
            else if (tab === 'security') await settingsService.updateSecurity(settings.security);
            else if (tab === 'email') await settingsService.updateEmail(settings.email);
            else if (tab === 'billing') await settingsService.updateBilling(settings.billing);
            toast.success('Ayarlar başarıyla kaydedildi.');
        } catch (error) {
            toast.error('Ayarlar kaydedilemedi.');
        }
    };

    const handleRestoreDefaults = async () => {
        if (confirm('Tüm ayarları varsayılana döndürmek istediğinize emin misiniz?')) {
            try {
                const refreshed = await settingsService.restoreDefaults();
                setSettings(refreshed);
                toast.success('Varsayılan ayarlar yüklendi.');
            } catch (error) {
                toast.error('İşlem başarısız.');
            }
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
            const errors = await systemService.getSystemErrors({ page: 1, pageSize: 20 });
            setSystemErrors(errors);
        } catch (error) {
            console.warn('Hata kayıtları servisi yanıt vermiyor');
        } finally {
            setIsErrorsLoading(false);
        }
    };
    const handleDockerCleanup = async () => {
        if (!confirm('Bu işlemi onaylıyor musunuz?')) return;
        try {
            await systemService.cleanAllDocker();
            toast.success('Temizlik başarılı.');
            fetchDockerStats();
        } catch (e) { toast.error('Hata oluştu.'); }
    };
    const handleResolveError = async (id: string, e: any) => {
        e.stopPropagation();
        try { await systemService.resolveError(id); toast.success('Çözüldü.'); fetchSystemErrors(); } catch (e) { toast.error('Hata.'); }
    };

    const tabs = [
        { id: 'general', label: 'Genel', icon: Globe },
        { id: 'security', label: 'Güvenlik', icon: Shield },
        { id: 'email', label: 'E-Posta', icon: Mail },
        { id: 'billing', label: 'Faturalandırma', icon: DollarSign },
        { id: 'system-management', label: 'Sistem Yönetimi', icon: Server },
    ];

    const errorColumns = [
        { header: 'Seviye', accessor: (e: any) => <span className={`uppercase font-bold text-xs ${e.level === 'error' ? 'text-rose-500' : 'text-amber-500'}`}>{e.level}</span> },
        { header: 'Mesaj', accessor: (e: any) => <span className="truncate block max-w-xs" title={e.message}>{e.message}</span> },
        { header: 'Kaynak', accessor: (e: any) => <span className="font-mono text-xs">{e.source}</span> },
        { header: 'Zaman', accessor: (e: any) => new Date(e.timestamp).toLocaleString() },
        {
            header: '', accessor: (e: any) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" icon={Eye} onClick={() => setSelectedError(e)} />
                    <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={(ev) => handleResolveError(e.id, ev)} className="text-emerald-500" />
                </div>
            )
        }
    ];

    if (isLoading && !settings) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-8 text-text-main animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main">Sistem Ayarları</h2>
                    <p className="text-text-muted mt-1">Platformun global parametrelerini ve güvenlik protokollerini yapılandırın.</p>
                </div>
                <Button variant="outline" icon={RotateCcw} onClick={handleRestoreDefaults}>Varsayılanları Yükle</Button>
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
                        <button
                            onClick={async () => {
                                if (confirm('Önbelleği temizlemek istiyor musunuz?')) {
                                    try { await settingsService.clearCache(); toast.success('Önbellek temizlendi'); } catch (e) { toast.error('Hata'); }
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-amber-500 hover:bg-amber-500/5 transition-all text-left"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-semibold">Önbelleği Temizle</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-all text-left opacity-50 cursor-not-allowed" title="Henüz aktif değil">
                            <HardDrive className="w-4 h-4" />
                            <span className="text-sm font-semibold">Sunucuyu Yeniden Başlat</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    <Card className="p-8">
                        {activeTab === 'general' && settings?.general && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold flex items-center gap-3"><Globe className="w-5 h-5 text-indigo-400" /> Genel Yapılandırma</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Uygulama Adı</label>
                                        <input type="text" value={settings.general.applicationName} onChange={e => setSettings({ ...settings, general: { ...settings.general, applicationName: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Destek E-Postası</label>
                                        <input type="email" value={settings.general.supportEmail} onChange={e => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Varsayılan Dil</label>
                                        <select value={settings.general.defaultLanguage} onChange={e => setSettings({ ...settings, general: { ...settings.general, defaultLanguage: e.target.value } })} className="w-full input-primary">
                                            <option value="tr-TR">Türkçe</option>
                                            <option value="en-US">English</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Bakım Modu</label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div onClick={() => setSettings({ ...settings, general: { ...settings.general, maintenanceMode: !settings.general.maintenanceMode } })} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.general.maintenanceMode ? 'bg-rose-500' : 'bg-slate-700'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.general.maintenanceMode ? 'left-7' : 'left-1'}`} />
                                            </div>
                                            <span className="text-sm">{settings.general.maintenanceMode ? 'Aktif (Sistem Kapalı)' : 'Pasif (Sistem Açık)'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4"><Button onClick={() => handleSave('general')}>Kaydet</Button></div>
                            </div>
                        )}

                        {activeTab === 'security' && settings?.security && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold flex items-center gap-3"><Shield className="w-5 h-5 text-indigo-400" /> Güvenlik Politikaları</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                        <span>2FA Zorunluluğu</span>
                                        <div onClick={() => setSettings({ ...settings, security: { ...settings.security, requireTwoFactor: !settings.security.requireTwoFactor } })} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.security.requireTwoFactor ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.security.requireTwoFactor ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase">Min Şifre Uzunluğu</label>
                                            <input type="number" value={settings.security.minPasswordLength} onChange={e => setSettings({ ...settings, security: { ...settings.security, minPasswordLength: +e.target.value } })} className="w-full input-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-text-muted uppercase">Oturum Süresi (dk)</label>
                                            <input type="number" value={settings.security.sessionTimeoutMinutes} onChange={e => setSettings({ ...settings, security: { ...settings.security, sessionTimeoutMinutes: +e.target.value } })} className="w-full input-primary" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4"><Button onClick={() => handleSave('security')}>Kaydet</Button></div>
                                <div className="h-px bg-white/10 my-8" />
                                <TwoFactorSettings />
                            </div>
                        )}

                        {activeTab === 'email' && settings?.email && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold flex items-center gap-3"><Mail className="w-5 h-5 text-indigo-400" /> SMTP Ayarları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">SMTP Host</label>
                                        <input type="text" value={settings.email.smtpHost} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpHost: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Port</label>
                                        <input type="number" value={settings.email.smtpPort} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpPort: +e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Kullanıcı Adı</label>
                                        <input type="text" value={settings.email.smtpUsername} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpUsername: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Gönderici Adı</label>
                                        <input type="text" value={settings.email.smtpSenderName} onChange={e => setSettings({ ...settings, email: { ...settings.email, smtpSenderName: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4"><Button onClick={() => handleSave('email')}>Kaydet</Button></div>
                            </div>
                        )}

                        {activeTab === 'billing' && settings?.billing && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold flex items-center gap-3"><CreditCard className="w-5 h-5 text-indigo-400" /> Faturalandırma Ayarları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Para Birimi</label>
                                        <select value={settings.billing.currency} onChange={e => setSettings({ ...settings, billing: { ...settings.billing, currency: e.target.value } })} className="w-full input-primary">
                                            <option value="TRY">Türk Lirası (TRY)</option>
                                            <option value="USD">Amerikan Doları (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">KDV Oranı (%)</label>
                                        <input type="number" value={settings.billing.taxRate} onChange={e => setSettings({ ...settings, billing: { ...settings.billing, taxRate: +e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Fatura Ön Eki</label>
                                        <input type="text" value={settings.billing.invoicePrefix} onChange={e => setSettings({ ...settings, billing: { ...settings.billing, invoicePrefix: e.target.value } })} className="w-full input-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase">Vade Gün Sayısı</label>
                                        <input type="number" value={settings.billing.dueDays} onChange={e => setSettings({ ...settings, billing: { ...settings.billing, dueDays: +e.target.value } })} className="w-full input-primary" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4"><Button onClick={() => handleSave('billing')}>Kaydet</Button></div>
                            </div>
                        )}

                        {activeTab === 'system-management' && (
                            <div className="space-y-8">
                                <h3 className="text-lg font-bold flex items-center gap-3"><Server className="w-5 h-5 text-indigo-400" /> Sitem Yönetimi</h3>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h4 className="font-bold mb-4">Docker Durumu</h4>
                                    {dockerStats ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>Container: {dockerStats.containers.running}/{dockerStats.containers.total}</div>
                                            <div>Images: {dockerStats.images.total} ({dockerStats.images.size})</div>
                                            <Button size="sm" variant="outline" onClick={fetchDockerStats} disabled={isDockerLoading}>Yenile</Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleDockerCleanup()}>Temizle</Button>
                                        </div>
                                    ) : (
                                        <p>Yükleniyor...</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4">Sistem Hataları</h4>
                                    <Table columns={errorColumns as any} data={systemErrors} isLoading={isErrorsLoading} />
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal isOpen={!!selectedError} onClose={() => setSelectedError(null)} title="Hata Detayı">
                {selectedError && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-900 rounded font-mono text-xs overflow-x-auto">
                            {selectedError.message}
                            <hr className="my-2 border-white/10" />
                            {selectedError.stackTrace}
                        </div>
                        <div className="flex justify-end">
                            <Button variant="ghost" onClick={() => setSelectedError(null)}>Kapat</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .input-primary {
                    background-color: rgb(255 255 255 / 0.05);
                    border: 1px solid rgb(255 255 255 / 0.1);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    color: white;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-primary:focus {
                    border-color: rgb(99 102 241 / 0.5);
                    background-color: rgb(99 102 241 / 0.05);
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
