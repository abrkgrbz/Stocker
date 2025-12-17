'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/terms" className="text-slate-600 hover:text-slate-900 transition-colors">Kullanim Sartlari</Link>
            <Link href="/help" className="text-slate-600 hover:text-slate-900 transition-colors">Yardim</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-600 font-medium transition-colors">Giris Yap</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Gizlilik Politikasi</h1>
          <p className="text-slate-500">Son guncelleme: 11 Aralik 2024</p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Giris
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Stoocker olarak, kullanicilarimizin gizliligini korumaya buyuk onem veriyoruz. Bu gizlilik politikasi,
              hizmetlerimizi kullanirken toplamis oldugumuz kisisel verilerin nasil toplandigi, kullanildigi,
              saklandigi ve korundugunun aciklamaktadir.
            </p>
          </motion.section>

          {/* Data Collection */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Toplanan Veriler
            </h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Hesap Bilgileri</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-slate-600">
                  <li>Ad, soyad ve e-posta adresi</li>
                  <li>Telefon numarasi</li>
                  <li>Sirket/Isletme bilgileri</li>
                  <li>Fatura ve odeme bilgileri</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Kullanim Verileri</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-slate-600">
                  <li>IP adresi ve cihaz bilgileri</li>
                  <li>Tarayici turu ve surumu</li>
                  <li>Sayfa goruntumeleri ve tiklamalar</li>
                  <li>Oturum suresi ve kullanim aliskanliklari</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Is Verileri</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-slate-600">
                  <li>Stok ve envanter bilgileri</li>
                  <li>Satis ve satin alma kayitlari</li>
                  <li>Musteri ve tedarikci verileri</li>
                  <li>Finansal raporlar</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Usage */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Verilerin Kullanimi
            </h2>
            <p className="text-slate-600 mb-4">Toplamis oldugumuz verileri asagidaki amaclarla kullaniyoruz:</p>
            <ul className="space-y-3">
              {[
                { icon: '🔧', text: 'Hizmetlerimizi sunmak ve gelistirmek' },
                { icon: '📊', text: 'Kullanici deneyimini kisisellestirmek' },
                { icon: '🔒', text: 'Hesap guvenligini saglamak' },
                { icon: '📧', text: 'Onemli guncellemeler ve bildirimler gondermek' },
                { icon: '📈', text: 'Hizmet analizleri ve iyilestirmeler yapmak' },
                { icon: '⚖️', text: 'Yasal yukumlulukleri yerine getirmek' },
              ].map((item, index) => (
                <li key={index} className="flex items-center text-slate-600">
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Data Protection */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">4</span>
              Veri Guvenligi
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: '256-bit SSL Sifreleme', desc: 'Tum veri transferleri sifrelidir' },
                { title: 'Guvenli Veri Merkezleri', desc: 'ISO 27001 sertifikali altyapi' },
                { title: 'Duzenli Yedekleme', desc: 'Verileriniz gunluk olarak yedeklenir' },
                { title: 'Erisim Kontrolu', desc: 'Rol tabanli yetkilendirme sistemi' },
              ].map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                  <div className="text-sm text-slate-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* User Rights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">5</span>
              Kullanici Haklari
            </h2>
            <p className="text-slate-600 mb-4">KVKK ve GDPR kapsaminda asagidaki haklara sahipsiniz:</p>
            <div className="space-y-3">
              {[
                'Kisisel verilerinize erisim talep etme',
                'Yanlis veya eksik verilerin duzeltilmesini isteme',
                'Verilerinizin silinmesini talep etme (unutulma hakki)',
                'Veri islemenin kisitlanmasini isteme',
                'Verilerinizi tasima hakki',
                'Otomatik karar almaya itiraz etme',
              ].map((right, index) => (
                <div key={index} className="flex items-center text-slate-600">
                  <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {right}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Cookies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">6</span>
              Cerezler (Cookies)
            </h2>
            <p className="text-slate-600 mb-4">
              Hizmetlerimizin duzgun calismasi icin cerezler kullaniyoruz. Cerez turleri:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Zorunlu Cerezler:</span>
                <span className="text-slate-600 ml-2">Oturum yonetimi ve guvenlik icin gereklidir</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Performans Cerezleri:</span>
                <span className="text-slate-600 ml-2">Hizmet iyilestirme icin anonim veriler toplar</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Tercih Cerezleri:</span>
                <span className="text-slate-600 ml-2">Kullanici tercihlerini hatirlar</span>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">7</span>
              Iletisim
            </h2>
            <p className="text-slate-600 mb-4">
              Gizlilik politikamiz hakkinda sorulariniz icin bizimle iletisime gecebilirsiniz:
            </p>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>privacy@stoocker.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+90 (850) 123 45 67</span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/login"
            className="inline-flex items-center text-slate-900 hover:text-slate-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Girise Don
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-600">
            <div>&copy; 2024 Stoocker. Tum haklari saklidir.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-900">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Sartlar</Link>
              <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cerezler</Link>
              <Link href="/help" className="hover:text-slate-900 transition-colors">Yardim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
