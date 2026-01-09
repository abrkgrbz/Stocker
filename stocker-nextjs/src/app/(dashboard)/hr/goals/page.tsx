'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Select } from 'antd';
import { MagnifyingGlassIcon, CursorArrowRaysIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
      showSuccess('Hedef Silindi', `"${goal.title}" hedefi basariyla silindi.`);
    } catch (err) {
      showApiError(err, 'Hedef silinirken bir hata olustu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Stats Cards */}
      <div className="mb-8">
        <GoalsStats goals={goals} loading={isLoading} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CursorArrowRaysIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Performans Hedefleri</h1>
            <p className="text-sm text-slate-500">Calisan performans hedeflerini yonetin ve takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{totalCount} hedef</span>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
          />
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/goals/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Hedef
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Hedefler yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <Button onClick={() => refetch()} className="!border-slate-300 !text-slate-700">
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Hedef ara... (baslik, calisan, kategori)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Calisan secin"
            allowClear
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))}
            className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!h-[42px] [&_.ant-select-selection-search-input]:!h-[40px]"
          />
          <Select
            placeholder="Yil"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
            ]}
            className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!h-[42px]"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
      </div>
    </div>
  );
}
