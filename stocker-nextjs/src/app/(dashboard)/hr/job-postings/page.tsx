'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { JobPostingsStats, JobPostingsTable } from '@/components/hr/job-postings';
import {
  useJobPostings,
  useDeleteJobPosting,
  usePublishJobPosting,
  useUnpublishJobPosting,
  useCloseJobPosting,
} from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { JobPostingDto } from '@/lib/api/services/hr.types';

export default function JobPostingsPage() {
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

  const { data: postingsData, isLoading, error, refetch } = useJobPostings();
  const deletePostingMutation = useDeleteJobPosting();
  const publishPostingMutation = usePublishJobPosting();
  const unpublishPostingMutation = useUnpublishJobPosting();
  const closePostingMutation = useCloseJobPosting();

  // Client-side filtering
  const filteredPostings = useMemo(() => {
    const postings = postingsData || [];
    if (!debouncedSearch) return postings;
    const lower = debouncedSearch.toLowerCase();
    return postings.filter((item: JobPostingDto) =>
      item.title?.toLowerCase().includes(lower) ||
      item.postingCode?.toLowerCase().includes(lower) ||
      item.departmentName?.toLowerCase().includes(lower)
    );
  }, [postingsData, debouncedSearch]);

  const totalCount = filteredPostings.length;

  const handleView = (id: number) => {
    router.push(`/hr/job-postings/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/job-postings/${id}/edit`);
  };

  const handleDelete = async (posting: JobPostingDto) => {
    try {
      await deletePostingMutation.mutateAsync(posting.id);
      showSuccess('Is ilani basariyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Is ilani silinemedi');
    }
  };

  const handlePublish = async (posting: JobPostingDto) => {
    try {
      await publishPostingMutation.mutateAsync(posting.id);
      showSuccess('Is ilani yayinlandi');
      refetch();
    } catch (err) {
      showApiError(err, 'Is ilani yayinlanamadi');
    }
  };

  const handleUnpublish = async (posting: JobPostingDto) => {
    try {
      await unpublishPostingMutation.mutateAsync(posting.id);
      showSuccess('Is ilani yayindan kaldirildi');
      refetch();
    } catch (err) {
      showApiError(err, 'Is ilani yayindan kaldirilamadi');
    }
  };

  const handleClose = async (posting: JobPostingDto) => {
    try {
      await closePostingMutation.mutateAsync(posting.id);
      showSuccess('Is ilani kapatildi');
      refetch();
    } catch (err) {
      showApiError(err, 'Is ilani kapatilmadi');
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
        <JobPostingsStats postings={filteredPostings} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#64748b"
        title="Is Ilanlari"
        description="Acik pozisyonlari ve is ilanlarini yonetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Ilan',
          onClick: () => router.push('/hr/job-postings/new'),
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
          title="Is ilanlari yuklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button
              onClick={() => refetch()}
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <div className="bg-white border border-slate-200 rounded-xl mt-6">
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Is ilani ara... (baslik, kod, departman)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <JobPostingsTable
          postings={filteredPostings}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
