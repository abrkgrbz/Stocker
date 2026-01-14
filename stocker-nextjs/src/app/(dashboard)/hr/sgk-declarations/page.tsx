'use client';

/**
 * SGK Bildirgeleri (Social Security Declarations) Page
 * Türkiye mevzuatına uygun SGK bildirge yönetimi
 * 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePayrolls, usePayrollParameters } from '@/lib/api/hooks/useHR';
import { PayrollStatus } from '@/lib/api/services/hr.types';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type DeclarationStatus = 'draft' | 'calculating' | 'ready' | 'submitted' | 'accepted' | 'rejected' | 'paid';
type DeclarationType = 'aphb' | 'ek_bildirge' | 'iptal_bildirge' | 'eksik_gun';

interface SGKDeclaration {
  id: number;
  declarationType: DeclarationType;
  period: string;
  year: number;
  month: number;
  status: DeclarationStatus;
  workplaceNumber: string;
  employeeCount: number;
  totalWorkDays: number;
  grossEarnings: number;
  sgkPremiumBase: number;
  sgkEmployer: number;
  sgkEmployee: number;
  unemploymentEmployer: number;
  unemploymentEmployee: number;
  totalPremium: number;
  incentiveAmount: number;
  netPayable: number;
  dueDate: string;
  submittedAt?: string;
  acceptedAt?: string;
  referenceNumber?: string;
  createdAt: string;
}

interface EmployeePremiumDetail {
  id: number;
  tcNo: string;
  name: string;
  workDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  grossEarnings: number;
  sgkBase: number;
  sgkPremium: number;
  unemploymentPremium: number;
  totalPremium: number;
  exemptionCode?: string;
}

// Status configurations - using custom badges
const statusConfig: Record<DeclarationStatus, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', badgeClass: 'bg-slate-100 text-slate-600', icon: <ClockIcon className="w-4 h-4" /> },
  calculating: { label: 'Hesaplanıyor', badgeClass: 'bg-slate-200 text-slate-700', icon: <DocumentDuplicateIcon className="w-4 h-4" /> },
  ready: { label: 'Hazır', badgeClass: 'bg-slate-300 text-slate-800', icon: <CheckCircleIcon className="w-4 h-4" /> },
  submitted: { label: 'Gönderildi', badgeClass: 'bg-slate-400 text-white', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  accepted: { label: 'Kabul Edildi', badgeClass: 'bg-slate-700 text-white', icon: <CheckCircleIcon className="w-4 h-4" /> },
  rejected: { label: 'Reddedildi', badgeClass: 'bg-slate-500 text-white', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  paid: { label: 'Ödendi', badgeClass: 'bg-slate-900 text-white', icon: <BanknotesIcon className="w-4 h-4" /> },
};

// Declaration type configurations
const declarationTypeConfig: Record<DeclarationType, { label: string; description: string }> = {
  aphb: { label: 'APHB', description: 'Aylık Prim ve Hizmet Belgesi' },
  ek_bildirge: { label: 'Ek Bildirge', description: 'Ek Prim ve Hizmet Bildirimi' },
  iptal_bildirge: { label: 'İptal Bildirge', description: 'İptal Prim ve Hizmet Bildirimi' },
  eksik_gun: { label: 'Eksik Gün', description: 'Eksik Gün Bildirim Formu' },
};

// SGK Premium rates (from TurkishPayrollCalculationService)
const SGK_RATES = {
  employeeInsurance: 0.14, // %14
  employeeUnemployment: 0.01, // %1
  employerInsurance: 0.205, // %20.5
  employerUnemployment: 0.02, // %2
  employerIncentiveDiscount: 0.05, // %5 (81/ı maddesi)
};

// Eksik gün kodları
const eksikGunKodlari = [
  { code: '01', description: 'İstirahat' },
  { code: '02', description: 'Ücretsiz/Aylıksız İzin' },
  { code: '03', description: 'Disiplin Cezası' },
  { code: '04', description: 'Gözaltına Alınma' },
  { code: '05', description: 'Tutukluluk' },
  { code: '06', description: 'Kısmi İstihdam' },
  { code: '07', description: 'Puantaj Kayıtları' },
  { code: '08', description: 'Grev' },
  { code: '09', description: 'Lokavt' },
  { code: '10', description: 'Genel Hayatı Etkileyen Olaylar' },
  { code: '11', description: 'Doğal Afet' },
  { code: '12', description: 'Birden Fazla' },
  { code: '13', description: 'Diğer' },
  { code: '15', description: 'Devamsızlık' },
  { code: '16', description: 'Fesih Tarihinde Eksik Gün' },
  { code: '17', description: 'Ev Hizmetleri' },
  { code: '18', description: 'Kısa Çalışma Ödeneği' },
  { code: '19', description: 'Ücretsiz Doğum İzni' },
  { code: '20', description: 'Ücretsiz Yarım Çalışma' },
  { code: '21', description: 'Diğer Ücretsiz İzin' },
  { code: '22', description: '4857/S.K. Geçici 10 Ücretsiz İzin' },
  { code: '23', description: 'Pandemi Ücretsiz İzin' },
];

// Turkish month names
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Tab definitions
type TabKey = 'declarations' | 'employees' | 'premium-rates' | 'eksik-gun';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { key: 'declarations', label: 'Bildirgeler', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { key: 'employees', label: 'Sigortalı Detayları', icon: <UserGroupIcon className="w-4 h-4" /> },
  { key: 'premium-rates', label: 'Prim Oranları', icon: <BanknotesIcon className="w-4 h-4" /> },
  { key: 'eksik-gun', label: 'Eksik Gün Kodları', icon: <CalendarDaysIcon className="w-4 h-4" /> },
];

export default function SGKDeclarationsPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedDeclaration, setSelectedDeclaration] = useState<SGKDeclaration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('declarations');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch payroll data from backend
  const { data: payrolls = [], isLoading, refetch } = usePayrolls();
  const { data: payrollParams } = usePayrollParameters();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate SGK declarations from payroll data
  const declarations = useMemo<SGKDeclaration[]>(() => {
    if (!payrolls || payrolls.length === 0) return [];

    // Group payrolls by month/year using year and month from PayrollDto
    const groupedByPeriod = payrolls.reduce((acc, payroll) => {
      const key = `${payroll.year}-${payroll.month}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(payroll);
      return acc;
    }, {} as Record<string, typeof payrolls>);

    return Object.entries(groupedByPeriod).map(([key, periodPayrolls], index) => {
      const [year, month] = key.split('-').map(Number);
      const totalGross = periodPayrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
      const employeeCount = periodPayrolls.length;
      const totalWorkDays = employeeCount * 30; // Simplified

      // Calculate SGK premiums
      const sgkBase = totalGross;
      const sgkEmployee = sgkBase * SGK_RATES.employeeInsurance;
      const sgkEmployer = sgkBase * SGK_RATES.employerInsurance;
      const unemploymentEmployee = sgkBase * SGK_RATES.employeeUnemployment;
      const unemploymentEmployer = sgkBase * SGK_RATES.employerUnemployment;
      const totalPremium = sgkEmployee + sgkEmployer + unemploymentEmployee + unemploymentEmployer;
      const incentiveAmount = sgkBase * SGK_RATES.employerIncentiveDiscount;
      const netPayable = totalPremium - incentiveAmount;

      // Determine status based on payroll status (using PayrollStatus enum)
      let status: DeclarationStatus = 'draft';
      const allApproved = periodPayrolls.every(p => p.status === PayrollStatus.Approved || p.status === PayrollStatus.Paid);
      const allPaid = periodPayrolls.every(p => p.status === PayrollStatus.Paid);
      if (allPaid) {
        status = 'paid';
      } else if (allApproved) {
        status = 'ready';
      }

      // Due date is the last day of the following month
      const dueDate = dayjs().year(year).month(month).endOf('month');

      return {
        id: index + 1,
        declarationType: 'aphb' as DeclarationType,
        period: `${monthNames[month - 1]} ${year}`,
        year,
        month,
        status,
        workplaceNumber: '1234567-89-01-02', // Would come from company settings
        employeeCount,
        totalWorkDays,
        grossEarnings: totalGross,
        sgkPremiumBase: sgkBase,
        sgkEmployer: Math.round(sgkEmployer * 100) / 100,
        sgkEmployee: Math.round(sgkEmployee * 100) / 100,
        unemploymentEmployer: Math.round(unemploymentEmployer * 100) / 100,
        unemploymentEmployee: Math.round(unemploymentEmployee * 100) / 100,
        totalPremium: Math.round(totalPremium * 100) / 100,
        incentiveAmount: Math.round(incentiveAmount * 100) / 100,
        netPayable: Math.round(netPayable * 100) / 100,
        dueDate: dueDate.format('YYYY-MM-DD'),
        createdAt: dayjs().format('YYYY-MM-DD'),
      };
    }).filter(d => d.year === selectedYear);
  }, [payrolls, selectedYear]);

  // Generate employee premium details from payroll data
  const employeeDetails = useMemo<EmployeePremiumDetail[]>(() => {
    if (!payrolls || payrolls.length === 0) return [];

    // Get latest month's payrolls
    const latestPayrolls = payrolls.slice(0, 10); // Show first 10 for now

    return latestPayrolls.map((payroll, index) => {
      const grossEarnings = payroll.grossSalary || 0;
      const sgkBase = grossEarnings;
      const sgkPremium = sgkBase * (SGK_RATES.employeeInsurance + SGK_RATES.employerInsurance);
      const unemploymentPremium = sgkBase * (SGK_RATES.employeeUnemployment + SGK_RATES.employerUnemployment);

      return {
        id: index + 1,
        tcNo: payroll.employeeCode || '-', // TC no backend'de tutulabilir, şimdilik employeeCode kullanıyoruz
        name: payroll.employeeName || 'Bilinmeyen',
        workDays: 30,
        paidLeaveDays: 0,
        unpaidLeaveDays: 0,
        grossEarnings,
        sgkBase,
        sgkPremium: Math.round(sgkPremium * 100) / 100,
        unemploymentPremium: Math.round(unemploymentPremium * 100) / 100,
        totalPremium: Math.round((sgkPremium + unemploymentPremium) * 100) / 100,
      };
    });
  }, [payrolls]);

  // Calculate totals
  const totals = useMemo(() => {
    return declarations.reduce(
      (acc, dec) => {
        if (dec.declarationType === 'aphb') {
          acc.totalPremium += dec.totalPremium;
          acc.totalIncentive += dec.incentiveAmount;
          acc.netPayable += dec.netPayable;
          acc.employeeCount = Math.max(acc.employeeCount, dec.employeeCount);
        }
        if (dec.status === 'paid') {
          acc.paidAmount += dec.netPayable;
        }
        return acc;
      },
      { totalPremium: 0, totalIncentive: 0, netPayable: 0, employeeCount: 0, paidAmount: 0 }
    );
  }, [declarations]);

  // Filter declarations
  const filteredDeclarations = useMemo(() => {
    return declarations.filter(dec => {
      if (typeFilter && dec.declarationType !== typeFilter) return false;
      if (statusFilter && dec.status !== statusFilter) return false;
      return true;
    });
  }, [declarations, typeFilter, statusFilter]);

  // Pagination
  const paginatedDeclarations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDeclarations.slice(startIndex, startIndex + pageSize);
  }, [filteredDeclarations, currentPage]);

  const totalPages = Math.ceil(filteredDeclarations.length / pageSize);

  // Employee details totals
  const employeeTotals = useMemo(() => {
    return employeeDetails.reduce(
      (acc, emp) => {
        acc.totalDays += emp.workDays;
        acc.totalBase += emp.sgkBase;
        acc.totalPremium += emp.totalPremium;
        return acc;
      },
      { totalDays: 0, totalBase: 0, totalPremium: 0 }
    );
  }, [employeeDetails]);

  const yearOptions = [2023, 2024, 2025];

  // Get next due date from declarations
  const nextDueDate = useMemo(() => {
    const upcoming = declarations
      .filter(d => d.status !== 'paid' && dayjs(d.dueDate).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
    return upcoming[0];
  }, [declarations]);

  // Close modal handler
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDeclaration(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ShieldCheckIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SGK Bildirgeleri</h1>
              <p className="text-sm text-slate-500">Aylık Prim ve Hizmet Belgesi (APHB) ve eksik gün bildirimi yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm text-slate-700">Yenile</span>
              </button>
              <button
                onClick={() => router.push('/hr/sgk-declarations/new')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Yeni Bildirge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* No Payroll Data Alert */}
      {!isLoading && payrolls.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-slate-100 border border-slate-300 rounded-lg mb-6">
          <InformationCircleIcon className="w-5 h-5 text-slate-600 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-slate-800">Bordro Verisi Bulunamadı</div>
            <div className="text-sm text-slate-600">
              SGK bildirgeleri bordro verilerinden otomatik olarak oluşturulur. Önce bordro kayıtları oluşturun.
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-500">Sigortalı Sayısı</span>
          </div>
          <div className="text-xl font-bold text-slate-700">{totals.employeeCount}</div>
          <div className="text-xs text-slate-500 mt-1">aktif çalışan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-500">Toplam Prim</span>
          </div>
          <div className="text-xl font-bold text-slate-800">{formatCurrency(totals.totalPremium)}</div>
          <div className="text-xs text-slate-500 mt-1">İşveren + İşçi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-500">Teşvik İndirimi</span>
          </div>
          <div className="text-xl font-bold text-slate-600">-{formatCurrency(totals.totalIncentive)}</div>
          <div className="text-xs text-slate-500 mt-1">5 puan indirimi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-500">Ödenecek Prim</span>
          </div>
          <div className="text-xl font-bold text-slate-700">{formatCurrency(totals.netPayable)}</div>
          <div className="text-xs text-slate-500 mt-1">net tutar</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
            <span className="text-xs text-slate-500">Sonraki Son Tarih</span>
          </div>
          <div className="text-xl font-bold text-slate-600">
            {nextDueDate ? dayjs(nextDueDate.dueDate).format('DD.MM.YYYY') : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {nextDueDate ? nextDueDate.period : 'Bekleyen bildirge yok'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Yıl:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Tür:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Tümü</option>
              {Object.entries(declarationTypeConfig).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Tümü</option>
              {Object.entries(statusConfig).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {/* Tab Headers */}
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Declarations Tab */}
          {activeTab === 'declarations' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">Yükleniyor...</span>
                  </div>
                </div>
              ) : filteredDeclarations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <span className="text-slate-500">
                    {payrolls.length === 0
                      ? 'Bordro verisi bulunamadı - Önce bordro oluşturun'
                      : 'Bildirge bulunmuyor'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Dönem</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">İşyeri No</th>
                          <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Sigortalı</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Prim Matrahı</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Toplam Prim</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Teşvik</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Ödenecek</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Son Tarih</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Durum</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedDeclarations.map((record) => {
                          const isOverdue = dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                                            !['accepted', 'paid', 'submitted'].includes(record.status);
                          const config = statusConfig[record.status];
                          return (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-3">
                                <div className="text-sm font-medium text-slate-900">{record.period}</div>
                                <div className="text-xs text-slate-500">
                                  {declarationTypeConfig[record.declarationType].label}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className="font-mono text-sm text-slate-700">{record.workplaceNumber}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <UserGroupIcon className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-700">{record.employeeCount}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-sm text-slate-700">{formatCurrency(record.sgkPremiumBase)}</span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-sm text-slate-700 font-medium">{formatCurrency(record.totalPremium)}</span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-sm text-slate-600">-{formatCurrency(record.incentiveAmount)}</span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="text-sm font-semibold text-slate-900">{formatCurrency(record.netPayable)}</span>
                              </td>
                              <td className="px-3 py-3">
                                <div className={`text-sm ${isOverdue ? 'text-slate-600 font-medium' : 'text-slate-700'}`}>
                                  {dayjs(record.dueDate).format('DD.MM.YYYY')}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.badgeClass}`}>
                                  {config.icon}
                                  <span>{config.label}</span>
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setSelectedDeclaration(record);
                                      setIsDetailModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Detay"
                                  >
                                    <EyeIcon className="w-4 h-4 text-slate-500" />
                                  </button>
                                  {record.status === 'ready' && (
                                    <button
                                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="SGK'ya Gönder"
                                    >
                                      <PaperAirplaneIcon className="w-4 h-4 text-slate-600" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm text-slate-500">
                        Toplam {filteredDeclarations.length} bildirge
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-slate-600">
                          Sayfa {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-slate-500">
                  Sigortalı bazlı prim detayları (bordro verilerinden)
                </p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">Yükleniyor...</span>
                  </div>
                </div>
              ) : employeeDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <UserGroupIcon className="w-12 h-12 text-slate-300 mb-3" />
                  <span className="text-slate-500">Sigortalı verisi bulunamadı</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">TC Kimlik No</th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Ad Soyad</th>
                        <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Gün</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">SPEK</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">SGK Primi</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">İşsizlik</th>
                        <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Toplam</th>
                        <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-3">Teşvik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employeeDetails.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3">
                            <span className="font-mono text-sm">{emp.tcNo}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-sm text-slate-900">{emp.name}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="text-sm">
                              <div className="text-slate-900">{emp.workDays}</div>
                              {emp.unpaidLeaveDays > 0 && (
                                <div className="text-xs text-slate-700">+{emp.unpaidLeaveDays} eksik</div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm">{formatCurrency(emp.sgkBase)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm text-slate-700">{formatCurrency(emp.sgkPremium)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm text-slate-600">{formatCurrency(emp.unemploymentPremium)}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-sm font-semibold">{formatCurrency(emp.totalPremium)}</span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {emp.exemptionCode ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                {emp.exemptionCode}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr className="border-t-2 border-slate-200">
                        <td className="px-3 py-3" colSpan={2}>
                          <span className="font-semibold">Toplam ({employeeDetails.length} sigortalı)</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="font-semibold">{employeeTotals.totalDays}</span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="font-semibold">{formatCurrency(employeeTotals.totalBase)}</span>
                        </td>
                        <td className="px-3 py-3" colSpan={2}></td>
                        <td className="px-3 py-3 text-right">
                          <span className="font-semibold text-slate-700">{formatCurrency(employeeTotals.totalPremium)}</span>
                        </td>
                        <td className="px-3 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Premium Rates Tab */}
          {activeTab === 'premium-rates' && (
            <div className="space-y-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500">
                  5510 sayılı kanun kapsamında SGK prim oranları (2025)
                </p>
              </div>

              {/* Premium Rates Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase p-3">Prim Türü</th>
                      <th className="text-center text-xs font-medium text-slate-500 uppercase p-3">İşveren</th>
                      <th className="text-center text-xs font-medium text-slate-500 uppercase p-3">İşçi</th>
                      <th className="text-center text-xs font-medium text-slate-500 uppercase p-3">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 text-sm text-slate-900">Kısa Vadeli Sigorta Primi</td>
                      <td className="p-3 text-sm text-center font-medium">%2</td>
                      <td className="p-3 text-sm text-center text-slate-400">-</td>
                      <td className="p-3 text-sm text-center font-medium">%2</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3 text-sm text-slate-900">Malullük, Yaşlılık, Ölüm Sigortası</td>
                      <td className="p-3 text-sm text-center font-medium">%11</td>
                      <td className="p-3 text-sm text-center font-medium">%9</td>
                      <td className="p-3 text-sm text-center font-medium">%20</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-sm text-slate-900">Genel Sağlık Sigortası</td>
                      <td className="p-3 text-sm text-center font-medium">%7.5</td>
                      <td className="p-3 text-sm text-center font-medium">%5</td>
                      <td className="p-3 text-sm text-center font-medium">%12.5</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-3 text-sm text-slate-700">5 Puan İşveren İndirimi (81/ı)</td>
                      <td className="p-3 text-sm text-center font-medium text-slate-600">-%5</td>
                      <td className="p-3 text-sm text-center text-slate-400">-</td>
                      <td className="p-3 text-sm text-center font-medium text-slate-600">-%5</td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td className="p-3 text-sm font-semibold text-slate-900">SGK Primi Toplamı</td>
                      <td className="p-3 text-sm text-center font-bold">%15.5</td>
                      <td className="p-3 text-sm text-center font-bold">%14</td>
                      <td className="p-3 text-sm text-center font-bold">%29.5</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-sm text-slate-900">İşsizlik Sigortası</td>
                      <td className="p-3 text-sm text-center font-medium">%2</td>
                      <td className="p-3 text-sm text-center font-medium">%1</td>
                      <td className="p-3 text-sm text-center font-medium">%3</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-200">
                    <tr>
                      <td className="p-3 text-sm font-bold text-slate-900">Genel Toplam</td>
                      <td className="p-3 text-sm text-center font-bold text-slate-900">%17.5</td>
                      <td className="p-3 text-sm text-center font-bold text-slate-900">%15</td>
                      <td className="p-3 text-sm text-center font-bold text-slate-900">%32.5</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Info Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 mb-1">5 Puan İşveren İndirimi</div>
                      <div className="text-xs text-slate-600">
                        5510 sayılı Kanun'un 81/ı maddesi kapsamında, SGK'ya borcu olmayan ve
                        kayıt dışı sigortalı çalıştırmayan işverenlere %5 prim indirimi uygulanır.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-slate-800 mb-1">Prim Tavanı</div>
                      <div className="text-xs text-slate-600">
                        2025 yılı için SGK prim tavanı brüt asgari ücretin 7.5 katıdır.
                        Bu tutarı aşan kazançlar için prim hesaplanmaz.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eksik Gün Tab */}
          {activeTab === 'eksik-gun' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                SGK eksik gün bildirim nedeni kodları
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eksikGunKodlari.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-700">{item.code}</span>
                    </div>
                    <span className="text-sm text-slate-700">{item.description}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div className="text-sm text-slate-700">
                    <strong>Önemli:</strong> 30 günden az çalışılan aylarda eksik gün
                    bildirim formu doldurulması zorunludur. Belgelenemeyen eksik günler
                    için idari para cezası uygulanabilir.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Bildirge Detayı</div>
                  <div className="text-sm text-slate-500">
                    {selectedDeclaration.period} - {declarationTypeConfig[selectedDeclaration.declarationType].label}
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Durum</div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedDeclaration.status].badgeClass}`}>
                    {statusConfig[selectedDeclaration.status].icon}
                    <span>{statusConfig[selectedDeclaration.status].label}</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">İşyeri Sicil No</div>
                  <div className="font-mono text-sm">{selectedDeclaration.workplaceNumber}</div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-1">Sigortalı</div>
                  <div className="text-lg font-semibold">{selectedDeclaration.employeeCount}</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-1">Toplam Gün</div>
                  <div className="text-lg font-semibold">{selectedDeclaration.totalWorkDays}</div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg text-center">
                  <div className="text-xs text-slate-500 mb-1">Prim Matrahı</div>
                  <div className="text-lg font-semibold">{formatCurrency(selectedDeclaration.sgkPremiumBase)}</div>
                </div>
              </div>

              {/* Premium Breakdown */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Prim Dağılımı</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">SGK İşveren Payı</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.sgkEmployer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">SGK İşçi Payı</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.sgkEmployee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">İşsizlik İşveren</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.unemploymentEmployer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">İşsizlik İşçi</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.unemploymentEmployee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Toplam Prim</span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(selectedDeclaration.totalPremium)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Teşvik İndirimi</span>
                    <span className="text-sm font-medium text-slate-600">-{formatCurrency(selectedDeclaration.incentiveAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="bg-slate-900 text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ödenecek Net Prim</span>
                  <span className="text-xl font-bold">{formatCurrency(selectedDeclaration.netPayable)}</span>
                </div>
              </div>

              {/* Reference Number */}
              {selectedDeclaration.referenceNumber && (
                <div className="text-center text-xs text-slate-500">
                  Referans No: <span className="font-mono">{selectedDeclaration.referenceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
