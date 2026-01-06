'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CurrencyDollarIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { PayslipsStats, PayslipsTable } from '@/components/hr/payslips';
import { usePayslips, useDeletePayslip } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { PayslipDto } from '@/lib/api/services/hr.types';

export default function PayslipsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: payslipsData, isLoading, error, refetch } = usePayslips();
  const deletePayslipMutation = useDeletePayslip();

  // Client-side filtering
  const filteredPayslips = useMemo(() => {
    const payslips = payslipsData || [];
    if (!debouncedSearch) return payslips;
    const lower = debouncedSearch.toLowerCase();
    return payslips.filter((item: PayslipDto) =>
      item.employeeName?.toLowerCase().includes(lower) ||
      item.payslipNumber?.toLowerCase().includes(lower)
    );
  }, [payslipsData, debouncedSearch]);

  const totalCount = filteredPayslips.length;

  const handleView = (id: number) => {
    router.push(`/hr/payslips/${id}`);
  };

  const handlePrint = (id: number) => {
    window.open(`/hr/payslips/${id}/print`, '_blank');
  };

  const handleDelete = async (payslip: PayslipDto) => {
    try {
      await deletePayslipMutation.mutateAsync(payslip.id);
      showSuccess('Bordro başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Bordro silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <PayslipsStats payslips={filteredPayslips} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Bordro Yönetimi"
        description="Çalışan maaş bordrolarını yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Bordro',
          onClick: () => router.push('/hr/payslips/new'),
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

      {error && (
        <Alert
          variant="error"
          title="Bordrolar yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <DataTableWrapper className="mt-6">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Bordro ara... (çalışan adı, bordro numarası)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <PayslipsTable
          payslips={filteredPayslips}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onPrint={handlePrint}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
