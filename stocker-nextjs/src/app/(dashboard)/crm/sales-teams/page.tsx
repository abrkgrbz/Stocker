'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input } from 'antd';
import { PlusOutlined, ReloadOutlined, TeamOutlined, SearchOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { SalesTeamDto } from '@/lib/api/services/crm.types';
import { useSalesTeams, useDeleteSalesTeam } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

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
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: 'Ekip Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Lider',
      dataIndex: 'teamLeaderName',
      key: 'teamLeaderName',
      render: (text: string) => text || '-',
    },
    {
      title: 'Bölge',
      dataIndex: 'territoryNames',
      key: 'territoryNames',
      render: (text: string) => text || '-',
    },
    {
      title: 'Satış Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Üyeler',
      key: 'members',
      width: 100,
      align: 'center',
      render: (_: unknown, record: SalesTeamDto) => (
        <span>
          <span className="font-medium text-green-600">{record.activeMemberCount || 0}</span>
          <span className="text-gray-400"> / {record.totalMemberCount || 0}</span>
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
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          <TeamOutlined className="mr-2" />
          Satış Ekipleri
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
            Yeni Ekip
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Ekip ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Space>

          <Table
            columns={columns}
            dataSource={salesTeams}
            rowKey="id"
            loading={isLoading || deleteSalesTeam.isPending}
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
