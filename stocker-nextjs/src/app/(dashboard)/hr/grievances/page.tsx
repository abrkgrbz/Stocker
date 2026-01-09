'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { ExclamationCircleIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { GrievancesStats, GrievancesTable } from '@/components/hr/grievances';
import { useGrievances, useDeleteGrievance } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { GrievanceDto } from '@/lib/api/services/hr.types';

export default function GrievancesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const { data: grievancesData, isLoading, error, refetch } = useGrievances();
  const deleteGrievanceMutation = useDeleteGrievance();

  // Client-side filtering
  const filteredGrievances = useMemo(() => {
    const grievances = grievancesData || [];
    if (!debouncedSearch) return grievances;
    const lower = debouncedSearch.toLowerCase();
    return grievances.filter((item: GrievanceDto) =>
      item.subject?.toLowerCase().includes(lower) ||
      item.complainantName?.toLowerCase().includes(lower) ||
      item.grievanceType?.toLowerCase().includes(lower)
    );
  }, [grievancesData, debouncedSearch]);

  const totalCount = filteredGrievances.length;

  const handleView = (id: number) => {
    router.push(`/hr/grievances/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/grievances/${id}/edit`);
  };

  const handleDelete = async (grievance: GrievanceDto) => {
    try {
      await deleteGrievanceMutation.mutateAsync(grievance.id);
      showSuccess('Sikayet basariyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Sikayet silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Stats Cards */}
      <div className="mb-8">
        <GrievancesStats grievances={filteredGrievances} loading={isLoading} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Sikayetler</h1>
            <p className="text-sm text-slate-500">Calisan sikayetlerini takip edin ve yonetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{totalCount} sikayet</span>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
          />
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/hr/grievances/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Sikayet
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Sikayetler yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <Button onClick={() => refetch()} className="!border-slate-300 !text-slate-700">
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Sikayet ara... (konu, sikayet eden, tur)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        <GrievancesTable
          grievances={filteredGrievances}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
