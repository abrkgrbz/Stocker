'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Select } from 'antd';
import { MagnifyingGlassIcon, RocketLaunchIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { CareerPathsStats, CareerPathsTable } from '@/components/hr/career-paths';
import { useCareerPaths, useDeleteCareerPath } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { CareerPathDto } from '@/lib/api/services/hr.types';

export default function CareerPathsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
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
  const { data: careerPaths = [], isLoading, error, refetch } = useCareerPaths();
  const deleteCareerPath = useDeleteCareerPath();

  // Filter career paths
  const filteredPaths = useMemo(() => {
    let result = careerPaths;

    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.employeeName?.toLowerCase().includes(search) ||
          p.currentPositionName?.toLowerCase().includes(search) ||
          p.targetPositionName?.toLowerCase().includes(search) ||
          p.pathName?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [careerPaths, debouncedSearch, statusFilter]);

  // Paginate
  const paginatedPaths = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPaths.slice(start, start + pageSize);
  }, [filteredPaths, currentPage, pageSize]);

  const totalCount = filteredPaths.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (careerPath: CareerPathDto) => {
    try {
      await deleteCareerPath.mutateAsync(careerPath.id);
      showSuccess('Kariyer Planı Silindi', `"${careerPath.employeeName}" kariyer planı başarıyla silindi.`);
    } catch (err) {
      showApiError(err, 'Kariyer planı silinirken bir hata oluştu');
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <CareerPathsStats careerPaths={careerPaths} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<RocketLaunchIcon className="w-5 h-5" />}
        iconColor="#9333ea"
        title="Kariyer Planları"
        description="Çalışan kariyer gelişim planlarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Kariyer Planı',
          onClick: () => router.push('/hr/career-paths/new'),
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
          title="Kariyer planları yüklenemedi"
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
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Ara... (çalışan, pozisyon, plan adı)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum filtrele"
              allowClear
              style={{ width: '100%', height: '44px' }}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'Draft', label: 'Taslak' },
                { value: 'Active', label: 'Aktif' },
                { value: 'OnTrack', label: 'Yolunda' },
                { value: 'AtRisk', label: 'Risk Altında' },
                { value: 'Completed', label: 'Tamamlandı' },
                { value: 'OnHold', label: 'Beklemede' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <DataTableWrapper>
        <CareerPathsTable
          careerPaths={paginatedPaths}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/career-paths/${id}`)}
          onEdit={(id) => router.push(`/hr/career-paths/${id}/edit`)}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
