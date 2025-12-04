'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import {
  useStockCount,
  useUpdateStockCount,
} from '@/lib/api/hooks/useInventory';
import type { UpdateStockCountDto, StockCountStatus, StockCountType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<StockCountStatus, { color: string; label: string }> = {
  Draft: { color: 'default', label: 'Taslak' },
  InProgress: { color: 'processing', label: 'Devam Ediyor' },
  Completed: { color: 'cyan', label: 'Tamamlandı' },
  Approved: { color: 'green', label: 'Onaylandı' },
  Rejected: { color: 'red', label: 'Reddedildi' },
  Adjusted: { color: 'blue', label: 'Düzeltildi' },
  Cancelled: { color: 'red', label: 'İptal' },
};

const countTypeLabels: Record<StockCountType, string> = {
  Full: 'Tam Sayım',
  Cycle: 'Periyodik Sayım',
  Spot: 'Anlık Sayım',
  Annual: 'Yıllık Sayım',
  Category: 'Kategori Sayımı',
  Location: 'Lokasyon Sayımı',
  ABC: 'ABC Sayımı',
  Perpetual: 'Sürekli Sayım',
};

export default function EditStockCountPage() {
  const router = useRouter();
  const params = useParams();
  const stockCountId = Number(params.id);
  const [form] = Form.useForm();

  const { data: stockCount, isLoading } = useStockCount(stockCountId);
  const updateStockCount = useUpdateStockCount();

  useEffect(() => {
    if (stockCount) {
      form.setFieldsValue({
        description: stockCount.description,
        notes: stockCount.notes,
      });
    }
  }, [stockCount, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateStockCountDto = {
        description: values.description,
        notes: values.notes,
      };

      await updateStockCount.mutateAsync({ id: stockCountId, data });
      router.push(`/inventory/stock-counts/${stockCountId}`);
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

  if (!stockCount) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Stok sayımı bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusConfig[stockCount.status];
  const canEdit = stockCount.status === 'Draft' || stockCount.status === 'InProgress';

  return (
    <div className="max-w-4xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                <FileSearchOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Sayım Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{stockCount.countNumber}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateStockCount.isPending}
              disabled={!canEdit}
              style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {!canEdit && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text type="warning">
            Bu sayım düzenlenemez durumda. Sadece Taslak veya Devam Ediyor durumundaki sayımlar düzenlenebilir.
          </Text>
        </div>
      )}

      {/* Form */}
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col xs={24} md={16}>
            {/* Count Info - Read Only */}
            <Card title="Sayım Bilgileri" className="mb-6">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Sayım No">
                  {stockCount.countNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sayım Türü">
                  {countTypeLabels[stockCount.countType]}
                </Descriptions.Item>
                <Descriptions.Item label="Sayım Tarihi">
                  {dayjs(stockCount.countDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Depo">
                  {stockCount.warehouseName}
                </Descriptions.Item>
                <Descriptions.Item label="Lokasyon">
                  {stockCount.locationName || 'Tüm Depo'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Editable Fields */}
            <Card title="Düzenlenebilir Bilgiler" className="mb-6">
              <Form.Item name="description" label="Açıklama">
                <TextArea
                  rows={3}
                  placeholder="Sayım açıklaması..."
                  disabled={!canEdit}
                />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea
                  rows={3}
                  placeholder="Sayım ile ilgili notlar..."
                  disabled={!canEdit}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            {/* Statistics - Read Only */}
            <Card title="İstatistikler" className="mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Toplam Kalem</Text>
                  <Text strong>{stockCount.totalItems}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Sayılan</Text>
                  <Text strong className="text-purple-600">{stockCount.countedItems}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Farklı Kalem</Text>
                  <Text strong className={stockCount.itemsWithDifferenceCount > 0 ? 'text-orange-500' : ''}>
                    {stockCount.itemsWithDifferenceCount}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Net Fark</Text>
                  <Text
                    strong
                    className={
                      stockCount.totalDifference > 0
                        ? 'text-green-600'
                        : stockCount.totalDifference < 0
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {stockCount.totalDifference > 0 ? '+' : ''}{stockCount.totalDifference}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Timestamps */}
            <Card title="Kayıt Bilgileri">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">Oluşturulma</Text>
                  <Text>{dayjs(stockCount.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
                {stockCount.startedDate && (
                  <div className="flex justify-between">
                    <Text type="secondary">Başlangıç</Text>
                    <Text>{dayjs(stockCount.startedDate).format('DD/MM/YYYY HH:mm')}</Text>
                  </div>
                )}
                {stockCount.completedDate && (
                  <div className="flex justify-between">
                    <Text type="secondary">Tamamlanma</Text>
                    <Text>{dayjs(stockCount.completedDate).format('DD/MM/YYYY HH:mm')}</Text>
                  </div>
                )}
              </div>
              <Text type="secondary" className="block mt-3 text-xs">
                Not: Sayım detayları sadece sayım sırasında değiştirilebilir.
              </Text>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
