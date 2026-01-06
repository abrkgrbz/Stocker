'use client';

/**
 * Holidays List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import {
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useHolidays, useDeleteHoliday } from '@/lib/api/hooks/useHR';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import { HolidaysStats, HolidaysTable } from '@/components/hr/holidays';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';
import dayjs from 'dayjs';

export default function HolidaysPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(dayjs().year());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: holidays = [], isLoading, error, refetch } = useHolidays(yearFilter);
  const deleteHoliday = useDeleteHoliday();

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) =>
      !debouncedSearch ||
      h.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [holidays, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/holidays/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/holidays/${id}/edit`);
  };

  const handleDelete = async (holiday: HolidayDto) => {
    try {
      await deleteHoliday.mutateAsync(holiday.id);
      showSuccess('Tatil günü başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Tatil günü silinirken bir hata oluştu');
      throw err;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setYearFilter(dayjs().year());
  };

  const currentYear = dayjs().year();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: `${currentYear - 2 + i}`,
  }));

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <HolidaysStats holidays={holidays} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CalendarIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Resmi Tatiller"
        description="Tüm tatil günlerini görüntüle ve yönet"
        itemCount={filteredHolidays.length}
        primaryAction={{
          label: 'Yeni Tatil',
          onClick: () => router.push('/hr/holidays/new'),
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
          title="Tatiller yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Tatil günleri getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
          <div className="md:col-span-2">
            <Input
              placeholder="Tatil ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            placeholder="Yıl seçin"
            className="h-10"
            style={{ height: 48 }}
            value={yearFilter}
            onChange={(value) => setYearFilter(value)}
            allowClear
            options={yearOptions}
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
          <HolidaysTable
            holidays={filteredHolidays}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredHolidays.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}