import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, FileText, ChevronRight, Star } from 'lucide-react';

const categories = [
    { id: 'getting-started', name: 'Başlarken', count: 5, icon: Star },
    { id: 'account', name: 'Hesap Yönetimi', count: 8, icon: UserIcon },
    { id: 'billing', name: 'Faturalandırma', count: 4, icon: CreditCardIcon },
    { id: 'technical', name: 'Teknik Sorunlar', count: 12, icon: AlertIcon },
];

const articles = [
    { id: 1, title: 'Yeni bir tenant hesabı nasıl oluşturulur?', category: 'Başlarken', views: 342 },
    { id: 2, title: 'API anahtarlarını yönetme ve güvenliği sağlama', category: 'Teknik Sorunlar', views: 856 },
    { id: 3, title: 'Abonelik planları ve fiyatlandırma detayları', category: 'Faturalandırma', views: 1205 },
    { id: 4, title: 'İki faktörlü kimlik doğrulamayı (2FA) etkinleştirme', category: 'Hesap Yönetimi', views: 543 },
];

// Simple icon wrappers to avoid import errors if icons not used before
function UserIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> }
function CreditCardIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg> }
function AlertIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg> }

export const KnowledgeBasePage: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center py-10">
                <h1 className="text-3xl font-bold text-text-main mb-4">Nasıl yardımcı olabiliriz?</h1>
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Makale, rehber veya sorun ara..."
                        className="w-full bg-indigo-500/10 border border-border-subtle rounded-full py-4 pl-14 pr-6 text-text-main focus:outline-none focus:border-indigo-500/40 focus:bg-indigo-500/20 transition-all placeholder:text-text-muted shadow-xl shadow-indigo-500/5"
                    />
                </div>
            </div>

            {/* Support Request - Added after search */}
            <div className="flex justify-center mb-8">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105">
                    <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Destek Talebi Oluştur
                </button>
            </div>


            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group glass-card p-6 rounded-2xl border border-border-subtle hover:bg-indigo-500/5 cursor-pointer transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center mb-4 transition-colors">
                            <category.icon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-1">{category.name}</h3>
                        <p className="text-text-muted text-sm">{category.count} makale</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Articles */}
            <div className="glass-card p-8 rounded-3xl border border-border-subtle">
                <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                    <Book className="w-5 h-5 text-indigo-400" />
                    Popüler Makaleler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((article, index) => (
                        <motion.a
                            key={article.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (index * 0.05) }}
                            href="#"
                            className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border-subtle hover:bg-indigo-500/5 transition-all group"
                        >
                            <FileText className="w-5 h-5 text-text-muted group-hover:text-indigo-400 transition-colors mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-base font-medium text-text-main group-hover:text-indigo-300 transition-colors mb-1">
                                    {article.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-text-muted">
                                    <span>{article.category}</span>
                                    <span>•</span>
                                    <span>{article.views} görüntülenme</span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBasePage;
