'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const stats = [
  { value: '10K+', label: 'Aktif Kullanıcı' },
  { value: '500+', label: 'Kurumsal Müşteri' },
  { value: '50M+', label: 'İşlenen Ürün' },
  { value: '99.9%', label: 'Uptime' },
];

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'İnovasyon',
    description: 'Sürekli gelişen teknoloji ile işletmelerin ihtiyaçlarına yenilikçi çözümler sunuyoruz.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Güvenilirlik',
    description: 'Verileriniz bizimle güvende. En yüksek güvenlik standartlarını uyguluyoruz.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Müşteri Odaklılık',
    description: 'Müşterilerimizin başarısı bizim başarımızdır. 7/24 destek sağlıyoruz.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Küresel Vizyon',
    description: 'Türkiye\'den dünyaya açılan, global standartlarda hizmet sunuyoruz.',
  },
];

const team = [
  { name: 'Ahmet Yılmaz', role: 'Kurucu & CEO', image: '👨‍💼' },
  { name: 'Elif Kaya', role: 'CTO', image: '👩‍💻' },
  { name: 'Mehmet Demir', role: 'Ürün Müdürü', image: '👨‍💻' },
  { name: 'Zeynep Aksoy', role: 'Tasarım Direktörü', image: '👩‍🎨' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/careers" className="text-slate-500 hover:text-slate-900 transition-colors">Kariyer</Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900 transition-colors">İletişim</Link>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Hakkımızda</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              2020 yılında kurulan Stocker, işletmelerin stok ve envanter yönetimini dijitalleştirmek ve
              kolaylaştırmak amacıyla yola çıktı. Bugün binlerce işletmenin güvendiği bir platform haline geldik.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-slate-200 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="text-center">
                  <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-slate-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Misyonumuz</h2>
                <p className="text-slate-500 leading-relaxed mb-4">
                  Her ölçekteki işletmenin stok yönetimini basitleştirmek ve verimliliğini artırmak için
                  modern, kullanıcı dostu ve güçlü araçlar sunmak.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Teknolojinin gücünü kullanarak, işletmelerin operasyonel süreçlerini optimize etmelerine
                  ve büyümelerine yardımcı oluyoruz.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-8 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Vizyonumuz</h2>
                <p className="text-slate-500 leading-relaxed">
                  Türkiye&apos;nin ve bölgenin lider stok yönetim platformu olmak. Yapay zeka destekli
                  çözümlerimizle işletmelerin geleceğe hazırlanmasına öncülük etmek.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Değerlerimiz</h2>
              <p className="text-slate-500">Bizi biz yapan temel değerler</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-500 text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ekibimiz</h2>
              <p className="text-slate-500">Stocker&apos;ı mümkün kılan harika insanlar</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }} className="p-6 bg-white rounded-2xl border border-slate-200 text-center hover:border-slate-300 transition-colors">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                  <p className="text-slate-500 text-sm">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Ekibimize Katılın</h2>
              <p className="text-slate-500 mb-6">Yetenekli insanları arıyoruz. Açık pozisyonlarımıza göz atın.</p>
              <Link href="/careers" className="inline-block px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">
                Kariyer Fırsatları
              </Link>
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
              <Link href="/about" className="text-slate-900">Hakkımızda</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
