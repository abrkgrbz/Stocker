'use client';

/**
 * Shipment Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Spin, Alert, Space, Dropdown, Table } from 'antd';
import {
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  useShipment,
  useShipShipment,
  useDeliverShipment,
  useCancelShipment,
} from '@/lib/api/hooks/useSales';
import { PageContainer, Card, StatCard, Badge } from '@/components/ui/enterprise-page';
import type { ShipmentStatus, ShipmentItemDto } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const statusConfig: Record<
  ShipmentStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  Draft: { label: 'Taslak', variant: 'default' },
  Confirmed: { label: 'Onaylandı', variant: 'info' },
  Preparing: { label: 'Hazırlanıyor', variant: 'warning' },
  PickedUp: { label: 'Alındı', variant: 'info' },
  Packed: { label: 'Paketlendi', variant: 'info' },
  Shipped: { label: 'Sevk Edildi', variant: 'info' },
  InTransit: { label: 'Yolda', variant: 'info' },
  OutForDelivery: { label: 'Dağıtımda', variant: 'info' },
  Delivered: { label: 'Teslim Edildi', variant: 'success' },
  Failed: { label: 'Başarısız', variant: 'error' },
  Cancelled: { label: 'İptal Edildi', variant: 'error' },
  Returned: { label: 'İade Edildi', variant: 'default' },
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: shipment, isLoading, error } = useShipment(id);
  const shipMutation = useShipShipment();
  const deliverMutation = useDeliverShipment();
  const cancelMutation = useCancelShipment();

  const handleShip = async () => {
    try {
      await shipMutation.mutateAsync({
        id,
        data: { actualShipDate: new Date().toISOString() },
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverMutation.mutateAsync({
        id,
        data: { actualDeliveryDate: new Date().toISOString() },
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id,
        reason: 'Kullanıcı tarafından iptal edildi',
      });
    } catch {
      // Error handled by hook
    }
  };

  const actionMenuItems: MenuProps['items'] = [];

  // Can ship from Draft, Confirmed, Preparing, PickedUp, Packed
  const canShip = shipment && ['Draft', 'Confirmed', 'Preparing', 'PickedUp', 'Packed'].includes(shipment.status);
  if (canShip) {
    actionMenuItems.push({
      key: 'ship',
      icon: <PaperAirplaneIcon className="w-4 h-4" />,
      label: 'Sevk Et',
      onClick: handleShip,
    });
  }

  // Can deliver from Shipped, InTransit, OutForDelivery
  const canDeliver = shipment && ['Shipped', 'InTransit', 'OutForDelivery'].includes(shipment.status);
  if (canDeliver) {
    actionMenuItems.push({
      key: 'deliver',
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: 'Teslim Edildi',
      onClick: handleDeliver,
    });
  }

  // Can cancel if not already cancelled, delivered, returned, or failed
  const canCancel = shipment && !['Cancelled', 'Delivered', 'Returned', 'Failed'].includes(shipment.status);
  if (canCancel) {
    actionMenuItems.push(
      { type: 'divider' },
      {
        key: 'cancel',
        icon: <XCircleIcon className="w-4 h-4" />,
        label: 'İptal Et',
        danger: true,
        onClick: handleCancel,
      }
    );
  }

  if (shipment?.status === 'Delivered') {
    actionMenuItems.push({
      key: 'return',
      icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
      label: 'İade Al',
      onClick: () => {
        // Handle return - would need a separate mutation
      },
    });
  }

  const itemColumns: ColumnsType<ShipmentItemDto> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Ağırlık',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number | undefined) => weight ? `${weight} kg` : '-',
    },
    {
      title: 'Toplama',
      key: 'picked',
      render: (_, record) => (
        <Badge variant={record.isPicked ? 'success' : 'default'}>
          {record.isPicked ? 'Toplandı' : 'Bekliyor'}
        </Badge>
      ),
    },
    {
      title: 'Paketleme',
      key: 'packed',
      render: (_, record) => (
        <Badge variant={record.isPacked ? 'success' : 'default'}>
          {record.isPacked ? 'Paketlendi' : 'Bekliyor'}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="p-8">
        <Alert
          message="Sevkiyat Bulunamadı"
          description="İstenen sevkiyat bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/sales/shipments')}>Geri Dön</Button>
          }
        />
      </div>
    );
  }

  const statusConf = statusConfig[shipment.status];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  {shipment.shipmentNumber}
                </h1>
                <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
              </div>
              <p className="text-sm text-slate-400 m-0">{shipment.customerName}</p>
            </div>
          </div>
          <Space>
            {actionMenuItems.length > 0 && (
              <Dropdown menu={{ items: actionMenuItems }} trigger={['click']}>
                <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />}>İşlemler</Button>
              </Dropdown>
            )}
          </Space>
        </div>
      </div>

      {/* Content */}
      <PageContainer maxWidth="6xl">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Durum"
            value={statusConf.label}
            icon={<TruckIcon className="w-5 h-5" />}
            iconColor="#06b6d4"
          />
          <StatCard
            label="Paket Sayısı"
            value={shipment.totalPackages}
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            iconColor="#8b5cf6"
          />
          <StatCard
            label="Sevk Tarihi"
            value={
              shipment.actualShipDate
                ? dayjs(shipment.actualShipDate).format('DD.MM.YYYY')
                : 'Henüz sevk edilmedi'
            }
            icon={<PaperAirplaneIcon className="w-4 h-4" />}
            iconColor="#3b82f6"
          />
          <StatCard
            label="Teslimat Tarihi"
            value={
              shipment.actualDeliveryDate
                ? dayjs(shipment.actualDeliveryDate).format('DD.MM.YYYY')
                : shipment.estimatedDeliveryDate
                ? `Tahmini: ${dayjs(shipment.estimatedDeliveryDate).format('DD.MM.YYYY')}`
                : '-'
            }
            icon={<CheckCircleIcon className="w-4 h-4" />}
            iconColor="#10b981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipment Information */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Sevkiyat Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Sevkiyat No
                  </p>
                  <p className="text-sm text-slate-900 font-medium">
                    {shipment.shipmentNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Sipariş No
                  </p>
                  <p className="text-sm text-slate-900">{shipment.orderNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Taşıyıcı
                  </p>
                  <p className="text-sm text-slate-900">{shipment.carrierName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Takip Numarası
                  </p>
                  <p className="text-sm text-slate-900">{shipment.trackingNumber || '-'}</p>
                </div>
                {shipment.shippingCost && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Kargo Ücreti
                    </p>
                    <p className="text-sm text-slate-900 font-medium">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: shipment.shippingCost.currency,
                      }).format(shipment.shippingCost.amount)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Toplam Ağırlık
                  </p>
                  <p className="text-sm text-slate-900">
                    {shipment.totalWeight ? `${shipment.totalWeight} ${shipment.weightUnit}` : '-'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Shipment Items */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Sevkiyat Kalemleri ({shipment.items?.length || 0})
              </h3>
              <Table
                columns={itemColumns}
                dataSource={shipment.items || []}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>

            {/* Notes */}
            {(shipment.deliveryInstructions || shipment.internalNotes) && (
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Notlar
                </h3>
                {shipment.deliveryInstructions && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Teslimat Talimatları
                    </p>
                    <p className="text-sm text-slate-600">{shipment.deliveryInstructions}</p>
                  </div>
                )}
                {shipment.internalNotes && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Dahili Notlar
                    </p>
                    <p className="text-sm text-slate-600">{shipment.internalNotes}</p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                <UserIcon className="w-4 h-4 mr-2" />
                Müşteri
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Müşteri Adı
                  </p>
                  <p className="text-sm text-slate-900 font-medium">
                    {shipment.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Alıcı
                  </p>
                  <p className="text-sm text-slate-900">{shipment.recipientName}</p>
                </div>
                {shipment.recipientPhone && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Telefon
                    </p>
                    <p className="text-sm text-slate-900">{shipment.recipientPhone}</p>
                  </div>
                )}
                {shipment.recipientEmail && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      E-posta
                    </p>
                    <p className="text-sm text-slate-900">{shipment.recipientEmail}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Teslimat Adresi
              </h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p>{shipment.shippingAddressLine1}</p>
                {shipment.shippingAddressLine2 && <p>{shipment.shippingAddressLine2}</p>}
                <p>
                  {shipment.shippingCity}
                  {shipment.shippingState ? `, ${shipment.shippingState}` : ''}
                </p>
                <p>
                  {shipment.shippingPostalCode && `${shipment.shippingPostalCode}, `}
                  {shipment.shippingCountry}
                </p>
              </div>
            </Card>

            {/* Timeline */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Zaman Çizelgesi
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Oluşturuldu</p>
                    <p className="text-xs text-slate-500">
                      {dayjs(shipment.createdAt).format('DD.MM.YYYY HH:mm')}
                    </p>
                  </div>
                </div>
                {shipment.actualShipDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Sevk Edildi</p>
                      <p className="text-xs text-slate-500">
                        {dayjs(shipment.actualShipDate).format('DD.MM.YYYY HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
                {shipment.actualDeliveryDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Teslim Edildi</p>
                      <p className="text-xs text-slate-500">
                        {dayjs(shipment.actualDeliveryDate).format('DD.MM.YYYY HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Sistem Bilgileri
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Oluşturulma Tarihi
                  </p>
                  <p className="text-sm text-slate-600">
                    {dayjs(shipment.createdAt).format('DD.MM.YYYY HH:mm')}
                  </p>
                </div>
                {shipment.updatedAt && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Son Güncelleme
                    </p>
                    <p className="text-sm text-slate-600">
                      {dayjs(shipment.updatedAt).format('DD.MM.YYYY HH:mm')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
