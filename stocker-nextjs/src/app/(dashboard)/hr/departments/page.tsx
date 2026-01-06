'use client';

/**
 * Departments List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Standardized with CRM Customer module patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Segmented } from 'antd';
import {
  ArrowPathIcon,
  Bars3Icon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import {
  useDepartments,
  useDeleteDepartment,
  useActivateDepartment,
  useDeactivateDepartment,
} from '@/lib/api/hooks/useHR';
import type { DepartmentDto } from '@/lib/api/services/hr.types';
import { DepartmentTree, DepartmentsStats, DepartmentsTable } from '@/components/hr/departments';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
  Card,
} from '@/components/patterns';
import { Input, Alert, Spinner } from '@/components/primitives';

type ViewMode = 'table' | 'tree';

export default function DepartmentsPage() {
  const router = useRouter();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const { data: departments = [], isLoading, error, refetch } = useDepartments(includeInactive);
  const deleteDepartment = useDeleteDepartment();
  const activateDepartment = useActivateDepartment();
  const deactivateDepartment = useDeactivateDepartment();

  // Filter departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !debouncedSearch ||
        dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (dept.code && dept.code.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (dept.description && dept.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

      return matchesSearch;
    });
  }, [departments, debouncedSearch]);

  // CRUD Handlers
  const handleView = (id: number) => {
    router.push(`/hr/departments/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/departments/${id}/edit`);
  };

  const handleDelete = async (dept: DepartmentDto) => {
    try {
      await deleteDepartment.mutateAsync(dept.id);
      showSuccess('Departman başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Departman silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleToggleActive = async (dept: DepartmentDto) => {
    try {
      if (dept.isActive) {
        await deactivateDepartment.mutateAsync(dept.id);
        showSuccess('Departman pasifleştirildi!');
      } else {
        await activateDepartment.mutateAsync(dept.id);
        showSuccess('Departman aktifleştirildi!');
      }
    } catch (err) {
      showApiError(err, 'İşlem sırasında bir hata oluştu');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setIncludeInactive(false);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <DepartmentsStats departments={departments} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BuildingOfficeIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Departmanlar"
        description="Tüm departmanları görüntüle ve yönet"
        itemCount={filteredDepartments.length}
        primaryAction={{
          label: 'Yeni Departman',
          onClick: () => router.push('/hr/departments/new'),
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
          title="Departmanlar yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Departmanlar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1 flex-wrap">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Departman ara... (ad, kod, açıklama)"
                prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="lg"
              />
            </div>
            <Select
              className="h-10"
              style={{ height: 48, minWidth: 150 }}
              value={includeInactive}
              onChange={setIncludeInactive}
              options={[
                { value: false, label: 'Sadece Aktifler' },
                { value: true, label: 'Tümü' },
              ]}
            />
            <button
              onClick={clearFilters}
              className="h-12 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Temizle
            </button>
          </div>
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <Bars3Icon className="w-4 h-4" />
                    <span>Liste</span>
                  </div>
                ),
                value: 'table',
              },
              {
                label: (
                  <div className="flex items-center gap-2 px-1">
                    <RectangleGroupIcon className="w-4 h-4" />
                    <span>Ağaç</span>
                  </div>
                ),
                value: 'tree',
              },
            ]}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : viewMode === 'tree' ? (
        <Card>
          <DepartmentTree
            departments={filteredDepartments}
            loading={isLoading}
            onView={handleView}
          />
        </Card>
      ) : (
        <DataTableWrapper>
          <DepartmentsTable
            departments={filteredDepartments}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={filteredDepartments.length}
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