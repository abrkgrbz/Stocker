'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Card, Row, Col } from 'antd';
import { MagnifyingGlassIcon, CursorArrowRaysIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { GoalsStats, GoalsTable } from '@/components/hr/goals';
import { usePerformanceGoals, useDeletePerformanceGoal, useEmployees } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';

export default function GoalsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<{ employeeId?: number; year?: number }>({});
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

  // API Hooks
  const { data: goals = [], isLoading, error, refetch } = usePerformanceGoals(filters.employeeId, filters.year);
  const { data: employees = [] } = useEmployees();
  const deleteGoal = useDeletePerformanceGoal();

  // Filter by search text
  const filteredGoals = useMemo(() => {
    if (!debouncedSearch.trim()) return goals;
    const search = debouncedSearch.toLowerCase();
    return goals.filter(
      (goal) =>
        goal.title?.toLowerCase().includes(search) ||
        goal.employeeName?.toLowerCase().includes(search) ||
        goal.category?.toLowerCase().includes(search)
    );
  }, [goals, debouncedSearch]);

  // Paginate
  const paginatedGoals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGoals.slice(start, start + pageSize);
  }, [filteredGoals, currentPage, pageSize]);

  const totalCount = filteredGoals.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (goal: PerformanceGoalDto) => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      showSuccess('Hedef Silindi', `"${goal.title}" hedefi başarıyla silindi.`);
    } catch (err) {
      showApiError(err, 'Hedef silinirken bir hata oluştu');
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <GoalsStats goals={goals} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CursorArrowRaysIcon className="w-5 h-5" />}
        iconColor="#9333ea"
        title="Performans Hedefleri"
        description="Çalışan performans hedeflerini yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Hedef',
          onClick: () => router.push('/hr/goals/new'),
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
          title="Hedefler yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button onClick={() => refetch()} className="text-red-600 hover:text-red-800 font-medium">
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <Card className="mt-6 mb-4 border border-gray-100 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Hedef ara... (başlık, çalışan, kategori)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Çalışan seçin"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%', height: '44px' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Yıl"
              allowClear
              style={{ width: '100%', height: '44px' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}
              options={[
                { value: 2024, label: '2024' },
                { value: 2025, label: '2025' },
                { value: 2026, label: '2026' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <DataTableWrapper>
        <GoalsTable
          goals={paginatedGoals}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/goals/${id}`)}
          onEdit={(id) => router.push(`/hr/goals/${id}/edit`)}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
