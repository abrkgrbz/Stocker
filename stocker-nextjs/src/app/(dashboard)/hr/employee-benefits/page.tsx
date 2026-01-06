'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GiftIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { EmployeeBenefitsStats, EmployeeBenefitsTable } from '@/components/hr/employee-benefits';
import { useEmployeeBenefits, useDeleteEmployeeBenefit } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { EmployeeBenefitDto } from '@/lib/api/services/hr.types';

export default function EmployeeBenefitsPage() {
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

  const { data: benefitsData, isLoading, error, refetch } = useEmployeeBenefits();
  const deleteBenefitMutation = useDeleteEmployeeBenefit();

  // Client-side filtering
  const filteredBenefits = useMemo(() => {
    const benefits = benefitsData || [];
    if (!debouncedSearch) return benefits;
    const lower = debouncedSearch.toLowerCase();
    return benefits.filter((item: EmployeeBenefitDto) =>
      item.benefitName?.toLowerCase().includes(lower) ||
      item.employeeName?.toLowerCase().includes(lower) ||
      item.benefitType?.toLowerCase().includes(lower)
    );
  }, [benefitsData, debouncedSearch]);

  const totalCount = filteredBenefits.length;

  const handleView = (id: number) => {
    router.push(`/hr/employee-benefits/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employee-benefits/${id}/edit`);
  };

  const handleDelete = async (benefit: EmployeeBenefitDto) => {
    try {
      await deleteBenefitMutation.mutateAsync(benefit.id);
      showSuccess('Yan hak başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Yan hak silinemedi');
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
        <EmployeeBenefitsStats benefits={filteredBenefits} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<GiftIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Çalışan Yan Hakları"
        description="Çalışan yan haklarını ve sosyal haklarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Yan Hak',
          onClick: () => router.push('/hr/employee-benefits/new'),
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
          title="Yan haklar yüklenemedi"
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
            placeholder="Yan hak ara... (yan hak adı, çalışan, tür)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <EmployeeBenefitsTable
          benefits={filteredBenefits}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
