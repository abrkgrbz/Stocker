'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';
import { useTerritories, useDeleteTerritory } from '@/lib/api/hooks/useCRM';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/patterns';
import { Spinner } from '@/components/primitives';
import type { ColumnsType } from 'antd/es/table';

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

interface TerritoriesStatsProps {
  territories: TerritoryDto[];
  loading: boolean;
}

function TerritoriesStats({ territories, loading }: TerritoriesStatsProps) {
  const totalTerritories = territories.length;
  const activeTerritories = territories.filter(t => t.isActive).length;
  const totalCustomers = territories.reduce((sum, t) => sum + (t.customerCount || 0), 0);
  const territoriesWithReps = territories.filter(t => (t as any).assignedToId).length;

  const stats = [
    {
      title: 'Toplam Bölge',
      value: totalTerritories,
      color: 'from-slate-500 to-slate-600',
    },
    {
      title: 'Aktif',
      value: activeTerritories,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Atanan Müşteri',
      value: totalCustomers,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Atanan Temsilci',
      value: territoriesWithReps,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const handleView = (territory: TerritoryDto) => {
    router.push(`/crm/territories/${territory.id}`);
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
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
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
        return <span className="text-slate-600">{parts.join(', ') || '-'}</span>;
      },
    },
    {
      title: 'Satış Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => <span className="text-slate-900">{formatCurrency(value)}</span>,
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerCount',
      key: 'customerCount',
      width: 90,
      align: 'center',
      render: (count: number) => <span className="text-slate-900">{count || 0}</span>,
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
      width: 180,
      render: (_: unknown, record: TerritoryDto) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => handleView(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            Görüntüle
          </Button>
          <Button
            type="text"
            size="small"
            icon={<PencilIcon className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
            className="text-slate-600 hover:text-slate-900"
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <TerritoriesStats territories={territories} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<GlobeAltIcon className="w-5 h-5" />}
        iconColor="#0f172a"
        title="Bölgeler"
        description="Satış bölgelerini yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Bölge',
          onClick: handleCreate,
          icon: <PlusIcon className="w-5 h-5" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Bölge ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
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
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={territories}
            rowKey="id"
            loading={deleteTerritory.isPending}
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
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
