'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  Typography,
  Popconfirm,
  message,
  Dropdown,
  Select,
  Badge,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  GiftOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useProductBundles, useDeleteProductBundle } from '@/lib/api/hooks/useInventory';
import type { ProductBundleDto, BundleType, BundlePricingType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
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

export default function ProductBundlesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<BundleType | undefined>();
  const [showInactive, setShowInactive] = useState(false);

  const { data: bundles = [], isLoading, refetch } = useProductBundles(showInactive, !showInactive);
  const deleteBundle = useDeleteProductBundle();

  const handleDelete = async (id: number) => {
    try {
      await deleteBundle.mutateAsync(id);
      message.success('Paket silindi');
    } catch {
      message.error('Silme işlemi başarısız');
    }
  };

  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch =
      bundle.name.toLowerCase().includes(searchText.toLowerCase()) ||
      bundle.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !selectedType || bundle.bundleType === selectedType;
    return matchesSearch && matchesType;
  });

  const getActionMenuItems = (record: ProductBundleDto): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Görüntüle',
      icon: <EyeOutlined />,
      onClick: () => router.push(`/inventory/product-bundles/${record.id}`),
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => router.push(`/inventory/product-bundles/${record.id}/edit`),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns: ColumnsType<ProductBundleDto> = [
    {
      title: 'Paket',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#f59e0b15' }}
          >
            <GiftOutlined style={{ fontSize: 18, color: '#f59e0b' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-400">Kod: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'bundleType',
      key: 'bundleType',
      width: 150,
      filters: Object.entries(bundleTypeConfig).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.bundleType === value,
      render: (type: BundleType) => (
        <Tag color={bundleTypeConfig[type]?.color || 'default'}>
          {bundleTypeConfig[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Fiyatlandırma',
      dataIndex: 'pricingType',
      key: 'pricingType',
      width: 150,
      render: (type: BundlePricingType) => (
        <Text type="secondary">{pricingTypeConfig[type]?.label || type}</Text>
      ),
    },
    {
      title: 'Ürünler',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.items?.length || 0) - (b.items?.length || 0),
      render: (items: ProductBundleDto['items']) => (
        <Badge count={items?.length || 0} showZero color="#6366f1" />
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.calculatedPrice || 0) - (b.calculatedPrice || 0),
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.calculatedPrice?.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
            })} ₺
          </div>
          {record.discountPercentage && record.discountPercentage > 0 && (
            <Tag color="red" className="text-xs">%{record.discountPercentage} indirim</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Geçerlilik',
      key: 'validity',
      width: 150,
      render: (_, record) => {
        if (!record.validFrom && !record.validTo) {
          return <Text type="secondary">Süresiz</Text>;
        }
        const now = dayjs();
        const validFrom = record.validFrom ? dayjs(record.validFrom) : null;
        const validTo = record.validTo ? dayjs(record.validTo) : null;

        let status: 'success' | 'warning' | 'error' = 'success';
        if (validFrom && now.isBefore(validFrom)) status = 'warning';
        if (validTo && now.isAfter(validTo)) status = 'error';

        return (
          <div className="text-xs">
            {validFrom && <div>Başlangıç: {validFrom.format('DD/MM/YYYY')}</div>}
            {validTo && <div>Bitiş: {validTo.format('DD/MM/YYYY')}</div>}
            <Tag color={status === 'success' ? 'green' : status === 'warning' ? 'orange' : 'red'} className="mt-1">
              {status === 'success' ? 'Aktif' : status === 'warning' ? 'Başlamadı' : 'Süresi Doldu'}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean, record) => (
        <Space direction="vertical" size={0} align="center">
          <Tag color={isActive ? 'success' : 'default'}>
            {isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.isValid ? (
            <CheckCircleOutlined style={{ color: '#10b981', fontSize: 12 }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 12 }} />
          )}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Stats
  const activeBundles = bundles.filter((b) => b.isActive).length;
  const validBundles = bundles.filter((b) => b.isValid).length;
  const totalValue = bundles.reduce((sum, b) => sum + (b.calculatedPrice || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Ürün Paketleri</Title>
          <Text type="secondary">Ürün paketlerini ve komboları yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/product-bundles/new')}
            style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
          >
            Yeni Paket
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <GiftOutlined className="text-blue-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Toplam Paket</Text>
              <div className="text-xl font-semibold">{bundles.length}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-green-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Aktif Paket</Text>
              <div className="text-xl font-semibold">{activeBundles}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-purple-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Geçerli Paket</Text>
              <div className="text-xl font-semibold">{validBundles}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <GiftOutlined className="text-orange-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Toplam Değer</Text>
              <div className="text-xl font-semibold">
                {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Input
            placeholder="Paket ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Tip seçin"
            allowClear
            style={{ width: 180 }}
            value={selectedType}
            onChange={setSelectedType}
            options={Object.entries(bundleTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />
          <Select
            value={showInactive}
            onChange={setShowInactive}
            style={{ width: 150 }}
            options={[
              { value: false, label: 'Sadece Aktif' },
              { value: true, label: 'Tümü' },
            ]}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredBundles}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} paket`,
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/product-bundles/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
