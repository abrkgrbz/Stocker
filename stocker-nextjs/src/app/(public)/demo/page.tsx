'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const features = [
  { icon: '📦', title: 'Stok Takibi', description: 'Gerçek zamanlı stok görünümü' },
  { icon: '📊', title: 'Raporlama', description: 'Detaylı analiz ve raporlar' },
  { icon: '🔔', title: 'Bildirimler', description: 'Akıllı stok uyarıları' },
  { icon: '📱', title: 'Mobil', description: 'Her yerden erişim' },
];

export default function DemoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', employees: '' });
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/#features" className="text-slate-500 hover:text-slate-900 transition-colors">Özellikler</Link>
            <Link href="/#pricing" className="text-slate-500 hover:text-slate-900 transition-colors">Fiyatlandırma</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Ücretsiz Demo</h1>
            <p className="text-xl text-slate-500 mb-8">
              Stocker&apos;ın tüm özelliklerini keşfedin. Uzmanlarımız size özel bir demo sunacak.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                  <p className="text-slate-400 text-xs">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {['30 dakikalık kişiselleştirilmiş demo', 'Sorularınıza anında cevap', 'Özel fiyat teklifi', 'Ücretsiz danışmanlık'].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-600">
                  <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Talebiniz Alındı!</h2>
                  <p className="text-slate-500 mb-6">En kısa sürede sizinle iletişime geçeceğiz.</p>
                  <Link href="/" className="inline-block px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors">Ana Sayfaya Dön</Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Demo Talep Formu</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-500 mb-2">Ad Soyad *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" placeholder="Ahmet Yılmaz" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-2">E-posta *</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" placeholder="ahmet@sirket.com" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-500 mb-2">Şirket *</label>
                        <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" placeholder="Şirket Adı" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-500 mb-2">Telefon</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900" placeholder="+90 5XX XXX XX XX" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-2">Çalışan Sayısı</label>
                      <select value={formData.employees} onChange={(e) => setFormData({ ...formData, employees: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900">
                        <option value="">Seçiniz</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                      {isSubmitting ? 'Gönderiliyor...' : 'Demo Talep Et'}
                    </button>
                    <p className="text-center text-slate-400 text-xs">Bilgileriniz gizli tutulacaktır.</p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>

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
              <Link href="/demo" className="text-slate-900">Demo</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
