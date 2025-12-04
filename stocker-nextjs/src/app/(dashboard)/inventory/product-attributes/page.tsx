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
  message,
  Dropdown,
  Select,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TagsOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useProductAttributes, useDeleteProductAttribute } from '@/lib/api/hooks/useInventory';
import type { ProductAttributeDetailDto, AttributeType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

const attributeTypeConfig: Record<AttributeType, { color: string; label: string }> = {
  Text: { color: 'blue', label: 'Metin' },
  Number: { color: 'cyan', label: 'Sayı' },
  Boolean: { color: 'green', label: 'Evet/Hayır' },
  Date: { color: 'purple', label: 'Tarih' },
  Select: { color: 'orange', label: 'Seçim' },
  MultiSelect: { color: 'magenta', label: 'Çoklu Seçim' },
  Color: { color: 'red', label: 'Renk' },
  Size: { color: 'gold', label: 'Beden' },
};

export default function ProductAttributesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<AttributeType | undefined>();
  const [showInactive, setShowInactive] = useState(false);
  const [filterableOnly, setFilterableOnly] = useState(false);

  const { data: attributes = [], isLoading, refetch } = useProductAttributes(showInactive, filterableOnly);
  const deleteAttribute = useDeleteProductAttribute();

  const handleDelete = async (id: number) => {
    try {
      await deleteAttribute.mutateAsync(id);
      message.success('Özellik silindi');
    } catch {
      message.error('Silme işlemi başarısız');
    }
  };

  const filteredAttributes = attributes.filter((attr) => {
    const matchesSearch =
      attr.name.toLowerCase().includes(searchText.toLowerCase()) ||
      attr.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = !selectedType || attr.attributeType === selectedType;
    return matchesSearch && matchesType;
  });

  const getActionMenuItems = (record: ProductAttributeDetailDto): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Görüntüle',
      icon: <EyeOutlined />,
      onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => router.push(`/inventory/product-attributes/${record.id}/edit`),
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

  const columns: ColumnsType<ProductAttributeDetailDto> = [
    {
      title: 'Özellik',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#8b5cf615' }}
          >
            <TagsOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />
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
      dataIndex: 'attributeType',
      key: 'attributeType',
      width: 150,
      filters: Object.entries(attributeTypeConfig).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.attributeType === value,
      render: (type: AttributeType) => (
        <Tag color={attributeTypeConfig[type]?.color || 'default'}>
          {attributeTypeConfig[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Grup',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
      render: (group) => group || <Text type="secondary">-</Text>,
    },
    {
      title: 'Seçenekler',
      dataIndex: 'options',
      key: 'options',
      width: 100,
      align: 'center',
      render: (options: ProductAttributeDetailDto['options']) => (
        <Badge count={options?.length || 0} showZero color="#8b5cf6" />
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 200,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.isRequired && <Tag color="red">Zorunlu</Tag>}
          {record.isFilterable && <Tag color="blue" icon={<FilterOutlined />}>Filtrelenebilir</Tag>}
          {record.isVisible && <Tag color="green">Görünür</Tag>}
        </Space>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.displayOrder - b.displayOrder,
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
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
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
  const activeAttributes = attributes.filter((a) => a.isActive).length;
  const filterableAttributes = attributes.filter((a) => a.isFilterable).length;
  const totalOptions = attributes.reduce((sum, a) => sum + (a.options?.length || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Ürün Özellikleri</Title>
          <Text type="secondary">Ürün özelliklerini ve varyant seçeneklerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/product-attributes/new')}
            style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}
          >
            Yeni Özellik
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TagsOutlined className="text-purple-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Toplam Özellik</Text>
              <div className="text-xl font-semibold">{attributes.length}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-green-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Aktif Özellik</Text>
              <div className="text-xl font-semibold">{activeAttributes}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FilterOutlined className="text-blue-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Filtrelenebilir</Text>
              <div className="text-xl font-semibold">{filterableAttributes}</div>
            </div>
          </div>
        </Card>
        <Card size="small">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TagsOutlined className="text-orange-500 text-lg" />
            </div>
            <div>
              <Text type="secondary" className="text-xs">Toplam Seçenek</Text>
              <div className="text-xl font-semibold">{totalOptions}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Input
            placeholder="Özellik ara..."
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
            options={Object.entries(attributeTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />
          <Select
            value={filterableOnly}
            onChange={setFilterableOnly}
            style={{ width: 180 }}
            options={[
              { value: false, label: 'Tüm Özellikler' },
              { value: true, label: 'Sadece Filtrelenebilir' },
            ]}
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
          dataSource={filteredAttributes}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} özellik`,
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}
