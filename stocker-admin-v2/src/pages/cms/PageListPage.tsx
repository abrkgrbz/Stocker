import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    FileText,
    ExternalLink,
    Edit3,
    Trash2,
    CheckCircle,
    Globe,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type Page } from '../../services/cms.service';

export default function PageListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: pages = [], isLoading } = useQuery({
        queryKey: ['pages'],
        queryFn: async () => {
            const response = await cmsService.getPages();
            // Handle paginated response
            if (response && 'items' in response) {
                return response.items;
            }
            // Fallback for array or other structures
            return Array.isArray(response) ? response : [];
        }
    });

    const deleteMutation = useMutation({
        mutationFn: cmsService.deletePage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages'] });
            toast.success('Sayfa başarıyla silindi.');
        },
        onError: () => {
            toast.error('Sayfa silinirken bir hata oluştu.');
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Bu sayfayı silmek istediğinize emin misiniz?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredPages = pages.filter((page: Page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-400" />
                        Sayfa Yönetimi
                    </h1>
                    <p className="text-text-muted">Web sitesi sayfalarını oluşturun ve yönetin.</p>
                </div>
                <button
                    onClick={() => navigate('/cms/pages/new')}
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Sayfa
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Sayfa ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-900/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-brand-900/50 border border-border-subtle rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-indigo-500/50">
                        <option value="all">Tüm Durumlar</option>
                        <option value="published">Yayında</option>
                        <option value="draft">Taslak</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="glass-card rounded-xl border border-border-subtle overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-border-subtle bg-white/5">
                                <th className="px-6 py-4 font-semibold text-text-muted">Sayfa Bilgisi</th>
                                <th className="px-6 py-4 font-semibold text-text-muted">URL (Slug)</th>
                                <th className="px-6 py-4 font-semibold text-text-muted">Durum</th>
                                <th className="px-6 py-4 font-semibold text-text-muted">Yazar</th>
                                <th className="px-6 py-4 font-semibold text-text-muted">Son Düzenleme</th>
                                <th className="px-6 py-4 font-semibold text-text-muted text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {filteredPages.map((page: Page) => (
                                <motion.tr
                                    key={page.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-text-main">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted font-mono text-xs">{page.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${page.status === 'published'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {page.status === 'published' ? (
                                                <CheckCircle className="w-3 h-3" />
                                            ) : (
                                                <Edit3 className="w-3 h-3" />
                                            )}
                                            {page.status === 'published' ? 'Yayında' : 'Taslak'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">{page.author?.name || '-'}</td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('tr-TR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => window.open(`https://stoocker.app/${page.slug}`, '_blank')}
                                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-indigo-400 transition-colors"
                                                title="Görüntüle"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/cms/pages/${page.id}`)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-amber-400 transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-rose-400 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPages.length === 0 && (
                    <div className="p-8 text-center text-text-muted">
                        Aradığınız kriterlere uygun sayfa bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}
