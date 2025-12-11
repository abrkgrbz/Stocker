'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

const supportOptions = [
  {
    icon: '💬',
    title: 'Canlı Destek',
    description: 'Uzmanlarımızla anlık sohbet edin',
    action: 'Sohbet Başlat',
    color: 'from-emerald-500 to-teal-500',
    available: true,
  },
  {
    icon: '📧',
    title: 'E-posta Desteği',
    description: 'Detaylı sorularınız için',
    action: 'E-posta Gönder',
    href: 'mailto:support@stocker.com',
    color: 'from-blue-500 to-indigo-500',
    available: true,
  },
  {
    icon: '📞',
    title: 'Telefon Desteği',
    description: '+90 (850) 123 45 67',
    action: 'Ara',
    href: 'tel:+908501234567',
    color: 'from-amber-500 to-orange-500',
    available: true,
  },
  {
    icon: '📚',
    title: 'Dokümantasyon',
    description: 'Kapsamlı kullanım kılavuzları',
    action: 'Dokumanları İncele',
    href: '/docs',
    color: 'from-purple-500 to-pink-500',
    available: true,
  },
];

const quickLinks = [
  { title: 'Hesap ve Faturalama', icon: '💳', href: '/docs/billing' },
  { title: 'Başlangıç Rehberi', icon: '🚀', href: '/docs/quick-start' },
  { title: 'Entegrasyonlar', icon: '🔗', href: '/docs/integrations' },
  { title: 'API Dokümantasyonu', icon: '⚙️', href: '/docs/api' },
  { title: 'Güvenlik', icon: '🔒', href: '/docs/security' },
  { title: 'Sık Sorulan Sorular', icon: '❓', href: '/faq' },
];

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState({ subject: '', priority: 'medium', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="brightness-0 invert object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Dokümantasyon</Link>
            <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">SSS</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Destek Merkezi</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Size nasıl yardımcı olabiliriz? 7/24 destek ekibimiz yanınızda.</p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {supportOptions.map((option, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              {option.href ? (
                <Link href={option.href} className="block p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all h-full">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="font-bold text-white mb-1">{option.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{option.description}</p>
                  <span className={`inline-block px-4 py-2 bg-gradient-to-r ${option.color} text-white text-sm font-medium rounded-lg`}>{option.action}</span>
                </Link>
              ) : (
                <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all h-full">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="font-bold text-white mb-1">{option.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{option.description}</p>
                  <button className={`px-4 py-2 bg-gradient-to-r ${option.color} text-white text-sm font-medium rounded-lg`}>{option.action}</button>
                  {option.available && <span className="ml-2 inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Hızlı Erişim</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href} className="flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/30 rounded-xl transition-all group">
                <span className="text-2xl">{link.icon}</span>
                <span className="text-white group-hover:text-purple-300 transition-colors">{link.title}</span>
                <svg className="w-4 h-4 text-gray-600 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Ticket Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">Destek Talebi Oluştur</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Talebiniz Oluşturuldu!</h3>
                <p className="text-gray-400 mb-4">Talep numaranız: #ST-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                <p className="text-gray-500 text-sm">En kısa sürede size dönüş yapacağız.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Konu</label>
                    <input type="text" required value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" placeholder="Sorununuzu kısaca açıklayın" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Öncelik</label>
                    <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500">
                      <option value="low">Düşük</option>
                      <option value="medium">Normal</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Açıklama</label>
                  <textarea required rows={5} value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" placeholder="Sorununuzu detaylı olarak açıklayın..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                  {isSubmitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
                </button>
              </form>
            )}
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
              <Link href="/support" className="text-emerald-400">Destek</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
