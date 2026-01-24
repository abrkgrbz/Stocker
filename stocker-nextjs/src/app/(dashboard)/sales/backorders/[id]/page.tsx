'use client';

/**
 * Back Order Detail Page
 * Bekleyen siparis detay sayfasi - Monochrome Design System
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CubeIcon,
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Table, Spin, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useBackOrder, useFulfillBackOrderItem, useCancelBackOrder, useUpdateBackOrderPriority } from '@/features/sales';
import type { BackOrderItemDto } from '@/features/sales';

dayjs.locale('tr');

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Created: { label: 'Bekliyor', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  PartiallyFulfilled: { label: 'Kismi Karsilandi', bgColor: 'bg-slate-400', textColor: 'text-white' },
  Fulfilled: { label: 'Karsilandi', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'Iptal', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

const priorityConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Low: { label: 'Dusuk', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
  Normal: { label: 'Normal', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  High: { label: 'Yuksek', bgColor: 'bg-slate-600', textColor: 'text-white' },
  Urgent: { label: 'Kritik', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

export default function BackOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: backOrder, isLoading } = useBackOrder(id);
  const fulfillMutation = useFulfillBackOrderItem();
  const cancelMutation = useCancelBackOrder();
  const priorityMutation = useUpdateBackOrderPriority();

  const handleFulfill = (itemId: string, quantity: number) => {
    fulfillMutation.mutate({ id, data: { itemId, quantity } });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Siparis Iptal',
      content: 'Bu bekleyen siparisi iptal etmek istediginizden emin misiniz?',
      okText: 'Iptal Et',
      okType: 'danger',
      cancelText: 'Vazgec',
      onOk: () => {
        cancelMutation.mutate({ id, reason: 'Kullanici tarafindan iptal edildi' });
      },
    });
  };

  const handlePriorityChange = (priority: string) => {
    priorityMutation.mutate({ id, priority });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!backOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">Siparis bulunamadi</h2>
          <Link href="/sales/backorders" className="text-sm text-slate-500 hover:text-slate-700 mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[backOrder.status] || statusConfig.Created;
  const priority = priorityConfig[backOrder.priority] || priorityConfig.Normal;
  const waitingDays = dayjs().diff(dayjs(backOrder.backOrderDate), 'day');

  const itemColumns: ColumnsType<BackOrderItemDto> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 50,
      render: (num: number) => <span className="text-sm text-slate-500">{num}</span>,
    },
    {
      title: 'Urun',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500 font-mono">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Siparis',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      width: 90,
      align: 'right',
      render: (qty: number) => <span className="text-sm text-slate-700">{qty}</span>,
    },
    {
      title: 'Mevcut',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 90,
      align: 'right',
      render: (qty: number) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Bekleyen',
      dataIndex: 'pendingQuantity',
      key: 'pendingQuantity',
      width: 90,
      align: 'right',
      render: (qty: number) => (
        <span className="text-sm font-semibold text-slate-900">{qty}</span>
      ),
    },
    {
      title: 'Karsilanan',
      dataIndex: 'fulfilledQuantity',
      key: 'fulfilledQuantity',
      width: 100,
      align: 'right',
      render: (qty: number) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      align: 'right',
      render: (price: number) => (
        <span className="text-sm text-slate-700">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isFullyFulfilled',
      key: 'isFullyFulfilled',
      width: 80,
      align: 'center',
      render: (fulfilled: boolean) => (
        fulfilled ? (
          <CheckCircleIcon className="w-5 h-5 text-slate-700 mx-auto" />
        ) : (
          <ClockIcon className="w-5 h-5 text-slate-400 mx-auto" />
        )
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        !record.isFullyFulfilled && backOrder.status !== 'Cancelled' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFulfill(record.id, record.pendingQuantity);
            }}
            disabled={fulfillMutation.isPending}
            className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
          >
            Karsila
          </button>
        )
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/backorders"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{backOrder.backOrderNumber}</h1>
                <p className="text-sm text-slate-500">
                  {backOrder.customerName || 'Bekleyen Siparis'}
                  {' - '}
                  {dayjs(backOrder.backOrderDate).format('DD MMMM YYYY')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {backOrder.status !== 'Cancelled' && backOrder.status !== 'Fulfilled' && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Iptal Et
                </button>
              </>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                Siparis Bilgileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Siparis No</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{backOrder.backOrderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Satis Siparisi</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{backOrder.salesOrderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tip</p>
                  <p className="text-sm font-medium text-slate-900">{backOrder.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bekleme Suresi</p>
                  <p className={`text-sm font-bold ${waitingDays > 7 ? 'text-slate-900' : 'text-slate-600'}`}>
                    {waitingDays} gun
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Toplam Kalem</p>
                  <p className="text-sm font-medium text-slate-900">{backOrder.totalItemCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bekleyen Miktar</p>
                  <p className="text-sm font-bold text-slate-900">{backOrder.totalPendingQuantity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Karsilanan Miktar</p>
                  <p className="text-sm font-medium text-slate-900">{backOrder.totalFulfilledQuantity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Musteri Bilgilendirildi</p>
                  <p className="text-sm font-medium text-slate-900">{backOrder.customerNotified ? 'Evet' : 'Hayir'}</p>
                </div>
              </div>
            </div>

            {/* Product Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Urun Kalemleri</h3>
                  <p className="text-xs text-slate-500">{backOrder.items?.length || 0} kalem</p>
                </div>
              </div>
              <Table
                className="enterprise-table"
                columns={itemColumns}
                dataSource={backOrder.items || []}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>

            {/* Notes */}
            {backOrder.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-3">Notlar</h3>
                <p className="text-sm text-slate-700">{backOrder.notes}</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Status & Priority Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Durum ve Oncelik</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Durum</p>
                  <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${status.bgColor} ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Oncelik</p>
                  <div className="flex gap-2">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handlePriorityChange(key)}
                        disabled={priorityMutation.isPending || backOrder.status === 'Cancelled' || backOrder.status === 'Fulfilled'}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                          backOrder.priority === key
                            ? `${config.bgColor} ${config.textColor}`
                            : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                {waitingDays > 7 && backOrder.status === 'Created' && (
                  <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                    <ExclamationTriangleIcon className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-medium text-slate-700">
                      Kritik bekleme suresi ({waitingDays} gun)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                Tarihler
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Siparis Tarihi</span>
                  <span className="text-xs font-medium text-slate-700">
                    {dayjs(backOrder.backOrderDate).format('DD.MM.YYYY')}
                  </span>
                </div>
                {backOrder.estimatedRestockDate && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Tahmini Tedarik</span>
                    <span className="text-xs font-medium text-slate-700">
                      {dayjs(backOrder.estimatedRestockDate).format('DD.MM.YYYY')}
                    </span>
                  </div>
                )}
                {backOrder.actualFulfillmentDate && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Karsilama Tarihi</span>
                    <span className="text-xs font-medium text-slate-700">
                      {dayjs(backOrder.actualFulfillmentDate).format('DD.MM.YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Card */}
            {backOrder.customerName && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Musteri
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">{backOrder.customerName}</p>
                  {backOrder.warehouseCode && (
                    <p className="text-xs text-slate-500">Depo: {backOrder.warehouseCode}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
