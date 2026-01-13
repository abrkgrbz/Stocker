'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Dropdown,
  Empty,
  Progress,
} from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import {
  useMaterialReservations,
  useCancelMaterialReservation,
  useApproveMaterialReservation,
} from '@/lib/api/hooks/useManufacturing';
import type { MaterialReservationListDto, ReservationStatus, ReservationPriority } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// Reservation status configuration
const statusConfig: Record<ReservationStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: '#64748b', bgColor: '#f1f5f9', label: 'Bekliyor', icon: <ClockIcon className="w-3 h-3" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-3 h-3" /> },
  Allocated: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Ayrıldı', icon: <CubeIcon className="w-3 h-3" /> },
  Issued: { color: '#475569', bgColor: '#e2e8f0', label: 'Çıkış Yapıldı', icon: <ArrowDownTrayIcon className="w-3 h-3" /> },
  Completed: { color: '#1e293b', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Cancelled: { color: '#94a3b8', bgColor: '#f8fafc', label: 'İptal', icon: <XMarkIcon className="w-3 h-3" /> },
};

const priorityConfig: Record<ReservationPriority, { color: string; bgColor: string; label: string }> = {
  Low: { color: '#64748b', bgColor: '#f1f5f9', label: 'Düşük' },
  Normal: { color: '#475569', bgColor: '#e2e8f0', label: 'Normal' },
  High: { color: '#334155', bgColor: '#cbd5e1', label: 'Yüksek' },
  Urgent: { color: '#1e293b', bgColor: '#94a3b8', label: 'Acil' },
};

interface FilterState {
  searchText: string;
  status?: ReservationStatus;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
};

export default function MaterialReservationsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // API Hooks
  const { data: reservations = [], isLoading, refetch } = useMaterialReservations();
  const cancelReservation = useCancelMaterialReservation();
  const approveReservation = useApproveMaterialReservation();

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch = !debouncedSearch ||
        r.reservationNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.productionOrderNumber.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = !filters.status || r.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, debouncedSearch, filters.status]);

  // Stats
  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'Pending').length,
    approved: reservations.filter(r => r.status === 'Approved').length,
    allocated: reservations.filter(r => r.status === 'Allocated').length,
  }), [reservations]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/material-reservations/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/material-reservations/${id}/edit`);
  };

  const handleCancel = async (r: MaterialReservationListDto) => {
    const confirmed = await confirmDelete('Malzeme Rezervasyonu', r.reservationNumber);
    if (confirmed) {
      try {
        await cancelReservation.mutateAsync(r.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReservation.mutateAsync({ id, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<MaterialReservationListDto> = [
    {
      title: 'Rezervasyon No',
      key: 'reservationNumber',
      width: 140,
      render: (_, record) => (
        <span
          className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
          onClick={() => handleView(record.id)}
        >
          {record.reservationNumber}
        </span>
      ),
    },
    {
      title: 'Üretim Emri',
      dataIndex: 'productionOrderNumber',
      key: 'productionOrderNumber',
      width: 130,
      render: (number) => (
        <span className="text-slate-600">{number}</span>
      ),
    },
    {
      title: 'Malzeme',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: ReservationStatus) => {
        const config = statusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status, icon: null };
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: ReservationPriority) => {
        const config = priorityConfig[priority] || { color: '#64748b', bgColor: '#f1f5f9', label: priority };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 200,
      render: (_, record) => {
        const percent = record.requiredQuantity > 0
          ? Math.round((record.allocatedQuantity / record.requiredQuantity) * 100)
          : 0;
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">
                {record.allocatedQuantity} / {record.requiredQuantity}
              </span>
              <span className="text-slate-700 font-medium">{percent}%</span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor="#475569"
              trailColor="#e2e8f0"
            />
          </div>
        );
      },
    },
    {
      title: 'Gerekli Tarih',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 110,
      render: (date) => (
        <span className="text-sm text-slate-600">
          {dayjs(date).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
            disabled: record.status !== 'Pending',
          },
          { type: 'divider' as const },
        ];

        if (record.status === 'Pending') {
          menuItems.push({
            key: 'approve',
            icon: <DocumentCheckIcon className="w-4 h-4" />,
            label: 'Onayla',
            onClick: () => handleApprove(record.id),
          });
          menuItems.push({
            key: 'cancel',
            icon: <XMarkIcon className="w-4 h-4" />,
            label: 'İptal Et',
            danger: true,
            onClick: () => handleCancel(record),
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Malzeme Rezervasyonları</h1>
          <p className="text-slate-500 mt-1">Üretim emirleri için malzeme rezervasyonlarını yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/manufacturing/material-reservations/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Rezervasyon
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekliyor</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <DocumentCheckIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.approved}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Onaylı</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.allocated}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ayrıldı</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Rezervasyon no, ürün veya emir ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 320 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            allowClear
            style={{ width: 160 }}
            options={[
              { value: 'Pending', label: 'Bekliyor' },
              { value: 'Approved', label: 'Onaylı' },
              { value: 'Allocated', label: 'Ayrıldı' },
              { value: 'Issued', label: 'Çıkış Yapıldı' },
              { value: 'Completed', label: 'Tamamlandı' },
              { value: 'Cancelled', label: 'İptal' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 ml-auto"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredReservations}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredReservations.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} rezervasyon`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Rezervasyon bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}
