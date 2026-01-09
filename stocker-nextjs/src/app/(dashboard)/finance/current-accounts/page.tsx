'use client';

/**
 * Current Accounts (Cari Hesaplar) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  WalletIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  UserGroupIcon,
  TruckIcon,
  CurrencyDollarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCurrentAccounts, useDeleteCurrentAccount } from '@/lib/api/hooks/useFinance';
import type { CurrentAccountSummaryDto, CurrentAccountFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Monochrome account type configuration
const accountTypeConfig: Record<string, { bg: string; text: string; label: string }> = {
  Customer: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Musteri' },
  Supplier: { bg: 'bg-slate-400', text: 'text-white', label: 'Tedarikci' },
  Both: { bg: 'bg-slate-600', text: 'text-white', label: 'Her Ikisi' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Diger' },
};

export default function CurrentAccountsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [accountType, setAccountType] = useState<string | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: CurrentAccountFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    accountType: accountType as any,
  };

  // Fetch current accounts from API
  const { data, isLoading, error, refetch } = useCurrentAccounts(filters);
  const deleteCurrentAccount = useDeleteCurrentAccount();

  const currentAccounts = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    customers: currentAccounts.filter((ca) => ca.accountType === 'Customer').length,
    suppliers: currentAccounts.filter((ca) => ca.accountType === 'Supplier').length,
    totalReceivables: currentAccounts.reduce((sum, ca) => sum + (ca.balance > 0 ? ca.balance : 0), 0),
    totalPayables: currentAccounts.reduce((sum, ca) => sum + (ca.balance < 0 ? Math.abs(ca.balance) : 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (accountId: number) => {
    try {
      await deleteCurrentAccount.mutateAsync(accountId);
      showSuccess('Cari hesap basariyla silindi!');
    } catch (err) {
      showApiError(err, 'Cari hesap silinirken bir hata olustu');
      throw err;
    }
  };

  const handleDeleteClick = (account: CurrentAccountSummaryDto) => {
    Modal.confirm({
      title: 'Cari Hesabi Sil',
      content: `${account.accountName || 'Bu cari hesap'} silinecek. Bu islem geri alinamaz.`,
      okText: 'Sil',
      cancelText: 'Iptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(account.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/current-accounts/new');
  };

  const handleEdit = (account: CurrentAccountSummaryDto) => {
    router.push(`/finance/current-accounts/${account.id}/edit`);
  };

  const handleView = (accountId: number) => {
    router.push(`/finance/current-accounts/${accountId}`);
  };

  const accountTypeOptions = [
    { value: '', label: 'Tum Turler' },
    { value: 'Customer', label: 'Musteri' },
    { value: 'Supplier', label: 'Tedarikci' },
    { value: 'Both', label: 'Her Ikisi' },
  ];

  const columns: ColumnsType<CurrentAccountSummaryDto> = [
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <WalletIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{text || record.customerName || record.vendorName || '-'}</div>
            <div className="text-xs text-slate-500">{record.accountCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type) => {
        const config = accountTypeConfig[type] || accountTypeConfig.Other;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Bakiye',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance, record) => {
        const isPositive = balance >= 0;
        return (
          <div className="text-right">
            <div className={`text-sm font-semibold ${isPositive ? 'text-slate-900' : 'text-slate-700'}`}>
              {formatCurrency(balance || 0, record.currency || 'TRY')}
            </div>
            <div className="text-xs text-slate-500">
              {isPositive ? 'Alacak' : 'Borc'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Kredi Limiti',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      align: 'right',
      render: (limit, record) => (
        <span className="text-sm text-slate-600">
          {limit ? formatCurrency(limit, record.currency || 'TRY') : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
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
          <WalletIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Cari Hesaplar</h1>
              <p className="text-sm text-slate-500">Musteri ve tedarikci cari hesaplarinizi yonetin</p>
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
                Cari Hesap Ekle
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
              <WalletIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.customers}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Musteri</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.suppliers}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tedarikci</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalReceivables)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Alacak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalPayables)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Borc</div>
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
              <h3 className="text-sm font-medium text-slate-900">Cari hesaplar yuklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Cari hesaplar getirilirken bir hata olustu. Lutfen tekrar deneyin.'}
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
              placeholder="Cari hesap ara... (hesap adi, kodu, musteri)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={accountType || undefined}
            onChange={(value) => setAccountType(value || undefined)}
            options={accountTypeOptions}
            placeholder="Hesap Turu"
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
            dataSource={currentAccounts}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} cari hesap`,
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
