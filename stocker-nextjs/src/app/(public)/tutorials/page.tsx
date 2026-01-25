'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Play,
    Clock,
    BookOpen,
    Search,
    ChevronRight,
    Target,
    Users,
    BarChart3,
    Package,
    ShieldCheck,
    Briefcase,
    Factory,
    ShoppingCart
} from 'lucide-react';

// Business Roles / Modules Data
const roles = [
    { id: 'inventory', title: 'Stok & Depo', icon: Package, desc: 'Envanter, sayım ve transferler' },
    { id: 'manufacturing', title: 'Üretim', icon: Factory, desc: 'Reçeteler ve üretim emirleri' },
    { id: 'sales', title: 'Satış & CRM', icon: Target, desc: 'Müşteriler, teklifler ve siparişler' },
    { id: 'finance', title: 'Finans', icon: BarChart3, desc: 'Faturalar ve cari hesaplar' },
    { id: 'hr', title: 'İnsan Kaynakları', icon: Users, desc: 'Personel, izinler ve bordro' },
    { id: 'purchase', title: 'Satın Alma', icon: ShoppingCart, desc: 'Tedarikçi ve satın alma talepleri' },
];

const tutorials = [
    // Üretim (Manufacturing)
    {
        id: 'man-1',
        title: 'Üretim Reçetesi (BOM) Hazırlama',
        description: 'Hammadde ve yarı mamul maliyetlerini reçetelerle otomatik hesaplayın.',
        duration: '15 dk',
        category: 'manufacturing',
        module: 'Üretim',
        level: 'İleri',
        views: 1200
    },
    {
        id: 'man-2',
        title: 'Üretim Emirleri ve İş İstasyonları',
        description: 'Siparişten üretime geçiş ve atölye takibi.',
        duration: '18 dk',
        category: 'manufacturing',
        module: 'Üretim',
        level: 'İleri',
        views: 950
    },

    // İK (HR)
    {
        id: 'hr-1',
        title: 'Personel Özlük Dosyası Oluşturma',
        description: 'Çalışan evraklarını dijital ortamda güvenle saklayın.',
        duration: '8 dk',
        category: 'hr',
        module: 'İnsan Kaynakları',
        level: 'Temel',
        views: 1500
    },
    {
        id: 'hr-2',
        title: 'İzin ve Vardiya Planlama',
        description: 'Departman bazlı haftalık vardiya ve yıllık izin yönetimi.',
        duration: '12 dk',
        category: 'hr',
        module: 'İnsan Kaynakları',
        level: 'Orta',
        views: 1100
    },

    // Satın Alma (Purchase)
    {
        id: 'pur-1',
        title: 'Tedarikçi Değerlendirme Sistemi',
        description: 'Vendor puanlama ve en iyi fiyat teklifini seçme.',
        duration: '10 dk',
        category: 'purchase',
        module: 'Satın Alma',
        level: 'Orta',
        views: 800
    },

    // Stok & Depo
    {
        id: 'inv-1',
        title: 'Barkod ile Mal Kabul Süreci',
        description: 'El terminalleri kullanarak hatasız stok girişi yapın.',
        duration: '14 dk',
        category: 'inventory',
        module: 'Stok Yönetimi',
        level: 'Orta',
        views: 3400
    },

    // Finans
    {
        id: 'fin-1',
        title: 'e-Fatura Giden Kutusu Yönetimi',
        description: 'Onaylanan faturaların GİB entegrasyonu ile gönderimi.',
        duration: '9 dk',
        category: 'finance',
        module: 'Finans',
        level: 'İleri',
        views: 4200
    },

    // CRM & Satış
    {
        id: 'sales-1',
        title: 'Tekliften Siparişe Dönüşüm',
        description: 'Onaylanan teklifleri tek tıkla satış siparişine çevirin.',
        duration: '6 dk',
        category: 'sales',
        module: 'Satış',
        level: 'Temel',
        views: 2800
    },
];

export default function TutorialsPage() {
    const [activeRole, setActiveRole] = useState('all');

    const filteredTutorials = activeRole === 'all'
        ? tutorials
        : tutorials.filter(t => t.category === activeRole);

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
                            <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                                Dokümantasyon
                            </Link>
                            <Link href="/api-docs" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                                API
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Giriş Yap
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="bg-slate-900 py-16 px-4 relative overflow-hidden">
                    {/* Abstract Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Kurumsal Eğitim Merkezi</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                İşinizi Profesyonelce <br />
                                <span className="text-indigo-400">Yönetmeyi Öğrenin</span>
                            </h1>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                                Stocker Akademisi, deponuzdan finansınıza kadar tüm süreçlerinizi
                                optimize etmeniz için rol bazlı eğitimler sunar.
                            </p>

                            <div className="relative max-w-md mx-auto md:mx-0">
                                <input
                                    type="text"
                                    placeholder="Eğitim veya konu arayın..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Hero Graphic / Stats */}
                        <div className="flex-1 w-full max-w-md md:max-w-full relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <div className="text-3xl font-bold text-white mb-1">40+</div>
                                    <div className="text-sm text-slate-400">Video Eğitim</div>
                                </div>
                                <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <div className="text-3xl font-bold text-white mb-1">12</div>
                                    <div className="text-sm text-slate-400">Sektörel Rehber</div>
                                </div>
                                <div className="col-span-2 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">Topluluk Desteği</div>
                                        <div className="text-xs text-slate-400">Diğer işletme sahipleriyle tanışın</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Learning Paths (Roles) */}
                <section className="py-16 bg-white border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center sm:text-left">
                            Kime Göre Eğitim Arıyorsunuz?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => setActiveRole('all')}
                                className={`p-4 rounded-xl border text-left transition-all ${activeRole === 'all' ? 'border-slate-800 bg-slate-900 text-white shadow-xl' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white'}`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-600">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold mb-1">Tüm Roller</h3>
                                <p className={`text-xs ${activeRole === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Tüm kataloğu görüntüle</p>
                            </button>

                            {roles.map((role) => {
                                const Icon = role.icon;
                                const isActive = activeRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setActiveRole(role.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${isActive ? 'border-slate-800 bg-slate-800 text-white shadow-xl' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${isActive ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold mb-1">{role.title}</h3>
                                        <p className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{role.desc}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Video Grid */}
                <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {activeRole === 'all' ? 'Öne Çıkan Eğitimler' : `${roles.find(r => r.id === activeRole)?.title} için Eğitimler`}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTutorials.map((tutorial, index) => (
                            <motion.div
                                key={tutorial.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
                            >
                                {/* Thumbnail Area */}
                                <div className="aspect-video bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Module Badge */}
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {tutorial.module}
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-indigo-600 ml-1 fill-current" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white text-xs font-medium">
                                        <span className="px-2 py-1 bg-black/40 rounded flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {tutorial.duration}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {tutorial.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                        {tutorial.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {tutorial.views.toLocaleString()} izlenme
                                        </span>
                                        <span className="px-2 py-1 bg-slate-50 rounded text-slate-600 font-medium">
                                            {tutorial.level}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredTutorials.length === 0 && (
                        <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                            <p className="text-slate-500">Bu kategoride henüz eğitim bulunmuyor.</p>
                        </div>
                    )}
                </section>

                {/* Newsletter / CTA */}
                <section className="py-20 bg-white border-t border-slate-200">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Canlı Eğitimlerimize Katılın</h2>
                        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                            Her Çarşamba saat 14:00'te uzmanlarımızla canlı soru-cevap seansları düzenliyoruz.
                            İşletmenize özel soruları sormak için kaydolun.
                        </p>
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1">
                            Webinar Takvimini Görüntüle
                        </button>
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
                        <Link href="/help" className="text-slate-500 hover:text-slate-900">Yardım</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
