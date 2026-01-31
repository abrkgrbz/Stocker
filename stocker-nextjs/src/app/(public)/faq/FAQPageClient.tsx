'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaqItem, FaqCategory } from '@/lib/api/services/cms.types';

// Default fallback FAQs
const defaultFaqs = [
  { id: '1', question: 'Stocker nedir?', answer: 'Stocker, isletmelerin stok ve envanter yonetimini kolaylastiran bulut tabanli bir SaaS platformudur.', categoryId: 'genel', order: 1, isActive: true, helpfulCount: 0, notHelpfulCount: 0 },
  { id: '2', question: 'Ucretsiz deneme suresi var mi?', answer: 'Evet! 14 gun boyunca tum ozellikleri ucretsiz deneyebilirsiniz. Kredi karti bilgisi gerekmez.', categoryId: 'fiyat', order: 2, isActive: true, helpfulCount: 0, notHelpfulCount: 0 },
  { id: '3', question: 'Verilerim guvende mi?', answer: 'Kesinlikle. Verileriniz 256-bit SSL sifreleme ile korunur. AWS altyapisinda barindirilir.', categoryId: 'guvenlik', order: 3, isActive: true, helpfulCount: 0, notHelpfulCount: 0 },
];

const defaultCategories = [
  { id: 'genel', name: 'Genel', slug: 'genel', order: 1, isActive: true },
  { id: 'fiyat', name: 'Fiyatlandirma', slug: 'fiyatlandirma', order: 2, isActive: true },
  { id: 'guvenlik', name: 'Guvenlik', slug: 'guvenlik', order: 3, isActive: true },
];

interface FAQPageClientProps {
  items: FaqItem[];
  categories: FaqCategory[];
}

export default function FAQPageClient({ items, categories }: FAQPageClientProps) {
  const [activeCategory, setActiveCategory] = useState('Tumu');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use CMS data or fallback to defaults
  const displayItems = items.length > 0 ? items : defaultFaqs;
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  // Create category list with "All" option
  const categoryList = useMemo(() => {
    return ['Tumu', ...displayCategories.map(c => c.name)];
  }, [displayCategories]);

  // Get category ID by name
  const getCategoryId = (name: string) => {
    const cat = displayCategories.find(c => c.name === name);
    return cat?.id;
  };

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return displayItems.filter(faq => {
      const categoryId = getCategoryId(activeCategory);
      const matchesCategory = activeCategory === 'Tumu' || faq.categoryId === categoryId;
      const matchesSearch = !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [displayItems, activeCategory, searchQuery, displayCategories]);

  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    const cat = displayCategories.find(c => c.id === categoryId);
    return cat?.name || 'Genel';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">Dokumantasyon</Link>
            <Link href="/support" className="text-slate-500 hover:text-slate-900 transition-colors">Destek</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giris Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Sikca Sorulan Sorular</h1>
          <p className="text-slate-500">Merak ettiklerinizin cevaplarini burada bulabilirsiniz.</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categoryList.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">&#128269;</div>
              <p className="text-slate-500">Aramanizla eslesen soru bulunamadi.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('Tumu'); }}
                className="mt-4 text-slate-900 hover:text-slate-700"
              >
                Filtreleri temizle
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className={`p-6 bg-white rounded-2xl border transition-colors ${
                  openIndex === index ? 'border-slate-900' : 'border-slate-200'
                }`}>
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                        {getCategoryName(faq.categoryId)}
                      </span>
                      <span className="font-medium text-slate-900">{faq.question}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="mt-4 text-slate-500 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Baska sorunuz mu var?</h2>
          <p className="text-slate-500 mb-6">Destek ekibimiz size yardimci olmaya hazir.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/support"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
            >
              Destek Al
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl transition-colors"
            >
              Iletisime Gec
            </Link>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-12">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2024 Stocker. Tum haklari saklidir.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Sartlar</Link>
              <Link href="/faq" className="text-slate-900">SSS</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
