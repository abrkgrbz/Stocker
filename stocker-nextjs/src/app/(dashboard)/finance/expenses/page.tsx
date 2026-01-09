'use client';

/**
 * Expenses (Giderler) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useExpenses, useDeleteExpense } from '@/lib/api/hooks/useFinance';
import type { ExpenseSummaryDto, ExpenseFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak' },
  Pending: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-slate-400', text: 'text-white', label: 'Onaylandi' },
  Paid: { bg: 'bg-slate-900', text: 'text-white', label: 'Odendi' },
  Rejected: { bg: 'bg-slate-600', text: 'text-white', label: 'Reddedildi' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Iptal' },
};

// Monochrome category configuration
const categoryConfig: Record<string, { label: string }> = {
  Rent: { label: 'Kira' },
  Utilities: { label: 'Faturalar' },
  Salaries: { label: 'Maaslar' },
  Marketing: { label: 'Pazarlama' },
  Travel: { label: 'Seyahat' },
  Office: { label: 'Ofis' },
  IT: { label: 'Bilisim' },
  Legal: { label: 'Hukuki' },
  Insurance: { label: 'Sigorta' },
  Maintenance: { label: 'Bakim' },
  Other: { label: 'Diger' },
};

export default function ExpensesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState<string | undefined>(undefined);
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
  const filters: ExpenseFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    category: category as any,
    status: status as any,
  };

  // Fetch expenses from API
  const { data, isLoading, error, refetch } = useExpenses(filters);
  const deleteExpense = useDeleteExpense();

  const expenses = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    draft: expenses.filter((e) => e.status === 'Draft').length,
    pending: expenses.filter((e) => e.status === 'Pending').length,
    paid: expenses.filter((e) => e.status === 'Paid').length,
    totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (expenseId: number) => {
    try {
      await deleteExpense.mutateAsync(expenseId);
      showSuccess('Gider basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Gider silinirken bir hata olustu');
      throw err;
    }
  };

  const handleDeleteClick = (expense: ExpenseSummaryDto) => {
    Modal.confirm({
      title: 'Gideri Sil',
      content: `${expense.description || 'Bu gider'} silinecek. Bu islem geri alinamaz.`,
      okText: 'Sil',
      cancelText: 'Iptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(expense.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/expenses/new');
  };

  const handleEdit = (expense: ExpenseSummaryDto) => {
    router.push(`/finance/expenses/${expense.id}/edit`);
  };

  const handleView = (expenseId: number) => {
    router.push(`/finance/expenses/${expenseId}`);
  };

  const categoryOptions = [
    { value: '', label: 'Tum Kategoriler' },
    { value: 'Rent', label: 'Kira' },
    { value: 'Utilities', label: 'Faturalar' },
    { value: 'Salaries', label: 'Maaslar' },
    { value: 'Marketing', label: 'Pazarlama' },
    { value: 'Travel', label: 'Seyahat' },
    { value: 'Office', label: 'Ofis Giderleri' },
    { value: 'IT', label: 'Bilisim' },
    { value: 'Legal', label: 'Hukuki' },
    { value: 'Insurance', label: 'Sigorta' },
    { value: 'Maintenance', label: 'Bakim' },
    { value: 'Other', label: 'Diger' },
  ];

  const statusOptions = [
    { value: '', label: 'Tum Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Pending', label: 'Onay Bekliyor' },
    { value: 'Approved', label: 'Onaylandi' },
    { value: 'Paid', label: 'Odendi' },
    { value: 'Rejected', label: 'Reddedildi' },
    { value: 'Cancelled', label: 'Iptal' },
  ];

  const columns: ColumnsType<ExpenseSummaryDto> = [
    {
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'Isimsiz Gider'}</div>
          <div className="text-xs text-slate-500">{record.vendorName || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (cat, record) => {
        const config = categoryConfig[cat] || { label: cat };
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
            {record.categoryName || config.label}
          </span>
        );
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => (
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
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
          <ReceiptPercentIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Giderler</h1>
              <p className="text-sm text-slate-500">Isletme giderlerinizi takip edin</p>
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
                Gider Ekle
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
              <ReceiptPercentIcon className="w-5 h-5 text-slate-600" />
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
              <FolderIcon className="w-5 h-5 text-white" />
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
              <h3 className="text-sm font-medium text-slate-900">Giderler yuklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Giderler getirilirken bir hata olustu. Lutfen tekrar deneyin.'}
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
              placeholder="Gider ara... (aciklama, tedarikci)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={category || undefined}
            onChange={(value) => setCategory(value || undefined)}
            options={categoryOptions}
            placeholder="Kategori"
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
            dataSource={expenses}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} gider`,
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
