'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BlogPostListItem, BlogCategory } from '@/lib/api/services/cms.types';

interface BlogPageClientProps {
  posts: BlogPostListItem[];
  categories: BlogCategory[];
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function BlogPageClient({ posts, categories }: BlogPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = activeCategory
    ? posts.filter((post) => post.categoryId === activeCategory)
    : posts;

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
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
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">
              Dokümantasyon
            </Link>
            <Link href="/updates" className="text-slate-500 hover:text-slate-900 transition-colors">
              Güncellemeler
            </Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">
              Giriş Yap
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Blog</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Stok yönetimi, e-ticaret ve işletme verimliliği hakkında en güncel içerikler.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        {featuredPost && activeCategory === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {featuredPost.featuredImage ? (
                  <div className="relative w-full lg:w-64 h-48 rounded-xl overflow-hidden">
                    <Image
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full lg:w-64 h-48 bg-slate-200 rounded-xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-slate-900 text-white text-xs rounded-full">
                      Öne Çıkan
                    </span>
                    {featuredPost.category && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                        {featuredPost.category.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-500 mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {featuredPost.author && (
                      <span className="flex items-center gap-2">
                        {featuredPost.author.avatar ? (
                          <Image
                            src={featuredPost.author.avatar}
                            alt={featuredPost.author.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">
                            {featuredPost.author.name[0]}
                          </span>
                        )}
                        {featuredPost.author.name}
                      </span>
                    )}
                    <span>{formatDate(featuredPost.publishedAt)}</span>
                    {featuredPost.readTime && <span>{featuredPost.readTime} okuma</span>}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeCategory === null ? regularPosts : filteredPosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group h-full"
                >
                  {post.featuredImage ? (
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {post.category && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                      {post.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2 group-hover:text-slate-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {post.author && (
                      <span className="flex items-center gap-2">
                        {post.author.avatar ? (
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px]">
                            {post.author.name[0]}
                          </span>
                        )}
                        {post.author.name}
                      </span>
                    )}
                    <span>{post.readTime || formatDate(post.publishedAt)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz yazı yok</h3>
            <p className="text-slate-500">Bu kategoride henüz blog yazısı bulunmuyor.</p>
          </div>
        )}

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 bg-white rounded-2xl border border-slate-200 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Bültene Abone Olun</h2>
          <p className="text-slate-500 mb-6">En son blog yazılarımızdan haberdar olun.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
            <button className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
              Abone Ol
            </button>
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
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; {new Date().getFullYear()} Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Şartlar
              </Link>
              <Link href="/blog" className="text-slate-900">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
