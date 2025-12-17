'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function TermsPage() {
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
            <Link href="/privacy" className="text-slate-600 hover:text-slate-900 transition-colors">Gizlilik</Link>
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Kullanim Sartlari</h1>
          <p className="text-slate-500">Son guncelleme: 11 Aralik 2024</p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Acceptance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Sartlarin Kabulu
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Stoocker hizmetlerini kullanarak, bu kullanim sartlarini kabul etmis sayilirsiniz. Bu sartlari kabul etmiyorsaniz,
              lutfen hizmetlerimizi kullanmayiniz. Stoocker, bu sartlari onceden haber vermeksizin degistirme hakkini sakli tutar.
            </p>
          </motion.section>

          {/* Service Description */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Hizmet Tanimi
            </h2>
            <p className="text-slate-600 mb-4">
              Stoocker, isletmeler icin bulut tabanli bir envanter ve is yonetim platformudur. Hizmetlerimiz sunlari icerir:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: '📦', title: 'Stok Yonetimi', desc: 'Envanter takibi ve optimizasyonu' },
                { icon: '💰', title: 'Satis Yonetimi', desc: 'Satis surecleri ve raporlama' },
                { icon: '🛒', title: 'Satin Alma', desc: 'Tedarikci ve siparis yonetimi' },
                { icon: '👥', title: 'IK Yonetimi', desc: 'Personel ve bordro islemleri' },
                { icon: '📊', title: 'Finans', desc: 'Muhasebe ve mali raporlar' },
                { icon: '🤝', title: 'CRM', desc: 'Musteri iliskileri yonetimi' },
              ].map((item, index) => (
                <div key={index} className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="font-semibold text-slate-900">{item.title}</span>
                  </div>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* User Obligations */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Kullanici Yukumlulukleri
            </h2>
            <p className="text-slate-600 mb-4">Hizmetlerimizi kullanirken asagidaki kurallara uymakla yukumlusunuz:</p>
            <ul className="space-y-3">
              {[
                'Dogru ve guncel bilgiler saglamak',
                'Hesap guvenligini korumak ve sifrelerini gizli tutmak',
                'Hizmetleri yasa disi amaclarla kullanmamak',
                'Diger kullanicilarin haklarini ihlal etmemek',
                'Sisteme yetkisiz erisim denemelerinde bulunmamak',
                'Zararli yazilim veya virus yaymamak',
              ].map((item, index) => (
                <li key={index} className="flex items-start text-slate-600">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Subscription & Payment */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">4</span>
              Abonelik ve Odeme
            </h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Abonelik Planlari</h3>
                <p className="text-slate-600">Farkli ihtiyaclara yonelik cesitli abonelik planlari sunuyoruz. Her planin ozellikleri ve fiyatlandirmasi web sitemizde belirtilmistir.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Odeme Kosullari</h3>
                <p className="text-slate-600">Odemeler aylik veya yillik olarak alinir. Yillik odemelerde indirim uygulanir. Odemeler otomatik olarak yenilenir.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Iptal ve Iade</h3>
                <p className="text-slate-600">Aboneliginizi istediginiz zaman iptal edebilirsiniz. Iptal, mevcut donem sonunda yururluge girer. Kullanilmamis donemler icin iade yapilmaz.</p>
              </div>
            </div>
          </motion.section>

          {/* Intellectual Property */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">5</span>
              Fikri Mulkiyet
            </h2>
            <p className="text-slate-600 mb-4">
              Stoocker platformu, tum icerigi, ozellikleri ve islevselligi (yazilim, metin, grafikler, logolar dahil) Stoocker'a aittir
              ve telif hakki, ticari marka ve diger fikri mulkiyet haklari ile korunmaktadir.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-700">
                  Platformumuzun herhangi bir bolumunu kopyalamak, degistirmek, dagitmak veya tersine muhendislik yapmak kesinlikle yasaktir.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">6</span>
              Sorumluluk Sinirlamasi
            </h2>
            <p className="text-slate-600 mb-4">
              Stoocker, hizmetlerin kesintisiz ve hatasiz olacagini garanti etmez. Asagidaki durumlarda sorumluluk kabul etmeyiz:
            </p>
            <ul className="space-y-2 text-slate-600">
              {[
                'Teknik arizalar veya bakim calismalarindan kaynaklanan kesintiler',
                'Ucuncu taraf hizmetlerinden kaynaklanan sorunlar',
                'Kullanici hatalarindan kaynaklanan veri kayiplari',
                'Dolayli, ozel veya arizi zararlar',
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Termination */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">7</span>
              Hesap Feshi
            </h2>
            <p className="text-slate-600 mb-4">
              Stoocker, bu sartlarin ihlali durumunda hesabinizi askiya alma veya feshetme hakkini sakli tutar. Fesih durumunda:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Verileriniz</h3>
                <p className="text-sm text-slate-600">Fesihten sonra 30 gun icerisinde verilerinizi disa aktarabilirsiniz.</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Odemeler</h3>
                <p className="text-sm text-slate-600">Odenmemis tutarlar tahsil edilmeye devam eder.</p>
              </div>
            </div>
          </motion.section>

          {/* Governing Law */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-3 text-sm font-bold">8</span>
              Gecerli Hukuk
            </h2>
            <p className="text-slate-600 mb-4">
              Bu sartlar Turkiye Cumhuriyeti kanunlarina tabidir. Herhangi bir uyusmazlik durumunda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.
            </p>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>legal@stoocker.com</span>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
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
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="text-slate-900">Sartlar</Link>
              <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cerezler</Link>
              <Link href="/help" className="hover:text-slate-900 transition-colors">Yardim</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
