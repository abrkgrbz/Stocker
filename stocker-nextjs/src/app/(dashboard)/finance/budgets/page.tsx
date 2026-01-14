'use client';

/**
 * Budgets (Bütçeler) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useBudgets, useDeleteBudget, useApproveBudget, useActivateBudget, useCloseBudget } from '@/lib/api/hooks/useFinance';
import type { BudgetDto, BudgetFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aktif' },
  Closed: { bg: 'bg-slate-900', text: 'text-white', label: 'Kapatıldı' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'İptal' },
};

// Period type configuration
const periodTypeConfig: Record<string, { label: string }> = {
  Monthly: { label: 'Aylık' },
  Quarterly: { label: 'Çeyreklik' },
  Annual: { label: 'Yıllık' },
  Custom: { label: 'Özel' },
};

export default function BudgetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Mutations
  const deleteBudget = useDeleteBudget();
  const approveBudget = useApproveBudget();
  const activateBudget = useActivateBudget();
  const closeBudget = useCloseBudget();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: BudgetFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    status: status as any,
  };

  // Fetch budgets from API
  const { data, isLoading, error, refetch } = useBudgets(filters);

  const budgets = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    active: budgets.filter((b) => b.status === 'Active').length,
    totalBudget: budgets.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    totalSpent: budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (budgetId: number) => {
    try {
      await deleteBudget.mutateAsync(budgetId);
      showSuccess('Bütçe başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Bütçe silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleApprove = async (budget: BudgetDto) => {
    try {
      await approveBudget.mutateAsync(budget.id);
      showSuccess('Bütçe onaylandı!');
    } catch (err) {
      showApiError(err, 'Bütçe onaylanırken bir hata oluştu');
    }
  };

  const handleActivate = async (budget: BudgetDto) => {
    try {
      await activateBudget.mutateAsync(budget.id);
      showSuccess('Bütçe aktifleştirildi!');
    } catch (err) {
      showApiError(err, 'Bütçe aktifleştirilirken bir hata oluştu');
    }
  };

  const handleClose = async (budget: BudgetDto) => {
    Modal.confirm({
      title: 'Bütçeyi Kapat',
      content: `${budget.budgetName} bütçesi kapatılacak. Devam etmek istiyor musunuz?`,
      okText: 'Kapat',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await closeBudget.mutateAsync(budget.id);
          showSuccess('Bütçe kapatıldı!');
        } catch (err) {
          showApiError(err, 'Bütçe kapatılırken bir hata oluştu');
        }
      },
    });
  };

  const handleDeleteClick = (budget: BudgetDto) => {
    Modal.confirm({
      title: 'Bütçeyi Sil',
      content: `${budget.budgetName} bütçesi silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(budget.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/budgets/new');
  };

  const handleView = (budgetId: number) => {
    router.push(`/finance/budgets/${budgetId}`);
  };

  const getActionItems = (record: BudgetDto) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(record.id),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        { type: 'divider' },
        {
          key: 'approve',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleApprove(record),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push(
        { type: 'divider' },
        {
          key: 'activate',
          icon: <PlayIcon className="w-4 h-4" />,
          label: 'Aktifleştir',
          onClick: () => handleActivate(record),
        }
      );
    }

    if (record.status === 'Active') {
      items.push(
        { type: 'divider' },
        {
          key: 'close',
          icon: <XCircleIcon className="w-4 h-4" />,
          label: 'Kapat',
          onClick: () => handleClose(record),
        }
      );
    }

    if (record.status === 'Draft') {
      items.push(
        { type: 'divider' },
        {
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDeleteClick(record),
        }
      );
    }

    return items;
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Approved', label: 'Onaylandı' },
    { value: 'Active', label: 'Aktif' },
    { value: 'Closed', label: 'Kapatıldı' },
    { value: 'Cancelled', label: 'İptal' },
  ];

  const columns: ColumnsType<BudgetDto> = [
    {
      title: 'Bütçe Adı',
      dataIndex: 'budgetName',
      key: 'budgetName',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">
            {periodTypeConfig[record.period]?.label || record.period} - {record.fiscalYear}
          </div>
        </div>
      ),
    },
    {
      title: 'Toplam Bütçe',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm font-medium text-slate-900">
          {formatCurrency(amount || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Kullanılan',
      dataIndex: 'spentAmount',
      key: 'spentAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm text-slate-600">
          {formatCurrency(amount || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Kullanım',
      key: 'utilization',
      width: 150,
      render: (_, record) => {
        const percent = record.totalAmount ? Math.round(((record.spentAmount || 0) / record.totalAmount) * 100) : 0;
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              strokeColor={percent > 90 ? '#ef4444' : percent > 70 ? '#f59e0b' : '#22c55e'}
              showInfo={false}
            />
            <span className="text-xs text-slate-500">{percent}%</span>
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
          menu={{ items: getActionItems(record) }}
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
          <CalculatorIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bütçeler</h1>
              <p className="text-sm text-slate-500">Finansal bütçeleri yönetin ve takip edin</p>
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
                Bütçe Ekle
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
              <CalculatorIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Bütçe</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <PlayIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalBudget)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tutar</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalSpent)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kullanılan</div>
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
              <h3 className="text-sm font-medium text-slate-900">Bütçeler yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Bütçeler getirilirken bir hata oluştu.'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Bütçe ara... (ad)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
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
            dataSource={budgets}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} bütçe`,
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
