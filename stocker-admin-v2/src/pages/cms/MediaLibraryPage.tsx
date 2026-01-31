import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Upload,
    Image as ImageIcon,
    File,
    MoreVertical,
    Trash2,
    Download,
    Loader2,
    X,
    Filter
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type MediaItem } from '../../services/cms.service';

export default function MediaLibraryPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Fetch Media
    const { data: mediaItems = [], isLoading } = useQuery({
        queryKey: ['media', { type: filterType, search: searchQuery }],
        queryFn: async () => {
            // Passing params to API. If backend doesn't support server-side filtering yet, 
            // we might need to filter client-side. Assuming API structure for now or client-side filter fallback.
            const response = await cmsService.getMedia({ type: filterType !== 'all' ? filterType : undefined, search: searchQuery });
            return Array.isArray(response) ? response : (response as any).data || [];
        }
    });

    // Client-side filtering fallback if API returns all
    const filteredMedia = mediaItems.filter((item: MediaItem) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()); // || item.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' ||
            (filterType === 'image' && item.type.startsWith('image')) ||
            (filterType === 'document' && !item.type.startsWith('image'));
        return matchesSearch && matchesType;
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: cmsService.deleteMedia,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('Dosya başarıyla silindi.');
        },
        onError: () => {
            toast.error('Dosya silinirken bir hata oluştu.');
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Bu dosyayı kalıcı olarak silmek istediğinize emin misiniz?')) {
            deleteMutation.mutate(id);
        }
    };

    // Upload Logic
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadMutation = useMutation({
        mutationFn: (file: File) => cmsService.uploadMedia(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
            toast.success('Dosya başarıyla yüklendi.');
            setIsUploadModalOpen(false);
            setUploadFile(null);
        },
        onError: () => {
            toast.error('Dosya yüklenirken bir hata oluştu.');
        }
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (uploadFile) {
            uploadMutation.mutate(uploadFile);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-emerald-400" />
                        Medya Kütüphanesi
                    </h1>
                    <p className="text-text-muted">Tüm görselleri ve dosyaları tek yerden yönetin.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Dosya Yükle
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Dosya ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-900/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2 items-center">
                    <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-brand-900/50 border border-border-subtle rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-emerald-500/50"
                    >
                        <option value="all">Tüm Dosyalar</option>
                        <option value="image">Görseller</option>
                        <option value="document">Dokümanlar</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredMedia.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-text-muted border-2 border-dashed border-border-subtle rounded-2xl bg-white/5">
                    <div className="p-4 rounded-full bg-white/5 mb-4">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Henüz dosya yüklenmemiş veya arama kriterlerine uygun sonuç yok.</p>
                </div>
            )}

            {/* Grid */}
            {!isLoading && filteredMedia.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-xl border border-border-subtle overflow-hidden group hover:border-emerald-500/30 transition-colors relative"
                        >
                            <div className="aspect-square bg-slate-900 relative flex items-center justify-center p-4">
                                {item.type.startsWith('image') ? (
                                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600 overflow-hidden">
                                        {/* Assuming 'url' is the full path or accessible path */}
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <File className="w-16 h-16 text-slate-600" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                    <a
                                        href={item.url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        title="İndir/Görüntüle"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-full bg-white/10 hover:bg-rose-500/50 text-white transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-medium text-text-main truncate" title={item.name}>{item.name || item.fileName}</h4>
                                <div className="flex justify-between items-center mt-1 text-xs text-text-muted">
                                    <span>{formatSize(item.size)}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upload Modal (Simplified) */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1e1e2d] border border-white/10 p-6 rounded-2xl w-full max-w-md m-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Dosya Yükle</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-text-muted hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div
                            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-white">
                                    {uploadFile ? uploadFile.name : 'Dosya seçmek için tıklayın'}
                                </p>
                                {!uploadFile && <p className="text-xs text-text-muted mt-1">PNG, JPG, PDF, DOCX</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-text-muted hover:text-white transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!uploadFile || uploadMutation.isPending}
                                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
                            >
                                {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Yükle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
