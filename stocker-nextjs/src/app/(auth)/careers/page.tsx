'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/landing/AnimatedBackground'

const benefits = [
  { icon: '💰', title: 'Rekabetçi Maaş', description: 'Piyasa üstü maaş ve performans bonusları' },
  { icon: '🏠', title: 'Uzaktan Çalışma', description: 'Hibrit veya tam uzaktan çalışma imkanı' },
  { icon: '📚', title: 'Eğitim Bütçesi', description: 'Yıllık kişisel gelişim ve eğitim bütçesi' },
  { icon: '🏥', title: 'Sağlık Sigortası', description: 'Özel sağlık sigortası ve check-up' },
  { icon: '🎮', title: 'Esnek Çalışma', description: 'Esnek çalışma saatleri' },
  { icon: '🎉', title: 'Sosyal Etkinlikler', description: 'Takım etkinlikleri ve ofis aktiviteleri' },
];

const positions = [
  {
    title: 'Senior Frontend Developer',
    department: 'Mühendislik',
    location: 'İstanbul / Uzaktan',
    type: 'Tam Zamanlı',
    description: 'React, Next.js ve TypeScript ile modern web uygulamaları geliştirin.',
    requirements: ['5+ yıl React deneyimi', 'TypeScript', 'Next.js', 'Tailwind CSS'],
  },
  {
    title: 'Backend Developer',
    department: 'Mühendislik',
    location: 'İstanbul / Uzaktan',
    type: 'Tam Zamanlı',
    description: '.NET Core ile ölçeklenebilir backend servisleri tasarlayın.',
    requirements: ['3+ yıl .NET deneyimi', 'C#', 'PostgreSQL', 'Redis'],
  },
  {
    title: 'Product Designer',
    department: 'Tasarım',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    description: 'Kullanıcı odaklı tasarım çözümleri üretin ve UX araştırmaları yapın.',
    requirements: ['Figma', 'UI/UX', 'Design Systems', 'User Research'],
  },
  {
    title: 'DevOps Engineer',
    department: 'Mühendislik',
    location: 'Uzaktan',
    type: 'Tam Zamanlı',
    description: 'CI/CD pipeline ve cloud altyapısını yönetin.',
    requirements: ['AWS/Azure', 'Docker', 'Kubernetes', 'Terraform'],
  },
  {
    title: 'Customer Success Manager',
    department: 'Müşteri Başarısı',
    location: 'İstanbul',
    type: 'Tam Zamanlı',
    description: 'Müşteri ilişkilerini yönetin ve başarılarını destekleyin.',
    requirements: ['3+ yıl B2B deneyimi', 'CRM araçları', 'İletişim becerileri'],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><Image src="/logo.png" alt="Stocker Logo" width={120} height={40} className="brightness-0 invert object-contain" priority /></Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">Hakkımızda</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">İletişim</Link>
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Kariyer Fırsatları</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Stocker&apos;da geleceği birlikte inşa edecek yetenekli takım arkadaşları arıyoruz.
              Hızlı büyüyen ekibimize katılın!
            </p>
          </motion.div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gray-800/30">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Neden Stocker?</h2>
              <p className="text-gray-400">Çalışanlarımıza sunduğumuz avantajlar</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Açık Pozisyonlar</h2>
              <p className="text-gray-400">{positions.length} açık pozisyon mevcut</p>
            </motion.div>
            <div className="space-y-4">
              {positions.map((position, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{position.title}</h3>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">{position.department}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {position.requirements.map((req, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-2">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {position.location}
                        </span>
                        <span>{position.type}</span>
                      </div>
                      <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors">
                        Başvur
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">Aradığınız pozisyonu bulamadınız mı?</h2>
              <p className="text-gray-400 mb-6">Genel başvurunuzu gönderin, size uygun bir pozisyon açıldığında iletişime geçelim.</p>
              <Link href="/contact" className="inline-block px-8 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors">
                Genel Başvuru Yap
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div>&copy; 2024 Stocker. Tüm hakları saklıdır.</div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Şartlar</Link>
              <Link href="/careers" className="text-pink-400">Kariyer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
