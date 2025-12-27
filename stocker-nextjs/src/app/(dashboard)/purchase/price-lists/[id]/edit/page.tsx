'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
  Table,
  Spin,
  Empty,
  Tag,
  Switch,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  usePriceList,
  useUpdatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<PriceListStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  PendingApproval: { color: 'orange', text: 'Onay Bekliyor' },
  Approved: { color: 'blue', text: 'Onaylandı' },
  Active: { color: 'green', text: 'Aktif' },
  Inactive: { color: 'gray', text: 'Pasif' },
  Expired: { color: 'red', text: 'Süresi Doldu' },
  Superseded: { color: 'purple', text: 'Yenilendi' },
  Rejected: { color: 'volcano', text: 'Reddedildi' },
};

export default function EditPriceListPage() {
  const params = useParams();
  const router = useRouter();
  const priceListId = params.id as string;
  const [form] = Form.useForm();

  const { data: priceList, isLoading: priceListLoading } = usePriceList(priceListId);
  const updatePriceList = useUpdatePriceList();

  useEffect(() => {
    if (priceList) {
      form.setFieldsValue({
        name: priceList.name,
        description: priceList.description,
        effectiveTo: priceList.effectiveTo ? dayjs(priceList.effectiveTo) : null,
        isDefault: priceList.isDefault,
        notes: priceList.notes,
      });
    }
  }, [priceList, form]);

  if (priceListLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="p-8">
        <Empty description="Fiyat listesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/price-lists')}>
            Fiyat Listelerine Dön
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = priceList.status === 'Draft' || priceList.status === 'Inactive';

  if (!canEdit) {
    return (
      <div className="p-8">
        <Empty description="Bu fiyat listesi düzenlenemez. Sadece taslak veya pasif listeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/price-lists/${priceListId}`)}>
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updatePriceList.mutateAsync({
        id: priceListId,
        data: {
          name: values.name,
          description: values.description,
          effectiveTo: values.effectiveTo?.toISOString(),
          isDefault: values.isDefault,
          notes: values.notes,
        },
      });
      message.success('Fiyat listesi başarıyla güncellendi');
      router.push(`/purchase/price-lists/${priceListId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/price-lists/${priceListId}`);
  };

  const isLoading = updatePriceList.isPending;
  const status = statusConfig[priceList.status as PriceListStatus] || statusConfig.Draft;

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name || 'Belirtilmemiş'}</div>
          {record.productCode && (
            <div className="text-xs text-gray-500">{record.productCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      align: 'right' as const,
      render: (price: number) =>
        `${(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${priceList.currency}`,
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      align: 'center' as const,
      render: (discount: number) => discount ? `%${discount}` : '-',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)' }}
              >
                <CurrencyDollarIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Fiyat Listesini Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {priceList.code}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<XMarkIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Info */}
          <Card title="Liste Bilgileri (Salt Okunur)" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Liste Kodu</Text>
                  <Text strong>{priceList.code}</Text>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Durum</Text>
                  <Tag color={status.color}>{status.text}</Tag>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Tedarikçi</Text>
                  <Text strong>{priceList.supplierName || '-'}</Text>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Para Birimi</Text>
                  <Text strong>{priceList.currency}</Text>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Başlangıç Tarihi</Text>
                  <Text strong>
                    {priceList.effectiveFrom
                      ? dayjs(priceList.effectiveFrom).format('DD.MM.YYYY')
                      : '-'}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div className="mb-4">
                  <Text type="secondary" className="block mb-1">Ürün Sayısı</Text>
                  <Text strong>{priceList.items?.length || 0}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Editable Fields */}
          <Card title="Düzenlenebilir Alanlar" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Liste Adı"
                  rules={[{ required: true, message: 'Ad zorunludur' }]}
                >
                  <Input placeholder="Fiyat listesi adı" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="effectiveTo" label="Bitiş Tarihi">
                  <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="description" label="Açıklama">
                  <TextArea rows={2} placeholder="Liste açıklaması..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="isDefault" label="Varsayılan Liste" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="notes" label="Notlar">
                  <TextArea rows={2} placeholder="Ek notlar..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Items (Read-Only) */}
          <Card title="Fiyat Kalemleri (Salt Okunur)">
            <Text type="secondary" className="block mb-4">
              Fiyat kalemlerini düzenlemek için lütfen listeyi silin ve yeni bir liste oluşturun.
            </Text>
            <Table
              columns={itemColumns}
              dataSource={priceList.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'Henüz ürün eklenmedi' }}
              scroll={{ x: 600 }}
            />
            {(priceList.items?.length || 0) > 0 && (
              <div className="mt-4 text-right text-sm text-gray-500">
                Toplam: {priceList.items?.length} ürün
              </div>
            )}
          </Card>
        </Form>
      </div>
    </div>
  );
}
