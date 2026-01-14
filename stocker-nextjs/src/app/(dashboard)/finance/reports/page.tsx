'use client';

/**
 * Financial Reports Dashboard Page
 * Türkiye muhasebe standartlarına uygun finansal raporlar merkezi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  CalculatorIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

// Report category definitions
const reportCategories = [
  {
    title: 'Temel Finansal Tablolar',
    description: 'VUK ve TFRS uyumlu mali tablolar',
    icon: DocumentChartBarIcon,
    color: 'bg-slate-900',
    reports: [
      {
        name: 'Bilanço',
        description: 'Varlık, borç ve özkaynak durumu',
        path: '/finance/reports/balance-sheet',
        icon: ScaleIcon,
      },
      {
        name: 'Gelir Tablosu',
        description: 'Dönem gelir ve giderleri',
        path: '/finance/reports/income-statement',
        icon: ArrowTrendingUpIcon,
      },
      {
        name: 'Nakit Akış Tablosu',
        description: 'Dönemsel nakit hareketleri',
        path: '/finance/cash-flow',
        icon: BanknotesIcon,
      },
      {
        name: 'Özkaynak Değişim Tablosu',
        description: 'Sermaye ve yedek hareketleri',
        path: '/finance/reports/equity-changes',
        icon: ChartBarIcon,
      },
    ],
  },
  {
    title: 'Vergi Raporları',
    description: 'GİB beyanname destekli vergi raporları',
    icon: BuildingLibraryIcon,
    color: 'bg-purple-600',
    reports: [
      {
        name: 'KDV Raporu',
        description: 'KDV1 ve KDV2 hesaplama raporu',
        path: '/finance/reports/vat',
        icon: CalculatorIcon,
      },
      {
        name: 'Stopaj/Tevkifat Raporu',
        description: 'Tevkifat oranları ve hesapları',
        path: '/finance/reports/withholding',
        icon: ScaleIcon,
      },
      {
        name: 'Ba-Bs Formu',
        description: 'Mal ve hizmet alış/satış bildirimi',
        path: '/finance/tax/ba-bs',
        icon: ClipboardDocumentListIcon,
      },
      {
        name: 'Vergi Beyannameleri',
        description: 'KDV, Muhtasar, Geçici Vergi',
        path: '/finance/tax/declarations',
        icon: DocumentChartBarIcon,
      },
    ],
  },
  {
    title: 'Cari Hesap Raporları',
    description: 'Müşteri ve tedarikçi analiz raporları',
    icon: CurrencyDollarIcon,
    color: 'bg-blue-600',
    reports: [
      {
        name: 'Yaşlandırma Raporu',
        description: 'Vade bazlı alacak/borç analizi',
        path: '/finance/aging-reports',
        icon: CalendarIcon,
      },
      {
        name: 'Cari Hesap Ekstresi',
        description: 'Detaylı cari hesap hareketleri',
        path: '/finance/reports/account-statement',
        icon: TableCellsIcon,
      },
      {
        name: 'Alacak Raporu',
        description: 'Toplam ve vadeli alacaklar',
        path: '/finance/reports/receivables',
        icon: ArrowTrendingUpIcon,
      },
      {
        name: 'Borç Raporu',
        description: 'Toplam ve vadeli borçlar',
        path: '/finance/reports/payables',
        icon: ArrowTrendingDownIcon,
      },
    ],
  },
  {
    title: 'Muhasebe Raporları',
    description: 'Hesap planı bazlı detaylı raporlar',
    icon: ClipboardDocumentListIcon,
    color: 'bg-emerald-600',
    reports: [
      {
        name: 'Mizan',
        description: 'Hesap bazlı borç-alacak dengesi',
        path: '/finance/reports/trial-balance',
        icon: ScaleIcon,
      },
      {
        name: 'Hesap Dökümü',
        description: 'Tek hesap detaylı hareket listesi',
        path: '/finance/reports/account-ledger',
        icon: TableCellsIcon,
      },
      {
        name: 'Yevmiye Defteri',
        description: 'Kronolojik muhasebe kayıtları',
        path: '/finance/journal-entries',
        icon: ClipboardDocumentListIcon,
      },
      {
        name: 'Kebir Defteri',
        description: 'Hesap bazlı kayıt grupları',
        path: '/finance/reports/general-ledger',
        icon: DocumentChartBarIcon,
      },
    ],
  },
];

// Quick stats - would come from API in real implementation
const quickStats = [
  { label: 'Toplam Alacak', value: '₺2,450,000', change: '+12.5%', positive: true },
  { label: 'Toplam Borç', value: '₺1,890,000', change: '-5.3%', positive: true },
  { label: 'Net Pozisyon', value: '₺560,000', change: '+18.2%', positive: true },
  { label: 'Vadesi Geçen', value: '₺125,000', change: '+8.1%', positive: false },
];

export default function FinancialReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Finansal Raporlar</h1>
          <p className="text-sm text-slate-500">
            VUK ve TFRS uyumlu mali tablolar ve analiz raporları
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className={`text-xs mt-1 ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {stat.change} bu ay
            </div>
          </div>
        ))}
      </div>

      {/* Report Categories */}
      <div className="space-y-8">
        {reportCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white border border-slate-200 rounded-xl p-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
                <p className="text-sm text-slate-500">{category.description}</p>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.reports.map((report, reportIndex) => (
                <Link
                  key={reportIndex}
                  href={report.path}
                  className="group block p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300 transition-colors">
                      <report.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                        {report.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports Section */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Son Oluşturulan Raporlar</h2>
          </div>
          <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Tümünü Gör →
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'KDV Raporu - Ocak 2025', date: '15 Ocak 2025', type: 'Vergi', status: 'Tamamlandı' },
            { name: 'Mizan - 4. Çeyrek 2024', date: '10 Ocak 2025', type: 'Muhasebe', status: 'Tamamlandı' },
            { name: 'Yaşlandırma Raporu', date: '08 Ocak 2025', type: 'Cari Hesap', status: 'Tamamlandı' },
            { name: 'Gelir Tablosu - 2024', date: '05 Ocak 2025', type: 'Mali Tablo', status: 'İnceleniyor' },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <DocumentChartBarIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-900">{report.name}</div>
                  <div className="text-xs text-slate-500">{report.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded">
                  {report.type}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  report.status === 'Tamamlandı'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Rapor Türleri Hakkında</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Mali Tablolar (VUK/TFRS)</h4>
            <p>
              Bilanço, Gelir Tablosu, Nakit Akış ve Özkaynak Değişim tabloları yasal zorunlu mali
              tablolardır. VUK (Vergi Usul Kanunu) ve TFRS (Türkiye Finansal Raporlama Standartları)
              formatlarında üretilebilir.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Vergi Raporları</h4>
            <p>
              KDV beyannamesi, Ba-Bs formu, Muhtasar beyanname gibi GİB&apos;e sunulması gereken
              raporlar otomatik olarak oluşturulur. e-Beyanname sistemine aktarılabilir formatta
              dışa aktarılabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
