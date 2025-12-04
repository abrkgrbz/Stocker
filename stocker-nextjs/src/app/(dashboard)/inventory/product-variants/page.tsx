'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Switch,
  Avatar,
  message,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
} from '@ant-design/icons';
import { useProducts, useProductVariants, useDeleteProductVariant } from '@/lib/api/hooks/useInventory';
import type { ProductVariantDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

export default function ProductVariantsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariantDto | null>(null);

  const { data: products = [] } = useProducts();
  const { data: variants = [], isLoading } = useProductVariants(selectedProduct || 0, includeInactive);
  const deleteVariant = useDeleteProductVariant();

  // Show variants only when a product is selected
  const allVariants = selectedProduct ? variants : [];

  const filteredVariants = allVariants.filter((v) => {
    const matchesSearch =
      !searchText ||
      v.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      v.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
      v.barcode?.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const activeVariants = filteredVariants.filter((v) => v.isActive);
  const defaultVariants = filteredVariants.filter((v) => v.isDefault);
  const totalValue = filteredVariants.reduce((sum, v) => sum + (v.price || 0), 0);

  const handleDelete = async () => {
    if (!variantToDelete) return;
    try {
      await deleteVariant.mutateAsync(variantToDelete.id);
      setDeleteModalOpen(false);
      setVariantToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<ProductVariantDto> = [
    {
      title: 'Varyant',
      key: 'variant',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.imageUrl}
            icon={<AppstoreOutlined />}
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BarcodeOutlined />
              <span>{record.sku}</span>
              {record.barcode && (
                <>
                  <span className="mx-1">•</span>
                  <span>{record.barcode}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <Text type="secondary" className="text-xs">
            {record.productCode}
          </Text>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 150,
      render: (_, record) => (
        <div>
          {record.price ? (
            <>
              <div className="font-medium">
                {record.price.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: record.priceCurrency || 'TRY',
                })}
              </div>
              {record.costPrice && (
                <Text type="secondary" className="text-xs">
                  Maliyet:{' '}
                  {record.costPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: record.costPriceCurrency || 'TRY',
                  })}
                </Text>
              )}
            </>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Ağırlık',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight) => (weight ? `${weight} kg` : <Text type="secondary">-</Text>),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Tag color={record.isActive ? 'success' : 'default'}>
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.isDefault && <Tag color="blue">Varsayılan</Tag>}
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/inventory/product-variants/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/inventory/product-variants/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setVariantToDelete(record);
              setDeleteModalOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <AppstoreOutlined style={{ fontSize: 20, color: 'white' }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 m-0">Ürün Varyantları</h1>
            <p className="text-sm text-gray-500 m-0">SKU ve barkod bazlı ürün çeşitleri</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/inventory/product-variants/new')}
          style={{ background: '#6366f1', borderColor: '#6366f1' }}
        >
          Yeni Varyant
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Toplam Varyant"
              value={filteredVariants.length}
              prefix={<AppstoreOutlined style={{ color: '#6366f1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Aktif"
              value={activeVariants.length}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Varsayılan"
              value={defaultVariants.length}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Toplam Değer"
              value={totalValue}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters & Table */}
      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Varyant ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Ürün seçin"
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="label"
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.code} - ${p.name}`,
            }))}
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={includeInactive}
              onChange={setIncludeInactive}
              size="small"
            />
            <Text type="secondary">Pasifleri göster</Text>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredVariants}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} varyant`,
          }}
          locale={{ emptyText: 'Varyant bulunamadı' }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        title="Varyantı Sil"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setVariantToDelete(null);
        }}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deleteVariant.isPending }}
      >
        <p>
          <strong>{variantToDelete?.name}</strong> varyantını silmek istediğinize emin misiniz?
        </p>
        <p className="text-gray-500 text-sm">
          SKU: {variantToDelete?.sku}
        </p>
      </Modal>
    </div>
  );
}
