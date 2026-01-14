'use client';

/**
 * Cash Flow Page (Nakit Akış Tablosu)
 * TMS 7 / TFRS uyumlu nakit akış raporu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Select, Spin, Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BanknotesIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
interface CashFlowItem {
  id: string;
  description: string;
  amount: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface CashFlowSection {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  items: CashFlowItem[];
  subtotal: number;
}

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Mock data following TMS 7 standard
const operatingActivities: CashFlowItem[] = [
  { id: 'op1', description: 'Müşterilerden Alınan Nakit', amount: 2450000 },
  { id: 'op2', description: 'Tedarikçilere Ödenen Nakit', amount: -1650000 },
  { id: 'op3', description: 'Personel Giderleri', amount: -380000 },
  { id: 'op4', description: 'Vergi Ödemeleri', amount: -125000 },
  { id: 'op5', description: 'Diğer İşletme Giderleri', amount: -95000 },
  { id: 'op6', description: 'Alınan Faiz', amount: 35000 },
  { id: 'op7', description: 'Ödenen Faiz', amount: -45000 },
];

const investingActivities: CashFlowItem[] = [
  { id: 'inv1', description: 'Maddi Duran Varlık Alımları', amount: -250000 },
  { id: 'inv2', description: 'Maddi Duran Varlık Satışları', amount: 85000 },
  { id: 'inv3', description: 'Finansal Varlık Alımları', amount: -150000 },
  { id: 'inv4', description: 'Finansal Varlık Satışları', amount: 45000 },
  { id: 'inv5', description: 'İştirak Edinimi', amount: -120000 },
];

const financingActivities: CashFlowItem[] = [
  { id: 'fin1', description: 'Banka Kredisi Kullanımı', amount: 500000 },
  { id: 'fin2', description: 'Banka Kredisi Geri Ödemesi', amount: -320000 },
  { id: 'fin3', description: 'Sermaye Artırımı', amount: 200000 },
  { id: 'fin4', description: 'Ödenen Temettüler', amount: -150000 },
  { id: 'fin5', description: 'Finansal Kiralama Ödemeleri', amount: -65000 },
];

export default function CashFlowPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  // Generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  // Calculate section totals
  const operatingTotal = operatingActivities.reduce((sum, item) => sum + item.amount, 0);
  const investingTotal = investingActivities.reduce((sum, item) => sum + item.amount, 0);
  const financingTotal = financingActivities.reduce((sum, item) => sum + item.amount, 0);
  const netCashFlow = operatingTotal + investingTotal + financingTotal;

  // Beginning and ending balances (mock)
  const beginningBalance = 850000;
  const endingBalance = beginningBalance + netCashFlow;

  const sections: CashFlowSection[] = [
    {
      title: 'A. İşletme Faaliyetlerinden Nakit Akışları',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      items: operatingActivities,
      subtotal: operatingTotal,
    },
    {
      title: 'B. Yatırım Faaliyetlerinden Nakit Akışları',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      items: investingActivities,
      subtotal: investingTotal,
    },
    {
      title: 'C. Finansman Faaliyetlerinden Nakit Akışları',
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
      items: financingActivities,
      subtotal: financingTotal,
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BanknotesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Nakit Akış Tablosu</h1>
              <p className="text-sm text-slate-500">TMS 7 / TFRS uyumlu nakit akış raporu</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={yearOptions}
                size="large"
                className="w-28 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <Select
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                options={monthOptions}
                size="large"
                className="w-32 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Period Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {monthNames[selectedMonth - 1]} {selectedYear} Dönemi Nakit Akış Tablosu
                </h3>
                <p className="text-xs text-blue-700">
                  Dönem: {dayjs(new Date(selectedYear, selectedMonth - 1, 1)).format('DD.MM.YYYY')} - {dayjs(new Date(selectedYear, selectedMonth, 0)).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-slate-500">İşletme Faaliyetleri</span>
              </div>
              <div className={`text-xl font-bold ${operatingTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(operatingTotal)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-slate-500">Yatırım Faaliyetleri</span>
              </div>
              <div className={`text-xl font-bold ${investingTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(investingTotal)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-xs text-slate-500">Finansman Faaliyetleri</span>
              </div>
              <div className={`text-xl font-bold ${financingTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(financingTotal)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {netCashFlow >= 0 ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                )}
                <span className="text-xs text-slate-500">Net Nakit Akışı</span>
              </div>
              <div className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(netCashFlow)}
              </div>
            </div>
          </div>

          {/* Cash Flow Statement */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <BanknotesIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Nakit Akış Tablosu (Dolaylı Yöntem)</h3>
            </div>

            {/* Beginning Balance */}
            <div className="p-4 bg-slate-100 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Dönem Başı Nakit ve Nakit Benzerleri</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(beginningBalance)}</span>
              </div>
            </div>

            {/* Cash Flow Sections */}
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-6 h-6 rounded ${section.color} flex items-center justify-center`}>
                      <section.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{section.title}</h4>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-1 ml-9">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 px-3 hover:bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm text-slate-600">{item.description}</span>
                        <span className={`text-sm font-medium ${item.amount >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    {/* Section Subtotal */}
                    <div className="flex justify-between items-center py-2 px-3 border-t border-slate-200 mt-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {section.title.split('.')[0]}. Toplam
                      </span>
                      <span className={`text-sm font-bold ${section.subtotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(section.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Net Cash Flow */}
            <div className="p-4 bg-slate-800 rounded-lg mt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-200">
                  D. Nakit ve Nakit Benzerlerindeki Net Artış/(Azalış)
                </span>
                <span className={`text-lg font-bold ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(netCashFlow)}
                </span>
              </div>
            </div>

            {/* Ending Balance */}
            <div className="p-4 bg-slate-900 rounded-lg mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Dönem Sonu Nakit ve Nakit Benzerleri</span>
                <span className="text-xl font-bold text-white">{formatCurrency(endingBalance)}</span>
              </div>
            </div>

            {/* Verification */}
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <span className="font-medium">Doğrulama:</span>
                <span>
                  {formatCurrency(beginningBalance)} + {formatCurrency(netCashFlow)} = {formatCurrency(endingBalance)}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 rounded text-emerald-800 font-medium">✓ Tutarlı</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Nakit Akış Tablosu Hakkında</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">İşletme Faaliyetleri</h4>
                <p>
                  İşletmenin ana faaliyet konusundan kaynaklanan nakit giriş ve çıkışlarını gösterir.
                  Müşteri tahsilatları, tedarikçi ödemeleri, personel giderleri bu kategoride yer alır.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Yatırım Faaliyetleri</h4>
                <p>
                  Duran varlık alım-satımları, finansal yatırımlar ve iştirak hareketlerini kapsar.
                  Uzun vadeli kaynak kullanımını ve yatırım politikasını yansıtır.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Finansman Faaliyetleri</h4>
                <p>
                  Özkaynaklar ve yabancı kaynaklardaki değişimleri gösterir. Kredi kullanım/geri ödemeleri,
                  sermaye hareketleri ve temettü ödemeleri bu kategoride izlenir.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
