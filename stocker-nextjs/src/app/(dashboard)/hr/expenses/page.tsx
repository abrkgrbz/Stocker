'use client';

/**
 * Expenses List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  WalletIcon,
  PlusIcon,
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
import { ExpensesStats, ExpensesTable } from '@/components/hr/expenses';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Alert, Spinner } from '@/components/primitives';

const { RangePicker } = DatePicker;

export default function ExpensesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpenseFilterDto>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: expenses = [], isLoading, error, refetch } = useExpenses(filters);
  const { data: employees = [] } = useEmployees();
  const deleteExpense = useDeleteExpense();
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/expenses/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/expenses/${id}/edit`);
  };

  const handleDelete = async (expense: ExpenseDto) => {
    try {
      await deleteExpense.mutateAsync(expense.id);
      showSuccess('Harcama başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Harcama silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleApprove = async (expense: ExpenseDto) => {
    try {
      await approveExpense.mutateAsync({ id: expense.id });
      showSuccess('Harcama onaylandı!');
    } catch (err) {
      showApiError(err, 'Harcama onaylanırken bir hata oluştu');
    }
  };

  const handleReject = async (expense: ExpenseDto) => {
    try {
      await rejectExpense.mutateAsync({ id: expense.id, data: { reason: 'Reddedildi' } });
      showSuccess('Harcama reddedildi!');
    } catch (err) {
      showApiError(err, 'Harcama reddedilirken bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ExpensesStats expenses={expenses} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<WalletIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Harcama Yönetimi"
        description="Tüm harcamaları görüntüle ve yönet"
        itemCount={expenses.length}
        primaryAction={{
          label: 'Yeni Harcama',
          onClick: () => router.push('/hr/expenses/new'),
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
          title="Harcamalar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Harcamalar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Çalışan seçin"
            allowClear
            showSearch
            optionFilterProp="children"
            className="h-10"
            style={{ height: 48 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: 'Pending', label: 'Beklemede' },
              { value: 'Approved', label: 'Onaylanan' },
              { value: 'Rejected', label: 'Reddedilen' },
              { value: 'Paid', label: 'Ödenen' },
            ]}
          />
          <RangePicker
            className="h-10"
            style={{ height: 48 }}
            format="DD.MM.YYYY"
            placeholder={['Başlangıç', 'Bitiş']}
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
          <button
            onClick={clearFilters}
            className="h-12 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Table */}
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
            totalCount={expenses.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}