'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/api/services/cms.types';
import { generateBlogPostJsonLd } from '@/lib/utils/cms-metadata';

interface BlogPostContentProps {
  post: BlogPost;
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

export default function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateBlogPostJsonLd(post) }}
      />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
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
            <Link href="/blog" className="text-slate-500 hover:text-slate-900 transition-colors">
              Blog
            </Link>
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">
              Dokümantasyon
            </Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">
              Giriş Yap
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 mb-8"
        >
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-900 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-xs">{post.title}</span>
        </motion.nav>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                {post.category.name}
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{post.title}</h1>

          {post.excerpt && (
            <p className="text-xl text-slate-500 mb-6 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-slate-500 pb-8 border-b border-slate-200">
            {post.author && (
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-medium">
                    {post.author.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium text-slate-900">{post.author.name}</div>
                  <div className="text-slate-500">{formatDate(post.publishedAt)}</div>
                </div>
              </div>
            )}
            {post.readTime && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{post.readTime} okuma</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{post.views} görüntülenme</span>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        {post.featuredImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative w-full h-96 rounded-2xl overflow-hidden mb-12"
          >
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-slate prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share & Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t border-slate-200 pt-8"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Tüm Yazılar</span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Paylaş:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://stoocker.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://stoocker.app/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; {new Date().getFullYear()} Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                Şartlar
              </Link>
              <Link href="/blog" className="hover:text-slate-900 transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
