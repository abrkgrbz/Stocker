'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Dropdown,
  Tooltip,
  Spin,
  Badge,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  CalendarIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  FunnelIcon,
  HashtagIcon,
  LanguageIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  SwatchIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useProductAttributes, useDeleteProductAttribute } from '@/lib/api/hooks/useInventory';
import type { ProductAttributeDetailDto, AttributeType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import { showSuccess, confirmDelete } from '@/lib/utils/sweetalert';

const attributeTypeConfig: Record<AttributeType, { color: string; label: string; icon: React.ReactNode }> = {
  Text: { color: 'blue', label: 'Metin', icon: <LanguageIcon className="w-4 h-4" /> },
  Number: { color: 'cyan', label: 'Sayı', icon: <HashtagIcon className="w-4 h-4" /> },
  Boolean: { color: 'green', label: 'Evet/Hayır', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Date: { color: 'purple', label: 'Tarih', icon: <CalendarIcon className="w-4 h-4" /> },
  Select: { color: 'orange', label: 'Seçim', icon: <ListBulletIcon className="w-4 h-4" /> },
  MultiSelect: { color: 'magenta', label: 'Çoklu Seçim', icon: <Squares2X2Icon className="w-4 h-4" /> },
  Color: { color: 'red', label: 'Renk', icon: <SwatchIcon className="w-4 h-4" /> },
  Size: { color: 'gold', label: 'Beden', icon: <ArrowsPointingOutIcon className="w-4 h-4" /> },
};

export default function ProductAttributesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AttributeType | undefined>();
  const [showInactive, setShowInactive] = useState(false);
  const [filterableOnly, setFilterableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: attributes = [], isLoading, refetch } = useProductAttributes(showInactive, filterableOnly);
  const deleteAttribute = useDeleteProductAttribute();

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleDelete = async (record: ProductAttributeDetailDto) => {
    const confirmed = await confirmDelete('Özellik', record.name);
    if (confirmed) {
      try {
        await deleteAttribute.mutateAsync(record.id);
        showSuccess('Başarılı', 'Özellik silindi');
      } catch {
        // Error handled by hook
      }
    }
  };

  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr) => {
      const matchesSearch =
        !debouncedSearch ||
        attr.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        attr.code.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = !selectedType || attr.attributeType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [attributes, debouncedSearch, selectedType]);

  // Stats
  const activeAttributes = attributes.filter((a) => a.isActive).length;
  const filterableAttributes = attributes.filter((a) => a.isFilterable).length;
  const totalOptions = attributes.reduce((sum, a) => sum + (a.options?.length || 0), 0);

  const columns: ColumnsType<ProductAttributeDetailDto> = [
    {
      title: 'Özellik',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <TagIcon className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <div
              className="text-sm font-medium text-violet-600 cursor-pointer hover:text-violet-800"
              onClick={() => router.push(`/inventory/product-attributes/${record.id}`)}
            >
              {record.name}
            </div>
            <div className="text-xs text-slate-500">Kod: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'attributeType',
      key: 'attributeType',
      width: 140,
      render: (type: AttributeType) => {
        const config = attributeTypeConfig[type];
        return (
          <Tag color={config?.color || 'default'} icon={config?.icon}>
            {config?.label || type}
          </Tag>
        );
      },
    },
    {
      title: 'Grup',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
      render: (group) => group ? (
        <span className="text-sm text-slate-600">{group}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      title: 'Seçenekler',
      dataIndex: 'options',
      key: 'options',
      width: 100,
      align: 'center',
      render: (options: ProductAttributeDetailDto['options']) => (
        <Badge
          count={options?.length || 0}
          showZero
          style={{ backgroundColor: options?.length ? '#8b5cf6' : '#94a3b8' }}
        />
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-1 flex-wrap">
          {record.isRequired && (
            <Tooltip title="Zorunlu Alan">
              <Tag color="red" style={{ margin: 0 }}>Zorunlu</Tag>
            </Tooltip>
          )}
          {record.isFilterable && (
            <Tooltip title="Filtrelenebilir">
              <Tag color="blue" icon={<FunnelIcon className="w-4 h-4" />} style={{ margin: 0 }}>Filtre</Tag>
            </Tooltip>
          )}
          {record.isVisible && (
            <Tooltip title="Müşterilere Görünür">
              <Tag color="green" style={{ margin: 0 }}>Görünür</Tag>
            </Tooltip>
          )}
          {!record.isRequired && !record.isFilterable && !record.isVisible && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Sıra',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.displayOrder - b.displayOrder,
      render: (order) => <span className="text-sm text-slate-600">{order}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/product-attributes/${record.id}/edit`),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4 text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Özellik</span>
              <div className="text-2xl font-semibold text-slate-900">{attributes.length}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <TagIcon className="w-4 h-4 text-violet-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Özellik</span>
              <div className="text-2xl font-semibold text-slate-900">{activeAttributes}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Filtrelenebilir</span>
              <div className="text-2xl font-semibold text-slate-900">{filterableAttributes}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <FunnelIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Seçenek</span>
              <div className="text-2xl font-semibold text-slate-900">{totalOptions}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ListBulletIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TagIcon className="w-4 h-4" />}
        iconColor="#8b5cf6"
        title="Ürün Özellikleri"
        description="Ürün özelliklerini ve varyant seçeneklerini yönetin"
        itemCount={filteredAttributes.length}
        primaryAction={{
          label: 'Yeni Özellik',
          onClick: () => router.push('/inventory/product-attributes/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Input
            placeholder="Özellik adı veya kodu ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 280 }}
            className="h-10"
          />
          <Select
            placeholder="Tip seçin"
            allowClear
            style={{ width: 160 }}
            value={selectedType}
            onChange={setSelectedType}
            options={Object.entries(attributeTypeConfig).map(([value, config]) => ({
              value,
              label: (
                <span className="flex items-center gap-2">
                  {config.icon}
                  {config.label}
                </span>
              ),
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
            style={{ width: 140 }}
            options={[
              { value: false, label: 'Sadece Aktif' },
              { value: true, label: 'Tümü' },
            ]}
          />
          {(searchText || selectedType || filterableOnly || showInactive) && (
            <button
              onClick={() => {
                setSearchText('');
                setSelectedType(undefined);
                setFilterableOnly(false);
                setShowInactive(false);
              }}
              className="ml-auto px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredAttributes}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredAttributes.length,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} özellik`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
