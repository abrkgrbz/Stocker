import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    PenTool,
    Users,
    Files,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';

export const CMSPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Layout className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Toplam Sayfa</p>
                            <h3 className="text-2xl font-bold text-white">12</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className="text-emerald-400 font-medium">+2</span>
                        bu hafta eklendi
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Blog Yazısı</p>
                            <h3 className="text-2xl font-bold text-white">48</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className="text-purple-400 font-medium">+5</span>
                        bu ay yayınlandı
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Ziyaretçi</p>
                            <h3 className="text-2xl font-bold text-white">12.5k</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                        <span className="text-emerald-400 font-medium">%12</span>
                        artış (son 30 gün)
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Files className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-muted">Medya Dosyası</p>
                            <h3 className="text-2xl font-bold text-white">1,240</h3>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted">
                        1.2 GB kullanılan alan
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <h3 className="text-lg font-bold text-white mb-4">Hızlı İşlemler</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/cms/blog/new')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <PenTool className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-text-main group-hover:text-white">Yeni Blog Yazısı</h4>
                                <p className="text-xs text-text-muted">Bir makale veya duyuru yayınlayın.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/cms/pages/new')}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Layout className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-text-main group-hover:text-white">Yeni Sayfa Oluştur</h4>
                                <p className="text-xs text-text-muted">Yeni bir statik sayfa ekleyin.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-text-muted ml-auto group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6 rounded-2xl border border-border-subtle">
                    <h3 className="text-lg font-bold text-white mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3 pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm text-text-main">
                                        <span className="font-bold text-white">Ahmet Y.</span> yeni bir blog yazısı yayınladı: "2026 Stok Trendleri"
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">2 saat önce</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSPage;
