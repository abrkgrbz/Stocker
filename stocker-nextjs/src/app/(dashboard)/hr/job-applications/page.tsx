'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { JobApplicationsStats, JobApplicationsTable } from '@/components/hr/job-applications';
import { useJobApplications, useDeleteJobApplication } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { JobApplicationDto } from '@/lib/api/services/hr.types';

export default function JobApplicationsPage() {
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

  const { data: applicationsData, isLoading, error, refetch } = useJobApplications();
  const deleteApplicationMutation = useDeleteJobApplication();

  // Client-side filtering
  const filteredApplications = useMemo(() => {
    const applications = applicationsData || [];
    if (!debouncedSearch) return applications;
    const lower = debouncedSearch.toLowerCase();
    return applications.filter((item: JobApplicationDto) =>
      item.fullName?.toLowerCase().includes(lower) ||
      item.jobTitle?.toLowerCase().includes(lower) ||
      item.email?.toLowerCase().includes(lower)
    );
  }, [applicationsData, debouncedSearch]);

  const totalCount = filteredApplications.length;

  const handleView = (id: number) => {
    router.push(`/hr/job-applications/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/job-applications/${id}/edit`);
  };

  const handleDelete = async (application: JobApplicationDto) => {
    try {
      await deleteApplicationMutation.mutateAsync(application.id);
      showSuccess('Başvuru başarıyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Başvuru silinemedi');
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <JobApplicationsStats applications={filteredApplications} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
        title="İş Başvuruları"
        description="Aday başvurularını takip edin ve değerlendirin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Başvuru',
          onClick: () => router.push('/hr/job-applications/new'),
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
          title="Başvurular yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <DataTableWrapper className="mt-6">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Başvuru ara... (aday adı, pozisyon, e-posta)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <JobApplicationsTable
          applications={filteredApplications}
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
