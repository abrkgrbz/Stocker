'use client';

/**
 * Bank Accounts (Banka Hesapları) List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useBankAccounts, useDeleteBankAccount } from '@/lib/api/hooks/useFinance';
import type { BankAccountSummaryDto, BankAccountFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner, Select } from '@/components/primitives';
import { Table, Dropdown, Modal, Tag, Row, Col, Card as AntCard, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

export default function BankAccountsPage() {
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
  const filters: BankAccountFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    accountType: accountType as any,
  };

  // Fetch bank accounts from API
  const { data, isLoading, error, refetch } = useBankAccounts(filters);
  const deleteBankAccount = useDeleteBankAccount();

  const bankAccounts = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const totalBalance = bankAccounts.reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const tryBalance = bankAccounts.filter(ba => ba.currency === 'TRY').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const usdBalance = bankAccounts.filter(ba => ba.currency === 'USD').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);
  const eurBalance = bankAccounts.filter(ba => ba.currency === 'EUR').reduce((sum, ba) => sum + (ba.currentBalance || 0), 0);

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (accountId: number) => {
    try {
      await deleteBankAccount.mutateAsync(accountId);
      showSuccess('Banka hesabı başarıyla silindi!');
    } catch (error) {
      showApiError(error, 'Banka hesabı silinirken bir hata oluştu');
      throw error;
    }
  };

  const handleCreate = () => {
    router.push('/finance/bank-accounts/new');
  };

  const handleEdit = (account: BankAccountSummaryDto) => {
    router.push(`/finance/bank-accounts/${account.id}/edit`);
  };

  const handleView = (accountId: number) => {
    router.push(`/finance/bank-accounts/${accountId}`);
  };

  const handleDeleteClick = (account: BankAccountSummaryDto) => {
    Modal.confirm({
      title: 'Banka Hesabını Sil',
      content: `${account.accountName || 'Bu banka hesabı'} silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(account.id);
      },
    });
  };

  const accountTypeOptions = [
    { value: '', label: 'Tüm Türler' },
    { value: 'Checking', label: 'Vadesiz' },
    { value: 'Savings', label: 'Vadeli' },
    { value: 'Credit', label: 'Kredi' },
    { value: 'Investment', label: 'Yatırım' },
  ];

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      Checking: { label: 'Vadesiz', color: 'blue' },
      Savings: { label: 'Vadeli', color: 'green' },
      Credit: { label: 'Kredi', color: 'red' },
      Investment: { label: 'Yatırım', color: 'purple' },
    };
    return labels[type] || { label: type, color: 'default' };
  };

  const columns: ColumnsType<BankAccountSummaryDto> = [
    {
      title: 'Hesap',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BuildingLibraryIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{text || record.bankName}</div>
            <div className="text-xs text-slate-500">{record.accountNumber || record.iban || '-'}</div>
          </div>
        </div>
      ),
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
      title: 'Tür',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type) => {
        const config = getAccountTypeLabel(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Bakiye',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      align: 'right',
      render: (balance, record) => (
        <div className="text-right">
          <div className={`text-sm font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(balance || 0, record.currency || 'TRY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
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
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
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
          <button className="p-1 rounded hover:bg-slate-100 transition-colors">
            <EllipsisVerticalIcon className="w-5 h-5 text-slate-400" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <AntCard className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">Toplam Hesap</span>}
                value={totalCount}
                valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
              />
              <div className="text-xs text-gray-400 mt-2">Banka hesabı</div>
            </AntCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <AntCard className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">TRY Bakiye</span>}
                value={tryBalance}
                valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem' }}
                formatter={() => formatCurrency(tryBalance, 'TRY')}
              />
              <div className="text-xs text-emerald-600 mt-2">Türk Lirası</div>
            </AntCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <AntCard className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">USD Bakiye</span>}
                value={usdBalance}
                valueStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.5rem' }}
                formatter={() => formatCurrency(usdBalance, 'USD')}
              />
              <div className="text-xs text-blue-600 mt-2">Amerikan Doları</div>
            </AntCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <AntCard className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-gray-500 text-sm">EUR Bakiye</span>}
                value={eurBalance}
                valueStyle={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '1.5rem' }}
                formatter={() => formatCurrency(eurBalance, 'EUR')}
              />
              <div className="text-xs text-purple-600 mt-2">Euro</div>
            </AntCard>
          </Col>
        </Row>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BuildingLibraryIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Banka Hesapları"
        description="Şirket banka hesaplarınızı yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Hesap Ekle',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Banka hesapları yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Banka hesapları getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
          closable
          action={
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          }
          className="mb-6"
        />
      )}

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Banka hesabı ara... (hesap adı, banka, IBAN)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            value={accountType || null}
            onChange={(value) => setAccountType(value || undefined)}
            options={accountTypeOptions}
            placeholder="Hesap Türü"
            clearable
          />
        </div>
      </div>

      {/* Bank Accounts Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg">
          <Table
            columns={columns}
            dataSource={bankAccounts}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} banka hesabı`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
            className="enterprise-table"
          />
        </div>
      )}
    </PageContainer>
  );
}
