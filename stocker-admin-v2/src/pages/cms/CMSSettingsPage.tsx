import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Settings,
    Globe,
    Shield,
    Mail,
    Smartphone,
    Layout,
    Database,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

// Mock types for settings since we are using local storage mostly
interface CMSSettings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    contactEmail: string;
    supportPhone: string;
    footerText: string;
    itemsPerPage: number;
}

const DEFAULT_SETTINGS: CMSSettings = {
    siteName: 'Stocker CMS',
    siteDescription: 'Premium Stok Yönetim Sistemi',
    maintenanceMode: false,
    allowRegistration: true,
    contactEmail: 'destek@stoocker.app',
    supportPhone: '+90 850 123 45 67',
    footerText: '© 2026 Stocker Inc. Tüm hakları saklıdır.',
    itemsPerPage: 10
};

export default function CMSSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<CMSSettings>(DEFAULT_SETTINGS);

    // Load settings from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('cms_settings');
        if (stored) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        // Simulate API delay
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const handleChange = (field: keyof CMSSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('cms_settings', JSON.stringify(settings));
            setIsSaving(false);
            toast.success('Ayarlar başarıyla kaydedildi.');
        }, 800);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-400" />
                        CMS Ayarları
                    </h1>
                    <p className="text-text-muted">Genel site ayarlarını ve yapılandırmalarını yönetin.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Kaydet
                </button>
            </div>

            {/* General Settings */}
            <div className="glass-card p-6 rounded-xl border border-border-subtle space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 pb-4 border-b border-border-subtle">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Genel Ayarlar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Site Başlığı</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Site Açıklaması</label>
                        <input
                            type="text"
                            value={settings.siteDescription}
                            onChange={(e) => handleChange('siteDescription', e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="glass-card p-6 rounded-xl border border-border-subtle space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 pb-4 border-b border-border-subtle">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    İletişim Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">E-posta Adresi</label>
                        <input
                            type="email"
                            value={settings.contactEmail}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Telefon</label>
                        <input
                            type="text"
                            value={settings.supportPhone}
                            onChange={(e) => handleChange('supportPhone', e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-text-muted">Footer Metni</label>
                        <textarea
                            rows={2}
                            value={settings.footerText}
                            onChange={(e) => handleChange('footerText', e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* System Config */}
            <div className="glass-card p-6 rounded-xl border border-border-subtle space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 pb-4 border-b border-border-subtle">
                    <Shield className="w-5 h-5 text-rose-400" />
                    Sistem & Güvenlik
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-border-subtle">
                        <div>
                            <h3 className="text-white font-medium">Bakım Modu</h3>
                            <p className="text-xs text-text-muted mt-1">Siteyi ziyaretçilere kapatır, sadece yöneticiler erişebilir.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-border-subtle">
                        <div>
                            <h3 className="text-white font-medium">Yeni Üyelik Alımı</h3>
                            <p className="text-xs text-text-muted mt-1">Kullanıcıların siteye kayıt olmasına izin ver.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.allowRegistration}
                                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-border-subtle">
                        <div className="flex flex-col">
                            <h3 className="text-white font-medium">Sayfa Başına Öğe</h3>
                            <p className="text-xs text-text-muted mt-1">Listelerde gösterilecek varsayılan kayıt sayısı.</p>
                        </div>
                        <select
                            value={settings.itemsPerPage}
                            onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                            className="bg-brand-900 border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none focus:border-indigo-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
