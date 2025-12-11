'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

const contactMethods = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'E-posta',
    value: 'info@stocker.com',
    href: 'mailto:info@stocker.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Telefon',
    value: '+90 (850) 123 45 67',
    href: 'tel:+908501234567',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Adres',
    value: 'Maslak, Sarıyer, İstanbul',
    href: 'https://maps.google.com',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Canlı Destek',
    value: '7/24 Online',
    href: '/support',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
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
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">Destek</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">İletişim</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız.</p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a key={index} href={method.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all group">
              <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {method.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{method.title}</h3>
              <p className="text-gray-400 text-sm">{method.value}</p>
            </motion.a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">Bize Yazın</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Mesajınız Alındı!</h3>
                  <p className="text-gray-400">En kısa sürede size dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Adınız</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" placeholder="Ahmet Yılmaz" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" placeholder="ahmet@sirket.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Konu</label>
                    <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500">
                      <option value="">Konu seçin</option>
                      <option value="sales">Satış</option>
                      <option value="support">Teknik Destek</option>
                      <option value="partnership">İş Ortaklığı</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Mesajınız</label>
                    <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none" placeholder="Mesajınızı yazın..." />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                    {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Map & Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
            <div className="p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-400">Maslak, Sarıyer, İstanbul</p>
              </div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <h3 className="font-bold text-white mb-4">Çalışma Saatleri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Pazartesi - Cuma</span><span className="text-white">09:00 - 18:00</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Cumartesi</span><span className="text-white">10:00 - 14:00</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Pazar</span><span className="text-gray-500">Kapalı</span></div>
              </div>
            </div>
          </motion.div>
        </div>

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
              <Link href="/contact" className="text-purple-400">İletişim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
