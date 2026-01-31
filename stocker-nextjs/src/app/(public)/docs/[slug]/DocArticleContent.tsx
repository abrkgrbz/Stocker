'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { DocArticle, DocArticleListItem } from '@/lib/api/services/cms.types';

interface DocArticleContentProps {
  article: DocArticle;
  relatedArticles: DocArticleListItem[];
}

export default function DocArticleContent({ article, relatedArticles }: DocArticleContentProps) {
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
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">Dokumantasyon</Link>
            <Link href="/support" className="text-slate-500 hover:text-slate-900 transition-colors">Destek</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giris Yap</Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-6 py-4">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              Ana Sayfa
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">
              Dokumantasyon
            </Link>
          </li>
          {article.category && (
            <>
              <li className="text-slate-400">/</li>
              <li>
                <Link
                  href={`/docs?category=${article.category.slug}`}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {article.category.name}
                </Link>
              </li>
            </>
          )}
          <li className="text-slate-400">/</li>
          <li className="text-slate-900 font-medium truncate max-w-[200px]">{article.title}</li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Article Header */}
          <header className="mb-8">
            {article.category && (
              <Link
                href={`/docs?category=${article.category.slug}`}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors"
              >
                {article.category.icon && <span>{article.category.icon}</span>}
                <span>{article.category.name}</span>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-slate-500">{article.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Son guncelleme: {new Date(article.updatedAt).toLocaleDateString('tr-TR')}
              </span>
              {article.views > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.views} goruntulenme
                </span>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-slate-900 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-slate-700
              prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-800 prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:overflow-x-auto
              prose-ul:text-slate-600 prose-ol:text-slate-600
              prose-li:marker:text-slate-400
              prose-blockquote:border-slate-300 prose-blockquote:text-slate-600
              prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-200">
            {/* Feedback */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bu makale yardimci oldu mu?</h3>
              <p className="text-slate-500 text-sm mb-4">Geri bildiriminiz icin tesekkur ederiz.</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-900 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Evet
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-900 transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  Hayir
                </button>
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Ilgili Makaleler</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/docs/${related.slug}`}
                      className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-900 rounded-xl transition-all group"
                    >
                      <span className="text-slate-900 group-hover:text-slate-700 transition-colors block font-medium">
                        {related.title}
                      </span>
                      {related.excerpt && (
                        <span className="text-sm text-slate-500 mt-1 block line-clamp-2">
                          {related.excerpt}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Link
                href="/docs"
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
                <span>Tum Dokumanlar</span>
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Destek Al</span>
              </Link>
            </div>
          </footer>
        </motion.article>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2024 Stocker. Tum haklari saklidir.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Sartlar</Link>
              <Link href="/docs" className="hover:text-slate-900 transition-colors">Dokumantasyon</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
