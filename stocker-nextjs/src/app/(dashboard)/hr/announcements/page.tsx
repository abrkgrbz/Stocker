'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
import { MagnifyingGlassIcon, BellIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { AnnouncementsStats, AnnouncementsTable } from '@/components/hr/announcements';
import { useAnnouncements, useDeleteAnnouncement } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
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
  const { data: announcements = [], isLoading, error, refetch } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();

  // Filter announcements
  const filteredAnnouncements = useMemo(() => {
    let result = announcements;

    if (priorityFilter) {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(search) ||
          a.content?.toLowerCase().includes(search) ||
          a.authorName?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [announcements, debouncedSearch, priorityFilter]);

  // Paginate
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnnouncements.slice(start, start + pageSize);
  }, [filteredAnnouncements, currentPage, pageSize]);

  const totalCount = filteredAnnouncements.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (announcement: AnnouncementDto) => {
    try {
      await deleteAnnouncement.mutateAsync(announcement.id);
      showSuccess('Duyuru Silindi', `"${announcement.title}" duyurusu basariyla silindi.`);
    } catch (err) {
      showApiError(err, 'Duyuru silinirken bir hata olustu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Stats Cards */}
      <div className="mb-8">
        <AnnouncementsStats announcements={announcements} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BellIcon className="w-5 h-5" />}
        iconColor="#64748b"
        title="Duyurular"
        description="Sirket duyurularini yonetin ve yayinlayin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Duyuru',
          onClick: () => router.push('/hr/announcements/new'),
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
          title="Duyurular yuklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button onClick={() => refetch()} className="text-slate-700 hover:text-slate-900 font-medium">
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 mt-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Duyuru ara... (baslik, icerik, yazar)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Select
            placeholder="Oncelik filtrele"
            allowClear
            style={{ width: '100%', height: '44px' }}
            onChange={(value) => setPriorityFilter(value)}
            options={[
              { value: 'Low', label: 'Dusuk' },
              { value: 'Normal', label: 'Normal' },
              { value: 'High', label: 'Yuksek' },
              { value: 'Urgent', label: 'Acil' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
        <AnnouncementsTable
          announcements={paginatedAnnouncements}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/announcements/${id}`)}
          onEdit={(id) => router.push(`/hr/announcements/${id}/edit`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
