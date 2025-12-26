'use client';

/**
 * Competitors List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select, Progress } from 'antd';
import {
  PlusIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { CompetitorDto } from '@/lib/api/services/crm.types';
import { ThreatLevel } from '@/lib/api/services/crm.types';
import { useCompetitors, useDeleteCompetitor } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/patterns';
import { Spinner } from '@/components/primitives';

const threatLevelLabels: Record<ThreatLevel, { label: string; color: string }> = {
  [ThreatLevel.VeryLow]: { label: 'Çok Düşük', color: 'green' },
  [ThreatLevel.Low]: { label: 'Düşük', color: 'lime' },
  [ThreatLevel.Medium]: { label: 'Orta', color: 'orange' },
  [ThreatLevel.High]: { label: 'Yüksek', color: 'red' },
  [ThreatLevel.VeryHigh]: { label: 'Çok Yüksek', color: 'purple' },
};

// Stats component inline
function CompetitorsStats({
  competitors,
  loading
}: {
  competitors: CompetitorDto[];
  loading: boolean;
}) {
  const totalCompetitors = competitors.length;
  const activeCompetitors = competitors.filter(c => c.isActive).length;
  const highThreat = competitors.filter(
    c => c.threatLevel === ThreatLevel.High || c.threatLevel === ThreatLevel.VeryHigh
  ).length;

  const totalEncounters = competitors.reduce((sum, c) => sum + (c.encounterCount || 0), 0);
  const totalWins = competitors.reduce((sum, c) => sum + (c.winCount || 0), 0);
  const overallWinRate = totalEncounters > 0 ? Math.round((totalWins / totalEncounters) * 100) : 0;

  const stats = [
    {
      label: 'Toplam Rakip',
      value: loading ? '-' : totalCompetitors,
      subtext: `${activeCompetitors} aktif`,
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
    {
      label: 'Yüksek Tehdit',
      value: loading ? '-' : highThreat,
      subtext: 'rakip',
      icon: <ExclamationTriangleIcon className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Kazanma Oranı',
      value: loading ? '-' : `%${overallWinRate}`,
      subtext: `${totalWins}/${totalEncounters} karşılaşma`,
      icon: <TrophyIcon className="w-5 h-5" />,
      color: overallWinRate >= 50 ? 'text-green-600' : 'text-orange-600',
      bgColor: overallWinRate >= 50 ? 'bg-green-50' : 'bg-orange-50',
    },
    {
      label: 'Online Varlık',
      value: loading ? '-' : competitors.filter(c => c.website).length,
      subtext: 'website',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400">{stat.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function CompetitorsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useCompetitors({
    page: currentPage,
    pageSize,
    threatLevel: threatFilter,
    search: debouncedSearch || undefined,
  });
  const deleteCompetitor = useDeleteCompetitor();

  const competitors = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/competitors/new');
  };

  const handleView = (competitor: CompetitorDto) => {
    router.push(`/crm/competitors/${competitor.id}`);
  };

  const handleEdit = (competitor: CompetitorDto) => {
    router.push(`/crm/competitors/${competitor.id}/edit`);
  };

  const handleDelete = async (id: string, competitor: CompetitorDto) => {
    const confirmed = await confirmDelete(
      'Rakip',
      competitor.name
    );

    if (confirmed) {
      try {
        await deleteCompetitor.mutateAsync(id);
        showDeleteSuccess('rakip');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const columns: ColumnsType<CompetitorDto> = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CompetitorDto) => (
        <div>
          <span className="font-medium">{text}</span>
          {record.code && (
            <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{record.code}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tehdit',
      dataIndex: 'threatLevel',
      key: 'threatLevel',
      width: 130,
      render: (level: ThreatLevel) => {
        const info = threatLevelLabels[level];
        return <Tag color={info?.color}>{info?.label || level}</Tag>;
      },
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (url: string) => url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {new URL(url).hostname.replace('www.', '')}
        </a>
      ) : '-',
    },
    {
      title: 'Kazanma Oranı',
      key: 'winRate',
      width: 180,
      render: (_: unknown, record: CompetitorDto) => {
        const total = record.encounterCount || 0;
        const winRate = record.winRate || 0;
        return total > 0 ? (
          <div>
            <Progress
              percent={Math.round(winRate)}
              size="small"
              status={winRate >= 50 ? 'success' : 'exception'}
              format={(percent) => `%${percent}`}
            />
            <span className="text-xs text-gray-500">
              {record.winCount}/{total} karşılaşma
            </span>
          </div>
        ) : '-';
      },
    },
    {
      title: 'Merkez',
      dataIndex: 'headquarters',
      key: 'headquarters',
      render: (text: string) => text || '-',
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
      render: (_: unknown, record: CompetitorDto) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            Görüntüle
          </Button>
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <CompetitorsStats competitors={competitors} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BuildingOffice2Icon className="w-5 h-5" />}
        iconColor="#0f172a"
        title="Rakipler"
        description="Rakip analizlerinizi yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Rakip',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
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
            placeholder="Rakip ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="flex-1 max-w-xs"
          />
          <Select
            placeholder="Tehdit Seviyesi"
            value={threatFilter}
            onChange={setThreatFilter}
            allowClear
            className="w-40"
            options={Object.entries(threatLevelLabels).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
          />
        </div>
      </div>

      {/* Competitors Table */}
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
            dataSource={competitors}
            rowKey="id"
            loading={deleteCompetitor.isPending}
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
