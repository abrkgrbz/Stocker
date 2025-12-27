'use client';

/**
 * Shipments List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Alert, Spin, Select, Modal } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  useShipments,
  useShipShipment,
  useDeliverShipment,
  useCancelShipment,
} from '@/lib/api/hooks/useSales';
import type { ShipmentQueryParams, ShipmentStatus } from '@/lib/api/services/sales.service';
import { ShipmentsStats, ShipmentsTable } from '@/components/sales/shipments';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Confirmed', label: 'Onaylandı' },
  { value: 'Preparing', label: 'Hazırlanıyor' },
  { value: 'PickedUp', label: 'Alındı' },
  { value: 'Packed', label: 'Paketlendi' },
  { value: 'Shipped', label: 'Sevk Edildi' },
  { value: 'InTransit', label: 'Yolda' },
  { value: 'OutForDelivery', label: 'Dağıtımda' },
  { value: 'Delivered', label: 'Teslim Edildi' },
  { value: 'Failed', label: 'Başarısız' },
  { value: 'Cancelled', label: 'İptal Edildi' },
  { value: 'Returned', label: 'İade Edildi' },
];

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

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ShipmentsStats shipments={shipments} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<PaperAirplaneIcon className="w-4 h-4" />}
        iconColor="#06b6d4"
        title="Sevkiyatlar"
        description="Sevkiyatları yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sevkiyat',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert
          message="Sevkiyatlar yüklenemedi"
          description={
            error instanceof Error
              ? error.message
              : 'Sevkiyatlar getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
          type="error"
          showIcon
          closable
          action={
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          }
          className="mb-6"
        />
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Sevkiyat ara... (numara, müşteri)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4" className="text-slate-400" />}
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
          />
        </div>
      </div>

      {/* Shipments Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <ShipmentsTable
            shipments={shipments}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShip={handleShip}
            onDeliver={handleDeliver}
            onCancel={handleCancel}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
