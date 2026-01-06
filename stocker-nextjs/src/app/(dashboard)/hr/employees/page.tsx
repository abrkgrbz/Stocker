'use client';

/**
 * Employees List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  useEmployees,
  useDepartments,
  usePositions,
  useDeleteEmployee,
  useActivateEmployee,
  useDeactivateEmployee,
} from '@/lib/api/hooks/useHR';
import type { EmployeeSummaryDto } from '@/lib/api/services/hr.types';
import { EmployeeStatus } from '@/lib/api/services/hr.types';
import { EmployeesStats, EmployeesTable } from '@/components/hr/employees';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';

// Employee status configuration for filters
const employeeStatusConfig: Record<number, { color: string; label: string }> = {
  [EmployeeStatus.Active]: { color: 'green', label: 'Aktif' },
  [EmployeeStatus.Inactive]: { color: 'default', label: 'Pasif' },
  [EmployeeStatus.OnLeave]: { color: 'blue', label: 'İzinde' },
  [EmployeeStatus.Terminated]: { color: 'red', label: 'İşten Çıkarıldı' },
  [EmployeeStatus.Resigned]: { color: 'orange', label: 'İstifa' },
  [EmployeeStatus.Retired]: { color: 'gray', label: 'Emekli' },
  [EmployeeStatus.Probation]: { color: 'purple', label: 'Deneme Süresinde' },
  [EmployeeStatus.MilitaryService]: { color: 'cyan', label: 'Askerde' },
  [EmployeeStatus.MaternityLeave]: { color: 'magenta', label: 'Doğum İzni' },
  [EmployeeStatus.SickLeave]: { color: 'volcano', label: 'Hastalık İzni' },
};

export default function EmployeesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EmployeeStatus | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);

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
  const { data: employees = [], isLoading, error, refetch } = useEmployees({
    departmentId: selectedDepartment,
    positionId: selectedPosition,
    status: selectedStatus,
    includeInactive,
  });
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const deleteEmployee = useDeleteEmployee();
  const activateEmployee = useActivateEmployee();
  const deactivateEmployee = useDeactivateEmployee();

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        !debouncedSearch ||
        employee.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        employee.employeeCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (employee.email && employee.email.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [employees, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/employees/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/employees/${id}/edit`);
  };

  const handleDelete = async (employee: EmployeeSummaryDto) => {
    try {
      await deleteEmployee.mutateAsync(employee.id);
      showSuccess('Çalışan başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Çalışan silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleToggleActive = async (employee: EmployeeSummaryDto) => {
    try {
      if (employee.status === EmployeeStatus.Active) {
        await deactivateEmployee.mutateAsync(employee.id);
        showSuccess('Çalışan pasifleştirildi!');
      } else {
        await activateEmployee.mutateAsync(employee.id);
        showSuccess('Çalışan aktifleştirildi!');
      }
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment(undefined);
    setSelectedPosition(undefined);
    setSelectedStatus(undefined);
    setIncludeInactive(false);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <EmployeesStats employees={employees} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<UsersIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Çalışanlar"
        description="Tüm çalışanları görüntüle ve yönet"
        itemCount={filteredEmployees.length}
        primaryAction={{
          label: 'Yeni Çalışan',
          onClick: () => router.push('/hr/employees/new'),
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
          title="Çalışanlar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Çalışanlar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
              placeholder="Çalışan ara... (ad, sicil no, e-posta)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="lg"
            />
          </div>
          <Select
            placeholder="Departman"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
          />
          <Select
            placeholder="Pozisyon"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={selectedPosition}
            onChange={setSelectedPosition}
            options={positions.map((p) => ({ value: p.id, label: p.title }))}
          />
          <Select
            placeholder="Durum"
            allowClear
            className="h-10"
            style={{ height: 48 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(employeeStatusConfig).map(([value, config]) => ({
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
          <EmployeesTable
            employees={filteredEmployees}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredEmployees.length}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
