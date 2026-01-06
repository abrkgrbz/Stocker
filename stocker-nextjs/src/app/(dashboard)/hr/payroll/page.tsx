'use client';

/**
 * Payroll List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  CurrencyDollarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  usePayrolls,
  useCancelPayroll,
  useApprovePayroll,
  useMarkPayrollPaid,
  useEmployees,
} from '@/lib/api/hooks/useHR';
import type { PayrollDto, PayrollFilterDto } from '@/lib/api/services/hr.types';
import { PayrollStatus } from '@/lib/api/services/hr.types';
import { PayrollStats, PayrollTable } from '@/components/hr/payroll';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Alert, Spinner } from '@/components/primitives';

export default function PayrollPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PayrollFilterDto>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: payrolls = [], isLoading, error, refetch } = usePayrolls(filters);
  const { data: employees = [] } = useEmployees();
  const cancelPayroll = useCancelPayroll();
  const approvePayroll = useApprovePayroll();
  const markPaid = useMarkPayrollPaid();

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/payroll/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/payroll/${id}/edit`);
  };

  const handleApprove = async (payroll: PayrollDto) => {
    try {
      await approvePayroll.mutateAsync({ id: payroll.id });
      showSuccess('Bordro onaylandı!');
    } catch (err) {
      showApiError(err, 'Bordro onaylanırken bir hata oluştu');
    }
  };

  const handleMarkPaid = async (payroll: PayrollDto) => {
    try {
      await markPaid.mutateAsync({ id: payroll.id });
      showSuccess('Bordro ödendi olarak işaretlendi!');
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  const handleCancel = async (payroll: PayrollDto) => {
    try {
      await cancelPayroll.mutateAsync({ id: payroll.id, reason: 'İptal edildi' });
      showSuccess('Bordro iptal edildi!');
    } catch (err) {
      showApiError(err, 'Bordro iptal edilirken bir hata oluştu');
      throw err;
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
        <PayrollStats payrolls={payrolls} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Bordro Yönetimi"
        description="Tüm bordroları görüntüle ve yönet"
        itemCount={payrolls.length}
        primaryAction={{
          label: 'Yeni Bordro',
          onClick: () => router.push('/hr/payroll/new'),
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
          title="Bordrolar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Bordrolar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
          <DatePicker
            picker="month"
            format="MM/YYYY"
            placeholder="Dönem seçin"
            className="h-10"
            style={{ height: 48 }}
            onChange={(date) => {
              if (date) {
                setFilters((prev) => ({
                  ...prev,
                  month: date.month() + 1,
                  year: date.year(),
                }));
              } else {
                setFilters((prev) => ({ ...prev, month: undefined, year: undefined }));
              }
            }}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: PayrollStatus.Draft, label: 'Taslak' },
              { value: PayrollStatus.Calculated, label: 'Hesaplandı' },
              { value: PayrollStatus.PendingApproval, label: 'Onay Bekliyor' },
              { value: PayrollStatus.Approved, label: 'Onaylanan' },
              { value: PayrollStatus.Paid, label: 'Ödenen' },
              { value: PayrollStatus.Cancelled, label: 'İptal' },
            ]}
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
          <PayrollTable
            payrolls={payrolls}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={payrolls.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onMarkPaid={handleMarkPaid}
            onCancel={handleCancel}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}