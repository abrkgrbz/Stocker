'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Scale, Shield, FileText, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CmsPage } from '@/lib/api/services/cms.types';

interface LegalPageClientProps {
  page: CmsPage | null;
  fallbackTitle: string;
  fallbackSlug: string;
  fallbackContent: string;
}

// Icon mapping for different legal pages
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  terms: Scale,
  privacy: Shield,
  kvkk: FileText,
  cookies: FileText,
  security: Shield,
};

function getIcon(slug: string) {
  return iconMap[slug] || FileText;
}

// Navigation links for legal pages
const legalLinks = [
  { slug: 'privacy', label: 'Gizlilik' },
  { slug: 'terms', label: 'Kullanim Sartlari' },
  { slug: 'kvkk', label: 'KVKK' },
];

export default function LegalPageClient({
  page,
  fallbackTitle,
  fallbackSlug,
  fallbackContent,
}: LegalPageClientProps) {
  const title = page?.title || fallbackTitle;
  const content = page?.content || fallbackContent;
  const slug = page?.slug || fallbackSlug;
  const updatedAt = page?.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const Icon = getIcon(slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/stoocker_black.png"
                alt="Stoocker"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Giris Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Ucretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 text-center px-4 bg-white border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-900">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{title}</h1>
            {updatedAt && <p className="text-slate-500">Son Guncelleme: {updatedAt}</p>}
          </motion.div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
          >
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </motion.div>

          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-indigo-50 rounded-xl p-8 text-center border border-indigo-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sorulariniz mi var?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Bu sayfa hakkinda hukuki veya teknik sorulariniz icin ekibimizle iletisime
              gecebilirsiniz.
            </p>
            <a
              href="mailto:legal@stoocker.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              <Mail className="w-4 h-4" />
              legal@stoocker.app
            </a>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">
              © 2026 Stoocker. Tum haklari saklidir.
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/${link.slug}`}
                className={`${
                  link.slug === slug
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">
              Iletisim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
