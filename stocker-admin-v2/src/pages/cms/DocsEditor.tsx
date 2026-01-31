import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Save,
    Eye,
    FileText,
    Folder,
    Book,
    Hash,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type DocItem } from '../../services/cms.service';
import { useMarkdownEditor } from '../../hooks/useMarkdownEditor';

export default function DocsEditor() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const parentIdParam = searchParams.get('parent');
    const isNew = !id;

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [parentId, setParentId] = useState<string>(parentIdParam || 'root');
    const [type, setType] = useState<'file' | 'folder'>('file');

    // Markdown Editor Hook
    const { textareaRef, insertFormat } = useMarkdownEditor(content, setContent);

    // Fetch Doc Details if editing
    const { data: doc, isLoading } = useQuery({
        queryKey: ['doc', id],
        queryFn: () => cmsService.getDoc(id!),
        enabled: !isNew
    });

    // Fetch all docs to populate parent folder selection (flattening simplistic approach for this example)
    const { data: allDocs = [] } = useQuery({
        queryKey: ['docs'],
        queryFn: async () => {
            const response = await cmsService.getDocs();
            return Array.isArray(response) ? response : (response as any).data || [];
        }
    });

    // Populate Form
    useEffect(() => {
        if (doc) {
            setTitle(doc.title);
            setSlug(doc.slug);
            setContent(doc.content || '');
            setParentId(doc.parentId || 'root');
            setType(doc.type);
        }
    }, [doc]);

    // Create/Update Mutation
    const saveMutation = useMutation({
        mutationFn: (data: Partial<DocItem>) => {
            return isNew
                ? cmsService.createDoc(data)
                : cmsService.updateDoc(id!, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docs'] });
            if (!isNew) queryClient.invalidateQueries({ queryKey: ['doc', id] });

            toast.success(isNew ? 'Doküman başarıyla oluşturuldu!' : 'Değişiklikler kaydedildi.');

            if (isNew) {
                navigate('/cms/docs');
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        // Only auto-generate slug if creating new doc
        if (isNew) {
            setSlug(slugify(val));
        }
    };

    const handleSave = () => {
        if (!title.trim() || !slug.trim()) {
            toast.warning('Lütfen başlık ve URL (slug) alanlarını doldurun.');
            return;
        }

        const data: Partial<DocItem> = {
            title: title.trim(),
            slug: slug.trim(),
            type,
            parentId: parentId === 'root' ? null : parentId,
            order: 0, // Default order
        };

        if (type === 'file') {
            data.content = content;
        }

        saveMutation.mutate(data);
    };

    // Helper to flatten docs for select dropdown (only folders)
    const getFolders = (items: DocItem[], level = 0): { id: string, title: string, level: number }[] => {
        let folders: { id: string, title: string, level: number }[] = [];
        items.forEach(item => {
            if (item.type === 'folder' && item.id !== id) { // Prevent selecting itself as parent
                folders.push({ id: item.id, title: item.title, level });
                if (item.children) {
                    folders = [...folders, ...getFolders(item.children, level + 1)];
                }
            }
        });
        return folders;
    };

    const folders = getFolders(allDocs);

    const handlePreview = () => {
        if (!slug.trim()) {
            toast.warning('Önizleme için önce bir URL (slug) belirlemelisiniz.');
            return;
        }
        window.open(`https://stoocker.app/docs/${slug.trim()}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

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
                            {isNew ? 'Bilgi bankasına yeni içerik ekleyin.' : `Son düzenleme: ${doc?.updatedAt ? new Date(doc.updatedAt).toLocaleString('tr-TR') : '-'}`}
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
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-colors"
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
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Doküman Başlığı"
                                    value={title}
                                    onChange={handleTitleChange}
                                    className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
                                />
                            </div>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'file' | 'folder')}
                                className="bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-emerald-500 h-fit"
                            >
                                <option value="file">Dosya</option>
                                <option value="folder">Klasör</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Book className="w-4 h-4" />
                            <span className="opacity-50">/docs/{parentId === 'root' ? '' : '.../'}</span>
                            <input
                                type="text"
                                placeholder="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="bg-transparent border-b border-dashed border-slate-600 focus:border-emerald-500 focus:outline-none text-emerald-400 font-mono w-full max-w-xs"
                            />
                        </div>
                    </div>

                    {/* Markdown Editor Placeholder (Only for files) */}
                    {type === 'file' && (
                        <div className="glass-card p-1 rounded-2xl border border-border-subtle flex-1 flex flex-col min-h-[500px]">
                            {/* Editor Toolbar */}
                            <div className="p-3 border-b border-border-subtle flex items-center gap-2 overflow-x-auto text-text-muted">
                                <button onClick={() => insertFormat('bold')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white font-bold">B</button>
                                <button onClick={() => insertFormat('italic')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white italic">I</button>
                                <div className="w-px h-4 bg-border-subtle mx-1" />
                                <button onClick={() => insertFormat('h1')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> H1
                                </button>
                                <button onClick={() => insertFormat('h2')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> H2
                                </button>
                                <div className="w-px h-4 bg-border-subtle mx-1" />
                                <button onClick={() => insertFormat('code')} className="p-2 hover:bg-white/5 rounded-lg hover:text-white text-xs font-mono">
                                    {"</> Code"}
                                </button>
                            </div>

                            {/* Editor Content Area */}
                            <textarea
                                ref={textareaRef}
                                className="flex-1 w-full bg-transparent p-6 text-text-main focus:outline-none resize-none font-mono text-sm leading-relaxed"
                                placeholder="# İçeriğinizi Markdown formatında yazın..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    )}
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
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    className="w-full bg-brand-900 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="root">/ (Kök Dizin)</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>
                                            {'-'.repeat(folder.level)} {folder.title}
                                        </option>
                                    ))}
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
                                <span className="text-text-muted">Oluşturulma</span>
                                <span className="text-white font-mono text-xs bg-white/5 px-2 py-1 rounded">
                                    {doc ? new Date(doc.createdAt).toLocaleDateString('tr-TR') : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
