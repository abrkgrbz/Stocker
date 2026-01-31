import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Globe,
    Layout,
    Settings,
    Eye,
    Calendar,
    Image as ImageIcon,
    Tag,
    User,
    PenTool
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export default function BlogEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    const [title, setTitle] = useState(isNew ? '' : 'Stok Yönetiminde Yapay Zeka Devrimi');
    const [slug, setSlug] = useState(isNew ? '' : 'stok-yonetiminde-yapay-zeka-devrimi');
    const [content, setContent] = useState(isNew ? '' : '<h2>Giriş</h2><p>Yapay zeka, stok yönetimini kökten değiştiriyor...</p>');
    const [category, setCategory] = useState(isNew ? 'tech' : 'tech');

    const handleSave = () => {
        toast.info('Kaydediliyor...');
        setTimeout(() => {
            toast.success(isNew ? 'Yazı başarıyla oluşturuldu!' : 'Değişiklikler kaydedildi.');
            if (isNew) navigate('/cms/blog');
        }, 1000);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/cms/blog')}
                        className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {isNew ? 'Yeni Blog Yazısı' : 'Yazıyı Düzenle'}
                            {!isNew && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Yayında</span>}
                        </h1>
                        <p className="text-xs text-text-muted">
                            {isNew ? 'Düşüncelerinizi paylaşın.' : `Son düzenleme: Ahmet Y. tarafından 2 saat önce`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-semibold transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Önizle
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Main Content Editor */}
                <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Title & Slug */}
                    <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-4 shrink-0">
                        <div>
                            <input
                                type="text"
                                placeholder="Yazı Başlığı"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <PenTool className="w-4 h-4" />
                            <span className="opacity-50">https://stoocker.app/blog/</span>
                            <input
                                type="text"
                                placeholder="yazi-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-transparent border-b border-dashed border-slate-600 focus:border-purple-500 focus:outline-none text-purple-400 font-mono w-full max-w-xs"
                            />
                        </div>
                    </div>

                    {/* Rich Text Editor Placeholder */}
                    <div className="glass-card p-1 rounded-2xl border border-border-subtle flex-1 flex flex-col min-h-[500px]">
                        {/* Editor Toolbar */}
                        <div className="p-3 border-b border-border-subtle flex items-center gap-2 overflow-x-auto text-text-muted">
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white font-bold">B</button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white italic">I</button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white underline">U</button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">H1</button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">H2</button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">H3</button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">
                                <Layout className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Editor Content Area */}
                        <textarea
                            className="flex-1 w-full bg-transparent p-6 text-text-main focus:outline-none resize-none font-mono text-sm leading-relaxed"
                            placeholder="Hikayenizi yazmaya başlayın..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                    {/* Publish Settings */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-purple-400" />
                            Yayın Ayarları
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Durum</span>
                                <select className="bg-brand-900 border border-border-subtle rounded-lg px-2 py-1 text-text-main text-xs focus:outline-none focus:border-purple-500">
                                    <option value="draft">Taslak</option>
                                    <option value="published">Yayında</option>
                                    <option value="scheduled">Planlandı</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Yazar</span>
                                <div className="flex items-center gap-2 text-xs font-medium text-white">
                                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">AY</div>
                                    Ahmet Y.
                                </div>
                            </div>
                            <div className="pt-3 border-t border-border-subtle">
                                <div className="text-xs text-text-muted flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Yayınlanma: 26 Oca 2026
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy (Categories & Tags) */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-400" />
                            Kategori & Etiketler
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-purple-500"
                                >
                                    <option value="tech">Teknoloji</option>
                                    <option value="ecommerce">E-Ticaret</option>
                                    <option value="operations">Operasyon</option>
                                    <option value="news">Haberler</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Etiketler</label>
                                <input
                                    type="text"
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-purple-500"
                                    placeholder="virgülle ayırın..."
                                />
                                <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20">#yapayzeka</span>
                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20">#stok</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                            Kapak Görseli
                        </h3>

                        <div className="aspect-video bg-brand-900 rounded-lg border-2 border-dashed border-border-subtle flex items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-brand-900/50 transition-all group overflow-hidden relative">
                            {/* Placeholder for selected image logic */}
                            <div className="text-center space-y-2 relative z-10">
                                <div className="p-2 rounded-full bg-white/5 inline-flex group-hover:bg-purple-500/20 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-text-muted group-hover:text-purple-400" />
                                </div>
                                <p className="text-xs text-text-muted">Görsel seçmek için tıklayın</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
