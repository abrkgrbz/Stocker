'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Service {
  name: string;
  status: 'operational' | 'degraded' | 'partial' | 'major';
  uptime: string;
  description: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  date: string;
  updates: { time: string; message: string; status: string }[];
}

const services: Service[] = [
  { name: 'Web Uygulaması', status: 'operational', uptime: '99.99%', description: 'Ana web arayüzü' },
  { name: 'API', status: 'operational', uptime: '99.98%', description: 'REST API servisleri' },
  { name: 'Veritabanı', status: 'operational', uptime: '99.99%', description: 'PostgreSQL veritabanı' },
  { name: 'Dosya Depolama', status: 'operational', uptime: '99.95%', description: 'Medya ve belge depolama' },
  { name: 'E-posta Servisi', status: 'operational', uptime: '99.90%', description: 'Bildirim ve e-posta gönderimi' },
  { name: 'Webhook Servisi', status: 'operational', uptime: '99.97%', description: 'Olay bildirimleri' },
  { name: 'Mobil API', status: 'operational', uptime: '99.96%', description: 'iOS ve Android uygulamaları' },
  { name: 'CDN', status: 'operational', uptime: '99.99%', description: 'Statik içerik dağıtımı' },
];

const recentIncidents: Incident[] = [
  {
    id: '1',
    title: 'API Yanıt Gecikmesi',
    status: 'resolved',
    date: '5 Ocak 2025',
    updates: [
      { time: '14:30', message: 'Sorun tespit edildi ve çözüldü. Tüm sistemler normal çalışıyor.', status: 'resolved' },
      { time: '14:15', message: 'Düzeltme uygulandı, sistemler izleniyor.', status: 'monitoring' },
      { time: '14:00', message: 'Yüksek trafik nedeniyle API yanıt süreleri artış gösterdi.', status: 'investigating' },
    ],
  },
  {
    id: '2',
    title: 'Planlı Bakım - Veritabanı Güncellemesi',
    status: 'resolved',
    date: '1 Ocak 2025',
    updates: [
      { time: '04:00', message: 'Bakım tamamlandı, sistemler aktif.', status: 'resolved' },
      { time: '02:00', message: 'Planlı bakım başladı.', status: 'monitoring' },
    ],
  },
];

const statusConfig = {
  operational: { label: 'Çalışıyor', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  degraded: { label: 'Düşük Performans', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-100' },
  partial: { label: 'Kısmi Kesinti', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' },
  major: { label: 'Büyük Kesinti', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' },
};

const incidentStatusConfig = {
  investigating: { label: 'İnceleniyor', color: 'text-amber-600' },
  identified: { label: 'Tespit Edildi', color: 'text-blue-600' },
  monitoring: { label: 'İzleniyor', color: 'text-purple-600' },
  resolved: { label: 'Çözüldü', color: 'text-emerald-600' },
};

// Generate mock uptime data for last 90 days
const generateUptimeData = () => {
  return Array.from({ length: 90 }, (_, i) => {
    const rand = Math.random();
    if (rand > 0.98) return 'partial';
    if (rand > 0.95) return 'degraded';
    return 'operational';
  });
};

export default function StatusPage() {
  const [uptimeData] = useState(generateUptimeData);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('tr-TR'));
  }, []);

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/stoocker_black.png" alt="Stoocker Logo" width={120} height={40} className="object-contain" priority />
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            <Link href="/docs" className="text-slate-500 hover:text-slate-900 transition-colors">Dokümantasyon</Link>
            <Link href="/support" className="text-slate-500 hover:text-slate-900 transition-colors">Destek</Link>
            <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium transition-colors">Giriş Yap</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-16 text-center border-b border-slate-200">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${allOperational ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              {allOperational ? (
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {allOperational ? 'Tüm Sistemler Çalışıyor' : 'Bazı Sistemlerde Sorun Var'}
            </h1>
            <p className="text-lg text-slate-500">
              Son güncelleme: {lastUpdated || 'Yükleniyor...'}
            </p>
          </motion.div>
        </section>

        {/* Uptime Graph */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Son 90 Gün Uptime</h2>
              <span className="text-sm text-slate-500">99.97% ortalama uptime</span>
            </div>
            <div className="flex gap-0.5">
              {uptimeData.map((status, index) => (
                <div
                  key={index}
                  className={`flex-1 h-8 rounded-sm ${
                    status === 'operational' ? 'bg-emerald-400' :
                    status === 'degraded' ? 'bg-amber-400' : 'bg-orange-400'
                  }`}
                  title={`Gün ${90 - index}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>90 gün önce</span>
              <span>Bugün</span>
            </div>
          </div>
        </section>

        {/* Services Status */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Servis Durumu</h2>
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[service.status].color}`} />
                    <div>
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <p className="text-sm text-slate-500">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{service.uptime} uptime</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[service.status].bgColor} ${statusConfig[service.status].textColor}`}>
                      {statusConfig[service.status].label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Performans Metrikleri</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Ortalama Yanıt Süresi', value: '45ms', icon: '⚡' },
                { label: 'Uptime (30 gün)', value: '99.99%', icon: '📈' },
                { label: 'Toplam İstek (bugün)', value: '2.4M', icon: '📊' },
                { label: 'Aktif Kullanıcı', value: '12,458', icon: '👥' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-xl border border-slate-200 text-center"
                >
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-slate-500">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Son Olaylar</h2>
            {recentIncidents.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl text-center">
                <p className="text-slate-500">Son 30 günde herhangi bir olay yaşanmadı.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{incident.title}</h3>
                        <p className="text-sm text-slate-500">{incident.date}</p>
                      </div>
                      <span className={`text-sm font-medium ${incidentStatusConfig[incident.status].color}`}>
                        {incidentStatusConfig[incident.status].label}
                      </span>
                    </div>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[21px] w-3 h-3 bg-white border-2 border-slate-300 rounded-full" />
                          <p className="text-sm text-slate-500">
                            <span className="font-medium text-slate-700">{update.time}</span> - {update.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Subscribe */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-2xl mx-auto px-6">
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Durum Güncellemelerinden Haberdar Olun</h3>
              <p className="text-sm text-slate-500 mb-6">Sistem kesintileri ve bakım çalışmalarından e-posta ile haberdar olun.</p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors">
                  Abone Ol
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center py-12">
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
              <Link href="/support" className="hover:text-slate-900 transition-colors">Destek</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
