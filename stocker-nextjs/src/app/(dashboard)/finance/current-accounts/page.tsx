'use client';

/**
 * Current Accounts (Cari Hesaplar) List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  WalletIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useCurrentAccounts, useDeleteCurrentAccount } from '@/lib/api/hooks/useFinance';
import type { CurrentAccountSummaryDto, CurrentAccountFilterDto } from '@/lib/api/services/finance.types';
import { CurrentAccountsStats, CurrentAccountsTable } from '@/components/finance/current-accounts';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner, Select } from '@/components/primitives';

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

  const handleDelete = async (accountId: number) => {
    try {
      await deleteCurrentAccount.mutateAsync(accountId);
      showSuccess('Cari hesap başarıyla silindi!');
    } catch (error) {
      showApiError(error, 'Cari hesap silinirken bir hata oluştu');
      throw error;
    }
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
    { value: '', label: 'Tüm Türler' },
    { value: 'Customer', label: 'Müşteri' },
    { value: 'Vendor', label: 'Tedarikçi' },
    { value: 'Employee', label: 'Personel' },
    { value: 'Partner', label: 'Ortak' },
    { value: 'Other', label: 'Diğer' },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <CurrentAccountsStats currentAccounts={currentAccounts} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<WalletIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Cari Hesaplar"
        description="Müşteri ve tedarikçi cari hesaplarınızı yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Cari Hesap Ekle',
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
          title="Cari hesaplar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Cari hesaplar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
              placeholder="Cari hesap ara... (hesap adı, kodu, müşteri)"
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

      {/* Current Accounts Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <CurrentAccountsTable
            currentAccounts={currentAccounts}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
