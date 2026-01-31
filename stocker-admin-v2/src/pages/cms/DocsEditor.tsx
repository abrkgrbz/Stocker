import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Eye,
    FileText,
    Folder,
    Book,
    Hash
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export default function DocsEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id;

    const [title, setTitle] = useState(isNew ? '' : 'Kurulum Kılavuzu');
    const [slug, setSlug] = useState(isNew ? '' : 'kurulum-kilavuzu');
    const [content, setContent] = useState(isNew ? '' : '# Kurulum\n\nBu doküman projenin nasıl kurulacağını anlatır...');
    const [parentFolder, setParentFolder] = useState(isNew ? 'getting-started' : 'getting-started');

    const handleSave = () => {
        toast.info('Kaydediliyor...');
        setTimeout(() => {
            toast.success(isNew ? 'Doküman başarıyla oluşturuldu!' : 'Değişiklikler kaydedildi.');
            if (isNew) navigate('/cms/docs');
        }, 1000);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/cms/docs')}
                        className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {isNew ? 'Yeni Doküman' : 'Dokümanı Düzenle'}
                        </h1>
                        <p className="text-xs text-text-muted">
                            {isNew ? 'Bilgi bankasına yeni içerik ekleyin.' : `Yol: /docs/getting-started/kurulum`}
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
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-colors"
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
                                placeholder="Doküman Başlığı"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Book className="w-4 h-4" />
                            <span className="opacity-50">/docs/{parentFolder}/</span>
                            <input
                                type="text"
                                placeholder="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-transparent border-b border-dashed border-slate-600 focus:border-emerald-500 focus:outline-none text-emerald-400 font-mono w-full max-w-xs"
                            />
                        </div>
                    </div>

                    {/* Markdown Editor Placeholder */}
                    <div className="glass-card p-1 rounded-2xl border border-border-subtle flex-1 flex flex-col min-h-[500px]">
                        {/* Editor Toolbar */}
                        <div className="p-3 border-b border-border-subtle flex items-center gap-2 overflow-x-auto text-text-muted">
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white font-bold">B</button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white italic">I</button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white flex items-center gap-1">
                                <Hash className="w-3 h-3" /> H1
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white flex items-center gap-1">
                                <Hash className="w-3 h-3" /> H2
                            </button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white text-xs font-mono">
                                {"</> Code"}
                            </button>
                        </div>

                        {/* Editor Content Area */}
                        <textarea
                            className="flex-1 w-full bg-transparent p-6 text-text-main focus:outline-none resize-none font-mono text-sm leading-relaxed"
                            placeholder="# İçeriğinizi Markdown formatında yazın..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                    {/* Folder Structure */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Folder className="w-4 h-4 text-emerald-400" />
                            Konum
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Üst Klasör</label>
                                <select
                                    value={parentFolder}
                                    onChange={(e) => setParentFolder(e.target.value)}
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="root">/ (Kök Dizin)</option>
                                    <option value="getting-started">Başlarken</option>
                                    <option value="api-reference">API Referansı</option>
                                    <option value="guides">Rehberler</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Meta Bilgiler
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Versiyon</span>
                                <span className="text-white font-mono text-xs bg-white/5 px-2 py-1 rounded">v2.1.0</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Okuma Süresi</span>
                                <span className="text-white text-xs">5 dk</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
