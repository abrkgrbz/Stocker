'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Tag,
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
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

  const { data: stockCount, isLoading, error } = useStockCount(stockCountId);
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
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !stockCount) {
    return (
      <div className="p-8">
        <Alert
          message="Sayım Bulunamadı"
          description="İstenen stok sayımı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/stock-counts')}>
              Sayımlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[stockCount.status];
  const canEdit = stockCount.status === 'Draft' || stockCount.status === 'InProgress';

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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {stockCount.countNumber}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {countTypeLabels[stockCount.countType]} • {stockCount.warehouseName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/stock-counts/${stockCountId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateStockCount.isPending}
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
              Bu sayım düzenlenemez durumda. Sadece Taslak veya Devam Ediyor durumundaki sayımlar düzenlenebilir.
            </Text>
          </div>
        )}

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Count Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Sayım Bilgileri
                </h3>
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Sayım No">
                    {stockCount.countNumber}
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
              </div>

              {/* Editable Fields */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Düzenlenebilir Bilgiler
                </h3>
                <Form.Item name="description" label="Açıklama">
                  <TextArea
                    rows={3}
                    placeholder="Sayım açıklaması..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>

                <Form.Item name="notes" label="Notlar">
                  <TextArea
                    rows={3}
                    placeholder="Sayım ile ilgili notlar..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
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
              </div>

              {/* Timestamps */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Kayıt Bilgileri
                </h3>
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
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
