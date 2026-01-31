import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Save,
    Globe,
    Layout,
    Settings,
    Eye,
    Calendar,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type Page } from '../../services/cms.service';
import { useMarkdownEditor } from '../../hooks/useMarkdownEditor';

export default function PageEditor() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();
    const isNew = !id;

    // Form States
    const [formTitle, setFormTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'Published' | 'Draft' | 'Archived'>('Draft');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');

    // Markdown Editor Hook
    const { textareaRef, insertFormat } = useMarkdownEditor(content, setContent);

    // Fetch Page Details
    const { data: page, isLoading } = useQuery({
        queryKey: ['page', id],
        queryFn: () => cmsService.getPage(id!),
        enabled: !isNew
    });

    // Populate Form
    useEffect(() => {
        if (page) {
            setFormTitle(page.title);
            setSlug(page.slug);
            setContent(page.content);
            setStatus(page.status as any); // Cast to any to avoid temporary type mismatch during refactor if needed, or just let it match if types are synced.
            setMetaTitle(Boolean(page.metaTitle) ? page.metaTitle! : '');
            setMetaDescription(Boolean(page.metaDescription) ? page.metaDescription! : '');
        }
    }, [page]);

    // Create/Update Mutation
    const saveMutation = useMutation({
        mutationFn: (data: Partial<Page>) => {
            return isNew
                ? cmsService.createPage(data)
                : cmsService.updatePage(id!, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            if (!isNew) queryClient.invalidateQueries({ queryKey: ['page', id] });

            toast.success(isNew ? 'Sayfa başarıyla oluşturuldu!' : 'Değişiklikler kaydedildi.');

            if (isNew) {
                navigate('/cms/pages');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Bir hata oluştu.');
        }
    });

    // Slugify helper
    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    // Auto-generate slug from title
    useEffect(() => {
        if (isNew && formTitle) {
            setSlug(slugify(formTitle));
        }
    }, [formTitle, isNew]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormTitle(e.target.value);
    };

    const handleSave = () => {
        if (!formTitle?.trim()) {
            toast.warning('Lütfen sayfa başlığını giriniz.');
            return;
        }

        if (!slug?.trim()) {
            toast.warning('Lütfen URL (slug) alanını giriniz.');
            return;
        }

        saveMutation.mutate({
            title: formTitle.trim(),
            slug: slug.trim(),
            content,
            status,
            metaTitle,
            metaDescription
        });
    };

    const handlePreview = () => {
        if (!slug.trim()) {
            toast.warning('Önizleme için önce bir URL (slug) belirlemelisiniz.');
            return;
        }
        // CMS Preview Secret
        const secret = 'R5VlT2OZ0wVQokJwruUN5e2AuDuf8FJW';
        const url = `https://stoocker.app/cms/preview?slug=${slug.trim()}&secret=${secret}&type=page`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/cms/pages')}
                        className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            {isNew ? 'Yeni Sayfa Oluştur' : 'Sayfayı Düzenle'}
                        </h1>
                        <p className="text-xs text-text-muted">
                            {isNew ? 'Sıfırdan bir sayfa yaratın.' : `Son düzenleme: ${page?.updatedAt ? new Date(page.updatedAt).toLocaleString('tr-TR') : '-'} `}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePreview}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white font-semibold transition-colors flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Önizle
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                                placeholder="Sayfa Başlığı"
                                value={formTitle}
                                onChange={handleTitleChange}
                                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Globe className="w-4 h-4" />
                            <span className="opacity-50">https://stoocker.app/</span>
                            <input
                                type="text"
                                placeholder="sayfa-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-transparent border-b border-dashed border-slate-600 focus:border-indigo-500 focus:outline-none text-indigo-400 font-mono w-full max-w-xs"
                            />
                        </div>
                    </div>

                    {/* Rich Text Editor Placeholder */}
                    <div className="glass-card p-1 rounded-2xl border border-border-subtle flex-1 flex flex-col min-h-[500px]">
                        {/* Editor Toolbar */}
                        <div className="p-3 border-b border-border-subtle flex items-center gap-2 overflow-x-auto text-text-muted">
                            <button onClick={() => insertFormat('bold')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white font-bold">B</button>
                            <button onClick={() => insertFormat('italic')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white italic">I</button>
                            <button onClick={() => insertFormat('underline')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white underline">U</button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button onClick={() => insertFormat('h1')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white">H1</button>
                            <button onClick={() => insertFormat('h2')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white">H2</button>
                            <div className="w-px h-4 bg-border-subtle mx-1" />
                            <button onClick={() => insertFormat('image')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white">
                                <ImageIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg hover:text-white">
                                <Layout className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Editor Content Area */}
                        <textarea
                            ref={textareaRef}
                            className="flex-1 w-full bg-transparent p-6 text-text-main focus:outline-none resize-none font-mono text-sm leading-relaxed"
                            placeholder="İçeriğinizi buraya yazın..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
                    {/* Status Card */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-indigo-400" />
                            Yayın Ayarları
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Durum</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="bg-brand-900 border border-border-subtle rounded-lg px-2 py-1 text-text-main text-xs focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="Draft">Taslak</option>
                                    <option value="Published">Yayında</option>
                                    <option value="Archived">Arşiv</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Görünürlük</span>
                                <span className="text-emerald-400 font-medium text-xs">Herkese Açık</span>
                            </div>
                            <div className="pt-3 border-t border-border-subtle">
                                <div className="text-xs text-text-muted flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Yayınlanma: {page ? new Date(page.createdAt).toLocaleDateString('tr-TR') : '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-400" />
                            SEO & Meta
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Meta Başlık</label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-indigo-500"
                                    placeholder="Google'da görünecek başlık"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-text-muted">Meta Açıklama</label>
                                <textarea
                                    rows={3}
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-indigo-500"
                                    placeholder="Sayfa hakkında kısa açıklama..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="glass-card p-5 rounded-xl border border-border-subtle space-y-4">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                            Öne Çıkan Görsel
                        </h3>

                        <div className="aspect-video bg-brand-900 rounded-lg border-2 border-dashed border-border-subtle flex items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-brand-900/50 transition-all group">
                            <div className="text-center space-y-2">
                                <div className="p-2 rounded-full bg-white/5 inline-flex group-hover:bg-indigo-500/20 transition-colors">
                                    <ImageIcon className="w-5 h-5 text-text-muted group-hover:text-indigo-400" />
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
