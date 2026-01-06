'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Select } from 'antd';
import { MagnifyingGlassIcon, ShieldCheckIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { CertificationsStats, CertificationsTable } from '@/components/hr/certifications';
import { useCertifications, useDeleteCertification } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { CertificationDto } from '@/lib/api/services/hr.types';

const certificationTypeOptions = [
  { value: 'Professional', label: 'Profesyonel' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'Industry', label: 'Sektörel' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Government', label: 'Devlet' },
  { value: 'Vendor', label: 'Vendor/Ürün' },
  { value: 'Safety', label: 'Güvenlik' },
  { value: 'Quality', label: 'Kalite' },
  { value: 'Other', label: 'Diğer' },
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
      showSuccess('Sertifika Silindi', `"${certification.certificationName}" sertifikası başarıyla silindi.`);
    } catch (err) {
      showApiError(err, 'Sertifika silinirken bir hata oluştu');
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <CertificationsStats certifications={certifications} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShieldCheckIcon className="w-5 h-5" />}
        iconColor="#9333ea"
        title="Sertifikalar"
        description="Çalışan sertifikalarını yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sertifika',
          onClick: () => router.push('/hr/certifications/new'),
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
          title="Sertifikalar yüklenemedi"
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
              placeholder="Ara... (sertifika, çalışan, kurum)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Tip filtrele"
              allowClear
              style={{ width: '100%', height: '44px' }}
              onChange={(value) => setTypeFilter(value)}
              options={certificationTypeOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Durum filtrele"
              allowClear
              style={{ width: '100%', height: '44px' }}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'valid', label: 'Geçerli' },
                { value: 'expiring', label: 'Yakında Dolacak' },
                { value: 'expired', label: 'Süresi Dolmuş' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <DataTableWrapper>
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
      </DataTableWrapper>
    </PageContainer>
  );
}
