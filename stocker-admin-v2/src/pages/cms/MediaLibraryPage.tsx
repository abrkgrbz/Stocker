import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Upload,
    Image as ImageIcon,
    File,
    MoreVertical,
    Trash2,
    Download
} from 'lucide-react';

interface MediaItem {
    id: string;
    name: string;
    type: 'image' | 'document';
    size: string;
    date: string;
    url: string;
}

// Mock Data
const mediaItems: MediaItem[] = [
    { id: '1', name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', date: '26 Ocak 2026', url: '#' },
    { id: '2', name: 'stok-yonetimi-blog.png', type: 'image', size: '1.1 MB', date: '25 Ocak 2026', url: '#' },
    { id: '3', name: 'logo-white.svg', type: 'image', size: '45 KB', date: '20 Ocak 2026', url: '#' },
    { id: '4', name: 'kullanici-kvk.pdf', type: 'document', size: '540 KB', date: '15 Ocak 2026', url: '#' },
    { id: '5', name: 'features-grid.jpg', type: 'image', size: '3.2 MB', date: '12 Ocak 2026', url: '#' },
    { id: '6', name: 'api-docs-v1.json', type: 'document', size: '120 KB', date: '10 Ocak 2026', url: '#' },
];

export default function MediaLibraryPage() {
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
                <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    Dosya Yükle
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl border border-border-subtle flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Dosya ara..."
                        className="w-full bg-brand-900/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-text-main focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
                <select className="bg-brand-900/50 border border-border-subtle rounded-lg py-2 px-3 text-sm text-text-main focus:outline-none focus:border-emerald-500/50">
                    <option value="all">Tüm Dosyalar</option>
                    <option value="image">Görseller</option>
                    <option value="document">Dokümanlar</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mediaItems.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-xl border border-border-subtle overflow-hidden group hover:border-emerald-500/30 transition-colors"
                    >
                        <div className="aspect-square bg-slate-900 relative flex items-center justify-center p-4">
                            {item.type === 'image' ? (
                                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            ) : (
                                <File className="w-16 h-16 text-slate-600" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="İndir">
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-full bg-white/10 hover:bg-rose-500/50 text-white transition-colors" title="Sil">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="text-sm font-medium text-text-main truncate" title={item.name}>{item.name}</h4>
                            <div className="flex justify-between items-center mt-1 text-xs text-text-muted">
                                <span>{item.size}</span>
                                <span>{item.date}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
