'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Users,
  Globe,
  TrendingUp,
  Target,
  Lightbulb,
  ShieldCheck,
  Zap,
  Heart,
  Star,
  Rocket,
  Award,
  CheckCircle,
} from 'lucide-react';
import type { TeamMember, CompanyValue, Stat } from '@/lib/api/services/cms.types';

interface AboutPageClientProps {
  teamMembers?: TeamMember[];
  companyValues?: CompanyValue[];
  stats?: Stat[];
}

// Default stats fallback
const defaultStats = [
  { value: '10K+', label: 'Aktif Kullanici' },
  { value: '500+', label: 'Kurumsal Musteri' },
  { value: '50M+', label: 'Islenen Urun' },
  { value: '99.9%', label: 'Uptime' },
];

// Default values fallback
const defaultValues = [
  {
    icon: 'Lightbulb',
    title: 'Inovasyon',
    description:
      'Surekli gelisen teknoloji dunyasinda, isletmelerin ihtiyaclarina en yenilikci cozumlerle yanit veriyoruz.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Guvenilirlik',
    description:
      'Verileriniz bizimle guvende. Banka seviyesinde guvenlik standartlari ve KVKK uyumlulugu sagliyoruz.',
  },
  {
    icon: 'Users',
    title: 'Musteri Odaklilik',
    description:
      'Musterilerimizin basarisi bizim basarimizdir. 7/24 destek ve kullanici dostu arayuzler sunuyoruz.',
  },
  {
    icon: 'Globe',
    title: 'Kuresel Vizyon',
    description:
      "Turkiye'den dogan bir teknoloji sirketi olarak, global standartlarda hizmet sunuyoruz.",
  },
];

// Default team fallback
const defaultTeam: Array<{ name: string; role: string; image?: string; initials: string; bio: string }> = [
  {
    name: 'Anil Berk Gurbuz',
    role: 'Kurucu Ortak & CEO',
    image: undefined,
    initials: 'AB',
    bio: "Vizyoner liderligi ile Stoocker'in stratejik yonunu belirliyor.",
  },
  {
    name: 'Arda Berkay Gurbuz',
    role: 'Kurucu Ortak & CTO',
    image: undefined,
    initials: 'AG',
    bio: 'Teknoloji altyapimizin mimari ve yenilikci cozumlerimizin gelistiricisi.',
  },
];

// Icon mapping for values
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  ShieldCheck,
  Users,
  Globe,
  Heart,
  Star,
  Rocket,
  Award,
  CheckCircle,
  Target,
  Zap,
  TrendingUp,
};

function getIcon(iconName?: string) {
  if (!iconName) return Lightbulb;
  return iconMap[iconName] || Lightbulb;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AboutPageClient({
  teamMembers,
  companyValues,
  stats,
}: AboutPageClientProps) {
  // Use CMS data or fallback to defaults
  const displayStats =
    stats && stats.length > 0
      ? stats.map((s) => ({ value: s.value, label: s.label }))
      : defaultStats;

  const displayValues =
    companyValues && companyValues.length > 0
      ? companyValues.map((v) => ({
          icon: v.icon || 'Lightbulb',
          title: v.title,
          description: v.description,
        }))
      : defaultValues;

  const displayTeam =
    teamMembers && teamMembers.length > 0
      ? teamMembers.map((m) => ({
          name: m.name,
          role: m.title, // TeamMember uses 'title' not 'role'
          image: m.photo, // TeamMember uses 'photo' not 'imageUrl'
          initials: getInitials(m.name),
          bio: m.bio || '',
        }))
      : defaultTeam;

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
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Giris Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Ucretsiz Dene
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
              2020 yilinda kurulan Stoocker, isletmelerin stok ve envanter yonetimini
              dijitallestirmek, karmasik surecleri basitlestirmek ve verimliligi artirmak
              amaciyla yola cikti.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {displayStats.map((stat, index) => (
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
                Isletmeleri Gelecege Tasiyoruz
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Her olcekteki isletmenin stok yonetimini basitlestirmek ve verimliligini artirmak
                icin modern, kullanici dostu ve guclu araclar sunuyoruz. Teknolojinin gucunu
                kullanarak, isletmelerin operasyonel sureclerini optimize etmelerine yardimci
                oluyoruz.
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
                  Turkiye'nin ve bolgenin lider stok yonetim platformu olmak ve yapay zeka
                  destekli cozumlerimizle isletmelerin dijital donusumune onculuk etmek.
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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Degerlerimiz</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Bizi biz yapan ve kararlarimiza yon veren temel degerler.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayValues.map((value, index) => {
                const Icon = getIcon(value.icon);
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Yonetim Kadrosu</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Stocker'in vizyonunu hayata geciren liderlik ekibi.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {displayTeam.map((member, index) => (
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
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                          {member.initials}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-16 pb-8 px-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-slate-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Yeni Nesil Stok Yonetimiyle Tanisin
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Isletmenizi bir adim one tasimak icin bugun Stocker'i ucretsiz deneyin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Hemen Baslayin
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Iletisime Gecin
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">
              © 2026 Stoocker. Tum haklari saklidir.
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900">
              Gizlilik
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900">
              Kullanim Sartlari
            </Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-900">
              Iletisim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
