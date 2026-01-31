import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    PenTool,
    Edit3,
    Trash2,
    Eye,
    Calendar,
    User,
    Tag,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type BlogPost } from '../../services/cms.service';

export default function BlogListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Fetch Posts
    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            const response = await cmsService.getPosts();
            return Array.isArray(response) ? response : (response as any).data || [];
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: cmsService.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success('Yazı başarıyla silindi.');
        },
        onError: () => {
            toast.error('Yazı silinirken bir hata oluştu.');
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredPosts = posts.filter((post: BlogPost) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'scheduled': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Yayında';
            case 'draft': return 'Taslak';
            case 'scheduled': return 'Planlandı';
            default: return status;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-purple-400" />
                        Blog Yönetimi
                    </h1>
                    <p className="text-text-muted">Blog yazılarını ve haberleri yönetin.</p>
                </div>
                <button
                    onClick={() => navigate('/cms/blog/new')}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Yazı
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Yazı ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-900/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-brand-900/50 border border-border-subtle rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="all">Tüm Kategoriler</option>
                        <option value="tech">Teknoloji</option>
                        <option value="ecommerce">E-Ticaret</option>
                        <option value="news">Haberler</option>
                    </select>
                </div>
            </div>

            {/* Grid Layout for Blog Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post: BlogPost) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl border border-border-subtle overflow-hidden hover:border-purple-500/30 transition-colors group"
                    >
                        {/* Fake Cover Image */}
                        <div className="h-48 bg-brand-900/50 relative">
                            {post.featuredImage ? (
                                <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-brand-800">
                                    <PenTool className="w-12 h-12 opacity-20" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                                    {getStatusLabel(post.status)}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-purple-400 font-medium mb-2">
                                    <Tag className="w-3 h-3" />
                                    {post.category}
                                </div>
                                <h3 className="font-bold text-lg text-text-main line-clamp-2 leading-snug">
                                    {post.title}
                                </h3>
                            </div>

                            <div className="flex items-center justify-between text-xs text-text-muted">
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    {post.author?.name || '-'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.publishDate || post.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                                <div className="flex items-center gap-1 text-text-muted text-xs">
                                    <Eye className="w-3 h-3" />
                                    {post.views || 0} okunma
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/cms/blog/${post.id}`)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-rose-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {filteredPosts.length === 0 && (
                <div className="p-8 text-center text-text-muted col-span-full">
                    Aradığınız kriterlere uygun yazı bulunamadı.
                </div>
            )}
        </div>
    );
}
