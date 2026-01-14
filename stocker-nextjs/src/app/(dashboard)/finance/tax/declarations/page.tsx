'use client';

/**
 * Tax Declarations (Vergi Beyannameleri) List Page
 * GİB - KDV, Muhtasar, Geçici Vergi vb. beyannameler
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Select, Spin, Empty, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useTaxDeclarations } from '@/lib/api/hooks/useFinance';
import type { TaxDeclarationSummaryDto, TaxDeclarationFilterDto } from '@/lib/api/services/finance.types';
import { TaxDeclarationType, TaxDeclarationStatus } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Calculated: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hesaplandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Ready: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Hazır', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Filed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-3 h-3" /> },
  Accepted: { bg: 'bg-slate-900', text: 'text-white', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi', icon: <XCircleIcon className="w-3 h-3" /> },
  Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi', icon: <BanknotesIcon className="w-3 h-3" /> },
};

// Declaration type configuration
const declarationTypeConfig: Record<string, { label: string; description: string; color: string }> = {
  KDV: { label: 'KDV', description: 'Katma Değer Vergisi', color: 'bg-blue-100 text-blue-700' },
  KDV2: { label: 'KDV 2', description: 'KDV 2 Beyannamesi', color: 'bg-indigo-100 text-indigo-700' },
  Muhtasar: { label: 'Muhtasar', description: 'Muhtasar ve Prim Hizmet', color: 'bg-purple-100 text-purple-700' },
  GeciciVergi: { label: 'Geçici Vergi', description: 'Geçici Vergi Beyannamesi', color: 'bg-orange-100 text-orange-700' },
  KurumlarVergisi: { label: 'Kurumlar', description: 'Kurumlar Vergisi', color: 'bg-red-100 text-red-700' },
  GelirVergisi: { label: 'Gelir', description: 'Gelir Vergisi', color: 'bg-green-100 text-green-700' },
  DamgaVergisi: { label: 'Damga', description: 'Damga Vergisi', color: 'bg-pink-100 text-pink-700' },
  BSMV: { label: 'BSMV', description: 'Banka Sigorta Muameleleri', color: 'bg-cyan-100 text-cyan-700' },
};

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Quarter names
const quarterNames = ['1. Çeyrek', '2. Çeyrek', '3. Çeyrek', '4. Çeyrek'];

export default function TaxDeclarationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [declarationType, setDeclarationType] = useState<TaxDeclarationType | undefined>(undefined);
  const [status, setStatus] = useState<TaxDeclarationStatus | undefined>(undefined);
  const [periodYear, setPeriodYear] = useState<number | undefined>(new Date().getFullYear());

  // Build filter
  const filters: TaxDeclarationFilterDto = {
    pageNumber: currentPage,
    pageSize,
    declarationType,
    status,
    taxYear: periodYear,
  };

  // Fetch tax declarations from API
  const { data, isLoading, refetch } = useTaxDeclarations(filters);

  const declarations = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handleCreate = () => {
    router.push('/finance/tax/declarations/new');
  };

  const handleView = (declarationId: number) => {
    router.push(`/finance/tax/declarations/${declarationId}`);
  };

  const getPeriodText = (record: TaxDeclarationSummaryDto) => {
    if (record.taxQuarter) {
      return `${quarterNames[record.taxQuarter - 1]} ${record.taxYear}`;
    }
    if (record.taxMonth) {
      return `${monthNames[record.taxMonth - 1]} ${record.taxYear}`;
    }
    return `${record.taxYear}`;
  };

  const isDueSoon = (dueDate: string) => {
    const due = dayjs(dueDate);
    const now = dayjs();
    return due.diff(now, 'day') <= 7 && due.isAfter(now);
  };

  const isOverdue = (dueDate: string) => {
    return dayjs(dueDate).isBefore(dayjs());
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  const declarationTypeOptions = [
    { value: '', label: 'Tüm Beyannameler' },
    { value: 'KDV', label: 'KDV Beyannamesi' },
    { value: 'KDV2', label: 'KDV 2 Beyannamesi' },
    { value: 'Muhtasar', label: 'Muhtasar Beyanname' },
    { value: 'GeciciVergi', label: 'Geçici Vergi' },
    { value: 'KurumlarVergisi', label: 'Kurumlar Vergisi' },
    { value: 'GelirVergisi', label: 'Gelir Vergisi' },
    { value: 'DamgaVergisi', label: 'Damga Vergisi' },
    { value: 'BSMV', label: 'BSMV' },
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Calculated', label: 'Hesaplandı' },
    { value: 'Ready', label: 'Hazır' },
    { value: 'Approved', label: 'Onaylı' },
    { value: 'Filed', label: 'Gönderildi' },
    { value: 'Accepted', label: 'Kabul Edildi' },
    { value: 'Rejected', label: 'Reddedildi' },
    { value: 'Paid', label: 'Ödendi' },
  ];

  const columns: ColumnsType<TaxDeclarationSummaryDto> = [
    {
      title: 'Beyanname',
      key: 'declarationType',
      render: (_, record) => {
        const config = declarationTypeConfig[record.declarationType] || declarationTypeConfig.KDV;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                {config.label}
              </span>
              <div className="text-xs text-slate-500 mt-1">{record.declarationNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Dönem',
      key: 'period',
      render: (_, record) => (
        <div className="text-sm font-medium text-slate-900">
          {getPeriodText(record)}
        </div>
      ),
    },
    {
      title: 'Vergi Tutarı',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(amount || 0)}</span>
      ),
    },
    {
      title: 'Ödenecek',
      dataIndex: 'totalPayable',
      key: 'totalPayable',
      align: 'right',
      render: (amount) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(amount || 0)}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Draft;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Beyan Tarihi',
      dataIndex: 'declarationDueDate',
      key: 'declarationDueDate',
      render: (date, record) => {
        const overdue = record.status !== 'Filed' && record.status !== 'Accepted' && record.status !== 'Paid' && isOverdue(date);
        const dueSoon = record.status !== 'Filed' && record.status !== 'Accepted' && record.status !== 'Paid' && isDueSoon(date);
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : dueSoon ? 'text-orange-600' : 'text-slate-600'}`}>
              {dayjs(date).format('DD MMM YYYY')}
            </span>
            {overdue && <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
            {dueSoon && <ClockIcon className="w-4 h-4 text-orange-500" />}
          </div>
        );
      },
    },
    {
      title: 'Ödeme Tarihi',
      dataIndex: 'paymentDueDate',
      key: 'paymentDueDate',
      render: (date, record) => {
        const overdue = record.status !== 'Paid' && isOverdue(date);
        return (
          <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD MMM YYYY')}
          </span>
        );
      },
    },
  ];

  // Calculate stats
  const pendingCount = declarations.filter(d => ['Draft', 'Calculated', 'Ready'].includes(d.status)).length;
  const awaitingPayment = declarations.filter(d => d.status === 'Accepted').length;
  const totalPayable = declarations
    .filter(d => d.status !== 'Paid')
    .reduce((sum, d) => sum + (d.remainingBalance || 0), 0);

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
              <h1 className="text-2xl font-bold text-slate-900">Vergi Beyannameleri</h1>
              <p className="text-sm text-slate-500">KDV, Muhtasar, Geçici Vergi ve diğer beyannameler</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={() => refetch()}
                loading={isLoading}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Yenile
              </Button>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreate}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Beyanname Oluştur
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Beyanname</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{awaitingPayment}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ödeme Bekleyen</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPayable)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Ödenecek</div>
        </div>
      </div>

      {/* Tax Calendar Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <CalendarDaysIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900">Vergi Takvimi Hatırlatması</h3>
            <div className="text-xs text-amber-700 mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><span className="font-medium">KDV:</span> Takip eden ayın 28'i</div>
              <div><span className="font-medium">Muhtasar:</span> Takip eden ayın 26'sı</div>
              <div><span className="font-medium">Geçici Vergi:</span> Çeyrek sonrası 17. gün</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={periodYear}
            onChange={(value) => setPeriodYear(value)}
            options={yearOptions}
            placeholder="Yıl"
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={declarationType || undefined}
            onChange={(value) => setDeclarationType(value as TaxDeclarationType || undefined)}
            options={declarationTypeOptions}
            placeholder="Beyanname Türü"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value as TaxDeclarationStatus || undefined)}
            options={statusOptions}
            placeholder="Durum"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <div className="flex items-center justify-end">
            <span className="text-sm text-slate-500">
              {totalCount} kayıt bulundu
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : declarations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <p className="text-slate-500 mb-4">Henüz vergi beyannamesi bulunmuyor</p>
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreate}
                  className="!bg-slate-900 hover:!bg-slate-800"
                >
                  İlk Beyannameyi Oluştur
                </Button>
              </div>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={declarations}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} beyanname`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              className: 'cursor-pointer',
            })}
            className={tableClassName}
          />
        )}
      </div>

      {/* Declaration Types Guide */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Beyanname Türleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(declarationTypeConfig).map(([key, config]) => (
            <div key={key} className="p-3 bg-slate-50 rounded-lg">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                {config.label}
              </span>
              <p className="text-xs text-slate-500 mt-2">{config.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
