'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Select } from 'antd';
import { MagnifyingGlassIcon, BookOpenIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { TrainingsStats, TrainingsTable } from '@/components/hr/trainings';
import { useTrainings, useDeleteTraining } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';

export default function TrainingsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | undefined>();
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
  const { data: trainings = [], isLoading, error, refetch } = useTrainings();
  const deleteTraining = useDeleteTraining();

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    let result = trainings;

    if (statusFilter !== undefined) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.provider?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [trainings, debouncedSearch, statusFilter]);

  // Paginate
  const paginatedTrainings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrainings.slice(start, start + pageSize);
  }, [filteredTrainings, currentPage, pageSize]);

  const totalCount = filteredTrainings.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (training: TrainingDto) => {
    try {
      await deleteTraining.mutateAsync(training.id);
      showSuccess('Eğitim Silindi', `"${training.title}" eğitimi başarıyla silindi.`);
    } catch (err) {
      showApiError(err, 'Eğitim silinirken bir hata oluştu');
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <TrainingsStats trainings={trainings} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BookOpenIcon className="w-5 h-5" />}
        iconColor="#9333ea"
        title="Eğitim Yönetimi"
        description="Şirket eğitimlerini planlayın ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Eğitim',
          onClick: () => router.push('/hr/trainings/new'),
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
          title="Eğitimler yüklenemedi"
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
              placeholder="Eğitim ara... (başlık, sağlayıcı)"
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
                { value: TrainingStatus.Scheduled, label: 'Planlandı' },
                { value: TrainingStatus.InProgress, label: 'Devam Ediyor' },
                { value: TrainingStatus.Completed, label: 'Tamamlandı' },
                { value: TrainingStatus.Cancelled, label: 'İptal Edildi' },
                { value: TrainingStatus.Postponed, label: 'Ertelendi' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <DataTableWrapper>
        <TrainingsTable
          trainings={paginatedTrainings}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/trainings/${id}`)}
          onEdit={(id) => router.push(`/hr/trainings/${id}/edit`)}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
