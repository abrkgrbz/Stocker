'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { DocCategory, DocArticleListItem } from '@/lib/api/services/cms.types';

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'getting-started': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'inventory': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  'sales': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  'crm': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'reports': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  'integrations': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  'getting-started': 'from-emerald-500 to-teal-500',
  'inventory': 'from-blue-500 to-indigo-500',
  'sales': 'from-amber-500 to-orange-500',
  'crm': 'from-pink-500 to-rose-500',
  'reports': 'from-violet-500 to-purple-500',
  'integrations': 'from-cyan-500 to-blue-500',
};

// Default icon for categories without mapping
const defaultIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface DocsPageClientProps {
  categories: DocCategory[];
  popularArticles: DocArticleListItem[];
}

export default function DocsPageClient({ categories, popularArticles }: DocsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter categories and their articles based on search query
  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      (category.description?.toLowerCase().includes(query) ?? false)
    );
  });

  const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || (categories.find(c => c.slug === slug)?.icon ? (
      <span className="text-lg">{categories.find(c => c.slug === slug)?.icon}</span>
    ) : defaultIcon);
  };

  const getCategoryColor = (slug: string, color?: string) => {
    if (color) return `from-${color}-500 to-${color}-600`;
    return categoryColors[slug] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/stoocker_black.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/updates" className="text-slate-500 hover:text-slate-900 transition-colors">Guncellemeler</Link>
            <Link href="/support" className="text-slate-500 hover:text-slate-900 transition-colors">Destek</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giris Yap</Link>
          </nav>
        </div>
      </header>

      {/* Hero & Search */}
      <section className="relative z-10 py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Dokumantasyon</h1>
            <p className="text-slate-500 text-lg mb-8">
              Stocker&apos;i en verimli sekilde kullanmak icin ihtiyaciniz olan tum bilgiler
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Dokumanlarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Popular Articles */}
        {!searchQuery && popularArticles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">&#128293;</span> Populer Makaleler
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/docs/${article.slug}`}
                  className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-900 rounded-xl transition-all group"
                >
                  <span className="text-xs text-slate-900 mb-1 block font-medium">
                    {article.category?.name || 'Genel'}
                  </span>
                  <span className="text-slate-900 group-hover:text-slate-700 transition-colors">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Categories Grid */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {searchQuery ? `"${searchQuery}" icin sonuclar` : 'Kategoriler'}
          </h2>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">&#128269;</div>
              <p className="text-slate-500">Aramanizla eslesen sonuc bulunamadi.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-slate-900 hover:text-slate-700"
              >
                Aramayi temizle
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  className="group"
                >
                  <div
                    className={`p-6 bg-white border border-slate-200 hover:border-slate-900 rounded-2xl transition-all cursor-pointer ${
                      activeCategory === category.id ? 'ring-2 ring-slate-900' : ''
                    }`}
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  >
                    {/* Category Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(category.slug, category.color)} rounded-xl flex items-center justify-center text-white`}>
                        {getCategoryIcon(category.slug)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-500">{category.description}</p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          activeCategory === category.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Show article count when collapsed */}
                    {activeCategory !== category.id && (
                      <div className="text-xs text-slate-500 mt-2">
                        {category.articleCount || 0} makale
                      </div>
                    )}

                    {/* Show view button when expanded */}
                    {activeCategory === category.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <Link
                          href={`/docs?category=${category.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700"
                        >
                          <span>Tum makaleleri gor</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Help Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 p-8 bg-slate-50 rounded-2xl border border-slate-200"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aradiginizi bulamadiniz mi?</h3>
              <p className="text-slate-500">Destek ekibimiz size yardimci olmaktan mutluluk duyar.</p>
            </div>
            <Link
              href="/support"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
            >
              Destek Al
            </Link>
          </div>
        </motion.section>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Don</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2024 Stocker. Tum haklari saklidir.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Sartlar</Link>
              <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cerezler</Link>
              <Link href="/docs" className="text-slate-900">Dokumantasyon</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
