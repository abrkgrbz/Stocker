'use client';

/**
 * Muhtasar ve Prim Hizmet Beyannamesi (Muhtasar Declaration) Page
 * Türkiye mevzuatına uygun stopaj ve SGK prim beyannamesi yönetimi
 * GİB e-Beyanname sistemine uyumlu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Tabs, Tag, Progress, Modal, Form, InputNumber, DatePicker, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type DeclarationStatus = 'draft' | 'calculating' | 'ready' | 'submitted' | 'accepted' | 'rejected' | 'paid';
type DeclarationPeriod = 'monthly' | 'quarterly';

interface MuhtasarDeclaration {
  id: number;
  period: string;
  year: number;
  month: number;
  periodType: DeclarationPeriod;
  status: DeclarationStatus;
  employeeCount: number;
  grossWages: number;
  incomeTax: number;
  stampTax: number;
  sgkEmployer: number;
  sgkEmployee: number;
  unemploymentEmployer: number;
  unemploymentEmployee: number;
  totalTax: number;
  totalSgk: number;
  grandTotal: number;
  dueDate: string;
  submittedAt?: string;
  acceptedAt?: string;
  receiptNumber?: string;
  createdAt: string;
}

interface WithholdingDetail {
  id: number;
  code: string;
  description: string;
  taxBase: number;
  rate: number;
  taxAmount: number;
  category: 'wages' | 'rent' | 'freelance' | 'other';
}

// Status configurations
const statusConfig: Record<DeclarationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', color: 'default', icon: <ClockIcon className="w-4 h-4" /> },
  calculating: { label: 'Hesaplanıyor', color: 'processing', icon: <CalculatorIcon className="w-4 h-4" /> },
  ready: { label: 'Hazır', color: 'blue', icon: <CheckCircleIcon className="w-4 h-4" /> },
  submitted: { label: 'Gönderildi', color: 'cyan', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  accepted: { label: 'Kabul Edildi', color: 'green', icon: <CheckCircleIcon className="w-4 h-4" /> },
  rejected: { label: 'Reddedildi', color: 'red', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  paid: { label: 'Ödendi', color: 'purple', icon: <BanknotesIcon className="w-4 h-4" /> },
};

// Withholding codes (GİB Stopaj Kodları)
const withholdingCodes = [
  { code: '001', description: 'Ücretler', category: 'wages' },
  { code: '002', description: 'Serbest Meslek Ödemeleri', category: 'freelance' },
  { code: '003', description: 'Kira Ödemeleri (GMSİ)', category: 'rent' },
  { code: '004', description: 'Kar Payları', category: 'other' },
  { code: '011', description: 'Çiftçilerden Alınan Zirai Mahsuller', category: 'other' },
  { code: '012', description: 'Esnaf Muaflığı Kapsamındaki Ödemeler', category: 'other' },
  { code: '017', description: 'Yıllara Sari İnşaat Hakediş Ödemeleri', category: 'other' },
  { code: '021', description: 'Diğer Ödemeler', category: 'other' },
];

// Mock data
const mockDeclarations: MuhtasarDeclaration[] = [
  {
    id: 1,
    period: '2025-01',
    year: 2025,
    month: 1,
    periodType: 'monthly',
    status: 'accepted',
    employeeCount: 45,
    grossWages: 1250000,
    incomeTax: 187500,
    stampTax: 9487.5,
    sgkEmployer: 275000,
    sgkEmployee: 175000,
    unemploymentEmployer: 25000,
    unemploymentEmployee: 12500,
    totalTax: 196987.5,
    totalSgk: 487500,
    grandTotal: 684487.5,
    dueDate: '2025-02-26',
    submittedAt: '2025-02-20',
    acceptedAt: '2025-02-20',
    receiptNumber: 'MUH2025010001234',
    createdAt: '2025-02-01',
  },
  {
    id: 2,
    period: '2025-02',
    year: 2025,
    month: 2,
    periodType: 'monthly',
    status: 'ready',
    employeeCount: 47,
    grossWages: 1320000,
    incomeTax: 198000,
    stampTax: 10019.52,
    sgkEmployer: 290400,
    sgkEmployee: 184800,
    unemploymentEmployer: 26400,
    unemploymentEmployee: 13200,
    totalTax: 208019.52,
    totalSgk: 514800,
    grandTotal: 722819.52,
    dueDate: '2025-03-26',
    createdAt: '2025-03-01',
  },
  {
    id: 3,
    period: '2024-Q4',
    year: 2024,
    month: 12,
    periodType: 'quarterly',
    status: 'paid',
    employeeCount: 42,
    grossWages: 3450000,
    incomeTax: 517500,
    stampTax: 26190.75,
    sgkEmployer: 759000,
    sgkEmployee: 483000,
    unemploymentEmployer: 69000,
    unemploymentEmployee: 34500,
    totalTax: 543690.75,
    totalSgk: 1345500,
    grandTotal: 1889190.75,
    dueDate: '2025-01-26',
    submittedAt: '2025-01-15',
    acceptedAt: '2025-01-15',
    receiptNumber: 'MUH2024Q40001234',
    createdAt: '2025-01-02',
  },
];

const mockWithholdingDetails: WithholdingDetail[] = [
  { id: 1, code: '001', description: 'Ücretler (Gelir Vergisi)', taxBase: 1320000, rate: 15, taxAmount: 198000, category: 'wages' },
  { id: 2, code: '001', description: 'Ücretler (Damga Vergisi)', taxBase: 1320000, rate: 0.759, taxAmount: 10019.52, category: 'wages' },
  { id: 3, code: '002', description: 'Serbest Meslek Ödemeleri', taxBase: 85000, rate: 20, taxAmount: 17000, category: 'freelance' },
  { id: 4, code: '003', description: 'Kira Ödemeleri (GMSİ)', taxBase: 45000, rate: 20, taxAmount: 9000, category: 'rent' },
  { id: 5, code: '017', description: 'Yıllara Sari İnşaat', taxBase: 120000, rate: 5, taxAmount: 6000, category: 'other' },
];

export default function MuhtasarDeclarationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDeclaration, setSelectedDeclaration] = useState<MuhtasarDeclaration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `%${rate.toFixed(2)}`;
  };

  // Calculate totals
  const totals = mockDeclarations.reduce(
    (acc, dec) => {
      acc.totalTax += dec.totalTax;
      acc.totalSgk += dec.totalSgk;
      acc.grandTotal += dec.grandTotal;
      if (dec.status === 'accepted' || dec.status === 'paid') {
        acc.submittedCount++;
      }
      if (dec.status === 'paid') {
        acc.paidAmount += dec.grandTotal;
      }
      return acc;
    },
    { totalTax: 0, totalSgk: 0, grandTotal: 0, submittedCount: 0, paidAmount: 0 }
  );

  // Check for overdue declarations
  const overdueDeclarations = mockDeclarations.filter(
    (dec) =>
      dayjs(dec.dueDate).isBefore(dayjs(), 'day') &&
      !['accepted', 'paid', 'submitted'].includes(dec.status)
  );

  const columns: ColumnsType<MuhtasarDeclaration> = [
    {
      title: 'Dönem',
      key: 'period',
      width: 140,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.period}</div>
          <div className="text-xs text-slate-500">
            {record.periodType === 'monthly' ? 'Aylık' : 'Üç Aylık'}
          </div>
        </div>
      ),
    },
    {
      title: 'Çalışan',
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
      title: 'Brüt Ücret',
      dataIndex: 'grossWages',
      key: 'grossWages',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-700">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Gelir Vergisi',
      dataIndex: 'incomeTax',
      key: 'incomeTax',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-blue-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'SGK Toplam',
      dataIndex: 'totalSgk',
      key: 'totalSgk',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-emerald-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Genel Toplam',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Son Tarih',
      key: 'dueDate',
      width: 120,
      render: (_, record) => {
        const isOverdue = dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                          !['accepted', 'paid', 'submitted'].includes(record.status);
        const daysLeft = dayjs(record.dueDate).diff(dayjs(), 'day');

        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
              {dayjs(record.dueDate).format('DD.MM.YYYY')}
            </div>
            {!['accepted', 'paid', 'submitted'].includes(record.status) && (
              <div className={`text-xs ${isOverdue ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-slate-500'}`}>
                {isOverdue ? `${Math.abs(daysLeft)} gün gecikmiş` : `${daysLeft} gün kaldı`}
              </div>
            )}
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
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            <span>{config.label}</span>
          </Tag>
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
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              title="GİB'e Gönder"
            >
              <PaperAirplaneIcon className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const withholdingColumns: ColumnsType<WithholdingDetail> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (value, record) => (
        <div>
          <div className="text-sm text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">
            {record.category === 'wages' && 'Ücret Ödemeleri'}
            {record.category === 'freelance' && 'Serbest Meslek'}
            {record.category === 'rent' && 'Kira Gelirleri'}
            {record.category === 'other' && 'Diğer'}
          </div>
        </div>
      ),
    },
    {
      title: 'Matrah',
      dataIndex: 'taxBase',
      key: 'taxBase',
      width: 140,
      align: 'right',
      render: (value) => <span className="text-sm">{formatCurrency(value)}</span>,
    },
    {
      title: 'Oran',
      dataIndex: 'rate',
      key: 'rate',
      width: 80,
      align: 'center',
      render: (value) => <span className="text-sm text-slate-600">{formatPercent(value)}</span>,
    },
    {
      title: 'Vergi',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 130,
      align: 'right',
      render: (value) => <span className="text-sm font-medium text-blue-600">{formatCurrency(value)}</span>,
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const yearOptions = [2023, 2024, 2025].map(year => ({ value: year, label: year.toString() }));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Muhtasar ve Prim Hizmet Beyannamesi</h1>
              <p className="text-sm text-slate-500">Aylık/üç aylık stopaj ve SGK prim beyannamesi yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/finance/tax/muhtasar/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Beyanname</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {overdueDeclarations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <div className="text-sm font-medium text-red-800">
                {overdueDeclarations.length} adet gecikmiş beyanname var!
              </div>
              <div className="text-xs text-red-600 mt-1">
                Gecikme cezası ve faiz uygulanabilir. Lütfen en kısa sürede beyannamelerinizi gönderin.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalculatorIcon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-slate-500">Toplam Vergi</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalTax)}</div>
          <div className="text-xs text-slate-500 mt-1">Gelir + Damga Vergisi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserGroupIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-500">Toplam SGK</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">{formatCurrency(totals.totalSgk)}</div>
          <div className="text-xs text-slate-500 mt-1">İşveren + İşçi Payı</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-slate-500">Genel Toplam</span>
          </div>
          <div className="text-xl font-bold text-purple-600">{formatCurrency(totals.grandTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">Vergi + SGK</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-cyan-500" />
            <span className="text-xs text-slate-500">Gönderilen</span>
          </div>
          <div className="text-xl font-bold text-cyan-600">{totals.submittedCount}</div>
          <div className="text-xs text-slate-500 mt-1">beyanname</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDaysIcon className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-slate-500">Sonraki Son Tarih</span>
          </div>
          <div className="text-xl font-bold text-amber-600">26.03.2025</div>
          <div className="text-xs text-slate-500 mt-1">Şubat 2025 dönemi</div>
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
            <span className="text-sm text-slate-500">Durum:</span>
            <Select
              placeholder="Tümü"
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-40"
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
                  Beyannameler
                </span>
              ),
              children: (
                <>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spin size="large" />
                    </div>
                  ) : mockDeclarations.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-slate-500">Beyanname bulunmuyor</span>}
                    />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={mockDeclarations}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} beyanname`,
                      }}
                      scroll={{ x: 1200 }}
                      className={tableClassName}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'withholding',
              label: (
                <span className="flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4" />
                  Stopaj Detayları
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">
                      Şubat 2025 dönemi stopaj kalemleri (GİB Stopaj Kodları)
                    </p>
                  </div>
                  <Table
                    columns={withholdingColumns}
                    dataSource={mockWithholdingDetails}
                    rowKey="id"
                    pagination={false}
                    className={tableClassName}
                    summary={(pageData) => {
                      const totalBase = pageData.reduce((sum, item) => sum + item.taxBase, 0);
                      const totalTax = pageData.reduce((sum, item) => sum + item.taxAmount, 0);
                      return (
                        <Table.Summary fixed>
                          <Table.Summary.Row className="bg-slate-50">
                            <Table.Summary.Cell index={0} colSpan={2}>
                              <span className="font-semibold">Toplam</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                              <span className="font-semibold">{formatCurrency(totalBase)}</span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} />
                            <Table.Summary.Cell index={4} align="right">
                              <span className="font-semibold text-blue-600">{formatCurrency(totalTax)}</span>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      );
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'sgk',
              label: (
                <span className="flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
                  SGK Primleri
                </span>
              ),
              children: (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">
                      Şubat 2025 dönemi SGK prim hesaplaması
                    </p>
                  </div>

                  {/* SGK Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-1">SGK İşveren Payı (%22)</div>
                      <div className="text-lg font-semibold text-slate-900">{formatCurrency(290400)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-1">SGK İşçi Payı (%14)</div>
                      <div className="text-lg font-semibold text-slate-900">{formatCurrency(184800)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-1">İşsizlik İşveren (%2)</div>
                      <div className="text-lg font-semibold text-slate-900">{formatCurrency(26400)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-1">İşsizlik İşçi (%1)</div>
                      <div className="text-lg font-semibold text-slate-900">{formatCurrency(13200)}</div>
                    </div>
                  </div>

                  {/* Prim Calculation Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase p-3">Prim Türü</th>
                          <th className="text-center text-xs font-medium text-slate-500 uppercase p-3">İşveren Oranı</th>
                          <th className="text-center text-xs font-medium text-slate-500 uppercase p-3">İşçi Oranı</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase p-3">İşveren Payı</th>
                          <th className="text-right text-xs font-medium text-slate-500 uppercase p-3">İşçi Payı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-3 text-sm text-slate-900">Kısa Vadeli Sigorta</td>
                          <td className="p-3 text-sm text-center text-slate-600">%2</td>
                          <td className="p-3 text-sm text-center text-slate-600">-</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(26400)}</td>
                          <td className="p-3 text-sm text-right">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-900">Malullük, Yaşlılık ve Ölüm</td>
                          <td className="p-3 text-sm text-center text-slate-600">%11</td>
                          <td className="p-3 text-sm text-center text-slate-600">%9</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(145200)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(118800)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-900">Genel Sağlık Sigortası</td>
                          <td className="p-3 text-sm text-center text-slate-600">%7.5</td>
                          <td className="p-3 text-sm text-center text-slate-600">%5</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(99000)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(66000)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-900">5 Puan İşveren İndirimi</td>
                          <td className="p-3 text-sm text-center text-slate-600">-%5</td>
                          <td className="p-3 text-sm text-center text-slate-600">-</td>
                          <td className="p-3 text-sm text-right text-emerald-600">-{formatCurrency(66000)}</td>
                          <td className="p-3 text-sm text-right">-</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-900">İşsizlik Sigortası</td>
                          <td className="p-3 text-sm text-center text-slate-600">%2</td>
                          <td className="p-3 text-sm text-center text-slate-600">%1</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(26400)}</td>
                          <td className="p-3 text-sm text-right">{formatCurrency(13200)}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-50">
                        <tr>
                          <td className="p-3 text-sm font-semibold text-slate-900">Toplam</td>
                          <td className="p-3 text-sm text-center font-semibold">%17.5</td>
                          <td className="p-3 text-sm text-center font-semibold">%15</td>
                          <td className="p-3 text-sm text-right font-semibold">{formatCurrency(231000)}</td>
                          <td className="p-3 text-sm text-right font-semibold">{formatCurrency(198000)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>5510 Sayılı Kanun 81/ı maddesi:</strong> 5 puanlık işveren SGK prim indirimi uygulanmıştır.
                        Şartları sağlayan işverenler için genel sağlık sigortası priminin %5'lik kısmı Hazine tarafından karşılanmaktadır.
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'calendar',
              label: (
                <span className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Beyanname Takvimi
                </span>
              ),
              children: (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">
                    2025 yılı Muhtasar ve Prim Hizmet Beyannamesi son ödeme tarihleri
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { month: 'Ocak 2025', dueDate: '26 Şubat 2025', status: 'completed' },
                      { month: 'Şubat 2025', dueDate: '26 Mart 2025', status: 'current' },
                      { month: 'Mart 2025', dueDate: '28 Nisan 2025', status: 'upcoming' },
                      { month: 'Nisan 2025', dueDate: '26 Mayıs 2025', status: 'upcoming' },
                      { month: 'Mayıs 2025', dueDate: '26 Haziran 2025', status: 'upcoming' },
                      { month: 'Haziran 2025', dueDate: '28 Temmuz 2025', status: 'upcoming' },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          item.status === 'completed'
                            ? 'border-emerald-200 bg-emerald-50'
                            : item.status === 'current'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">{item.month}</span>
                          {item.status === 'completed' && (
                            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                          )}
                          {item.status === 'current' && (
                            <ClockIcon className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">Son Tarih: {item.dueDate}</div>
                        {item.status === 'current' && (
                          <div className="mt-2">
                            <Progress
                              percent={60}
                              size="small"
                              strokeColor="#f59e0b"
                              showInfo={false}
                            />
                            <div className="text-xs text-amber-600 mt-1">Süre dolmak üzere</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Beyanname Süreleri</h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Muhtasar Beyanname: Takip eden ayın 26'sına kadar</li>
                      <li>• Ödeme: Beyanname verme süresinin son günü</li>
                      <li>• Düzeltme Beyannamesi: Son ödeme tarihinden itibaren 5 yıl içinde verilebilir</li>
                      <li>• Gecikme Zammı: Aylık %2.5 oranında uygulanır</li>
                    </ul>
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
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">Beyanname Detayı</div>
              <div className="text-sm text-slate-500">{selectedDeclaration?.period}</div>
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
                <Tag color={statusConfig[selectedDeclaration.status].color} className="flex items-center gap-1 w-fit">
                  {statusConfig[selectedDeclaration.status].icon}
                  <span>{statusConfig[selectedDeclaration.status].label}</span>
                </Tag>
              </div>
              {selectedDeclaration.receiptNumber && (
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Makbuz No</div>
                  <div className="font-mono text-sm">{selectedDeclaration.receiptNumber}</div>
                </div>
              )}
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Çalışan Sayısı</div>
                <div className="text-lg font-semibold">{selectedDeclaration.employeeCount}</div>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Brüt Ücret Toplamı</div>
                <div className="text-lg font-semibold">{formatCurrency(selectedDeclaration.grossWages)}</div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">Vergi Detayları</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Gelir Vergisi</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.incomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Damga Vergisi</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.stampTax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-900">Toplam Vergi</span>
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(selectedDeclaration.totalTax)}</span>
                </div>
              </div>
            </div>

            {/* SGK Breakdown */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">SGK Primleri</span>
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
                  <span className="text-sm font-semibold text-slate-900">Toplam SGK</span>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(selectedDeclaration.totalSgk)}</span>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-slate-900 text-white rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Genel Toplam</span>
                <span className="text-xl font-bold">{formatCurrency(selectedDeclaration.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
