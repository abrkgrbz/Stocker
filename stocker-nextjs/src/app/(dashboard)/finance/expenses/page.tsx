'use client';

/**
 * Expenses (Giderler) List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useExpenses, useDeleteExpense } from '@/lib/api/hooks/useFinance';
import type { ExpenseSummaryDto, ExpenseFilterDto } from '@/lib/api/services/finance.types';
import { ExpensesStats, ExpensesTable } from '@/components/finance/expenses';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner, Select } from '@/components/primitives';

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

  const handleDelete = async (expenseId: number) => {
    try {
      await deleteExpense.mutateAsync(expenseId);
      showSuccess('Gider başarıyla silindi!');
    } catch (error) {
      showApiError(error, 'Gider silinirken bir hata oluştu');
      throw error;
    }
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
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'Rent', label: 'Kira' },
    { value: 'Utilities', label: 'Faturalar' },
    { value: 'Salaries', label: 'Maaşlar' },
    { value: 'Marketing', label: 'Pazarlama' },
    { value: 'Travel', label: 'Seyahat' },
    { value: 'Office', label: 'Ofis Giderleri' },
    { value: 'IT', label: 'Bilişim' },
    { value: 'Legal', label: 'Hukuki' },
    { value: 'Insurance', label: 'Sigorta' },
    { value: 'Maintenance', label: 'Bakım' },
    { value: 'Other', label: 'Diğer' },
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Draft', label: 'Taslak' },
    { value: 'Pending', label: 'Onay Bekliyor' },
    { value: 'Approved', label: 'Onaylandı' },
    { value: 'Paid', label: 'Ödendi' },
    { value: 'Rejected', label: 'Reddedildi' },
    { value: 'Cancelled', label: 'İptal' },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ExpensesStats expenses={expenses} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ReceiptPercentIcon className="w-5 h-5" />}
        iconColor="#ef4444"
        title="Giderler"
        description="İşletme giderlerinizi takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Gider Ekle',
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
          title="Giderler yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Giderler getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Gider ara... (açıklama, tedarikçi)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            value={category || null}
            onChange={(value) => setCategory(value || undefined)}
            options={categoryOptions}
            placeholder="Kategori"
            clearable
          />
          <Select
            value={status || null}
            onChange={(value) => setStatus(value || undefined)}
            options={statusOptions}
            placeholder="Durum"
            clearable
          />
        </div>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <ExpensesTable
            expenses={expenses}
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
