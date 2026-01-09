'use client';

/**
 * Work Locations List Page
 * Monochrome design system following inventory page patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useWorkLocations, useDeleteWorkLocation, useActivateWorkLocation, useDeactivateWorkLocation } from '@/lib/api/hooks/useHR';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';
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
      showSuccess('Basarili', 'Lokasyon silindi');
    } catch (err) {
      showApiError(err, 'Lokasyon silinirken hata olustu');
    }
  };

  const handleToggleActive = async (location: WorkLocationDto) => {
    try {
      if (location.isActive) {
        await deactivateLocation.mutateAsync(location.id);
        showSuccess('Basarili', 'Lokasyon pasiflestirildi');
      } else {
        await activateLocation.mutateAsync(location.id);
        showSuccess('Basarili', 'Lokasyon aktiflestirildi');
      }
    } catch (err) {
      showApiError(err, 'Islem sirasinda hata olustu');
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <MapPinIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calisma Lokasyonlari</h1>
            <p className="text-sm text-slate-500">
              {totalCount} lokasyon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/work-locations/new')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Lokasyon
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <WorkLocationsStats locations={locations as WorkLocationDto[]} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Lokasyonlar yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Lokasyon, kod veya sehir ara..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
