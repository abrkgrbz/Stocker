'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-slate-600 hover:text-slate-900 transition-colors">Dokümantasyon</Link>
            <Link href="/faq" className="text-slate-600 hover:text-slate-900 transition-colors">SSS</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-600 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Destek Merkezi</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Size nasıl yardımcı olabiliriz? 7/24 destek ekibimiz yanınızda.</p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {supportOptions.map((option, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              {option.href ? (
                <Link href={option.href} className="block p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all h-full">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{option.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{option.description}</p>
                  <span className={`inline-block px-4 py-2 bg-gradient-to-r ${option.color} text-white text-sm font-medium rounded-lg`}>{option.action}</span>
                </Link>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all h-full">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{option.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{option.description}</p>
                  <button className={`px-4 py-2 bg-gradient-to-r ${option.color} text-white text-sm font-medium rounded-lg`}>{option.action}</button>
                  {option.available && <span className="ml-2 inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Hızlı Erişim</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href} className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all group">
                <span className="text-2xl">{link.icon}</span>
                <span className="text-slate-900 group-hover:text-slate-700 transition-colors">{link.title}</span>
                <svg className="w-4 h-4 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Ticket Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Destek Talebi Oluştur</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Talebiniz Oluşturuldu!</h3>
                <p className="text-slate-600 mb-4">Talep numaranız: #ST-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                <p className="text-slate-500 text-sm">En kısa sürede size dönüş yapacağız.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Konu</label>
                    <input type="text" required value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" placeholder="Sorununuzu kısaca açıklayın" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Öncelik</label>
                    <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900">
                      <option value="low">Düşük</option>
                      <option value="medium">Normal</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Açıklama</label>
                  <textarea required rows={5} value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 resize-none" placeholder="Sorununuzu detaylı olarak açıklayın..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                  {isSubmitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-600 transition-colors group">
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
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-600">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/support" className="text-slate-900">Destek</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
