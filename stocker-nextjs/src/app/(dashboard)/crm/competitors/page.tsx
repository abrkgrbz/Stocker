'use client';

/**
 * Competitors List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Spin, Button, Space, Dropdown, Progress } from 'antd';
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  EyeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrophyIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
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

const threatLevelLabels: Record<ThreatLevel, string> = {
  [ThreatLevel.VeryLow]: 'Cok Dusuk',
  [ThreatLevel.Low]: 'Dusuk',
  [ThreatLevel.Medium]: 'Orta',
  [ThreatLevel.High]: 'Yuksek',
  [ThreatLevel.VeryHigh]: 'Cok Yuksek',
};

const getThreatStyle = (level: ThreatLevel): string => {
  switch (level) {
    case ThreatLevel.VeryHigh:
      return 'bg-slate-900 text-white';
    case ThreatLevel.High:
      return 'bg-slate-700 text-white';
    case ThreatLevel.Medium:
      return 'bg-slate-500 text-white';
    case ThreatLevel.Low:
      return 'bg-slate-300 text-slate-700';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

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

  // Stats calculation
  const stats = useMemo(() => {
    const totalEncounters = competitors.reduce((sum, c) => sum + (c.encounterCount || 0), 0);
    const totalWins = competitors.reduce((sum, c) => sum + (c.winCount || 0), 0);
    const overallWinRate = totalEncounters > 0 ? Math.round((totalWins / totalEncounters) * 100) : 0;

    return {
      total: competitors.length,
      active: competitors.filter(c => c.isActive).length,
      highThreat: competitors.filter(c => c.threatLevel === ThreatLevel.High || c.threatLevel === ThreatLevel.VeryHigh).length,
      winRate: overallWinRate,
      withWebsite: competitors.filter(c => c.website).length,
    };
  }, [competitors]);

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
    const confirmed = await confirmDelete('Rakip', competitor.name);

    if (confirmed) {
      try {
        await deleteCompetitor.mutateAsync(id);
        showDeleteSuccess('rakip');
      } catch (error) {
        showError('Silme islemi basarisiz');
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
          <span className="text-sm font-medium text-slate-900">{text}</span>
          {record.code && (
            <span className="ml-2 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{record.code}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tehdit',
      dataIndex: 'threatLevel',
      key: 'threatLevel',
      width: 130,
      render: (level: ThreatLevel) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getThreatStyle(level)}`}>
          {threatLevelLabels[level] || level}
        </span>
      ),
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (url: string) => url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GlobeAltIcon className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{new URL(url).hostname.replace('www.', '')}</span>
        </a>
      ) : <span className="text-slate-400">-</span>,
    },
    {
      title: 'Kazanma Orani',
      key: 'winRate',
      width: 180,
      render: (_: unknown, record: CompetitorDto) => {
        const total = record.encounterCount || 0;
        const winRate = record.winRate || 0;
        return total > 0 ? (
          <div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${Math.min(winRate, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 w-10">%{Math.round(winRate)}</span>
            </div>
            <span className="text-xs text-slate-500">
              {record.winCount}/{total} karsilasma
            </span>
          </div>
        ) : <span className="text-slate-400">-</span>;
      },
    },
    {
      title: 'Merkez',
      dataIndex: 'headquarters',
      key: 'headquarters',
      render: (text: string) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_: unknown, record: CompetitorDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleView(record),
              },
              {
                key: 'edit',
                label: 'Duzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => handleEdit(record),
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDelete(record.id, record),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BuildingOffice2Icon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rakipler</h1>
            <p className="text-sm text-slate-500">Rakip analizlerinizi yonetin</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreate}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Rakip
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingOffice2Icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stats.active} aktif</div>
              </>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Rakip</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.highThreat}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yuksek Tehdit</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">%{stats.winRate}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kazanma Orani</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <GlobeAltIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.withWebsite}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Online Varlik</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Rakip ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 280 }}
            className="!rounded-lg !border-slate-300"
          />
          <Select
            placeholder="Tehdit Seviyesi"
            value={threatFilter}
            onChange={setThreatFilter}
            allowClear
            style={{ width: 150 }}
            options={Object.entries(threatLevelLabels).map(([key, val]) => ({
              value: key,
              label: val,
            }))}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
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
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
