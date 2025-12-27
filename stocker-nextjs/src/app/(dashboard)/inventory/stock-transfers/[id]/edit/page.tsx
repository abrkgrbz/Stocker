'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Tag,
  Descriptions,
  Table,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  useStockTransfer,
  useUpdateStockTransfer,
} from '@/lib/api/hooks/useInventory';
import type { UpdateStockTransferDto, TransferStatus, TransferType, StockTransferItemDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<TransferStatus, { color: string; label: string }> = {
  Draft: { color: 'default', label: 'Taslak' },
  Pending: { color: 'processing', label: 'Beklemede' },
  Approved: { color: 'blue', label: 'Onaylı' },
  Rejected: { color: 'red', label: 'Reddedildi' },
  InTransit: { color: 'orange', label: 'Yolda' },
  Received: { color: 'cyan', label: 'Teslim Alındı' },
  PartiallyReceived: { color: 'gold', label: 'Kısmi Teslim' },
  Completed: { color: 'green', label: 'Tamamlandı' },
  Cancelled: { color: 'red', label: 'İptal' },
};

const transferTypeLabels: Record<TransferType, string> = {
  Standard: 'Standart',
  Urgent: 'Acil',
  Replenishment: 'İkmal',
  Return: 'İade',
  Internal: 'Dahili',
  CrossDock: 'Cross-Dock',
  Consolidation: 'Konsolidasyon',
};

export default function EditStockTransferPage() {
  const router = useRouter();
  const params = useParams();
  const transferId = Number(params.id);
  const [form] = Form.useForm();

  const { data: transfer, isLoading, error } = useStockTransfer(transferId);
  const updateTransfer = useUpdateStockTransfer();

  useEffect(() => {
    if (transfer) {
      form.setFieldsValue({
        description: transfer.description,
        notes: transfer.notes,
        expectedArrivalDate: transfer.expectedArrivalDate ? dayjs(transfer.expectedArrivalDate) : undefined,
      });
    }
  }, [transfer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateStockTransferDto = {
        description: values.description,
        notes: values.notes,
        expectedArrivalDate: values.expectedArrivalDate?.toISOString(),
      };

      await updateTransfer.mutateAsync({ id: transferId, data });
      router.push(`/inventory/stock-transfers/${transferId}`);
    } catch {
      // Validation error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="p-8">
        <Alert
          message="Transfer Bulunamadı"
          description="İstenen stok transferi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/stock-transfers')}>
              Transferlere Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[transfer.status];
  const canEdit = transfer.status === 'Draft' || transfer.status === 'Pending';

  const itemColumns: ColumnsType<StockTransferItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Kaynak Lokasyon',
      dataIndex: 'sourceLocationName',
      key: 'sourceLocationName',
      render: (name) => name || '-',
    },
    {
      title: 'Hedef Lokasyon',
      dataIndex: 'destinationLocationName',
      key: 'destinationLocationName',
      render: (name) => name || '-',
    },
    {
      title: 'Miktar',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      align: 'right',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
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
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {transfer.transferNumber}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {transferTypeLabels[transfer.transferType]} • {transfer.sourceWarehouseName} → {transfer.destinationWarehouseName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/stock-transfers/${transferId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateTransfer.isPending}
              onClick={handleSubmit}
              disabled={!canEdit}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {!canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text type="warning">
              Bu transfer düzenlenemez durumda. Sadece Taslak veya Beklemede durumundaki transferler düzenlenebilir.
            </Text>
          </div>
        )}

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Warehouse Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Depo Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Kaynak Depo</Text>
                      <div className="font-medium">{transfer.sourceWarehouseName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Hedef Depo</Text>
                      <div className="font-medium">{transfer.destinationWarehouseName}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Transfer Bilgileri
                </h3>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Transfer No">
                    {transfer.transferNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transfer Türü">
                    {transferTypeLabels[transfer.transferType]}
                  </Descriptions.Item>
                  <Descriptions.Item label="Transfer Tarihi">
                    {dayjs(transfer.transferDate).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              {/* Editable Fields */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Düzenlenebilir Bilgiler
                </h3>
                <Form.Item name="expectedArrivalDate" label="Tahmini Varış Tarihi">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>

                <Form.Item name="description" label="Açıklama">
                  <TextArea
                    rows={3}
                    placeholder="Transfer açıklaması..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>

                <Form.Item name="notes" label="Notlar">
                  <TextArea
                    rows={3}
                    placeholder="Transfer ile ilgili notlar..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>

              {/* Items - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Transfer Kalemleri ({transfer.items?.length || 0})
                </h3>
                <Table
                  columns={itemColumns}
                  dataSource={transfer.items || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Kalem bulunamadı' }}
                />
                <Text type="secondary" className="block mt-3 text-xs">
                  Not: Transfer kalemleri oluşturulduktan sonra değiştirilemez.
                </Text>
              </div>
            </div>

            <div className="space-y-6">
              {/* Statistics - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  İstatistikler
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text type="secondary">Talep Edilen</Text>
                    <Text strong>{transfer.totalRequestedQuantity}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Sevk Edilen</Text>
                    <Text strong className="text-blue-600">{transfer.totalShippedQuantity}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Teslim Alınan</Text>
                    <Text strong className="text-green-600">{transfer.totalReceivedQuantity}</Text>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Kayıt Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text type="secondary">Oluşturulma</Text>
                    <Text>{dayjs(transfer.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </div>
                  {transfer.shippedDate && (
                    <div className="flex justify-between">
                      <Text type="secondary">Sevk Tarihi</Text>
                      <Text>{dayjs(transfer.shippedDate).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                  )}
                  {transfer.receivedDate && (
                    <div className="flex justify-between">
                      <Text type="secondary">Teslim Tarihi</Text>
                      <Text>{dayjs(transfer.receivedDate).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                  )}
                  {transfer.completedDate && (
                    <div className="flex justify-between">
                      <Text type="secondary">Tamamlanma</Text>
                      <Text>{dayjs(transfer.completedDate).format('DD/MM/YYYY HH:mm')}</Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
