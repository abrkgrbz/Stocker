'use client';

/**
 * Cheques (Çekler) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useCheques, useDeleteCheque } from '@/lib/api/hooks/useFinance';
import type { ChequeSummaryDto, ChequeFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Received: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Alındı' },
  InPortfolio: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Portföyde' },
  Endorsed: { bg: 'bg-slate-400', text: 'text-white', label: 'Ciro Edildi' },
  Deposited: { bg: 'bg-slate-500', text: 'text-white', label: 'Bankaya Verildi' },
  Cleared: { bg: 'bg-slate-900', text: 'text-white', label: 'Tahsil Edildi' },
  Bounced: { bg: 'bg-red-600', text: 'text-white', label: 'Karşılıksız' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'İptal' },
};

// Cheque type configuration
const chequeTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Received: { label: 'Alınan Çek', icon: <ArrowDownIcon className="w-4 h-4" />, color: 'text-green-600' },
  Given: { label: 'Verilen Çek', icon: <ArrowUpIcon className="w-4 h-4" />, color: 'text-red-600' },
};

export default function ChequesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [chequeType, setChequeType] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: ChequeFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    status: status as any,
    chequeType: chequeType as any,
  };

  // Fetch cheques from API
  const { data, isLoading, error, refetch } = useCheques(filters);
  const deleteCheque = useDeleteCheque();

  const cheques = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    inPortfolio: cheques.filter((c) => c.status === 'InPortfolio' || c.status === 'Received').length,
    cleared: cheques.filter((c) => c.status === 'Cleared').length,
    bounced: cheques.filter((c) => c.status === 'Bounced').length,
    totalAmount: cheques.reduce((sum, c) => sum + (c.amount || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (chequeId: number) => {
    try {
      await deleteCheque.mutateAsync(chequeId);
      showSuccess('Çek başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Çek silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleDeleteClick = (cheque: ChequeSummaryDto) => {
    Modal.confirm({
      title: 'Çeki Sil',
      content: `${cheque.chequeNumber} numaralı çek silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(cheque.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/checks/new');
  };

  const handleView = (chequeId: number) => {
    router.push(`/finance/checks/${chequeId}`);
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Received', label: 'Alındı' },
    { value: 'InPortfolio', label: 'Portföyde' },
    { value: 'Endorsed', label: 'Ciro Edildi' },
    { value: 'Deposited', label: 'Bankaya Verildi' },
    { value: 'Cleared', label: 'Tahsil Edildi' },
    { value: 'Bounced', label: 'Karşılıksız' },
    { value: 'Cancelled', label: 'İptal' },
  ];

  const chequeTypeOptions = [
    { value: '', label: 'Tüm Tipler' },
    { value: 'Received', label: 'Alınan Çekler' },
    { value: 'Given', label: 'Verilen Çekler' },
  ];

  const columns: ColumnsType<ChequeSummaryDto> = [
    {
      title: 'Çek No',
      dataIndex: 'chequeNumber',
      key: 'chequeNumber',
      render: (text, record) => {
        const typeConfig = chequeTypeConfig[record.chequeType] || chequeTypeConfig.Received;
        return (
          <div className="flex items-center gap-2">
            <span className={typeConfig.color}>{typeConfig.icon}</span>
            <div>
              <div className="text-sm font-medium text-slate-900">{text}</div>
              <div className="text-xs text-slate-500">{typeConfig.label}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Banka',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Cari Hesap',
      dataIndex: 'currentAccountName',
      key: 'currentAccountName',
      render: (text) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        const typeConfig = chequeTypeConfig[record.chequeType] || chequeTypeConfig.Received;
        return (
          <div className={`text-right text-sm font-semibold ${typeConfig.color}`}>
            {formatCurrency(amount || 0, record.currency || 'TRY')}
          </div>
        );
      },
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const isOverdue = date && dayjs(date).isBefore(dayjs(), 'day');
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
            {date ? dayjs(date).format('DD MMM YYYY') : '-'}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Received;
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
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
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
          <DocumentCheckIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Çekler</h1>
              <p className="text-sm text-slate-500">Alınan ve verilen çekleri yönetin</p>
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
                Çek Ekle
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
              <DocumentCheckIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.inPortfolio}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Portföyde</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.cleared}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tahsil Edildi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.bounced}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Karşılıksız</div>
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
              <h3 className="text-sm font-medium text-slate-900">Çekler yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Çekler getirilirken bir hata oluştu.'}
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
              placeholder="Çek ara... (çek no, banka, cari hesap)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={chequeType || undefined}
            onChange={(value) => setChequeType(value || undefined)}
            options={chequeTypeOptions}
            placeholder="Tip"
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
            dataSource={cheques}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} çek`,
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
