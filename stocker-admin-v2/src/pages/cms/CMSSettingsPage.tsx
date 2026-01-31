import React from 'react';
import { Save, Globe, Settings as SettingsIcon, Shield } from 'lucide-react';

export default function CMSSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-slate-400" />
                        CMS Ayarları
                    </h1>
                    <p className="text-text-muted">Genel site yapılandırması ve SEO ayarları.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Save className="w-4 h-4" />
                    Değişiklikleri Kaydet
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        Site Kimliği
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Site Başlığı</label>
                            <input
                                type="text"
                                defaultValue="Stocker - Akıllı Stok Yönetimi"
                                className="w-full bg-brand-900/50 border border-border-subtle rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Site Açıklaması (Meta Description)</label>
                            <textarea
                                rows={3}
                                defaultValue="Stocker ile tüm stok operasyonlarınızı tek panelden yönetin. Kolay entegrasyon, anlık takip ve yapay zeka destekli analizler."
                                className="w-full bg-brand-900/50 border border-border-subtle rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Security / Access */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Erişim ve Güvenlik
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border-subtle">
                            <div>
                                <h3 className="font-medium text-text-main">Bakım Modu</h3>
                                <p className="text-sm text-text-muted">Siteyi ziyaretçilere kapatın</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border-subtle">
                            <div>
                                <h3 className="font-medium text-text-main">Arama Motoru İndeksleme</h3>
                                <p className="text-sm text-text-muted">Siteyi Google'da göster</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-500">
                                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
