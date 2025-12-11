'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

export default function CookiesPage() {
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
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Kullanim Sartlari</Link>
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
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Cerez Politikasi</h1>
          <p className="text-gray-400">Son guncelleme: 11 Aralik 2024</p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">1</span>
              Cerezler Nedir?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Cerezler (cookies), web sitelerinin tarayiciniza gonderip cihazinizda sakladigi kucuk metin dosyalaridir.
              Bu dosyalar, web sitesinin sizi tanimasina, tercihlerinizi hatirlamasina ve size daha iyi bir kullanici
              deneyimi sunmasina yardimci olur. Cerezler, oturum bilgileri, dil tercihleri ve kullanim analizleri gibi
              cesitli amaclarla kullanilir.
            </p>
          </motion.section>

          {/* Cookie Types */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">2</span>
              Kullandigimiz Cerez Turleri
            </h2>
            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="p-4 bg-emerald-900/30 rounded-xl border border-emerald-700/30">
                <div className="flex items-center mb-2">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></span>
                  <h3 className="font-semibold text-white">Zorunlu Cerezler</h3>
                  <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Her zaman aktif</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Bu cerezler, web sitesinin temel islevlerinin calismasi icin zorunludur. Bunlar olmadan
                  hizmetlerimizi kullanamazsiniz.
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Oturum yonetimi
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guvenlik dogrulamasi
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yuk dengeleme
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    CSRF korumasi
                  </div>
                </div>
              </div>

              {/* Performance Cookies */}
              <div className="p-4 bg-blue-900/30 rounded-xl border border-blue-700/30">
                <div className="flex items-center mb-2">
                  <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
                  <h3 className="font-semibold text-white">Performans Cerezleri</h3>
                  <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Opsiyonel</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Bu cerezler, web sitesinin nasil kullanildigini anlamamiza yardimci olur ve hizmetlerimizi
                  iyilestirmemize olanak tanir.
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Sayfa yuklenme suresi
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Hata raporlari
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Kullanim istatistikleri
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    A/B testleri
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-700/30">
                <div className="flex items-center mb-2">
                  <span className="w-3 h-3 bg-purple-400 rounded-full mr-3"></span>
                  <h3 className="font-semibold text-white">Islevsel Cerezler</h3>
                  <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Opsiyonel</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Bu cerezler, tercihlerinizi hatirlamak ve size kisisellesirilmis bir deneyim sunmak icin kullanilir.
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dil tercihi
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tema ayarlari
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Panel duzen tercihleri
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Bildirim tercihleri
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-rose-900/30 rounded-xl border border-rose-700/30">
                <div className="flex items-center mb-2">
                  <span className="w-3 h-3 bg-rose-400 rounded-full mr-3"></span>
                  <h3 className="font-semibold text-white">Pazarlama Cerezleri</h3>
                  <span className="ml-auto text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded">Opsiyonel</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Bu cerezler, size ilgi alanlariniza uygun reklamlar gostermek ve pazarlama kampanyalarimizin
                  etkinligini olcmek icin kullanilir.
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-rose-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Reklam hedefleme
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-rose-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kampanya izleme
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-rose-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Donusum olcumu
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 text-rose-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yeniden pazarlama
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookie Details Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">3</span>
              Cerez Detaylari
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Cerez Adi</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Tur</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Sure</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amac</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">auth_token</td>
                    <td className="py-3 px-4"><span className="text-emerald-400">Zorunlu</span></td>
                    <td className="py-3 px-4">Oturum</td>
                    <td className="py-3 px-4">Kullanici kimlik dogrulamasi</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">refresh_token</td>
                    <td className="py-3 px-4"><span className="text-emerald-400">Zorunlu</span></td>
                    <td className="py-3 px-4">7 gun</td>
                    <td className="py-3 px-4">Oturum yenileme</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">tenant_code</td>
                    <td className="py-3 px-4"><span className="text-emerald-400">Zorunlu</span></td>
                    <td className="py-3 px-4">30 gun</td>
                    <td className="py-3 px-4">Calisma alani tanimlamasi</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">_ga</td>
                    <td className="py-3 px-4"><span className="text-blue-400">Performans</span></td>
                    <td className="py-3 px-4">2 yil</td>
                    <td className="py-3 px-4">Google Analytics kullanici kimligi</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">theme</td>
                    <td className="py-3 px-4"><span className="text-purple-400">Islevsel</span></td>
                    <td className="py-3 px-4">1 yil</td>
                    <td className="py-3 px-4">Tema tercihi (acik/koyu)</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">locale</td>
                    <td className="py-3 px-4"><span className="text-purple-400">Islevsel</span></td>
                    <td className="py-3 px-4">1 yil</td>
                    <td className="py-3 px-4">Dil tercihi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Cookie Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">4</span>
              Cerezleri Yonetme
            </h2>
            <p className="text-gray-300 mb-4">
              Cerezleri tarayici ayarlarinizdan yonetebilirsiniz. Asagidaki tarayicilar icin cerez ayarlari:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Google Chrome', link: 'chrome://settings/cookies' },
                { name: 'Mozilla Firefox', link: 'about:preferences#privacy' },
                { name: 'Safari', link: 'Tercihler > Gizlilik' },
                { name: 'Microsoft Edge', link: 'edge://settings/privacy' },
              ].map((browser, index) => (
                <div key={index} className="p-3 bg-gray-700/30 rounded-lg flex items-center justify-between">
                  <span className="text-white font-medium">{browser.name}</span>
                  <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{browser.link}</code>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-amber-900/20 rounded-xl border border-amber-700/30">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-gray-300">
                  <strong className="text-amber-400">Dikkat:</strong> Zorunlu cerezleri devre disi birakmaniz durumunda
                  hizmetlerimizin bazi ozellikleri duzgun calismayabilir.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Third Party Cookies */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">5</span>
              Ucuncu Taraf Cerezleri
            </h2>
            <p className="text-gray-300 mb-4">
              Hizmetlerimizde kullandigimiz ucuncu taraf hizmet saglayicilari ve cerezleri:
            </p>
            <div className="space-y-3">
              {[
                { name: 'Google Analytics', purpose: 'Web sitesi trafik analizi ve kullanici davranisi izleme', link: 'https://policies.google.com/privacy' },
                { name: 'Cloudflare', purpose: 'Guvenlik, performans ve CDN hizmetleri', link: 'https://www.cloudflare.com/privacypolicy/' },
                { name: 'Sentry', purpose: 'Hata izleme ve performans takibi', link: 'https://sentry.io/privacy/' },
              ].map((service, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{service.name}</span>
                    <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300">
                      Gizlilik Politikasi →
                    </a>
                  </div>
                  <p className="text-sm text-gray-400">{service.purpose}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Updates */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">6</span>
              Politika Guncellemeleri
            </h2>
            <p className="text-gray-300">
              Bu cerez politikasini zaman zaman guncelleyebiliriz. Onemli degisiklikler yapildiginda
              sizi bilgilendirecegiz. Hizmetlerimizi kullanmaya devam etmeniz, guncellenmis politikayi
              kabul ettiginiz anlamina gelir.
            </p>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl border border-amber-700/30"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">7</span>
              Iletisim
            </h2>
            <p className="text-gray-300 mb-4">
              Cerez politikamiz hakkinda sorulariniz icin bizimle iletisime gecebilirsiniz:
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>privacy@stoocker.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            href="/"
            className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Don
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
              <Link href="/cookies" className="text-amber-400">Cerezler</Link>
              <Link href="/help" className="hover:text-white transition-colors">Yardim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
