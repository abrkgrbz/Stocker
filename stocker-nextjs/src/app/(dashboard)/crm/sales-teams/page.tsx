'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, TeamOutlined, SearchOutlined, UserOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { SalesTeamDto } from '@/lib/api/services/crm.types';
import { useSalesTeams, useDeleteSalesTeam } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';

interface SalesTeamsStatsProps {
  salesTeams: SalesTeamDto[];
  loading: boolean;
}

function SalesTeamsStats({ salesTeams, loading }: SalesTeamsStatsProps) {
  const totalTeams = salesTeams.length;
  const totalMembers = salesTeams.reduce((sum, team) => sum + (team.totalMemberCount || 0), 0);
  const activeTeams = salesTeams.filter(team => team.isActive).length;
  const avgPerformance = salesTeams.length > 0
    ? Math.round(salesTeams.reduce((sum, team) => sum + ((team as any).performanceScore || 0), 0) / salesTeams.length)
    : 0;

  const stats = [
    {
      title: 'Toplam Ekip',
      value: totalTeams,
      icon: <TeamOutlined className="text-2xl" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Toplam Üye',
      value: totalMembers,
      icon: <UserOutlined className="text-2xl" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Aktif',
      value: activeTeams,
      icon: <CheckCircleOutlined className="text-2xl" />,
      color: 'bg-green-500',
    },
    {
      title: 'Ortalama Performans',
      value: `${avgPerformance}%`,
      icon: <TrophyOutlined className="text-2xl" />,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="small" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default function SalesTeamsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/sales-teams/new');
  };

  const handleDelete = async (id: string, salesTeam: SalesTeamDto) => {
    const confirmed = await confirmDelete(
      'Satış Ekibi',
      salesTeam.name
    );

    if (confirmed) {
      try {
        await deleteSalesTeam.mutateAsync(id);
        showDeleteSuccess('satış ekibi');
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
      title: 'Ekip Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Lider',
      dataIndex: 'teamLeaderName',
      key: 'teamLeaderName',
      render: (text: string) => <span className="text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Bölge',
      dataIndex: 'territoryNames',
      key: 'territoryNames',
      render: (text: string) => <span className="text-slate-600">{text || '-'}</span>,
    },
    {
      title: 'Satış Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => <span className="text-slate-900 font-medium">{formatCurrency(value)}</span>,
    },
    {
      title: 'Üyeler',
      key: 'members',
      width: 100,
      align: 'center',
      render: (_: unknown, record: SalesTeamDto) => (
        <span>
          <span className="font-medium text-green-600">{record.activeMemberCount || 0}</span>
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
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: SalesTeamDto) => (
        <Space>
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
        <SalesTeamsStats salesTeams={salesTeams} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TeamOutlined />}
        iconColor="#0f172a"
        title="Satış Ekipleri"
        description="Satış ekiplerinizi yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Ekip',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Ekip ara..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="max-w-md"
        />
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
            dataSource={salesTeams}
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
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
