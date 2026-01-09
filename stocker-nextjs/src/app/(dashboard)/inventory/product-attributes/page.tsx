'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Dropdown,
  Tooltip,
  Spin,
  Button,
  Space,
  Tabs,
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
  InboxIcon,
} from '@heroicons/react/24/outline';
import { useProductAttributes, useDeleteProductAttribute } from '@/lib/api/hooks/useInventory';
import type { ProductAttributeDetailDto, AttributeType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { showSuccess, confirmDelete } from '@/lib/utils/sweetalert';

const attributeTypeConfig: Record<AttributeType, { label: string; icon: React.ReactNode }> = {
  Text: { label: 'Metin', icon: <LanguageIcon className="w-4 h-4" /> },
  TextArea: { label: 'Uzun Metin', icon: <LanguageIcon className="w-4 h-4" /> },
  Integer: { label: 'Tam Sayi', icon: <HashtagIcon className="w-4 h-4" /> },
  Decimal: { label: 'Ondalik Sayi', icon: <HashtagIcon className="w-4 h-4" /> },
  Boolean: { label: 'Evet/Hayir', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Date: { label: 'Tarih', icon: <CalendarIcon className="w-4 h-4" /> },
  DateTime: { label: 'Tarih/Saat', icon: <CalendarIcon className="w-4 h-4" /> },
  Select: { label: 'Secim', icon: <ListBulletIcon className="w-4 h-4" /> },
  MultiSelect: { label: 'Coklu Secim', icon: <Squares2X2Icon className="w-4 h-4" /> },
  Color: { label: 'Renk', icon: <SwatchIcon className="w-4 h-4" /> },
  Url: { label: 'URL', icon: <LanguageIcon className="w-4 h-4" /> },
  File: { label: 'Dosya', icon: <LanguageIcon className="w-4 h-4" /> },
  Size: { label: 'Beden', icon: <ArrowsPointingOutIcon className="w-4 h-4" /> },
};

export default function ProductAttributesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AttributeType | undefined>();
  const [activeTab, setActiveTab] = useState('active');
  const [filterableOnly, setFilterableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showInactive = activeTab === 'all';
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
    const confirmed = await confirmDelete('Ozellik', record.name);
    if (confirmed) {
      try {
        await deleteAttribute.mutateAsync(record.id);
        showSuccess('Basarili', 'Ozellik silindi');
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
  const stats = {
    total: attributes.length,
    active: attributes.filter((a) => a.isActive).length,
    filterable: attributes.filter((a) => a.isFilterable).length,
    totalOptions: attributes.reduce((sum, a) => sum + (a.options?.length || 0), 0),
  };

  const columns: ColumnsType<ProductAttributeDetailDto> = [
    {
      title: 'Ozellik',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <TagIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div
              className="text-sm font-medium text-slate-900 cursor-pointer hover:text-slate-600"
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {config?.icon}
            {config?.label || type}
          </span>
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
      title: 'Secenekler',
      dataIndex: 'options',
      key: 'options',
      width: 100,
      align: 'center',
      render: (options: ProductAttributeDetailDto['options']) => (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
          options?.length ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {options?.length || 0}
        </span>
      ),
    },
    {
      title: 'Ozellikler',
      key: 'features',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-1 flex-wrap">
          {record.isRequired && (
            <Tooltip title="Zorunlu Alan">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-300 text-slate-800">
                Zorunlu
              </span>
            </Tooltip>
          )}
          {record.isFilterable && (
            <Tooltip title="Filtrelenebilir">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700">
                <FunnelIcon className="w-3 h-3" />
                Filtre
              </span>
            </Tooltip>
          )}
          {record.isVisible && (
            <Tooltip title="Musterilere Gorunur">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                Gorunur
              </span>
            </Tooltip>
          )}
          {!record.isRequired && !record.isFilterable && !record.isVisible && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Sira',
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
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
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
            label: 'Goruntule',
            onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Duzenle',
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
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'active',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Aktif
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.active}
          </span>
        </span>
      ),
    },
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4" />
          Tumu
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            Urun Ozellikleri
          </h1>
          <p className="text-slate-500 mt-1">Urun ozelliklerini ve varyant seceneklerini yonetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/product-attributes/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Ozellik
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Ozellik
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Aktif Ozellik
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.filterable}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Filtrelenebilir
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ListBulletIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalOptions}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Secenek
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <Input
            placeholder="Ozellik adi veya kodu ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 280 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Tip secin"
            allowClear
            style={{ width: 160 }}
            value={selectedType}
            onChange={setSelectedType}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            options={[
              { value: false, label: 'Tum Ozellikler' },
              { value: true, label: 'Sadece Filtrelenebilir' },
            ]}
          />
          {(searchText || selectedType || filterableOnly) && (
            <button
              onClick={() => {
                setSearchText('');
                setSelectedType(undefined);
                setFilterableOnly(false);
              }}
              className="ml-auto px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
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
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ozellik`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/inventory/product-attributes/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
