'use client';

/**
 * Sales Teams List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Spin, Button, Space, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { SalesTeamDto } from '@/lib/api/services/crm.types';
import { useSalesTeams, useDeleteSalesTeam } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

export default function SalesTeamsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API Hooks
  const { data, isLoading, refetch } = useSalesTeams({
    page: currentPage,
    pageSize,
  });
  const deleteSalesTeam = useDeleteSalesTeam();

  const salesTeams = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculation
  const stats = useMemo(() => ({
    total: salesTeams.length,
    totalMembers: salesTeams.reduce((sum, team) => sum + (team.totalMemberCount || 0), 0),
    active: salesTeams.filter(team => team.isActive).length,
    avgPerformance: salesTeams.length > 0
      ? Math.round(salesTeams.reduce((sum, team) => sum + ((team as any).performanceScore || 0), 0) / salesTeams.length)
      : 0,
  }), [salesTeams]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/sales-teams/new');
  };

  const handleView = (id: string) => {
    router.push(`/crm/sales-teams/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/crm/sales-teams/${id}/edit`);
  };

  const handleDelete = async (id: string, salesTeam: SalesTeamDto) => {
    const confirmed = await confirmDelete('Satis Ekibi', salesTeam.name);

    if (confirmed) {
      try {
        await deleteSalesTeam.mutateAsync(id);
        showDeleteSuccess('satis ekibi');
      } catch (error) {
        showError('Silme islemi basarisiz');
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

  // Filter sales teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchText) return salesTeams;
    return salesTeams.filter((team) =>
      team.name.toLowerCase().includes(searchText.toLowerCase()) ||
      team.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      team.teamLeaderName?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [salesTeams, searchText]);

  const columns: ColumnsType<SalesTeamDto> = [
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
      title: 'Ekip Adi',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="text-sm font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Lider',
      dataIndex: 'teamLeaderName',
      key: 'teamLeaderName',
      render: (text: string) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Bolge',
      dataIndex: 'territoryNames',
      key: 'territoryNames',
      render: (text: string) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Satis Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => (
        <span className="text-sm text-slate-900 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Uyeler',
      key: 'members',
      width: 100,
      align: 'center',
      render: (_: unknown, record: SalesTeamDto) => (
        <span className="text-sm">
          <span className="font-medium text-slate-900">{record.activeMemberCount || 0}</span>
          <span className="text-slate-400"> / {record.totalMemberCount || 0}</span>
        </span>
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
      render: (_: unknown, record: SalesTeamDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                label: 'Duzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => handleEdit(record.id),
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
            <UsersIcon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satis Ekipleri</h1>
            <p className="text-sm text-slate-500">Satis ekiplerinizi yonetin</p>
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
            Yeni Ekip
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Ekip</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.totalMembers}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Uye</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
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
              <div className="text-2xl font-bold text-slate-900">{stats.avgPerformance}%</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ort. Performans</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Ekip ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ maxWidth: 400 }}
            className="!rounded-lg !border-slate-300"
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
            dataSource={filteredTeams}
            rowKey="id"
            loading={deleteSalesTeam.isPending}
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
