'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Modal, Dropdown, Spin } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  TruckIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useShipments,
  useShipShipment,
  useDeliverShipment,
  useCancelShipment,
} from '@/lib/api/hooks/useSales';
import type { ShipmentQueryParams, ShipmentStatus, ShipmentListDto } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const statusConfig: Record<ShipmentStatus, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Confirmed: { label: 'Onaylandı', bgColor: 'bg-slate-200', textColor: 'text-slate-800' },
  Preparing: { label: 'Hazırlanıyor', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
  PickedUp: { label: 'Alındı', bgColor: 'bg-slate-400', textColor: 'text-white' },
  Packed: { label: 'Paketlendi', bgColor: 'bg-slate-500', textColor: 'text-white' },
  Shipped: { label: 'Sevk Edildi', bgColor: 'bg-slate-600', textColor: 'text-white' },
  InTransit: { label: 'Yolda', bgColor: 'bg-slate-700', textColor: 'text-white' },
  OutForDelivery: { label: 'Dağıtımda', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Delivered: { label: 'Teslim Edildi', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Failed: { label: 'Başarısız', bgColor: 'bg-slate-900', textColor: 'text-white' },
  Cancelled: { label: 'İptal Edildi', bgColor: 'bg-slate-300', textColor: 'text-slate-700' },
  Returned: { label: 'İade Edildi', bgColor: 'bg-slate-400', textColor: 'text-slate-800' },
};

const statusOptions: { value: ShipmentStatus; label: string }[] = Object.entries(statusConfig).map(
  ([value, config]) => ({ value: value as ShipmentStatus, label: config.label })
);

export default function ShipmentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ShipmentQueryParams>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch shipments
  const { data, isLoading, error, refetch } = useShipments({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    ...filters,
  });

  const shipMutation = useShipShipment();
  const deliverMutation = useDeliverShipment();
  const cancelMutation = useCancelShipment();

  const shipments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/sales/shipments/new');
  };

  const handleShip = async (id: string) => {
    try {
      await shipMutation.mutateAsync({
        id,
        data: { actualShipDate: new Date().toISOString() },
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await deliverMutation.mutateAsync({
        id,
        data: { actualDeliveryDate: new Date().toISOString() },
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: 'Sevkiyatı İptal Et',
      content: 'Bu sevkiyatı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelMutation.mutateAsync({
            id,
            reason: 'Kullanıcı tarafından iptal edildi',
          });
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const getActionMenu = (record: ShipmentListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/shipments/${record.id}`),
      },
    ];

    if (['Confirmed', 'Preparing', 'Packed'].includes(record.status)) {
      items.push({
        key: 'ship',
        icon: <TruckIcon className="w-4 h-4" />,
        label: 'Sevk Et',
        onClick: () => handleShip(record.id),
      });
    }

    if (['Shipped', 'InTransit', 'OutForDelivery'].includes(record.status)) {
      items.push({
        key: 'deliver',
        icon: <CheckIcon className="w-4 h-4" />,
        label: 'Teslim Et',
        onClick: () => handleDeliver(record.id),
      });
    }

    if (!['Delivered', 'Cancelled', 'Returned'].includes(record.status)) {
      items.push({
        key: 'cancel',
        icon: <XMarkIcon className="w-4 h-4" />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<ShipmentListDto> = [
    {
      title: 'Sevkiyat No',
      dataIndex: 'shipmentNumber',
      key: 'shipmentNumber',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/shipments/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => (
        <span className="text-slate-600">{text}</span>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Taşıyıcı',
      dataIndex: 'carrierName',
      key: 'carrierName',
    },
    {
      title: 'Sevk Tarihi',
      dataIndex: 'estimatedShipDate',
      key: 'estimatedShipDate',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Teslimat Tarihi',
      dataIndex: 'estimatedDeliveryDate',
      key: 'estimatedDeliveryDate',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ShipmentStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  // Calculate stats
  const draftCount = shipments.filter(s => s.status === 'Draft').length;
  const inTransitCount = shipments.filter(s => ['Shipped', 'InTransit', 'OutForDelivery'].includes(s.status)).length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <PaperAirplaneIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sevkiyatlar</h1>
            <p className="text-sm text-slate-500">Sevkiyatları yönetin ve takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Sevkiyat
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <PaperAirplaneIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Sevkiyat</p>
              <p className="text-xl font-semibold text-slate-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Hazırlanan</p>
              <p className="text-xl font-semibold text-slate-900">{draftCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Yolda</p>
              <p className="text-xl font-semibold text-slate-900">{inTransitCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Teslim Edildi</p>
              <p className="text-xl font-semibold text-slate-900">{deliveredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-red-600">
              <XMarkIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Sevkiyatlar yüklenemedi</p>
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'Sevkiyatlar getirilirken bir hata oluştu.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Sevkiyat ara... (numara, müşteri)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Durum"
            allowClear
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={shipments}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} sevkiyat`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
