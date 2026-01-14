'use client';

/**
 * VAT Report (KDV Raporu) Page
 * Türkiye KDV Beyannamesi detaylı raporu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Select, Spin, Card, Progress } from 'antd';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  BanknotesIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useVatReport } from '@/lib/api/hooks/useFinance';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function VatReportPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Fetch VAT report
  const { data: vatReport, isLoading, refetch } = useVatReport(selectedYear, selectedMonth);

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

  // Calculate totals from report or default to 0
  const salesKdv = {
    kdv20: vatReport?.salesKdv20 || 0,
    kdv10: vatReport?.salesKdv10 || 0,
    kdv1: vatReport?.salesKdv1 || 0,
    total: vatReport?.totalSalesKdv || 0,
  };

  const purchaseKdv = {
    kdv20: vatReport?.purchaseKdv20 || 0,
    kdv10: vatReport?.purchaseKdv10 || 0,
    kdv1: vatReport?.purchaseKdv1 || 0,
    total: vatReport?.totalPurchaseKdv || 0,
  };

  const summary = {
    netKdv: vatReport?.netKdv || 0,
    previousCredit: vatReport?.previousPeriodCredit || 0,
    payable: vatReport?.payableKdv || 0,
    carryForward: vatReport?.carryForwardCredit || 0,
    withholding: vatReport?.withholdingKdv || 0,
    exemptSales: vatReport?.exemptSales || 0,
    exportSales: vatReport?.exportSales || 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">KDV Raporu</h1>
              <p className="text-sm text-slate-500">Katma Değer Vergisi detaylı hesaplama raporu</p>
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
                onClick={() => refetch()}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
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
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {monthNames[selectedMonth - 1]} {selectedYear} Dönemi KDV Raporu
                </h3>
                <p className="text-xs text-blue-700">
                  Dönem: {dayjs(new Date(selectedYear, selectedMonth - 1, 1)).format('DD.MM.YYYY')} - {dayjs(new Date(selectedYear, selectedMonth, 0)).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(salesKdv.total)}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Hesaplanan KDV</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(purchaseKdv.total)}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">İndirilecek KDV</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalculatorIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${summary.netKdv >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                {formatCurrency(summary.netKdv)}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Net KDV</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BanknotesIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${summary.payable > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(summary.payable))}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                {summary.payable > 0 ? 'Ödenecek KDV' : 'Devreden KDV'}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hesaplanan KDV (Sales) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Hesaplanan KDV (Satışlar)</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">%20</span>
                    <span className="text-sm text-slate-600">KDV Oranı %20</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(salesKdv.kdv20)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">%10</span>
                    <span className="text-sm text-slate-600">KDV Oranı %10</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(salesKdv.kdv10)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">%1</span>
                    <span className="text-sm text-slate-600">KDV Oranı %1</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(salesKdv.kdv1)}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-green-50 rounded-lg px-3 -mx-3">
                  <span className="text-sm font-semibold text-green-800">Toplam Hesaplanan KDV</span>
                  <span className="text-lg font-bold text-green-700">{formatCurrency(salesKdv.total)}</span>
                </div>
              </div>
            </div>

            {/* İndirilecek KDV (Purchases) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">İndirilecek KDV (Alımlar)</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">%20</span>
                    <span className="text-sm text-slate-600">KDV Oranı %20</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(purchaseKdv.kdv20)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">%10</span>
                    <span className="text-sm text-slate-600">KDV Oranı %10</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(purchaseKdv.kdv10)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">%1</span>
                    <span className="text-sm text-slate-600">KDV Oranı %1</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(purchaseKdv.kdv1)}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-3 -mx-3">
                  <span className="text-sm font-semibold text-red-800">Toplam İndirilecek KDV</span>
                  <span className="text-lg font-bold text-red-700">{formatCurrency(purchaseKdv.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KDV Calculation Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">KDV Hesaplama Özeti</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-600">Hesaplanan KDV (Satışlar)</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(salesKdv.total)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MinusIcon className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-600">İndirilecek KDV (Alımlar)</span>
                </div>
                <span className="text-sm font-semibold text-red-600">-{formatCurrency(purchaseKdv.total)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100 bg-slate-50 rounded-lg px-3 -mx-3">
                <div className="flex items-center gap-2">
                  <ArrowRightIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Dönem Net KDV</span>
                </div>
                <span className={`text-sm font-bold ${summary.netKdv >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {formatCurrency(summary.netKdv)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MinusIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-600">Önceki Dönemden Devreden</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">-{formatCurrency(summary.previousCredit)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MinusIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-slate-600">Tevkifat Kesintisi</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">-{formatCurrency(summary.withholding)}</span>
              </div>
              <div className="flex items-center justify-between py-4 bg-slate-900 rounded-lg px-4 -mx-3">
                <span className="text-sm font-semibold text-white">
                  {summary.payable > 0 ? 'Ödenecek KDV' : 'Sonraki Döneme Devreden KDV'}
                </span>
                <span className="text-xl font-bold text-white">{formatCurrency(Math.abs(summary.payable))}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">İstisna ve Muafiyetler</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">İhracat Satışları</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(summary.exportSales)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">İstisna Satışlar</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(summary.exemptSales)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Devreden KDV Takibi</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Önceki Dönemden Gelen</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(summary.previousCredit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Sonraki Döneme Aktarılan</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(summary.carryForward)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
