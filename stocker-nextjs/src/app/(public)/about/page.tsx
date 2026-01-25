'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Users,
  Globe,
  TrendingUp,
  Target,
  Lightbulb,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '10K+', label: 'Aktif Kullanıcı' },
    { value: '500+', label: 'Kurumsal Müşteri' },
    { value: '50M+', label: 'İşlenen Ürün' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'İnovasyon',
      description: 'Sürekli gelişen teknoloji dünyasında, işletmelerin ihtiyaçlarına en yenilikçi çözümlerle yanıt veriyoruz.',
    },
    {
      icon: ShieldCheck,
      title: 'Güvenilirlik',
      description: 'Verileriniz bizimle güvende. Banka seviyesinde güvenlik standartları ve KVKK uyumluluğu sağlıyoruz.',
    },
    {
      icon: Users,
      title: 'Müşteri Odaklılık',
      description: 'Müşterilerimizin başarısı bizim başarımızdır. 7/24 destek ve kullanıcı dostu arayüzler sunuyoruz.',
    },
    {
      icon: Globe,
      title: 'Küresel Vizyon',
      description: 'Türkiye\'den doğan bir teknoloji şirketi olarak, global standartlarda hizmet sunuyoruz.',
    },
  ];

  const team = [
    {
      name: 'Anıl Berk Gürbüz',
      role: 'Kurucu Ortak & CEO',
      image: '/team/anil.jpg', // Placeholder path, falling back to initials if not found
      initials: 'AB',
      bio: 'Vizyoner liderliği ile Stoocker\'ın stratejik yönünü belirliyor.'
    },
    {
      name: 'Arda Berkay Gürbüz',
      role: 'Kurucu Ortak & CTO',
      image: '/team/arda.jpg',
      initials: 'AG',
      bio: 'Teknoloji altyapımızın mimarı ve yenilikçi çözümlerimizin geliştiricisi.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/stoocker_black.png"
                alt="Stoocker"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 text-center px-4 bg-white border-b border-slate-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Biz Kimiz?
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              2020 yılında kurulan Stoocker, işletmelerin stok ve envanter yönetimini dijitalleştirmek, karmaşık süreçleri basitleştirmek ve verimliliği artırmak amacıyla yola çıktı.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                  <div className="text-slate-500 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
                <Target className="w-4 h-4" />
                <span>Misyonumuz</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                İşletmeleri Geleceğe Taşıyoruz
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Her ölçekteki işletmenin stok yönetimini basitleştirmek ve verimliliğini artırmak için modern, kullanıcı dostu ve güçlü araçlar sunuyoruz. Teknolojinin gücünü kullanarak, işletmelerin operasyonel süreçlerini optimize etmelerine yardımcı oluyoruz.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 rounded-2xl p-10 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  <span>Vizyonumuz</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Lider Platform Olmak</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  Türkiye'nin ve bölgenin lider stok yönetim platformu olmak ve yapay zeka destekli çözümlerimizle işletmelerin dijital dönüşümüne öncülük etmek.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Değerlerimiz</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Bizi biz yapan ve kararlarımıza yön veren temel değerler.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 text-center group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-700 mb-6 mx-auto shadow-sm group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Yönetim Kadrosu</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Stocker'ın vizyonunu hayata geçiren liderlik ekibi.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="h-32 bg-slate-900 relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        {member.initials}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-16 pb-8 px-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Yeni Nesil Stok Yönetimiyle Tanışın
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              İşletmenizi bir adım öne taşımak için bugün Stocker'ı ücretsiz deneyin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Hemen Başlayın
              </Link>
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                İletişime Geçin
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">© 2026 Stoocker. Tüm hakları saklıdır.</span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900">Gizlilik</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900">Kullanım Şartları</Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">İletişim</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
