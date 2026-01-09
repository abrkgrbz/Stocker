'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { MagnifyingGlassIcon, ShieldCheckIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CertificationsStats, CertificationsTable } from '@/components/hr/certifications';
import { useCertifications, useDeleteCertification } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { CertificationDto } from '@/lib/api/services/hr.types';

const certificationTypeOptions = [
  { value: 'Professional', label: 'Profesyonel' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'Industry', label: 'Sektorel' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Government', label: 'Devlet' },
  { value: 'Vendor', label: 'Vendor/Urun' },
  { value: 'Safety', label: 'Guvenlik' },
  { value: 'Quality', label: 'Kalite' },
  { value: 'Other', label: 'Diger' },
];

export default function CertificationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
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
  const { data: certifications = [], isLoading, error, refetch } = useCertifications();
  const deleteCertification = useDeleteCertification();

  // Filter certifications
  const filteredCertifications = useMemo(() => {
    let result = certifications;

    if (typeFilter) {
      result = result.filter((c) => c.certificationType === typeFilter);
    }

    if (statusFilter) {
      if (statusFilter === 'expired') {
        result = result.filter((c) => c.isExpired);
      } else if (statusFilter === 'expiring') {
        result = result.filter((c) => c.isExpiringSoon && !c.isExpired);
      } else if (statusFilter === 'valid') {
        result = result.filter((c) => !c.isExpired && !c.isExpiringSoon);
      }
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.certificationName?.toLowerCase().includes(search) ||
          c.employeeName?.toLowerCase().includes(search) ||
          c.issuingAuthority?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [certifications, debouncedSearch, typeFilter, statusFilter]);

  // Paginate
  const paginatedCertifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCertifications.slice(start, start + pageSize);
  }, [filteredCertifications, currentPage, pageSize]);

  const totalCount = filteredCertifications.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (certification: CertificationDto) => {
    try {
      await deleteCertification.mutateAsync(certification.id);
      showSuccess('Sertifika Silindi', `"${certification.certificationName}" sertifikasi basariyla silindi.`);
    } catch (err) {
      showApiError(err, 'Sertifika silinirken bir hata olustu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sertifikalar</h1>
              <p className="text-sm text-slate-500">Calisan sertifikalarini yonetin ve takip edin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => router.push('/hr/certifications/new')}
            className="flex items-center gap-2 px-4 py-2 !bg-slate-900 hover:!bg-slate-800 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Sertifika
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <CertificationsStats certifications={certifications} loading={isLoading} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Sertifikalar yuklenemedi</p>
              <p className="text-sm text-slate-500">{(error as Error).message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ara... (sertifika, calisan, kurum)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <div className="w-40">
            <Select
              placeholder="Tip filtrele"
              allowClear
              style={{ width: '100%', height: '42px' }}
              onChange={(value) => setTypeFilter(value)}
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={certificationTypeOptions}
            />
          </div>
          <div className="w-44">
            <Select
              placeholder="Durum filtrele"
              allowClear
              style={{ width: '100%', height: '42px' }}
              onChange={(value) => setStatusFilter(value)}
              className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
              options={[
                { value: 'valid', label: 'Gecerli' },
                { value: 'expiring', label: 'Yakinda Dolacak' },
                { value: 'expired', label: 'Suresi Dolmus' },
              ]}
            />
          </div>
          <div className="text-sm text-slate-500">
            {totalCount} kayit
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <CertificationsTable
          certifications={paginatedCertifications}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/certifications/${id}`)}
          onEdit={(id) => router.push(`/hr/certifications/${id}/edit`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
