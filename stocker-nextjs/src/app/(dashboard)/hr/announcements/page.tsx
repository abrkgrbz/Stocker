'use client';

/**
 * Announcements List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  BellIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAnnouncements, useDeleteAnnouncement } from '@/lib/api/hooks/useHR';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
  StatCard,
} from '@/components/patterns';
import { Input, Badge, Spinner } from '@/components/primitives';
import { ConfirmModal } from '@/components/primitives/overlay';

// Stats Component
function AnnouncementsStats({
  total,
  published,
  pinned,
  loading,
}: {
  total: number;
  published: number;
  pinned: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-16 bg-slate-100 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Toplam Duyuru"
        value={total}
        icon={<BellIcon className="w-5 h-5" />}
      />
      <StatCard
        label="Yayında"
        value={published}
        icon={<CheckCircleIcon className="w-5 h-5" />}
      />
      <StatCard
        label="Sabitlenmiş"
        value={pinned}
        icon={<MapPinIcon className="w-5 h-5" />}
      />
    </div>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority?: string }) {
  const config: Record<string, { variant: 'default' | 'info' | 'warning' | 'error'; text: string }> = {
    Low: { variant: 'default', text: 'Düşük' },
    Normal: { variant: 'info', text: 'Normal' },
    High: { variant: 'warning', text: 'Yüksek' },
    Urgent: { variant: 'error', text: 'Acil' },
  };
  const { variant, text } = config[priority || ''] || { variant: 'default' as const, text: priority || '-' };
  return <Badge variant={variant}>{text}</Badge>;
}

// Status Badge Component
function PublishStatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge variant={isPublished ? 'success' : 'default'}>
      {isPublished ? 'Yayında' : 'Taslak'}
    </Badge>
  );
}

// Action Menu Component
function ActionMenu({
  announcement,
  onView,
  onEdit,
  onDelete,
}: {
  announcement: AnnouncementDto;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              Görüntüle
            </button>
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Düzenle
            </button>
            <div className="border-t border-slate-100 my-1" />
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Sil
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; announcement: AnnouncementDto | null }>({
    open: false,
    announcement: null,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: announcements = [], isLoading } = useAnnouncements();
  const deleteAnnouncement = useDeleteAnnouncement();

  // Filter announcements
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Stats
  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter((a) => a.isPublished).length;
  const pinnedAnnouncements = announcements.filter((a) => a.isPinned).length;

  const handleDelete = async () => {
    if (!deleteModal.announcement) return;
    try {
      await deleteAnnouncement.mutateAsync(deleteModal.announcement.id);
      setDeleteModal({ open: false, announcement: null });
    } catch {
      // Error handled by hook
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats */}
      <AnnouncementsStats
        total={totalAnnouncements}
        published={publishedAnnouncements}
        pinned={pinnedAnnouncements}
        loading={isLoading}
      />

      {/* Header */}
      <ListPageHeader
        icon={<BellIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Duyurular"
        description="Şirket duyurularını yönetin"
        itemCount={totalAnnouncements}
        primaryAction={{
          label: 'Yeni Duyuru',
          onClick: () => router.push('/hr/announcements/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Duyuru ara... (başlık veya içerik)"
          prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="lg"
        />
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <BellIcon className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Duyuru bulunamadı</p>
            <p className="text-sm">Arama kriterlerinizi değiştirin veya yeni duyuru ekleyin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Başlık
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    İçerik
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                    Öncelik
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnnouncements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {announcement.isPinned && (
                          <MapPinIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <button
                          onClick={() => router.push(`/hr/announcements/${announcement.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-violet-600 transition-colors text-left"
                        >
                          {announcement.title}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-600 truncate max-w-xs">
                        {announcement.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={announcement.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {dayjs(announcement.publishDate).format('DD.MM.YYYY')}
                    </td>
                    <td className="px-4 py-3">
                      <PublishStatusBadge isPublished={announcement.isPublished} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu
                        announcement={announcement}
                        onView={() => router.push(`/hr/announcements/${announcement.id}`)}
                        onEdit={() => router.push(`/hr/announcements/${announcement.id}/edit`)}
                        onDelete={() => setDeleteModal({ open: true, announcement })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, announcement: null })}
        onConfirm={handleDelete}
        title="Duyuruyu Sil"
        message={`"${deleteModal.announcement?.title}" duyurusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        variant="danger"
        loading={deleteAnnouncement.isPending}
      />
    </PageContainer>
  );
}
