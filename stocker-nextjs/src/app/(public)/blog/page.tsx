'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: { name: string; avatar: string };
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const posts: BlogPost[] = [
  {
    id: '1',
    title: 'Stok Yönetiminde Yapay Zeka: 2024 Trendleri',
    excerpt: 'Yapay zeka teknolojilerinin stok yönetimini nasıl dönüştürdüğünü ve işletmelerin bu değişime nasıl uyum sağlayabileceğini inceliyoruz.',
    category: 'Teknoloji',
    author: { name: 'Ahmet Yılmaz', avatar: '👨‍💼' },
    date: '10 Aralık 2024',
    readTime: '8 dk',
    image: '📊',
    featured: true,
  },
  {
    id: '2',
    title: 'E-ticarette Envanter Optimizasyonu',
    excerpt: 'Online satış yapan işletmeler için envanter yönetimi stratejileri ve en iyi uygulamalar.',
    category: 'E-ticaret',
    author: { name: 'Elif Kaya', avatar: '👩‍💻' },
    date: '5 Aralık 2024',
    readTime: '6 dk',
    image: '🛒',
  },
  {
    id: '3',
    title: 'Depo Verimliliğini Artırmanın 10 Yolu',
    excerpt: 'Depo operasyonlarınızı optimize etmek ve maliyetleri düşürmek için pratik öneriler.',
    category: 'Operasyon',
    author: { name: 'Mehmet Demir', avatar: '👨‍💻' },
    date: '28 Kasım 2024',
    readTime: '5 dk',
    image: '🏭',
  },
  {
    id: '4',
    title: 'Barkod Sistemleri: Kapsamlı Rehber',
    excerpt: 'Farklı barkod türleri, okuyucular ve işletmeniz için en uygun sistemi seçme rehberi.',
    category: 'Teknoloji',
    author: { name: 'Zeynep Aksoy', avatar: '👩‍🎨' },
    date: '20 Kasım 2024',
    readTime: '7 dk',
    image: '📱',
  },
  {
    id: '5',
    title: 'Stok Sayımı: En İyi Uygulamalar',
    excerpt: 'Döngüsel sayım, tam sayım ve stok doğruluğunu artırmak için stratejiler.',
    category: 'Operasyon',
    author: { name: 'Ahmet Yılmaz', avatar: '👨‍💼' },
    date: '15 Kasım 2024',
    readTime: '6 dk',
    image: '📋',
  },
  {
    id: '6',
    title: 'Tedarik Zinciri Yönetiminde Dijitalleşme',
    excerpt: 'Modern tedarik zinciri yönetimi araçları ve dijital dönüşüm stratejileri.',
    category: 'Strateji',
    author: { name: 'Elif Kaya', avatar: '👩‍💻' },
    date: '10 Kasım 2024',
    readTime: '9 dk',
    image: '🔗',
  },
];

const categories = ['Tümü', 'Teknoloji', 'E-ticaret', 'Operasyon', 'Strateji'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const filteredPosts = posts.filter(post => activeCategory === 'Tümü' || post.category === activeCategory);
  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">Dokümantasyon</Link>
            <Link href="/updates" className="text-slate-500 hover:text-slate-900 transition-colors">Güncellemeler</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Blog</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Stok yönetimi, e-ticaret ve işletme verimliliği hakkında en güncel içerikler.</p>
        </motion.div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'}`}>
              {category}
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        {featuredPost && activeCategory === 'Tümü' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <Link href={`/blog/${featuredPost.id}`} className="block p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="text-8xl">{featuredPost.image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-slate-900 text-white text-xs rounded-full">Öne Çıkan</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{featuredPost.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">{featuredPost.title}</h2>
                  <p className="text-slate-500 mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{featuredPost.author.avatar}</span>
                      {featuredPost.author.name}
                    </span>
                    <span>{featuredPost.date}</span>
                    <span>{featuredPost.readTime} okuma</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
              <Link href={`/blog/${post.id}`} className="block p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group h-full">
                <div className="text-5xl mb-4">{post.image}</div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">{post.category}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2 group-hover:text-slate-700 transition-colors">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="text-base">{post.author.avatar}</span>
                    {post.author.name}
                  </span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Bültene Abone Olun</h2>
          <p className="text-slate-500 mb-6">En son blog yazılarımızdan haberdar olun.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="E-posta adresiniz" className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" />
            <button className="px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">Abone Ol</button>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/blog" className="text-slate-900">Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
