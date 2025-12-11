'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, GlobalOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';
import { useTerritories, useDeleteTerritory } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const typeLabels: Record<TerritoryType, { label: string; color: string }> = {
  [TerritoryType.Country]: { label: 'Ülke', color: 'blue' },
  [TerritoryType.Region]: { label: 'Bölge', color: 'green' },
  [TerritoryType.City]: { label: 'Şehir', color: 'cyan' },
  [TerritoryType.District]: { label: 'İlçe', color: 'purple' },
  [TerritoryType.PostalCode]: { label: 'Posta Kodu', color: 'orange' },
  [TerritoryType.Custom]: { label: 'Özel', color: 'default' },
  [TerritoryType.Industry]: { label: 'Sektör', color: 'gold' },
  [TerritoryType.CustomerSegment]: { label: 'Müşteri Segmenti', color: 'magenta' },
};

export default function TerritoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<TerritoryType | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // API Hooks
  const { data, isLoading, refetch } = useTerritories({
    page: currentPage,
    pageSize,
    territoryType: typeFilter,
    isActive: activeFilter,
  });
  const deleteTerritory = useDeleteTerritory();

  const territories = data || [];
  const totalCount = territories.length;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/territories/new');
  };

  const handleEdit = (territory: TerritoryDto) => {
    router.push(`/crm/territories/${territory.id}/edit`);
  };

  const handleDelete = async (id: string, territory: TerritoryDto) => {
    const confirmed = await confirmDelete(
      'Bölge',
      territory.name
    );

    if (confirmed) {
      try {
        await deleteTerritory.mutateAsync(id);
        showDeleteSuccess('bölge');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnsType<TerritoryDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'territoryType',
      key: 'territoryType',
      width: 130,
      render: (type: TerritoryType) => {
        const info = typeLabels[type];
        return <Tag color={info?.color}>{info?.label || type}</Tag>;
      },
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_: unknown, record: TerritoryDto) => {
        const parts = [record.city, record.region, record.country].filter(Boolean);
        return parts.join(', ') || '-';
      },
    },
    {
      title: 'Satış Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerCount',
      key: 'customerCount',
      width: 90,
      align: 'center',
      render: (count: number) => count || 0,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: TerritoryDto) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Düzenle
          </Button>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          <GlobalOutlined className="mr-2" />
          Bölgeler
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Yeni Bölge
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Bölge ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Tip"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 150 }}
              allowClear
              options={Object.entries(typeLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
            <Select
              placeholder="Durum"
              value={activeFilter}
              onChange={setActiveFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Pasif' },
              ]}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={territories}
            rowKey="id"
            loading={isLoading || deleteTerritory.isPending}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
          />
        </Space>
      </AnimatedCard>
    </div>
  );
}
