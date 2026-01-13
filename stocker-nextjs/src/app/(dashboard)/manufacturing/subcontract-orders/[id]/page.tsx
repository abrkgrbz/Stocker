'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Descriptions, Tag, Table, Card, Row, Col, Statistic, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TruckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  useSubcontractOrder,
  useApproveSubcontractOrder,
  useCompleteSubcontractOrder,
  useCancelSubcontractOrder,
} from '@/lib/api/hooks/useManufacturing';
import type { SubcontractOrderStatus, SubcontractMaterialDto, SubcontractShipmentDto } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusConfig: Record<SubcontractOrderStatus, { color: string; bgColor: string; label: string }> = {
  Draft: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Taslak' },
  Approved: { color: '#64748b', bgColor: '#f1f5f9', label: 'Onaylı' },
  Shipped: { color: '#334155', bgColor: '#e2e8f0', label: 'Sevk Edildi' },
  Received: { color: '#475569', bgColor: '#cbd5e1', label: 'Teslim Alındı' },
  Completed: { color: '#1e293b', bgColor: '#94a3b8', label: 'Tamamlandı' },
  Closed: { color: '#475569', bgColor: '#e2e8f0', label: 'Kapatıldı' },
  Cancelled: { color: '#ef4444', bgColor: '#fee2e2', label: 'İptal' },
};

export default function SubcontractOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useSubcontractOrder(orderId);
  const approveOrder = useApproveSubcontractOrder();
  const completeOrder = useCompleteSubcontractOrder();
  const cancelOrder = useCancelSubcontractOrder();

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(orderId);
    } catch {
      // Error handled by hook
    }
  };

  const handleComplete = async () => {
    try {
      await completeOrder.mutateAsync(orderId);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Sipariş Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen fason sipariş bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/subcontract-orders')} className="!border-slate-300">
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const sConfig = statusConfig[order.status] || { color: '#64748b', bgColor: '#f1f5f9', label: 'Bilinmiyor' };
  const progressPercent = order.quantity > 0 ? Math.round((order.receivedQuantity / order.quantity) * 100) : 0;
  const isOverdue = order.expectedDeliveryDate && dayjs(order.expectedDeliveryDate).isBefore(dayjs()) && order.status !== 'Completed' && order.status !== 'Closed';

  const materialColumns: ColumnsType<SubcontractMaterialDto> = [
    { title: 'Malzeme Kodu', dataIndex: 'materialCode', key: 'materialCode' },
    { title: 'Malzeme Adı', dataIndex: 'materialName', key: 'materialName' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', align: 'right', render: (v, r) => `${v} ${r.unitOfMeasure}` },
    { title: 'Sevk Edilen', dataIndex: 'shippedQuantity', key: 'shippedQuantity', align: 'right', render: (v, r) => `${v} ${r.unitOfMeasure}` },
    {
      title: 'Durum',
      key: 'status',
      align: 'center',
      render: (_, r) => r.shippedQuantity >= r.quantity ? <Tag color="success">Tamamlandı</Tag> : <Tag color="warning">Bekliyor</Tag>,
    },
  ];

  const shipmentColumns: ColumnsType<SubcontractShipmentDto> = [
    { title: 'Sevkiyat No', dataIndex: 'shipmentNumber', key: 'shipmentNumber' },
    { title: 'Tip', dataIndex: 'shipmentType', key: 'shipmentType', render: (t) => t === 'Outgoing' ? 'Giden' : 'Gelen' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', align: 'right' },
    { title: 'Tarih', dataIndex: 'shipmentDate', key: 'shipmentDate', render: (d) => dayjs(d).format('DD.MM.YYYY') },
    { title: 'Not', dataIndex: 'notes', key: 'notes', ellipsis: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{order.orderNumber}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}
                >
                  {sConfig.label}
                </span>
                {isOverdue && <Tag color="error">Gecikmiş</Tag>}
              </div>
              <p className="text-sm text-slate-400 m-0">{order.subcontractorName} - {order.productName}</p>
            </div>
          </div>
          <Space size="small">
            {order.status === 'Draft' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleApprove}
                loading={approveOrder.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Onayla
              </Button>
            )}
            {order.status === 'Received' && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleComplete}
                loading={completeOrder.isPending}
                type="primary"
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Tamamla
              </Button>
            )}
            {order.status !== 'Completed' && order.status !== 'Closed' && order.status !== 'Cancelled' && (
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={handleCancel}
                loading={cancelOrder.isPending}
                danger
              >
                İptal Et
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <Row gutter={[24, 24]} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Sipariş Miktarı"
                value={order.quantity}
                suffix={order.unitOfMeasure}
                prefix={<CubeIcon className="w-5 h-5 text-slate-400" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Teslim Alınan"
                value={order.receivedQuantity}
                suffix={order.unitOfMeasure}
                valueStyle={{ color: progressPercent === 100 ? '#16a34a' : '#334155' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Toplam Tutar"
                value={order.totalPrice}
                precision={2}
                prefix={<CurrencyDollarIcon className="w-5 h-5 text-slate-400" />}
                formatter={(v) => `₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div className="mb-2">
                <span className="text-slate-500 text-sm">İlerleme</span>
              </div>
              <Progress
                percent={progressPercent}
                strokeColor="#1e293b"
                trailColor="#e2e8f0"
              />
            </Card>
          </Col>
        </Row>

        <Card title="Sipariş Bilgileri" className="mb-6">
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            size="small"
            className="[&_.ant-descriptions-item-label]:!bg-slate-50 [&_.ant-descriptions-item-label]:!text-slate-500"
          >
            <Descriptions.Item label="Sipariş No">{order.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="Fasoncu">{order.subcontractorName}</Descriptions.Item>
            <Descriptions.Item label="Ürün">{order.productName}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: sConfig.bgColor, color: sConfig.color }}>
                {sConfig.label}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Sipariş Miktarı">{order.quantity} {order.unitOfMeasure}</Descriptions.Item>
            <Descriptions.Item label="Teslim Alınan">{order.receivedQuantity} {order.unitOfMeasure}</Descriptions.Item>
            <Descriptions.Item label="Birim Fiyat">₺{order.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Toplam Tutar">₺{order.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Descriptions.Item>
            <Descriptions.Item label="Beklenen Teslim">
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {dayjs(order.expectedDeliveryDate).format('DD.MM.YYYY')}
              </span>
            </Descriptions.Item>
            {order.actualDeliveryDate && (
              <Descriptions.Item label="Gerçek Teslim">{dayjs(order.actualDeliveryDate).format('DD.MM.YYYY')}</Descriptions.Item>
            )}
            {order.productionOrderId && (
              <Descriptions.Item label="Üretim Emri">{order.productionOrderId}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {order.materials && order.materials.length > 0 && (
          <Card title={`Malzemeler (${order.materials.length})`} className="mb-6">
            <Table
              columns={materialColumns}
              dataSource={order.materials}
              rowKey="id"
              pagination={false}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
            />
          </Card>
        )}

        {order.shipments && order.shipments.length > 0 && (
          <Card title={`Sevkiyatlar (${order.shipments.length})`}>
            <Table
              columns={shipmentColumns}
              dataSource={order.shipments}
              rowKey="id"
              pagination={false}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
