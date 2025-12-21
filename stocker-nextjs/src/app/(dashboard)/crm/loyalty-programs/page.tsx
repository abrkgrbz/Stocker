'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, GiftOutlined, SearchOutlined, EditOutlined, TrophyOutlined, UserOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { LoyaltyProgramDto } from '@/lib/api/services/crm.types';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';
import { useLoyaltyPrograms, useDeleteLoyaltyProgram } from '@/lib/api/hooks/useCRM';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';
import type { ColumnsType } from 'antd/es/table';

const programTypeLabels: Record<LoyaltyProgramType, { label: string; color: string }> = {
  [LoyaltyProgramType.PointsBased]: { label: 'Puan Tabanlı', color: 'blue' },
  [LoyaltyProgramType.TierBased]: { label: 'Kademe Tabanlı', color: 'purple' },
  [LoyaltyProgramType.SpendBased]: { label: 'Harcama Tabanlı', color: 'green' },
  [LoyaltyProgramType.Subscription]: { label: 'Abonelik', color: 'cyan' },
  [LoyaltyProgramType.Hybrid]: { label: 'Hibrit', color: 'orange' },
};

interface LoyaltyProgramsStatsProps {
  programs: LoyaltyProgramDto[];
  loading: boolean;
}

function LoyaltyProgramsStats({ programs, loading }: LoyaltyProgramsStatsProps) {
  const totalPrograms = programs.length;
  const activePrograms = programs.filter((p) => p.isActive).length;
  const totalMembers = programs.reduce((sum, p) => sum + ((p as any).memberCount || 0), 0);
  const totalPoints = programs.reduce((sum, p) => sum + ((p as any).totalPointsDistributed || 0), 0);

  const stats = [
    {
      title: 'Toplam Program',
      value: totalPrograms,
      icon: <GiftOutlined className="text-xl" />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Aktif',
      value: activePrograms,
      icon: <TrophyOutlined className="text-xl" />,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Toplam Üye',
      value: totalMembers.toLocaleString('tr-TR'),
      icon: <UserOutlined className="text-xl" />,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Dağıtılan Puan',
      value: totalPoints.toLocaleString('tr-TR'),
      icon: <StarOutlined className="text-xl" />,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
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
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoyaltyProgramsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<LoyaltyProgramType | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // API Hooks
  const { data, isLoading, refetch } = useLoyaltyPrograms({
    page: currentPage,
    pageSize,
    programType: typeFilter,
    isActive: activeFilter,
  });
  const deleteLoyaltyProgram = useDeleteLoyaltyProgram();

  const programs = data || [];
  const totalCount = programs.length;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/loyalty-programs/new');
  };

  const handleView = (program: LoyaltyProgramDto) => {
    router.push(`/crm/loyalty-programs/${program.id}`);
  };

  const handleEdit = (program: LoyaltyProgramDto) => {
    router.push(`/crm/loyalty-programs/${program.id}/edit`);
  };

  const handleDelete = async (id: string, program: LoyaltyProgramDto) => {
    const confirmed = await confirmDelete(
      'Sadakat Programı',
      program.name
    );

    if (confirmed) {
      try {
        await deleteLoyaltyProgram.mutateAsync(id);
        showDeleteSuccess('sadakat programı');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const columns: ColumnsType<LoyaltyProgramDto> = [
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
      dataIndex: 'programType',
      key: 'programType',
      width: 140,
      render: (type: LoyaltyProgramType) => {
        const info = programTypeLabels[type];
        return <Tag color={info?.color}>{info?.label || type}</Tag>;
      },
    },
    {
      title: 'Puan/Harcama',
      key: 'pointsPerSpend',
      width: 130,
      render: (_: unknown, record: LoyaltyProgramDto) => (
        <span className="text-slate-700">
          {record.pointsPerSpend} puan / {formatCurrency(record.spendUnit)}
        </span>
      ),
    },
    {
      title: 'Puan Değeri',
      dataIndex: 'pointValue',
      key: 'pointValue',
      width: 120,
      render: (value: number) => <span className="text-slate-700">{formatCurrency(value)}</span>,
    },
    {
      title: 'Min. Kullanım',
      dataIndex: 'minimumRedemptionPoints',
      key: 'minimumRedemptionPoints',
      width: 120,
      render: (value: number) => <span className="text-slate-700">{value} puan</span>,
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
      render: (_: unknown, record: LoyaltyProgramDto) => (
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
            className="text-slate-600 hover:text-slate-900"
          >
            Düzenle
          </Button>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
            className="text-red-600 hover:text-red-700"
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
        <LoyaltyProgramsStats programs={programs} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<GiftOutlined />}
        iconColor="#0f172a"
        title="Sadakat Programları"
        description="Müşteri sadakat programlarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Program',
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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Program ara..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />
          <Select
            placeholder="Tip"
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-40"
            allowClear
            options={Object.entries(programTypeLabels).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
          />
          <Select
            placeholder="Durum"
            value={activeFilter}
            onChange={setActiveFilter}
            className="w-32"
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
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={programs}
            rowKey="id"
            loading={deleteLoyaltyProgram.isPending}
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
