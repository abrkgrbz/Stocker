import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Book,
    Edit3,
    Trash2,
    Folder,
    FileText,
    ChevronRight,
    ChevronDown,
    Loader2
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { cmsService, type DocItem } from '../../services/cms.service';

const DocTreeItem = ({ item, level = 0, onDelete }: { item: DocItem, level?: number, onDelete: (id: string) => void }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    if (item.type === 'file') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 group cursor-pointer"
                style={{ marginLeft: `${level * 20}px` }}
                onClick={() => navigate(`/cms/docs/${item.id}`)}
            >
                <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm text-text-muted group-hover:text-text-main transition-colors">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-text-muted mr-2">{new Date(item.updatedAt || item.lastModified).toLocaleDateString('tr-TR')}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cms/docs/${item.id}`); }}
                        className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-white"
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu dokümanı silmek istediğinize emin misiniz?')) {
                                onDelete(item.id);
                            }
                        }}
                        className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-rose-400"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="mb-1">
            <div
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer group"
                style={{ marginLeft: `${level * 20}px` }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                    )}
                    <Folder className={`w-4 h-4 ${isOpen ? 'text-indigo-400' : 'text-slate-400'} transition-colors`} />
                    <span className="text-sm font-medium text-text-main">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-indigo-400"
                        title="Alt Sayfa Ekle"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cms/docs/new?parent=${item.id}`);
                        }}
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bu klasörü ve içindekileri silmek istediğinize emin misiniz?')) {
                                onDelete(item.id);
                            }
                        }}
                        className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-rose-400"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
            {isOpen && item.children && (
                <div>
                    {item.children.map(child => (
                        <DocTreeItem key={child.id} item={child} level={level + 1} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function DocsListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Docs
    const { data: docs = [], isLoading } = useQuery({
        queryKey: ['docs'],
        queryFn: async () => {
            const response = await cmsService.getDocs();
            return Array.isArray(response) ? response : (response as any).data || [];
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: cmsService.deleteDoc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['docs'] });
            toast.success('Doküman silindi.');
        },
        onError: () => {
            toast.error('Silme işleminde hata oluştu.');
        }
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    // Simple search filtering (only filters top level for now, improved recursive filtering can be added)
    const filteredDocs = docs.filter((doc: DocItem) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <Book className="w-6 h-6 text-indigo-400" />
                        Dokümantasyon
                    </h1>
                    <p className="text-text-muted">Kullanıcı kılavuzlarını ve teknik dokümanları yönetin.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-semibold transition-colors">
                        Kategori Ekle
                    </button>
                    <button
                        onClick={() => navigate('/cms/docs/new')}
                        className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Doküman
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tree View */}
                <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-border-subtle h-fit min-h-[400px]">
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Doküman ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-brand-900/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                    <div className="space-y-1">
                        {filteredDocs.map((doc: DocItem) => (
                            <DocTreeItem key={doc.id} item={doc} onDelete={handleDelete} />
                        ))}
                        {filteredDocs.length === 0 && (
                            <div className="text-center text-text-muted text-sm py-4">Doküman bulunamadı.</div>
                        )}
                    </div>
                </div>

                {/* Preview / Quick Edit Area (Placeholder) */}
                <div className="lg:col-span-2 glass-card p-8 rounded-2xl border border-border-subtle flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Edit3 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-2">Düzenlemek için bir doküman seçin</h3>
                    <p className="text-text-muted max-w-md">
                        Soldaki menüden bir doküman seçerek içeriğini görüntüleyebilir ve düzenleyebilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
