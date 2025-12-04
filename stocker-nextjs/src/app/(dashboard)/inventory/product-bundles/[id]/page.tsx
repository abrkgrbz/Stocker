'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Descriptions,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  Modal,
  InputNumber,
  message,
  Divider,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import {
  useProductBundle,
  useDeleteProductBundle,
  useAddProductBundleItem,
  useRemoveProductBundleItem,
} from '@/lib/api/hooks/useInventory';
import type {
  ProductBundleDto,
  ProductBundleItemDto,
  BundleType,
  BundlePricingType,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const bundleTypeConfig: Record<BundleType, { color: string; label: string }> = {
  Fixed: { color: 'blue', label: 'Sabit' },
  Configurable: { color: 'purple', label: 'Yapılandırılabilir' },
  Kit: { color: 'cyan', label: 'Kit' },
  Package: { color: 'green', label: 'Paket' },
  Combo: { color: 'orange', label: 'Kombo' },
};

const pricingTypeConfig: Record<BundlePricingType, { label: string }> = {
  FixedPrice: { label: 'Sabit Fiyat' },
  DynamicSum: { label: 'Dinamik Toplam' },
  DiscountedSum: { label: 'İndirimli Toplam' },
  PercentageDiscount: { label: 'Yüzde İndirim' },
};

export default function ProductBundleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: bundle, isLoading, error, refetch } = useProductBundle(id);
  const deleteBundle = useDeleteProductBundle();
  const removeItem = useRemoveProductBundleItem();

  const handleDelete = () => {
    Modal.confirm({
      title: 'Paketi Sil',
      content: 'Bu paketi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteBundle.mutateAsync(id);
          message.success('Paket silindi');
          router.push('/inventory/product-bundles');
        } catch {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem.mutateAsync({ bundleId: id, itemId });
      message.success('Ürün paketten çıkarıldı');
      refetch();
    } catch {
      message.error('İşlem başarısız');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <Alert
        message="Hata"
        description="Paket bilgileri yüklenemedi"
        type="error"
        showIcon
        action={<Button onClick={() => router.back()}>Geri Dön</Button>}
      />
    );
  }

  const itemColumns: ColumnsType<ProductBundleItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">{record.productCode}</Text>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (quantity, record) => (
        <div>
          <div className="font-medium">{quantity}</div>
          {(record.minQuantity || record.maxQuantity) && (
            <Text type="secondary" className="text-xs">
              ({record.minQuantity || 1}-{record.maxQuantity || '∞'})
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {(record.overridePrice || record.productPrice || 0).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
            })} ₺
          </div>
          {record.discountPercentage && record.discountPercentage > 0 && (
            <Tag color="red" className="text-xs">%{record.discountPercentage}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const price = record.overridePrice || record.productPrice || 0;
        const discount = record.discountPercentage || 0;
        const total = price * record.quantity * (1 - discount / 100);
        return (
          <div className="font-medium text-orange-600">
            {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        );
      },
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      align: 'center',
      render: (isRequired) =>
        isRequired ? (
          <CheckCircleOutlined style={{ color: '#10b981' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#9ca3af' }} />
        ),
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      align: 'center',
      render: (isDefault) =>
        isDefault ? (
          <CheckCircleOutlined style={{ color: '#10b981' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#9ca3af' }} />
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
          size="small"
        />
      ),
    },
  ];

  // Calculate validity status
  const now = dayjs();
  const validFrom = bundle.validFrom ? dayjs(bundle.validFrom) : null;
  const validTo = bundle.validTo ? dayjs(bundle.validTo) : null;
  let validityStatus: 'active' | 'pending' | 'expired' = 'active';
  if (validFrom && now.isBefore(validFrom)) validityStatus = 'pending';
  if (validTo && now.isAfter(validTo)) validityStatus = 'expired';

  // Calculate totals
  const itemsTotal = bundle.items?.reduce((sum, item) => {
    const price = item.overridePrice || item.productPrice || 0;
    const discount = item.discountPercentage || 0;
    return sum + price * item.quantity * (1 - discount / 100);
  }, 0) || 0;

  const savings = itemsTotal - (bundle.calculatedPrice || 0);
  const savingsPercent = itemsTotal > 0 ? (savings / itemsTotal) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto">
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
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <GiftOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">{bundle.name}</h1>
                  <Tag color={bundleTypeConfig[bundle.bundleType]?.color}>
                    {bundleTypeConfig[bundle.bundleType]?.label}
                  </Tag>
                  <Tag color={bundle.isActive ? 'success' : 'default'}>
                    {bundle.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {bundle.isValid ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Geçerli</Tag>
                  ) : (
                    <Tag color="red" icon={<CloseCircleOutlined />}>Geçersiz</Tag>
                  )}
                </div>
                <p className="text-sm text-gray-500 m-0">Kod: {bundle.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
            >
              Düzenle
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Paket Fiyatı"
              value={bundle.calculatedPrice || 0}
              precision={2}
              suffix="₺"
              prefix={<DollarOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Ürün Sayısı"
              value={bundle.items?.length || 0}
              prefix={<AppstoreOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tasarruf"
              value={savings}
              precision={2}
              suffix="₺"
              prefix={<ShoppingCartOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
            {savingsPercent > 0 && (
              <Tag color="green" className="mt-2">%{savingsPercent.toFixed(1)} indirim</Tag>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <div className="flex items-center justify-between">
              <Statistic
                title="Geçerlilik"
                value={validityStatus === 'active' ? 'Aktif' : validityStatus === 'pending' ? 'Bekliyor' : 'Süresi Doldu'}
                prefix={<CalendarOutlined className="text-blue-500" />}
              />
            </div>
            <Tag
              color={validityStatus === 'active' ? 'green' : validityStatus === 'pending' ? 'orange' : 'red'}
              className="mt-2"
            >
              {validityStatus === 'active' ? 'Kullanılabilir' : validityStatus === 'pending' ? 'Henüz Başlamadı' : 'Süresi Dolmuş'}
            </Tag>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column - Info */}
        <Col xs={24} lg={8}>
          <Card title="Paket Bilgileri" className="mb-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Kod">{bundle.code}</Descriptions.Item>
              <Descriptions.Item label="Ad">{bundle.name}</Descriptions.Item>
              {bundle.description && (
                <Descriptions.Item label="Açıklama">{bundle.description}</Descriptions.Item>
              )}
              <Descriptions.Item label="Tip">
                <Tag color={bundleTypeConfig[bundle.bundleType]?.color}>
                  {bundleTypeConfig[bundle.bundleType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fiyatlandırma">
                {pricingTypeConfig[bundle.pricingType]?.label}
              </Descriptions.Item>
              {bundle.fixedPrice && (
                <Descriptions.Item label="Sabit Fiyat">
                  {bundle.fixedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </Descriptions.Item>
              )}
              {bundle.discountPercentage && bundle.discountPercentage > 0 && (
                <Descriptions.Item label="İndirim Oranı">
                  %{bundle.discountPercentage}
                </Descriptions.Item>
              )}
              {bundle.discountAmount && bundle.discountAmount > 0 && (
                <Descriptions.Item label="İndirim Tutarı">
                  {bundle.discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card title="Seçenekler" className="mb-6">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tüm Ürünler Zorunlu">
                {bundle.requireAllItems ? (
                  <Tag color="green">Evet</Tag>
                ) : (
                  <Tag color="default">Hayır</Tag>
                )}
              </Descriptions.Item>
              {bundle.minSelectableItems && (
                <Descriptions.Item label="Min Seçilebilir">
                  {bundle.minSelectableItems}
                </Descriptions.Item>
              )}
              {bundle.maxSelectableItems && (
                <Descriptions.Item label="Max Seçilebilir">
                  {bundle.maxSelectableItems}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Görüntüleme Sırası">
                {bundle.displayOrder}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Geçerlilik Tarihleri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Başlangıç">
                {bundle.validFrom ? dayjs(bundle.validFrom).format('DD/MM/YYYY') : 'Belirsiz'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş">
                {bundle.validTo ? dayjs(bundle.validTo).format('DD/MM/YYYY') : 'Belirsiz'}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(bundle.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {bundle.updatedAt && (
                <Descriptions.Item label="Güncellenme">
                  {dayjs(bundle.updatedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column - Items */}
        <Col xs={24} lg={16}>
          <Card
            title={`Paket Ürünleri (${bundle.items?.length || 0})`}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
              >
                Ürün Ekle
              </Button>
            }
          >
            {bundle.items && bundle.items.length > 0 ? (
              <>
                <Table
                  columns={itemColumns}
                  dataSource={bundle.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
                <Divider />
                <div className="flex justify-between items-center">
                  <div>
                    <Text type="secondary">Ürün Toplamı:</Text>
                    <div className="text-lg">
                      {itemsTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                  </div>
                  <div className="text-right">
                    <Text type="secondary">Paket Fiyatı:</Text>
                    <div className="text-2xl font-bold text-orange-500">
                      {(bundle.calculatedPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </div>
                    {savings > 0 && (
                      <Tag color="green">%{savingsPercent.toFixed(1)} tasarruf</Tag>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Empty
                description="Bu pakette henüz ürün yok"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
                >
                  Ürün Ekle
                </Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
