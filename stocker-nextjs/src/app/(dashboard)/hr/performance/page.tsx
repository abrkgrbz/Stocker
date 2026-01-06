'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Card, Row, Col } from 'antd';
import {
  ArrowPathIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceReviews, useDeletePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { PerformanceStats, PerformanceTable } from '@/components/hr/performance';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Cancelled', label: 'İptal' },
];

export default function PerformancePage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: reviews = [], isLoading, error, refetch } = usePerformanceReviews(selectedEmployeeId);
  const { data: employees = [] } = useEmployees();
  const deleteReview = useDeletePerformanceReview();

  const filteredReviews = useMemo(() => {
    return reviews.filter((r: PerformanceReviewDto) => {
      const matchesSearch =
        !debouncedSearch ||
        r.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.reviewPeriod?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = !selectedStatus || r.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, debouncedSearch, selectedStatus]);

  const totalCount = filteredReviews.length;

  const handleView = (id: number) => router.push(`/hr/performance/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/performance/${id}/edit`);

  const handleDelete = async (review: PerformanceReviewDto) => {
    try {
      await deleteReview.mutateAsync(review.id);
      showSuccess('Başarılı', 'Değerlendirme silindi');
    } catch (err) {
      showApiError(err, 'Değerlendirme silinirken hata oluştu');
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedEmployeeId(undefined);
    setSelectedStatus(undefined);
  };

  const hasFilters = searchText || selectedEmployeeId || selectedStatus;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <PerformanceStats reviews={reviews as PerformanceReviewDto[]} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TrophyIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Performans Değerlendirme"
        description="Çalışan performans değerlendirmelerini görüntüleyin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Değerlendirme',
          onClick: () => router.push('/hr/performance/new'),
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
          title="Değerlendirmeler yüklenemedi"
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
              placeholder="Çalışan veya dönem ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Çalışan seçin"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%', height: '44px' }}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%', height: '44px' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </Col>
          {hasFilters && (
            <Col xs={24} sm={12} md={5}>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Temizle
              </button>
            </Col>
          )}
        </Row>
      </Card>

      <DataTableWrapper>
        <PerformanceTable
          reviews={filteredReviews as PerformanceReviewDto[]}
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
