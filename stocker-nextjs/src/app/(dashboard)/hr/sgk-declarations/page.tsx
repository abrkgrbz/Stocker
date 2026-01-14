'use client';

/**
 * SGK Bildirgeleri (Social Security Declarations) Page
 * Türkiye mevzuatına uygun SGK bildirge yönetimi
 * 5510 sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, Select, Tabs, Modal, Spin, Empty, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

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

// Status configurations - using custom badges instead of colored Tags
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

export default function SGKDeclarationsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDeclaration, setSelectedDeclaration] = useState<SGKDeclaration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const columns: ColumnsType<SGKDeclaration> = [
    {
      title: 'Dönem',
      key: 'period',
      width: 120,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.period}</div>
          <div className="text-xs text-slate-500">
            {declarationTypeConfig[record.declarationType].label}
          </div>
        </div>
      ),
    },
    {
      title: 'İşyeri No',
      dataIndex: 'workplaceNumber',
      key: 'workplaceNumber',
      width: 140,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: 'Sigortalı',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 90,
      align: 'center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <UserGroupIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">{value}</span>
        </div>
      ),
    },
    {
      title: 'Prim Matrahı',
      dataIndex: 'sgkPremiumBase',
      key: 'sgkPremiumBase',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-700">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Toplam Prim',
      dataIndex: 'totalPremium',
      key: 'totalPremium',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-700 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Teşvik',
      dataIndex: 'incentiveAmount',
      key: 'incentiveAmount',
      width: 110,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-600">-{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Ödenecek',
      dataIndex: 'netPayable',
      key: 'netPayable',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Son Tarih',
      key: 'dueDate',
      width: 110,
      render: (_, record) => {
        const isOverdue = dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                          !['accepted', 'paid', 'submitted'].includes(record.status);

        return (
          <div className={`text-sm ${isOverdue ? 'text-slate-600 font-medium' : 'text-slate-700'}`}>
            {dayjs(record.dueDate).format('DD.MM.YYYY')}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const config = statusConfig[record.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.badgeClass}`}>
            {config.icon}
            <span>{config.label}</span>
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
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
      ),
    },
  ];

  const employeeColumns: ColumnsType<EmployeePremiumDetail> = [
    {
      title: 'TC Kimlik No',
      dataIndex: 'tcNo',
      key: 'tcNo',
      width: 130,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (value) => <span className="text-sm text-slate-900">{value}</span>,
    },
    {
      title: 'Gün',
      key: 'days',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-900">{record.workDays}</div>
          {record.unpaidLeaveDays > 0 && (
            <div className="text-xs text-slate-700">+{record.unpaidLeaveDays} eksik</div>
          )}
        </div>
      ),
    },
    {
      title: 'SPEK',
      dataIndex: 'sgkBase',
      key: 'sgkBase',
      width: 120,
      align: 'right',
      render: (value) => <span className="text-sm">{formatCurrency(value)}</span>,
    },
    {
      title: 'SGK Primi',
      dataIndex: 'sgkPremium',
      key: 'sgkPremium',
      width: 110,
      align: 'right',
      render: (value) => <span className="text-sm text-slate-700">{formatCurrency(value)}</span>,
    },
    {
      title: 'İşsizlik',
      dataIndex: 'unemploymentPremium',
      key: 'unemploymentPremium',
      width: 100,
      align: 'right',
      render: (value) => <span className="text-sm text-slate-600">{formatCurrency(value)}</span>,
    },
    {
      title: 'Toplam',
      dataIndex: 'totalPremium',
      key: 'totalPremium',
      width: 110,
      align: 'right',
      render: (value) => <span className="text-sm font-semibold">{formatCurrency(value)}</span>,
    },
    {
      title: 'Teşvik',
      dataIndex: 'exemptionCode',
      key: 'exemptionCode',
      width: 80,
      align: 'center',
      render: (value) =>
        value ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            {value}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  const yearOptions = [2023, 2024, 2025].map(year => ({ value: year, label: year.toString() }));

  // Get next due date from declarations
  const nextDueDate = useMemo(() => {
    const upcoming = declarations
      .filter(d => d.status !== 'paid' && dayjs(d.dueDate).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
    return upcoming[0];
  }, [declarations]);

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
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/hr/sgk-declarations/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Bildirge</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* No Payroll Data Alert */}
      {!isLoading && payrolls.length === 0 && (
        <Alert
          message="Bordro Verisi Bulunamadı"
          description="SGK bildirgeleri bordro verilerinden otomatik olarak oluşturulur. Önce bordro kayıtları oluşturun."
          type="info"
          showIcon
          className="mb-6"
        />
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
            <Select
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              options={yearOptions}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Tür:</span>
            <Select
              placeholder="Tümü"
              allowClear
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              className="w-36"
              options={Object.entries(declarationTypeConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Durum:</span>
            <Select
              placeholder="Tümü"
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-36"
              options={Object.entries(statusConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          defaultActiveKey="declarations"
          items={[
            {
              key: 'declarations',
              label: (
                <span className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Bildirgeler
                </span>
              ),
              children: (
                <>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spin size="large" />
                    </div>
                  ) : filteredDeclarations.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span className="text-slate-500">
                          {payrolls.length === 0
                            ? 'Bordro verisi bulunamadı - Önce bordro oluşturun'
                            : 'Bildirge bulunmuyor'}
                        </span>
                      }
                    />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={filteredDeclarations}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} bildirge`,
                      }}
                      scroll={{ x: 1200 }}
                      className={tableClassName}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'employees',
              label: (
                <span className="flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
                  Sigortalı Detayları
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">
                      Sigortalı bazlı prim detayları (bordro verilerinden)
                    </p>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spin size="large" />
                    </div>
                  ) : employeeDetails.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-slate-500">Sigortalı verisi bulunamadı</span>}
                    />
                  ) : (
                    <Table
                      columns={employeeColumns}
                      dataSource={employeeDetails}
                      rowKey="id"
                      pagination={false}
                      className={tableClassName}
                      summary={(pageData) => {
                        const totalDays = pageData.reduce((sum, item) => sum + item.workDays, 0);
                        const totalBase = pageData.reduce((sum, item) => sum + item.sgkBase, 0);
                        const totalPremium = pageData.reduce((sum, item) => sum + item.totalPremium, 0);
                        return (
                          <Table.Summary fixed>
                            <Table.Summary.Row className="bg-slate-50">
                              <Table.Summary.Cell index={0} colSpan={2}>
                                <span className="font-semibold">Toplam ({pageData.length} sigortalı)</span>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={2} align="center">
                                <span className="font-semibold">{totalDays}</span>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={3} align="right">
                                <span className="font-semibold">{formatCurrency(totalBase)}</span>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={4} colSpan={2} />
                              <Table.Summary.Cell index={6} align="right">
                                <span className="font-semibold text-slate-700">{formatCurrency(totalPremium)}</span>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={7} />
                            </Table.Summary.Row>
                          </Table.Summary>
                        );
                      }}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'premium-rates',
              label: (
                <span className="flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4" />
                  Prim Oranları
                </span>
              ),
              children: (
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
              ),
            },
            {
              key: 'eksik-gun',
              label: (
                <span className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Eksik Gün Kodları
                </span>
              ),
              children: (
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
              ),
            },
          ]}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">Bildirge Detayı</div>
              <div className="text-sm text-slate-500">
                {selectedDeclaration?.period} - {selectedDeclaration && declarationTypeConfig[selectedDeclaration.declarationType].label}
              </div>
            </div>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedDeclaration && (
          <div className="space-y-6 mt-6">
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
        )}
      </Modal>
    </div>
  );
}
