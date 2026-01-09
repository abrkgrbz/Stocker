'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserGroupIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { InterviewsStats, InterviewsTable } from '@/components/hr/interviews';
import { useInterviews, useDeleteInterview } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { InterviewDto } from '@/lib/api/services/hr.types';

export default function InterviewsPage() {
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

  const { data: interviewsData, isLoading, error, refetch } = useInterviews();
  const deleteInterviewMutation = useDeleteInterview();

  // Client-side filtering
  const filteredInterviews = useMemo(() => {
    const interviews = interviewsData || [];
    if (!debouncedSearch) return interviews;
    const lower = debouncedSearch.toLowerCase();
    return interviews.filter((item: InterviewDto) =>
      item.candidateName?.toLowerCase().includes(lower) ||
      item.interviewerName?.toLowerCase().includes(lower)
    );
  }, [interviewsData, debouncedSearch]);

  const totalCount = filteredInterviews.length;

  const handleView = (id: number) => {
    router.push(`/hr/interviews/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/hr/interviews/${id}/edit`);
  };

  const handleDelete = async (interview: InterviewDto) => {
    try {
      await deleteInterviewMutation.mutateAsync(interview.id);
      showSuccess('Mulakat basariyla silindi');
      refetch();
    } catch (err) {
      showApiError(err, 'Mulakat silinemedi');
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
        <InterviewsStats interviews={filteredInterviews} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<UserGroupIcon className="w-5 h-5" />}
        iconColor="#64748b"
        title="Mulakatlar"
        description="Is gorusmelerini planlayin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Mulakat',
          onClick: () => router.push('/hr/interviews/new'),
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
          title="Mulakatlar yuklenemedi"
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
            placeholder="Mulakat ara... (aday adi, gorusmeci)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <InterviewsTable
          interviews={filteredInterviews}
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
