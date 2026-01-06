'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select, DatePicker, Modal, Card, Row, Col } from 'antd';
import {
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useOvertimes,
  useDeleteOvertime,
  useApproveOvertime,
  useRejectOvertime,
} from '@/lib/api/hooks/useHR';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { OvertimesStats, OvertimesTable } from '@/components/hr/overtimes';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

const { RangePicker } = DatePicker;

const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Günü' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazlı' },
];

const statusOptions = [
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Cancelled', label: 'İptal Edildi' },
];

export default function OvertimesPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: overtimes = [], isLoading, error, refetch } = useOvertimes();
  const deleteOvertime = useDeleteOvertime();
  const approveOvertime = useApproveOvertime();
  const rejectOvertime = useRejectOvertime();

  const filteredOvertimes = useMemo(() => {
    return overtimes.filter((ot) => {
      const matchesSearch =
        !debouncedSearch ||
        ot.employeeName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ot.reason.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = !selectedType || ot.overtimeType === selectedType;
      const matchesStatus = !selectedStatus || ot.status === selectedStatus;

      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const otDate = dayjs(ot.date);
        matchesDate =
          otDate.isAfter(dateRange[0].subtract(1, 'day')) &&
          otDate.isBefore(dateRange[1].add(1, 'day'));
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [overtimes, debouncedSearch, selectedType, selectedStatus, dateRange]);

  const totalCount = filteredOvertimes.length;

  const handleView = (id: number) => router.push(`/hr/overtimes/${id}`);
  const handleEdit = (id: number) => router.push(`/hr/overtimes/${id}/edit`);

  const handleDelete = async (overtime: OvertimeDto) => {
    try {
      await deleteOvertime.mutateAsync(overtime.id);
      showSuccess('Başarılı', 'Mesai kaydı silindi');
    } catch (err) {
      showApiError(err, 'Mesai kaydı silinirken hata oluştu');
    }
  };

  const handleApprove = async (overtime: OvertimeDto) => {
    try {
      await approveOvertime.mutateAsync({ id: overtime.id });
      showSuccess('Başarılı', 'Mesai talebi onaylandı');
    } catch (err) {
      showApiError(err, 'Mesai talebi onaylanırken hata oluştu');
    }
  };

  const handleReject = async (overtime: OvertimeDto) => {
    Modal.confirm({
      title: 'Mesai Talebini Reddet',
      content: 'Bu talebi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectOvertime.mutateAsync({ id: overtime.id, reason: 'Talep reddedildi' });
          showSuccess('Başarılı', 'Mesai talebi reddedildi');
        } catch (err) {
          showApiError(err, 'Mesai talebi reddedilirken hata oluştu');
        }
      },
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
    setSelectedStatus(undefined);
    setDateRange(null);
  };

  const hasFilters = searchText || selectedType || selectedStatus || dateRange;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <OvertimesStats overtimes={overtimes} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Fazla Mesailer"
        description="Fazla mesai taleplerini görüntüleyin ve yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Mesai Talebi',
          onClick: () => router.push('/hr/overtimes/new'),
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
          title="Mesailer yüklenemedi"
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
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Çalışan veya sebep ara..."
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Tip"
              allowClear
              style={{ width: '100%', height: '44px' }}
              value={selectedType}
              onChange={setSelectedType}
              options={overtimeTypeOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%', height: '44px' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%', height: '44px' }}
              format="DD.MM.YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              placeholder={['Başlangıç', 'Bitiş']}
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
        <OvertimesTable
          overtimes={filteredOvertimes}
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
