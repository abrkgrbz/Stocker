import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    X,
    Package,
    Shield,
    Database,
    Zap,
    Settings,
    Layout
} from 'lucide-react';
import { packageService, type CreatePackageCommand } from '@/services/packageService';
import { toast } from '@/components/ui/Toast';

interface PackageFormData {
    name: string;
    description: string;
    type: string;
    billingCycle: string;
    basePrice: number;
    currency: string;
    maxUsers: number;
    maxStorage: number;
    isActive: boolean;
    displayOrder: number;
    features: string[];
    limits: {
        apiCalls: number;
        projects: number;
        customDomains: number;
        emailSupport: boolean;
        phoneSupport: boolean;
        prioritySupport: boolean;
        sla: number;
    };
    trialDays: number;
    isPopular: boolean;
    isBestValue: boolean;
}

const CreatePackagePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState<PackageFormData>({
        name: '',
        description: '',
        type: 'starter',
        billingCycle: 'monthly',
        basePrice: 0,
        currency: 'TRY',
        maxUsers: 5,
        maxStorage: 10,
        isActive: true,
        displayOrder: 0,
        features: [],
        limits: {
            apiCalls: 10000,
            projects: 5,
            customDomains: 0,
            emailSupport: true,
            phoneSupport: false,
            prioritySupport: false,
            sla: 95.0
        },
        trialDays: 14,
        isPopular: false,
        isBestValue: false
    });

    const [unlimited, setUnlimited] = useState({
        users: false,
        storage: false,
        projects: false,
        apiCalls: false,
        customDomains: false
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => {
            const newData = { ...prev };
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                // @ts-ignore
                newData[parent] = { ...newData[parent], [child]: value };
            } else {
                // @ts-ignore
                newData[field] = value;
            }
            return newData;
        });
    };

    const handlePriceChange = (amount: number) => {
        setFormData((prev) => ({
            ...prev,
            basePrice: amount
        }));
    };

    const toggleFeature = (feature: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Lütfen paket adını giriniz');
            return;
        }

        setIsLoading(true);
        try {
            // Apply unlimited logic
            const finalData: any = { ...formData };
            if (unlimited.users) finalData.maxUsers = 2147483647;
            if (unlimited.storage) finalData.maxStorage = 2147483647;
            if (unlimited.projects) finalData.limits.projects = 2147483647;
            if (unlimited.apiCalls) finalData.limits.apiCalls = 2147483647;
            if (unlimited.customDomains) finalData.limits.customDomains = 2147483647;

            // Constuct basePrice object
            finalData.basePrice = {
                amount: formData.basePrice,
                currency: formData.currency
            };

            // Map features to simplistic list if needed, or backend expects codes
            // formData.features is string[] already

            await packageService.create(finalData);
            toast.success('Paket başarıyla oluşturuldu');
            navigate('/billing');
        } catch (error) {
            console.error(error);
            toast.error('Paket oluşturulurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'Genel Bilgiler', icon: Layout },
        { id: 'limits', label: 'Limitler & Kotalar', icon: Database },
        { id: 'features', label: 'Özellikler', icon: Zap },
        { id: 'settings', label: 'Ayarlar', icon: Settings },
    ];

    const packageTypes = [
        { value: 'starter', label: 'Başlangıç (Starter)' },
        { value: 'professional', label: 'Profesyonel (Pro)' },
        { value: 'enterprise', label: 'Kurumsal (Enterprise)' },
        { value: 'custom', label: 'Özel (Custom)' },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
                        <Package className="w-8 h-8 text-indigo-400" />
                        Yeni Paket Oluştur
                    </h2>
                    <p className="text-text-muted mt-1">Sistem için yeni bir abonelik paketi tanımlayın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={X} onClick={() => navigate('/billing')}>İptal</Button>
                    <Button variant="primary" icon={Save} onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Kaydediliyor...' : 'Paketi Oluştur'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold
                                ${activeTab === tab.id
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-text-muted hover:text-text-main hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="lg:col-span-3">
                    <Card className="p-6 min-h-[500px]">
                        {/* Tab: General */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Paket Adı</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Örn: Profesyonel Plan"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Paket Tipi</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => handleInputChange('type', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                        >
                                            {packageTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Açıklama</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        placeholder="Paketin özelliklerini ve hedef kitlesini açıklayın..."
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Fiyat</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">₺</span>
                                            <input
                                                type="number"
                                                value={formData.basePrice}
                                                onChange={(e) => handlePriceChange(Number(e.target.value))}
                                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-text-main focus:outline-none focus:border-indigo-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Faturalama</label>
                                        <select
                                            value={formData.billingCycle}
                                            onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                        >
                                            <option value="monthly">Aylık</option>
                                            <option value="yearly">Yıllık</option>
                                            <option value="one-time">Tek Seferlik</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Limits */}
                        {activeTab === 'limits' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Kullanıcı Limiti</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={unlimited.users} onChange={(e) => setUnlimited({ ...unlimited, users: e.target.checked })} className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0" />
                                                <span className="text-xs text-text-muted">Sınırsız</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.maxUsers}
                                            disabled={unlimited.users}
                                            onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Depolama (GB)</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={unlimited.storage} onChange={(e) => setUnlimited({ ...unlimited, storage: e.target.checked })} className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0" />
                                                <span className="text-xs text-text-muted">Sınırsız</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.maxStorage}
                                            disabled={unlimited.storage}
                                            onChange={(e) => handleInputChange('maxStorage', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Proje Limiti</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={unlimited.projects} onChange={(e) => setUnlimited({ ...unlimited, projects: e.target.checked })} className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0" />
                                                <span className="text-xs text-text-muted">Sınırsız</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.limits.projects}
                                            disabled={unlimited.projects}
                                            onChange={(e) => handleInputChange('limits.projects', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">API Çağrısı (Aylık)</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={unlimited.apiCalls} onChange={(e) => setUnlimited({ ...unlimited, apiCalls: e.target.checked })} className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0" />
                                                <span className="text-xs text-text-muted">Sınırsız</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.limits.apiCalls}
                                            disabled={unlimited.apiCalls}
                                            onChange={(e) => handleInputChange('limits.apiCalls', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Özel Domain</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={unlimited.customDomains} onChange={(e) => setUnlimited({ ...unlimited, customDomains: e.target.checked })} className="rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-0" />
                                                <span className="text-xs text-text-muted">Sınırsız</span>
                                            </label>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.limits.customDomains}
                                            disabled={unlimited.customDomains}
                                            onChange={(e) => handleInputChange('limits.customDomains', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">SLA Garantisi (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            max="100"
                                            value={formData.limits.sla}
                                            onChange={(e) => handleInputChange('limits.sla', parseFloat(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Features */}
                        {activeTab === 'features' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-text-main pb-2 border-b border-slate-800">Teknik Özellikler</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['API Access', 'Webhook Integration', 'Custom Integrations', 'Advanced Analytics', 'Data Export', 'Audit Logs'].map(feat => (
                                            <div key={feat} className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800/50 cursor-pointer hover:border-indigo-500/30 transition-all" onClick={() => toggleFeature(feat)}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.features.includes(feat) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                                    {formData.features.includes(feat) && <Zap className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-sm font-medium text-text-main">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-text-main pb-2 border-b border-slate-800">Güvenlik & Destek</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['SSO', '2FA Enforcement', 'IP Whitelisting', 'Priority Support', 'Dedicated Manager', 'Onboarding Session'].map(feat => (
                                            <div key={feat} className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800/50 cursor-pointer hover:border-indigo-500/30 transition-all" onClick={() => toggleFeature(feat)}>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.features.includes(feat) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                                    {formData.features.includes(feat) && <Shield className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-sm font-medium text-text-main">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Settings */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-text-main">Paket Durumu</h4>
                                            <p className="text-xs text-text-muted">Paket oluşturulduğunda kullanıma açık olsun mu?</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('isActive', !formData.isActive)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-text-main">Popüler Etiketi</h4>
                                            <p className="text-xs text-text-muted">Bu paketi "En Popüler" olarak işaretle.</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('isPopular', !formData.isPopular)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.isPopular ? 'bg-amber-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formData.isPopular ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-text-main">En İyi Değer</h4>
                                            <p className="text-xs text-text-muted">Fiyat/Performans oranı en yüksek paket olarak işaretle.</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('isBestValue', !formData.isBestValue)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${formData.isBestValue ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formData.isBestValue ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Deneme Süresi (Gün)</label>
                                    <input
                                        type="number"
                                        value={formData.trialDays}
                                        onChange={(e) => handleInputChange('trialDays', parseInt(e.target.value))}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-text-main"
                                    />
                                    <p className="text-[10px] text-text-muted">0 girilirse deneme süresi tanımlanmaz.</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreatePackagePage;
