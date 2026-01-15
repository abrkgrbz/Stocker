'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const securityFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Uçtan Uca Şifreleme',
    description: 'Tüm veriler 256-bit AES şifreleme ile korunur. Aktarım sırasında TLS 1.3 protokolü kullanılır.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'İki Faktörlü Doğrulama',
    description: 'SMS, e-posta veya authenticator uygulaması ile hesabınızı ekstra güvenlik katmanıyla koruyun.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    title: 'Güvenli Veri Merkezi',
    description: 'Verileriniz ISO 27001 sertifikalı, Tier III veri merkezlerinde barındırılır. Coğrafi yedekleme ile koruma altında.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: 'Rol Tabanlı Erişim',
    description: 'Granüler izin sistemi ile kullanıcıların sadece ihtiyaç duydukları verilere erişmesini sağlayın.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Denetim Günlükleri',
    description: 'Tüm sistem aktiviteleri detaylı olarak loglanır. Kim, ne zaman, ne yaptı - her şey kayıt altında.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Otomatik Yedekleme',
    description: 'Verileriniz saatlik olarak yedeklenir. 30 güne kadar geri dönüş imkanı ile veri kaybı riski minimize edilir.',
  },
];

const certifications = [
  { name: 'ISO 27001', description: 'Bilgi Güvenliği Yönetim Sistemi', icon: '🏅' },
  { name: 'SOC 2 Type II', description: 'Güvenlik, Erişilebilirlik, Gizlilik', icon: '🛡️' },
  { name: 'KVKK', description: 'Kişisel Verilerin Korunması Kanunu', icon: '📋' },
  { name: 'GDPR', description: 'Avrupa Veri Koruma Tüzüğü', icon: '🇪🇺' },
  { name: 'PCI DSS', description: 'Ödeme Kartı Endüstrisi Güvenlik Standardı', icon: '💳' },
];

const securityPractices = [
  {
    title: 'Düzenli Penetrasyon Testleri',
    description: 'Bağımsız güvenlik firmaları tarafından yılda en az iki kez penetrasyon testi yapılır.',
  },
  {
    title: 'Bug Bounty Programı',
    description: 'Güvenlik araştırmacılarına açık bug bounty programı ile güvenlik açıklarını proaktif olarak tespit ediyoruz.',
  },
  {
    title: 'Güvenli Yazılım Geliştirme',
    description: 'OWASP standartlarına uygun güvenli kodlama pratikleri ve otomatik güvenlik taramaları.',
  },
  {
    title: 'Çalışan Güvenlik Eğitimi',
    description: 'Tüm çalışanlarımız düzenli güvenlik farkındalık eğitimlerinden geçer.',
  },
  {
    title: 'Olay Müdahale Planı',
    description: '7/24 güvenlik ekibi ve detaylı olay müdahale prosedürleri ile hızlı yanıt kapasitesi.',
  },
  {
    title: 'Şifre Güvenliği',
    description: 'Bcrypt ile şifre hashleme, şifre politikaları ve sızıntı taraması ile hesap güvenliği.',
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">Şartlar</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Güvenlik</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Verilerinizin güvenliği bizim için en büyük öncelik. En yüksek endüstri standartlarını
              uygulayarak işletmenizin verilerini koruyoruz.
            </p>
          </motion.div>
        </section>

        {/* Trust Banner */}
        <section className="py-8 border-y border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-slate-600"
                >
                  <span className="text-2xl">{cert.icon}</span>
                  <span className="font-medium">{cert.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Güvenlik Özellikleri</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Verilerinizi korumak için kullandığımız teknolojiler ve yöntemler</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Detail */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Uyumluluk & Sertifikalar</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Uluslararası güvenlik standartlarına uyumlu, sertifikalı altyapı</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-200 text-center hover:border-slate-300 transition-colors"
                >
                  <div className="text-4xl mb-3">{cert.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{cert.name}</h3>
                  <p className="text-xs text-slate-500">{cert.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Practices */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Güvenlik Uygulamalarımız</h2>
                <p className="text-slate-500 mb-8">
                  Güvenlik sadece teknoloji değil, bir kültürdür. Ekibimiz, süreçlerimiz ve altyapımızla
                  verilerinizi en üst düzeyde korumak için çalışıyoruz.
                </p>
                <div className="space-y-6">
                  {securityPractices.map((practice, index) => (
                    <motion.div
                      key={practice.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{practice.title}</h3>
                        <p className="text-sm text-slate-500">{practice.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Güvenlik Açığı Bildirimi</h3>
                <p className="text-slate-400 mb-6">
                  Bir güvenlik açığı keşfettiyseniz, lütfen sorumlu açıklama prensiplerine uygun olarak bize bildirin.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-300">security@stoocker.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-slate-300">PGP Key: security.stoocker.com/pgp</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Sorumlu açıklama yapan araştırmacılara teşekkür olarak Hall of Fame&apos;de yer veriyoruz.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Veri Koruma</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Verileriniz nerede ve nasıl korunuyor?</p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Veri Merkezi Lokasyonu',
                  description: 'Verileriniz Türkiye\'deki ISO 27001 sertifikalı veri merkezlerinde barındırılır.',
                  icon: '🏢',
                },
                {
                  title: 'Veri Yedekleme',
                  description: 'Saatlik yedekleme, 30 güne kadar geri dönüş, coğrafi olarak dağıtılmış yedekler.',
                  icon: '💾',
                },
                {
                  title: 'Veri Silme',
                  description: 'Hesap kapatıldığında verileriniz 30 gün içinde tamamen ve geri dönüşümsüz olarak silinir.',
                  icon: '🗑️',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="p-6 bg-white rounded-2xl border border-slate-200 text-center"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Güvenlik Hakkında Sorularınız mı Var?</h2>
              <p className="text-slate-500 mb-6">Güvenlik ekibimiz sorularınızı yanıtlamak için hazır.</p>
              <div className="flex justify-center gap-4">
                <Link href="/contact" className="px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
                  İletişime Geçin
                </Link>
                <Link href="/docs" className="px-8 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors">
                  Dokümantasyon
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 hover:text-slate-700 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Şartlar</Link>
              <Link href="/kvkk" className="hover:text-slate-900 transition-colors">KVKK</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
