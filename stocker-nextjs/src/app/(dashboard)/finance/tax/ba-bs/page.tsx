'use client';

/**
 * Ba-Bs Forms (Ba-Bs Formları) List Page
 * GİB - 5.000 TL üzeri mal ve hizmet alım/satım bildirimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Select, Spin, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { useBaBsForms } from '@/lib/api/hooks/useFinance';
import type { BaBsFormSummaryDto, BaBsFormFilterDto, BaBsFormType } from '@/lib/api/services/finance.types';
import { BaBsFormStatus } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Ready: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hazır', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Onaylı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Filed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Gönderildi', icon: <PaperAirplaneIcon className="w-3 h-3" /> },
  Accepted: { bg: 'bg-slate-900', text: 'text-white', label: 'Kabul Edildi', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi', icon: <XCircleIcon className="w-3 h-3" /> },
};

// Form type configuration
const formTypeConfig: Record<string, { label: string; description: string; color: string }> = {
  Ba: { label: 'Ba Formu', description: 'Mal ve Hizmet Alımları', color: 'bg-orange-100 text-orange-700' },
  Bs: { label: 'Bs Formu', description: 'Mal ve Hizmet Satışları', color: 'bg-cyan-100 text-cyan-700' },
};

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function BaBsFormsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formType, setFormType] = useState<BaBsFormType | undefined>(undefined);
  const [status, setStatus] = useState<BaBsFormStatus | undefined>(undefined);
  const [periodYear, setPeriodYear] = useState<number | undefined>(new Date().getFullYear());

  // Build filter
  const filters: BaBsFormFilterDto = {
    pageNumber: currentPage,
    pageSize,
    formType,
    status,
    periodYear,
  };

  // Fetch Ba-Bs forms from API
  const { data, isLoading, refetch } = useBaBsForms(filters);

  const forms = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const handleCreate = () => {
    router.push('/finance/tax/ba-bs/new');
  };

  const handleView = (formId: number) => {
    router.push(`/finance/tax/ba-bs/${formId}`);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  const formTypeOptions = [
    { value: '', label: 'Tüm Formlar' },
    { value: 'Ba', label: 'Ba Formu (Alımlar)' },
    { value: 'Bs', label: 'Bs Formu (Satışlar)' },
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Ready', label: 'Hazır' },
    { value: 'Approved', label: 'Onaylı' },
    { value: 'Filed', label: 'Gönderildi' },
    { value: 'Accepted', label: 'Kabul Edildi' },
    { value: 'Rejected', label: 'Reddedildi' },
  ];

  const columns: ColumnsType<BaBsFormSummaryDto> = [
    {
      title: 'Form',
      key: 'formType',
      render: (_, record) => {
        const config = formTypeConfig[record.formType] || formTypeConfig.Ba;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                {config.label}
              </span>
              <div className="text-xs text-slate-500 mt-1">{record.formNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Dönem',
      key: 'period',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {monthNames[record.periodMonth - 1]} {record.periodYear}
          </div>
        </div>
      ),
    },
    {
      title: 'Kayıt Sayısı',
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
      render: (count) => (
        <span className="text-sm font-medium text-slate-900">{count || 0}</span>
      ),
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
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
      title: 'Gönderim Tarihi',
      dataIndex: 'filingDate',
      key: 'filingDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
  ];

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
              <h1 className="text-2xl font-bold text-slate-900">Ba-Bs Formları</h1>
              <p className="text-sm text-slate-500">GİB - 5.000 TL üzeri mal ve hizmet alım/satım bildirimi</p>
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
                Form Oluştur
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Ba-Bs Formu Hakkında</h3>
            <p className="text-xs text-blue-700 mt-1">
              Ba Formu: Bir takvim ayı içinde 5.000 TL ve üzerindeki mal ve hizmet alımlarınızı bildirin.
              <br />
              Bs Formu: Bir takvim ayı içinde 5.000 TL ve üzerindeki mal ve hizmet satışlarınızı bildirin.
              <br />
              <span className="font-medium">Son Bildirim Tarihi:</span> İlgili ayı takip eden ayın son günü
            </p>
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
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Form</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ArrowUpTrayIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {forms.filter(f => f.formType === 'Ba').length}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ba Formu (Alım)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <ArrowUpTrayIcon className="w-5 h-5 text-cyan-600 rotate-180" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {forms.filter(f => f.formType === 'Bs').length}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bs Formu (Satış)</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {forms.filter(f => f.status === 'Accepted').length}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kabul Edilen</div>
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
            value={formType || undefined}
            onChange={(value) => setFormType(value as BaBsFormType || undefined)}
            options={formTypeOptions}
            placeholder="Form Türü"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value as BaBsFormStatus || undefined)}
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
        ) : forms.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <p className="text-slate-500 mb-4">Henüz Ba-Bs formu bulunmuyor</p>
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreate}
                  className="!bg-slate-900 hover:!bg-slate-800"
                >
                  İlk Formu Oluştur
                </Button>
              </div>
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={forms}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} form`,
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

      {/* Help Section */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Ba-Bs Formu Rehberi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Ba Formu (Alımlar)</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Bir takvim ayı içinde aynı kişi/kurumdan 5.000 TL ve üzeri alımlar</li>
              <li>• KDV dahil toplam tutar dikkate alınır</li>
              <li>• Belge türü: Fatura, gider pusulası vb.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Bs Formu (Satışlar)</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Bir takvim ayı içinde aynı kişi/kuruma 5.000 TL ve üzeri satışlar</li>
              <li>• KDV dahil toplam tutar dikkate alınır</li>
              <li>• Belge türü: Satış faturası</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
