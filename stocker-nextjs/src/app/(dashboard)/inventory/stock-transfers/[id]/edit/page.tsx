'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Descriptions,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SwapOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
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

  const { data: transfer, isLoading } = useStockTransfer(transferId);
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
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Transfer bulunamadı" />
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
    <div className="max-w-5xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <SwapOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Transfer Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{transfer.transferNumber}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateTransfer.isPending}
              disabled={!canEdit}
              style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {!canEdit && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text type="warning">
            Bu transfer düzenlenemez durumda. Sadece Taslak veya Beklemede durumundaki transferler düzenlenebilir.
          </Text>
        </div>
      )}

      {/* Form */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col xs={24} md={16}>
            {/* Warehouse Info - Read Only */}
            <Card title="Depo Bilgileri" className="mb-6">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <EnvironmentOutlined className="text-blue-500 text-lg" />
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Kaynak Depo</Text>
                      <div className="font-medium">{transfer.sourceWarehouseName}</div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <EnvironmentOutlined className="text-green-500 text-lg" />
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Hedef Depo</Text>
                      <div className="font-medium">{transfer.destinationWarehouseName}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Transfer Info - Read Only */}
            <Card title="Transfer Bilgileri" className="mb-6">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Transfer No">
                  {transfer.transferNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Transfer Türü">
                  {transferTypeLabels[transfer.transferType]}
                </Descriptions.Item>
                <Descriptions.Item label="Transfer Tarihi">
                  {dayjs(transfer.transferDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Editable Fields */}
            <Card title="Düzenlenebilir Bilgiler" className="mb-6">
              <Form.Item name="expectedArrivalDate" label="Tahmini Varış Tarihi">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabled={!canEdit}
                />
              </Form.Item>

              <Form.Item name="description" label="Açıklama">
                <TextArea
                  rows={3}
                  placeholder="Transfer açıklaması..."
                  disabled={!canEdit}
                />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea
                  rows={3}
                  placeholder="Transfer ile ilgili notlar..."
                  disabled={!canEdit}
                />
              </Form.Item>
            </Card>

            {/* Items - Read Only */}
            <Card title={`Transfer Kalemleri (${transfer.items?.length || 0})`}>
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
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {/* Statistics - Read Only */}
            <Card title="İstatistikler" className="mb-6">
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
            </Card>

            {/* Timestamps */}
            <Card title="Kayıt Bilgileri">
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
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
