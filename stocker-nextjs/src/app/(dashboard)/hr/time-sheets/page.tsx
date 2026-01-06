'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Modal, Card, Row, Col } from 'antd';
import {
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTimeSheets, useDeleteTimeSheet } from '@/lib/api/hooks/useHR';
import type { TimeSheetDto } from '@/lib/api/services/hr.types';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { TimeSheetsStats, TimeSheetsTable } from '@/components/hr/time-sheets';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Submitted', label: 'Gönderildi' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Paid', label: 'Ödendi' },
];

export default function TimeSheetsPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: timeSheets = [], isLoading, error, refetch } = useTimeSheets();
  const deleteTimeSheet = useDeleteTimeSheet();

  const filteredTimeSheets = useMemo(() => {
    return timeSheets.filter((ts: TimeSheetDto) => {
      const matchesSearch =
        !debouncedSearch ||
        ts.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = !selectedStatus || ts.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [timeSheets, debouncedSearch, selectedStatus]);

  const totalCount = filteredTimeSheets.length;

  const handleView = (id: number) => router.push(`/hr/time-sheets/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/time-sheets/${id}/edit`);

  const handleDelete = async (timeSheet: TimeSheetDto) => {
    try {
      await deleteTimeSheet.mutateAsync(timeSheet.id);
      showSuccess('Başarılı', 'Puantaj kaydı silindi');
    } catch (err) {
      showApiError(err, 'Puantaj kaydı silinirken hata oluştu');
    }
  };

  const handleApprove = async (_timeSheet: TimeSheetDto) => {
    showSuccess('Bilgi', 'Onay işlemi henüz uygulanmadı');
  };

  const handleReject = async (_timeSheet: TimeSheetDto) => {
    Modal.confirm({
      title: 'Puantajı Reddet',
      content: 'Bu puantajı reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        showSuccess('Bilgi', 'Reddetme işlemi henüz uygulanmadı');
      },
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
  };

  const hasFilters = searchText || selectedStatus;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <TimeSheetsStats timeSheets={timeSheets as TimeSheetDto[]} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Puantaj"
        description="Çalışan çalışma saatlerini görüntüleyin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Puantaj',
          onClick: () => router.push('/hr/time-sheets/new'),
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
          title="Puantajlar yüklenemedi"
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
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Çalışan ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%', height: '44px' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </Col>
          {hasFilters && (
            <Col xs={24} sm={12} md={4}>
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
        <TimeSheetsTable
          timeSheets={filteredTimeSheets as TimeSheetDto[]}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
