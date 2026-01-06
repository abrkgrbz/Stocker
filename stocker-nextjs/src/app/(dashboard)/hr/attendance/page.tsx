'use client';

/**
 * Attendance Tracking Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAttendance, useEmployees } from '@/lib/api/hooks/useHR';
import type { AttendanceFilterDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import { AttendanceStats, AttendanceTable } from '@/components/hr/attendance';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Alert, Spinner } from '@/components/primitives';

const { RangePicker } = DatePicker;

export default function AttendancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AttendanceFilterDto>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data: attendances = [], isLoading, error, refetch } = useAttendance(filters);
  const { data: employees = [] } = useEmployees();

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/attendance/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/attendance/${id}/edit`);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <AttendanceStats attendances={attendances} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Yoklama Takibi"
        description="Çalışan yoklama kayıtlarını görüntüle ve yönet"
        itemCount={attendances.length}
        primaryAction={{
          label: 'Yeni Kayıt',
          onClick: () => router.push('/hr/attendance/new'),
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
          title="Kayıtlar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Yoklama kayıtları getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={[
              { value: AttendanceStatus.Present, label: 'Mevcut' },
              { value: AttendanceStatus.Absent, label: 'Yok' },
              { value: AttendanceStatus.Late, label: 'Geç' },
              { value: AttendanceStatus.HalfDay, label: 'Yarım Gün' },
              { value: AttendanceStatus.OnLeave, label: 'İzinli' },
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
          <AttendanceTable
            attendances={attendances}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={attendances.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
