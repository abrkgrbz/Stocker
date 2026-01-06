'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col } from 'antd';
import {
  ArrowPathIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useWorkLocations, useDeleteWorkLocation, useActivateWorkLocation, useDeactivateWorkLocation } from '@/lib/api/hooks/useHR';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { WorkLocationsStats, WorkLocationsTable } from '@/components/hr/work-locations';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

export default function WorkLocationsPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: locations = [], isLoading, error, refetch } = useWorkLocations();
  const deleteLocation = useDeleteWorkLocation();
  const activateLocation = useActivateWorkLocation();
  const deactivateLocation = useDeactivateWorkLocation();

  const filteredLocations = useMemo(() => {
    if (!debouncedSearch) return locations;
    const lower = debouncedSearch.toLowerCase();
    return locations.filter(
      (l: WorkLocationDto) =>
        l.name.toLowerCase().includes(lower) ||
        l.code?.toLowerCase().includes(lower) ||
        l.city?.toLowerCase().includes(lower)
    );
  }, [locations, debouncedSearch]);

  const totalCount = filteredLocations.length;

  const handleView = (id: number) => router.push(`/hr/work-locations/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/work-locations/${id}/edit`);

  const handleDelete = async (location: WorkLocationDto) => {
    try {
      await deleteLocation.mutateAsync(location.id);
      showSuccess('Başarılı', 'Lokasyon silindi');
    } catch (err) {
      showApiError(err, 'Lokasyon silinirken hata oluştu');
    }
  };

  const handleToggleActive = async (location: WorkLocationDto) => {
    try {
      if (location.isActive) {
        await deactivateLocation.mutateAsync(location.id);
        showSuccess('Başarılı', 'Lokasyon pasifleştirildi');
      } else {
        await activateLocation.mutateAsync(location.id);
        showSuccess('Başarılı', 'Lokasyon aktifleştirildi');
      }
    } catch (err) {
      showApiError(err, 'İşlem sırasında hata oluştu');
    }
  };

  const clearFilters = () => {
    setSearchText('');
  };

  const hasFilters = searchText;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <WorkLocationsStats locations={locations as WorkLocationDto[]} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<MapPinIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Çalışma Lokasyonları"
        description="Şirket lokasyonlarını görüntüleyin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Lokasyon',
          onClick: () => router.push('/hr/work-locations/new'),
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
          title="Lokasyonlar yüklenemedi"
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
          <Col xs={24} sm={16} md={12}>
            <Input
              placeholder="Lokasyon, kod veya şehir ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          {hasFilters && (
            <Col xs={24} sm={8} md={4}>
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
        <WorkLocationsTable
          locations={filteredLocations as WorkLocationDto[]}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
