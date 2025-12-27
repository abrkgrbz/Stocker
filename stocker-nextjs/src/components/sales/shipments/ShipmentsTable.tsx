'use client';

/**
 * Shipments Table Component
 * Enterprise-grade design following Linear/Stripe/Vercel principles
 */

import React from 'react';
import { Table, Dropdown, Button } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { ShipmentListDto, ShipmentStatus } from '@/lib/api/services/sales.service';
import { Badge } from '@/components/ui/enterprise-page';
import dayjs from 'dayjs';

interface ShipmentsTableProps {
  shipments: ShipmentListDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onShip?: (id: string) => void;
  onDeliver?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReturn?: (id: string) => void;
}

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

export function ShipmentsTable({
  shipments,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onShip,
  onDeliver,
  onCancel,
  onReturn,
}: ShipmentsTableProps) {
  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`/sales/shipments/${id}`);
  };

  const getActionMenu = (record: ShipmentListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => handleView(record.id),
      },
    ];

    // Status actions - can ship from Draft, Confirmed, Preparing, PickedUp, Packed
    const canShip = ['Draft', 'Confirmed', 'Preparing', 'PickedUp', 'Packed'].includes(record.status);
    if (canShip && onShip) {
      items.push({
        key: 'ship',
        icon: <PaperAirplaneIcon className="w-4 h-4" />,
        label: 'Sevk Et',
        onClick: () => onShip(record.id),
      });
    }

    // Can deliver from Shipped, InTransit, OutForDelivery
    const canDeliver = ['Shipped', 'InTransit', 'OutForDelivery'].includes(record.status);
    if (canDeliver && onDeliver) {
      items.push({
        key: 'deliver',
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: 'Teslim Edildi',
        onClick: () => onDeliver(record.id),
      });
    }

    if (record.status === 'Delivered' && onReturn) {
      items.push({
        key: 'return',
        icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
        label: 'İade Al',
        onClick: () => onReturn(record.id),
      });
    }

    // Can cancel if not already cancelled, delivered, or returned
    const canCancel = !['Cancelled', 'Delivered', 'Returned', 'Failed'].includes(record.status);
    if (canCancel && onCancel) {
      items.push(
        { type: 'divider' },
        {
          key: 'cancel',
          icon: <XCircleIcon className="w-4 h-4" />,
          label: 'İptal Et',
          danger: true,
          onClick: () => onCancel(record.id),
        }
      );
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
          onClick={() => handleView(record.id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <span className="text-slate-900 font-medium">{text}</span>
      ),
    },
    {
      title: 'Taşıyıcı',
      dataIndex: 'carrierName',
      key: 'carrierName',
      render: (text: string) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Tahmini Teslimat',
      dataIndex: 'estimatedDeliveryDate',
      key: 'estimatedDeliveryDate',
      render: (date: string | null) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Şehir',
      dataIndex: 'shippingCity',
      key: 'shippingCity',
      render: (text: string) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Paket',
      dataIndex: 'totalPackages',
      key: 'totalPackages',
      render: (count: number) => (
        <span className="text-slate-600">{count}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ShipmentStatus) => {
        const config = statusConfig[status];
        return <Badge variant={config?.variant || 'default'}>{config?.label || status}</Badge>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            className="text-slate-400 hover:text-slate-600"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={shipments}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} sevkiyat`,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      className="enterprise-table"
    />
  );
}
