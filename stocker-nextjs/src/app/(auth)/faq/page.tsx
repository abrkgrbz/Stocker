'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  { category: 'Genel', question: 'Stocker nedir?', answer: 'Stocker, işletmelerin stok ve envanter yönetimini kolaylaştıran bulut tabanlı bir SaaS platformudur. Ürün takibi, sipariş yönetimi, raporlama ve analiz gibi kapsamlı özellikler sunar.' },
  { category: 'Genel', question: 'Stocker hangi sektörlere uygundur?', answer: 'Stocker, perakende, toptan satış, e-ticaret, üretim, lojistik ve daha birçok sektördeki işletmeler için uygundur. Esnek yapısı sayesinde farklı iş modellerine adapte olabilir.' },
  { category: 'Fiyatlandırma', question: 'Ücretsiz deneme süresi var mı?', answer: 'Evet! 14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz. Kredi kartı bilgisi gerekmez.' },
  { category: 'Fiyatlandırma', question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?', answer: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Kurumsal müşterilerimiz için fatura kesimi de mümkündür.' },
  { category: 'Fiyatlandırma', question: 'İstediğim zaman iptal edebilir miyim?', answer: 'Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. Taahhüt yoktur. İptal ettiğinizde mevcut dönem sonuna kadar hizmeti kullanmaya devam edebilirsiniz.' },
  { category: 'Özellikler', question: 'Kaç kullanıcı ekleyebilirim?', answer: 'Kullanıcı sayısı seçtiğiniz pakete göre değişir. Starter pakette 3, Professional pakette 10, Enterprise pakette sınırsız kullanıcı ekleyebilirsiniz.' },
  { category: 'Özellikler', question: 'Mobil uygulama var mı?', answer: 'Evet! iOS ve Android için mobil uygulamamız mevcuttur. Stok sayımı, barkod okuma ve anlık bildirimler gibi özellikler mobilde de kullanılabilir.' },
  { category: 'Özellikler', question: 'E-ticaret platformlarıyla entegre olabilir mi?', answer: 'Evet, Shopify, WooCommerce, Trendyol, Hepsiburada ve daha birçok platformla entegrasyon sağlıyoruz.' },
  { category: 'Güvenlik', question: 'Verilerim güvende mi?', answer: 'Kesinlikle. Verileriniz 256-bit SSL şifreleme ile korunur. AWS altyapısında barındırılır ve günlük yedekleme yapılır. KVKK ve GDPR uyumludur.' },
  { category: 'Güvenlik', question: 'İki faktörlü kimlik doğrulama var mı?', answer: 'Evet, hesabınızı korumak için SMS veya authenticator uygulaması ile 2FA kullanabilirsiniz.' },
  { category: 'Destek', question: 'Teknik destek nasıl alırım?', answer: 'E-posta, canlı sohbet ve telefon ile 7/24 destek alabilirsiniz. Enterprise müşterilerimize özel hesap yöneticisi atanır.' },
  { category: 'Destek', question: 'Eğitim ve onboarding desteği var mı?', answer: 'Evet! Ücretsiz onboarding eğitimi, video tutorials ve kapsamlı dokümantasyon sunuyoruz. Kurumsal müşteriler için yerinde eğitim de mümkündür.' },
];

const categories = ['Tümü', 'Genel', 'Fiyatlandırma', 'Özellikler', 'Güvenlik', 'Destek'];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'Tümü' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="brightness-0 invert object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Dokümantasyon</Link>
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">Destek</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-gray-400">Merak ettiklerinizin cevaplarını burada bulabilirsiniz.</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Soru ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400">Aramanızla eşleşen soru bulunamadı.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <div className={`p-6 bg-gray-800/50 rounded-2xl border transition-colors ${openIndex === index ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
                  <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">{faq.category}</span>
                      <span className="font-medium text-white">{faq.question}</span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <p className="mt-4 text-gray-400 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 p-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/20 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Başka sorunuz mu var?</h2>
          <p className="text-gray-400 mb-6">Destek ekibimiz size yardımcı olmaya hazır.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/support" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">Destek Al</Link>
            <Link href="/contact" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors">İletişime Geç</Link>
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link>
              <Link href="/faq" className="text-amber-400">SSS</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
