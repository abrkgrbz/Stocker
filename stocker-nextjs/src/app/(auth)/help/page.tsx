'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

const faqItems = [
  {
    category: 'Genel',
    questions: [
      {
        q: 'Stoocker nedir?',
        a: 'Stoocker, isletmeler icin gelistirilmis kapsamli bir is yonetim platformudur. Stok takibi, satis, satin alma, insan kaynaklari, finans ve CRM modullerini tek bir yerde birlestirerek isletmenizi verimli bir sekilde yonetmenizi saglar.'
      },
      {
        q: 'Nasil kayit olabilirim?',
        a: 'Ana sayfamizdaki "Ucretsiz Dene" butonuna tiklayarak kayit formunu doldurabilirsiniz. 14 gunluk ucretsiz deneme sureniz ile tum ozellikleri test edebilirsiniz.'
      },
      {
        q: 'Mobil uygulama var mi?',
        a: 'Evet! Stoocker iOS ve Android icin mobil uygulamalara sahiptir. App Store ve Google Play Store uzerinden indirebilirsiniz.'
      }
    ]
  },
  {
    category: 'Abonelik',
    questions: [
      {
        q: 'Hangi odeme yontemlerini kabul ediyorsunuz?',
        a: 'Kredi karti, banka karti ve havale/EFT ile odeme yapabilirsiniz. Kurumsal musterilerimiz icin fatura kesimi de yapilmaktadir.'
      },
      {
        q: 'Aboneligimi nasil iptal edebilirim?',
        a: 'Ayarlar > Abonelik menusu uzerinden aboneliginizi istediginiz zaman iptal edebilirsiniz. Iptal islemi mevcut fatura doneminizin sonunda gecerli olur.'
      },
      {
        q: 'Plan degisikligi yapabilir miyim?',
        a: 'Evet, istediginiz zaman planinizi yukseltebilir veya dusur ebilirsiniz. Degisiklik bir sonraki fatura doneminizde gecerli olur.'
      }
    ]
  },
  {
    category: 'Teknik',
    questions: [
      {
        q: 'Verilerim guvenli mi?',
        a: 'Evet, verileriniz 256-bit SSL sifreleme ile korunmaktadir. Ayrica ISO 27001 sertifikali veri merkezlerinde barindirilmakta ve gunluk olarak yedeklenmektedir.'
      },
      {
        q: 'API entegrasyonu sagliyor musunuz?',
        a: 'Evet, RESTful API ile diger sistemlerinizle entegrasyon saglayabilirsiniz. API dokumantasyonumuza developer.stoocker.com adresinden ulasabilirsiniz.'
      },
      {
        q: 'Excel/CSV dosyalari ile veri aktarimi yapabilir miyim?',
        a: 'Evet, toplu veri yukleme ve disa aktarma ozelligi ile Excel ve CSV formatlarinda veri transferi yapabilirsiniz.'
      }
    ]
  },
  {
    category: 'Destek',
    questions: [
      {
        q: 'Canli destek saatleri nedir?',
        a: 'Canli destek ekibimiz hafta ici 09:00 - 18:00 saatleri arasinda hizmet vermektedir. Acil durumlar icin 7/24 e-posta destegi sunuyoruz.'
      },
      {
        q: 'Egitim aliyor musunuz?',
        a: 'Evet, yeni musterilerimize ucretsiz online egitim veriyoruz. Ayrica video egitimlerimiz ve detayli dokumantasyonumuz mevcuttur.'
      },
      {
        q: 'Ozel gelistirme taleplerim olabilir mi?',
        a: 'Enterprise planinda ozel gelistirme talepleri degerlendirilmektedir. Detaylar icin satis ekibimizle iletisime gecebilirsiniz.'
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const filteredFaq = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category =>
    (selectedCategory === null || category.category === selectedCategory) &&
    category.questions.length > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Stoocker Logo"
              width={120}
              height={40}
              className="brightness-0 invert object-contain"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Gizlilik</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Sartlar</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giris Yap</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Yardim Merkezi</h1>
          <p className="text-gray-400 mb-8">Sorulariniza hizla cevap bulun veya bizimle iletisime gecin</p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'E-posta',
              desc: 'destek@stoocker.com',
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              ),
              title: 'Telefon',
              desc: '+90 (850) 123 45 67',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              title: 'Canli Destek',
              desc: 'Hafta ici 09:00 - 18:00',
              color: 'from-emerald-500 to-teal-500'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 text-center cursor-pointer hover:border-gray-600/50 transition-colors"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 text-white`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
            }`}
          >
            Tumu
          </button>
          {faqItems.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === category.category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
              }`}
            >
              {category.category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFaq.map((category, categoryIndex) => (
            <motion.section
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + categoryIndex * 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></span>
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, index) => {
                  const itemId = `${categoryIndex}-${index}`
                  const isExpanded = expandedItems.includes(itemId)

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                      >
                        <span className="font-medium text-white pr-4">{item.q}</span>
                        <motion.svg
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 text-gray-400 border-t border-gray-700/50 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 p-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-700/30 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Hala Yardima mi Ihtiyaciniz Var?</h2>
          <p className="text-gray-300 mb-6">
            Sorularinizi yanitlamaktan mutluluk duyariz. Destek ekibimiz size yardimci olmaya hazir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:destek@stoocker.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-posta Gonder
            </a>
            <a
              href="tel:+908501234567"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white font-medium rounded-xl hover:bg-gray-600 transition-all hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Bizi Arayin
            </a>
          </div>
        </motion.section>

        {/* Resources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">Faydali Kaynaklar</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Dokumantasyon',
                desc: 'Detayli kullanim klavuzlari',
                href: '/docs'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Video Egitimler',
                desc: 'Adim adim video anlatimlar',
                href: '/tutorials'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
                title: 'API Dokumantasyonu',
                desc: 'Gelistirici kaynaklari',
                href: '/api-docs'
              }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all hover:scale-[1.02] group"
              >
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:text-purple-300 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center mt-12"
        >
          <Link
            href="/login"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Girise Don
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div>&copy; 2024 Stoocker. Tum haklari saklidir.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Sartlar</Link>
              <Link href="/help" className="text-emerald-400">Yardim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
