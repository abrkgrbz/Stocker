'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Typography,
  Spin,
  Modal,
  Empty,
  Divider,
  Avatar,
  Switch,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import {
  useProductVariant,
  useDeleteProductVariant,
} from '@/lib/api/hooks/useInventory';

const { Title, Text } = Typography;

export default function ProductVariantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const variantId = Number(params.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: variant, isLoading } = useProductVariant(variantId);
  const deleteVariant = useDeleteProductVariant();

  const handleDelete = async () => {
    try {
      await deleteVariant.mutateAsync(variantId);
      router.push('/inventory/product-variants');
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Varyant bulunamadı" />
      </div>
    );
  }

  const margin = variant.price && variant.costPrice
    ? ((variant.price - variant.costPrice) / variant.price) * 100
    : null;

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
              <Avatar
                shape="square"
                size={48}
                src={variant.imageUrl}
                icon={<AppstoreOutlined />}
                style={{
                  backgroundColor: '#f0f0f0',
                  border: '2px solid #6366f1',
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{variant.name}</h1>
                  <Tag color={variant.isActive ? 'success' : 'default'}>
                    {variant.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {variant.isDefault && <Tag color="blue">Varsayılan</Tag>}
                </div>
                <p className="text-sm text-gray-500 m-0">SKU: {variant.sku}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/product-variants/${variantId}/edit`)}
            >
              Düzenle
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalOpen(true)}>
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Satış Fiyatı"
              value={variant.price || 0}
              precision={2}
              prefix={variant.priceCurrency === 'USD' ? '$' : variant.priceCurrency === 'EUR' ? '€' : '₺'}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Maliyet"
              value={variant.costPrice || 0}
              precision={2}
              prefix={variant.costPriceCurrency === 'USD' ? '$' : variant.costPriceCurrency === 'EUR' ? '€' : '₺'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Kar Marjı"
              value={margin ?? 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: margin && margin > 0 ? '#10b981' : '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Ağırlık"
              value={variant.weight || 0}
              precision={3}
              suffix="kg"
            />
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <Card title="Varyant Bilgileri" className="mb-6">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Varyant Adı">{variant.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">
                <div className="flex items-center gap-2">
                  <BarcodeOutlined />
                  <code>{variant.sku}</code>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Barkod">
                {variant.barcode ? (
                  <div className="flex items-center gap-2">
                    <BarcodeOutlined />
                    <code>{variant.barcode}</code>
                  </div>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ağırlık">
                {variant.weight ? `${variant.weight} kg` : <Text type="secondary">-</Text>}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Parent Product */}
          <Card title="Ana Ürün" className="mb-6">
            <div
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => router.push(`/inventory/products/${variant.productId}`)}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <ShoppingOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{variant.productName}</div>
                <Text type="secondary">{variant.productCode}</Text>
              </div>
              <Button type="link">Ürüne Git →</Button>
            </div>
          </Card>

          {/* Pricing Details */}
          <Card title="Fiyatlandırma Detayları">
            <Row gutter={24}>
              <Col span={12}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                  <div className="text-2xl font-bold mt-2" style={{ color: '#3b82f6' }}>
                    {variant.price?.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: variant.priceCurrency || 'TRY',
                    }) || '₺0,00'}
                  </div>
                  <Text type="secondary">Satış Fiyatı</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarOutlined style={{ fontSize: 24, color: '#6b7280' }} />
                  <div className="text-2xl font-bold mt-2" style={{ color: '#6b7280' }}>
                    {variant.costPrice?.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: variant.costPriceCurrency || 'TRY',
                    }) || '₺0,00'}
                  </div>
                  <Text type="secondary">Maliyet</Text>
                </div>
              </Col>
            </Row>

            {margin !== null && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <Text type="secondary">Kar Marjı</Text>
                <div
                  className="text-xl font-bold"
                  style={{ color: margin > 0 ? '#10b981' : '#ef4444' }}
                >
                  %{margin.toFixed(1)}
                </div>
                {variant.price && variant.costPrice && (
                  <Text type="secondary">
                    ({(variant.price - variant.costPrice).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: variant.priceCurrency || 'TRY',
                    })} kar)
                  </Text>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Status */}
          <Card title="Durum" className="mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Aktif</Text>
                <Switch checked={variant.isActive} disabled />
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text>Varsayılan Varyant</Text>
                <Switch checked={variant.isDefault} disabled />
              </div>
            </div>
          </Card>

          {/* Variant Options */}
          {variant.options && variant.options.length > 0 && (
            <Card title="Özellik Değerleri" className="mb-6">
              <div className="space-y-3">
                {variant.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <Text type="secondary">{option.attributeName}</Text>
                    <Tag color="blue">{option.value}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Image */}
          {variant.imageUrl && (
            <Card title="Görsel">
              <img
                src={variant.imageUrl}
                alt={variant.name}
                className="w-full rounded-lg"
                style={{ maxHeight: 300, objectFit: 'cover' }}
              />
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        title="Varyantı Sil"
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deleteVariant.isPending }}
      >
        <p>
          <strong>{variant.name}</strong> varyantını silmek istediğinize emin misiniz?
        </p>
        <p className="text-gray-500 text-sm">
          SKU: {variant.sku}
        </p>
        <p className="text-gray-500 text-sm">
          Bu işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
}
