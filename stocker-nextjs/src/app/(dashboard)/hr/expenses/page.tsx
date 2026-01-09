'use client';

/**
 * Expenses List Page
 * Monochrome design system following inventory module patterns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker, Table, Button, Dropdown, Tooltip, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  WalletIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import {
  useExpenses,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { ExpenseDto, ExpenseFilterDto } from '@/lib/api/services/hr.types';
import { ExpenseStatus } from '@/lib/api/services/hr.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const { RangePicker } = DatePicker;

// Format currency helper
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date helper
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// Status configuration with monochrome colors
const statusConfig: Record<number, { label: string; bgColor: string; textColor: string }> = {
  [ExpenseStatus.Draft]: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  [ExpenseStatus.Pending]: { label: 'Beklemede', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  [ExpenseStatus.Approved]: { label: 'Onaylandi', bgColor: 'bg-slate-700', textColor: 'text-white' },
  [ExpenseStatus.Rejected]: { label: 'Reddedildi', bgColor: 'bg-slate-300', textColor: 'text-slate-600' },
  [ExpenseStatus.Paid]: { label: 'Odendi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  [ExpenseStatus.Cancelled]: { label: 'Iptal', bgColor: 'bg-slate-400', textColor: 'text-white' },
};

export default function ExpensesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpenseFilterDto>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: expenses = [], isLoading, refetch } = useExpenses(filters);
  const { data: employees = [] } = useEmployees();
  const deleteExpense = useDeleteExpense();
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();

  // Calculate stats
  const stats = {
    total: expenses.length,
    pending: expenses.filter((e) => e.status === ExpenseStatus.Pending).length,
    approved: expenses.filter((e) => e.status === ExpenseStatus.Approved).length,
    paid: expenses.filter((e) => e.status === ExpenseStatus.Paid).length,
    totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
  };

  // CRUD Handlers
  const handleView = (id: number) => router.push(`/hr/expenses/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/expenses/${id}/edit`);

  const handleDelete = async (expense: ExpenseDto) => {
    try {
      await deleteExpense.mutateAsync(expense.id);
      showSuccess('Harcama basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Harcama silinirken bir hata olustu');
    }
  };

  const handleApprove = async (expense: ExpenseDto) => {
    try {
      await approveExpense.mutateAsync({ id: expense.id });
      showSuccess('Harcama onaylandi!');
    } catch (err) {
      showApiError(err, 'Harcama onaylanirken bir hata olustu');
    }
  };

  const handleReject = async (expense: ExpenseDto) => {
    try {
      await rejectExpense.mutateAsync({ id: expense.id, data: { reason: 'Reddedildi' } });
      showSuccess('Harcama reddedildi!');
    } catch (err) {
      showApiError(err, 'Harcama reddedilirken bir hata olustu');
    }
  };

  const clearFilters = () => setFilters({});

  // Table columns
  const columns: ColumnsType<ExpenseDto> = [
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 180,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (value) => <span className="text-slate-600">{value}</span>,
    },
    {
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (value) => <span className="text-slate-500">{value || '-'}</span>,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (value) => <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>,
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      width: 120,
      render: (value) => <span className="text-slate-500">{formatDate(value)}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ExpenseStatus) => {
        const config = statusConfig[status] || statusConfig[ExpenseStatus.Pending];
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          { key: 'view', icon: <EyeIcon className="w-4 h-4" />, label: 'Goruntule', onClick: () => handleView(record.id) },
          { key: 'edit', icon: <PencilSquareIcon className="w-4 h-4" />, label: 'Duzenle', onClick: () => handleEdit(record.id) },
          { type: 'divider' as const },
          ...(record.status === ExpenseStatus.Pending ? [
            { key: 'approve', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Onayla', onClick: () => handleApprove(record) },
            { key: 'reject', icon: <XMarkIcon className="w-4 h-4" />, label: 'Reddet', onClick: () => handleReject(record) },
          ] : []),
          { key: 'delete', icon: <TrashIcon className="w-4 h-4" />, label: 'Sil', danger: true, onClick: () => handleDelete(record) },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="!text-slate-600 hover:!text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <WalletIcon className="w-7 h-7" />
            Harcama Yonetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tum harcamalari goruntule ve yonet
          </p>
        </div>
        <Space size="middle">
          <Tooltip title="Yenile">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              loading={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/expenses/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Harcama
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Harcama</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Beklemede</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.approved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylanan</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.paid}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Odenen</div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ReceiptPercentIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tutar</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Calisan secin"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: '100%' }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: ExpenseStatus.Pending, label: 'Beklemede' },
              { value: ExpenseStatus.Approved, label: 'Onaylanan' },
              { value: ExpenseStatus.Rejected, label: 'Reddedilen' },
              { value: ExpenseStatus.Paid, label: 'Odenen' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <RangePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            placeholder={['Baslangic', 'Bitis']}
            className="[&_.ant-picker]:!border-slate-300 [&_.ant-picker]:!rounded-lg"
            onChange={(dates) => {
              if (dates) {
                setFilters((prev) => ({
                  ...prev,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD'),
                }));
              } else {
                setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
              }
            }}
          />
          <Button
            onClick={clearFilters}
            className="h-10 !border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: expenses.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} harcama`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
