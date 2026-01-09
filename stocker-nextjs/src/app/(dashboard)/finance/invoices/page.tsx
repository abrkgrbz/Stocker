'use client';

/**
 * Invoices List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useInvoices, useDeleteInvoice } from '@/lib/api/hooks/useFinance';
import type { InvoiceSummaryDto, InvoiceFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak' },
  Pending: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Beklemede' },
  Approved: { bg: 'bg-slate-400', text: 'text-white', label: 'Onaylandi' },
  Paid: { bg: 'bg-slate-900', text: 'text-white', label: 'Odendi' },
  PartiallyPaid: { bg: 'bg-slate-600', text: 'text-white', label: 'Kismi Odeme' },
  Overdue: { bg: 'bg-slate-700', text: 'text-white', label: 'Vadesi Gecti' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Iptal' },
};

export default function InvoicesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invoiceType, setInvoiceType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: InvoiceFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    invoiceType: invoiceType as any,
    status: status as any,
  };

  // Fetch invoices from API
  const { data, isLoading, error, refetch } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();

  const invoices = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    draft: invoices.filter((i) => i.status === 'Draft').length,
    pending: invoices.filter((i) => i.status === 'Pending').length,
    paid: invoices.filter((i) => i.status === 'Paid').length,
    overdue: invoices.filter((i) => i.status === 'Overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const getInvoiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Sales: 'Satis',
      Purchase: 'Alis',
      Return: 'Iade',
      Proforma: 'Proforma',
    };
    return labels[type] || type;
  };

  const handleDelete = async (invoiceId: number) => {
    try {
      await deleteInvoice.mutateAsync(invoiceId);
      showSuccess('Fatura basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Fatura silinirken bir hata olustu');
      throw err;
    }
  };

  const handleDeleteClick = (invoice: InvoiceSummaryDto) => {
    Modal.confirm({
      title: 'Faturayi Sil',
      content: `${invoice.invoiceNumber || 'Bu fatura'} silinecek. Bu islem geri alinamaz.`,
      okText: 'Sil',
      cancelText: 'Iptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(invoice.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/invoices/new');
  };

  const handleEdit = (invoice: InvoiceSummaryDto) => {
    router.push(`/finance/invoices/${invoice.id}/edit`);
  };

  const handleView = (invoiceId: number) => {
    router.push(`/finance/invoices/${invoiceId}`);
  };

  const invoiceTypeOptions = [
    { value: '', label: 'Tum Turler' },
    { value: 'Sales', label: 'Satis Faturasi' },
    { value: 'Purchase', label: 'Alis Faturasi' },
    { value: 'Return', label: 'Iade Faturasi' },
    { value: 'Proforma', label: 'Proforma Fatura' },
  ];

  const statusOptions = [
    { value: '', label: 'Tum Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Pending', label: 'Beklemede' },
    { value: 'Approved', label: 'Onaylandi' },
    { value: 'Paid', label: 'Odendi' },
    { value: 'PartiallyPaid', label: 'Kismi Odeme' },
    { value: 'Overdue', label: 'Vadesi Gecti' },
    { value: 'Cancelled', label: 'Iptal' },
  ];

  const columns: ColumnsType<InvoiceSummaryDto> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'Taslak'}</div>
          <div className="text-xs text-slate-500">
            {record.invoiceDate ? dayjs(record.invoiceDate).format('DD MMM YYYY') : '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Musteri/Tedarikci',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || record.vendorName || '-'}</div>
          <div className="text-xs text-slate-500">{getInvoiceTypeLabel(record.invoiceType)}</div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount, record) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
          {record.paidAmount !== undefined && record.paidAmount > 0 && (
            <div className="text-xs text-slate-500">
              Odenen: {formatCurrency(record.paidAmount, record.currency || 'TRY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        if (!date) return <span className="text-sm text-slate-400">-</span>;
        const dueDate = dayjs(date);
        const isOverdue = dueDate.isBefore(dayjs()) && record.status !== 'Paid';
        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
              {dueDate.format('DD MMM YYYY')}
            </div>
            {isOverdue && (
              <div className="text-xs text-slate-500">
                {Math.abs(dueDate.diff(dayjs(), 'day'))} gun gecikmis
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Draft;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Goruntule',
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Duzenle',
                onClick: () => handleEdit(record),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDeleteClick(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
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
              <h1 className="text-2xl font-bold text-slate-900">Faturalar</h1>
              <p className="text-sm text-slate-500">Satis ve alis faturalarinizi yonetin</p>
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
                Fatura Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.draft}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Taslak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Beklemede</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.paid}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Odendi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tutar</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Faturalar yuklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Faturalar getirilirken bir hata olustu. Lutfen tekrar deneyin.'}
              </p>
            </div>
            <Button
              size="small"
              onClick={() => refetch()}
              className="!border-slate-300 !text-slate-600"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Fatura ara... (fatura no, musteri, tedarikci)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={invoiceType || undefined}
            onChange={(value) => setInvoiceType(value || undefined)}
            options={invoiceTypeOptions}
            placeholder="Fatura Turu"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value || undefined)}
            options={statusOptions}
            placeholder="Durum"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} fatura`,
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
    </div>
  );
}
