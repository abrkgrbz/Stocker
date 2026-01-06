'use client';

/**
 * Leaves List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  useLeaves,
  useDeleteLeave,
  useApproveLeave,
  useRejectLeave,
  useEmployees,
  useLeaveTypes,
} from '@/lib/api/hooks/useHR';
import type { LeaveDto, LeaveFilterDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import { LeavesStats, LeavesTable } from '@/components/hr/leaves';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Leave status configuration for filters
const leaveStatusConfig: Record<number, { color: string; label: string }> = {
  [LeaveStatus.Pending]: { color: 'orange', label: 'Beklemede' },
  [LeaveStatus.Approved]: { color: 'green', label: 'Onaylandı' },
  [LeaveStatus.Rejected]: { color: 'red', label: 'Reddedildi' },
  [LeaveStatus.Cancelled]: { color: 'default', label: 'İptal Edildi' },
  [LeaveStatus.Taken]: { color: 'blue', label: 'Kullanıldı' },
  [LeaveStatus.PartiallyTaken]: { color: 'cyan', label: 'Kısmen Kullanıldı' },
};

export default function LeavesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<LeaveFilterDto>({});

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
  const { data: leaves = [], isLoading, error, refetch } = useLeaves(filters);
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const deleteLeave = useDeleteLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  // Filter leaves by search
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const matchesSearch =
        !debouncedSearch ||
        leave.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (leave.employeeCode && leave.employeeCode.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (leave.leaveTypeName && leave.leaveTypeName.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [leaves, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/leaves/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/leaves/${id}/edit`);
  };

  const handleDelete = async (leave: LeaveDto) => {
    try {
      await deleteLeave.mutateAsync(leave.id);
      showSuccess('İzin talebi başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'İzin talebi silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleApprove = async (leave: LeaveDto) => {
    try {
      await approveLeave.mutateAsync({ id: leave.id });
      showSuccess('İzin talebi onaylandı!');
    } catch (err) {
      showApiError(err, 'İzin talebi onaylanırken bir hata oluştu');
    }
  };

  const handleReject = async (leave: LeaveDto) => {
    try {
      await rejectLeave.mutateAsync({ id: leave.id, data: { reason: 'Reddedildi' } });
      showSuccess('İzin talebi reddedildi!');
    } catch (err) {
      showApiError(err, 'İzin talebi reddedilirken bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setFilters({});
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <LeavesStats leaves={leaves} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CalendarIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="İzin Yönetimi"
        description="Tüm izin taleplerini görüntüle ve yönet"
        itemCount={filteredLeaves.length}
        primaryAction={{
          label: 'Yeni İzin Talebi',
          onClick: () => router.push('/hr/leaves/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/hr/leave-types')}
              className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              İzin Türleri
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="İzin talepleri yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'İzin talepleri getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="İzin ara... (çalışan adı, sicil no, izin türü)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            placeholder="Çalışan"
            allowClear
            showSearch
            optionFilterProp="children"
            className="h-10"
            style={{ height: 48 }}
            value={filters.employeeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
            options={employees.map((e) => ({ value: e.id, label: e.fullName }))}
          />
          <Select
            placeholder="İzin Türü"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={filters.leaveTypeId}
            onChange={(value) => setFilters((prev) => ({ ...prev, leaveTypeId: value }))}
            options={leaveTypes.map((lt) => ({ value: lt.id, label: lt.name }))}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={filters.status}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            options={Object.entries(leaveStatusConfig).map(([value, config]) => ({
              value: Number(value),
              label: config.label,
            }))}
          />
          <button
            onClick={clearFilters}
            className="h-12 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Temizle
          </button>
        </div>
        <div className="mt-4">
          <RangePicker
            style={{ width: '100%', maxWidth: 300, height: 48 }}
            format="DD.MM.YYYY"
            placeholder={['Başlangıç Tarihi', 'Bitiş Tarihi']}
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
          <LeavesTable
            leaves={filteredLeaves}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredLeaves.length}
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
