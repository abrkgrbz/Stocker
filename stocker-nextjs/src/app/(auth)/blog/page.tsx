'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="brightness-0 invert object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Dokümantasyon</Link>
            <Link href="/updates" className="text-gray-400 hover:text-white transition-colors">Güncellemeler</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Stok yönetimi, e-ticaret ve işletme verimliliği hakkında en güncel içerikler.</p>
        </motion.div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>
              {category}
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        {featuredPost && activeCategory === 'Tümü' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <Link href={`/blog/${featuredPost.id}`} className="block p-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all group">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="text-8xl">{featuredPost.image}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Öne Çıkan</span>
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">{featuredPost.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{featuredPost.title}</h2>
                  <p className="text-gray-400 mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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
              <Link href={`/blog/${post.id}`} className="block p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all group h-full">
                <div className="text-5xl mb-4">{post.image}</div>
                <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">{post.category}</span>
                <h3 className="text-lg font-bold text-white mt-3 mb-2 group-hover:text-purple-300 transition-colors">{post.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-16 p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Bültene Abone Olun</h2>
          <p className="text-gray-400 mb-6">En son blog yazılarımızdan haberdar olun.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="E-posta adresiniz" className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">Abone Ol</button>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link>
              <Link href="/blog" className="text-indigo-400">Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
