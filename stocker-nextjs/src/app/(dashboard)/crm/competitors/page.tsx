'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select, Progress } from 'antd';
import { PlusOutlined, ReloadOutlined, AimOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { CompetitorDto } from '@/lib/api/services/crm.types';
import { ThreatLevel } from '@/lib/api/services/crm.types';
import { useCompetitors, useDeleteCompetitor } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const threatLevelLabels: Record<ThreatLevel, { label: string; color: string }> = {
  [ThreatLevel.VeryLow]: { label: 'Çok Düşük', color: 'green' },
  [ThreatLevel.Low]: { label: 'Düşük', color: 'lime' },
  [ThreatLevel.Medium]: { label: 'Orta', color: 'orange' },
  [ThreatLevel.High]: { label: 'Yüksek', color: 'red' },
  [ThreatLevel.VeryHigh]: { label: 'Çok Yüksek', color: 'purple' },
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
      width: 120,
      render: (_: unknown, record: CompetitorDto) => (
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
          <AimOutlined className="mr-2" />
          Rakipler
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
            Yeni Rakip
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Rakip ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Tehdit Seviyesi"
              value={threatFilter}
              onChange={setThreatFilter}
              style={{ width: 150 }}
              allowClear
              options={Object.entries(threatLevelLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={competitors}
            rowKey="id"
            loading={isLoading || deleteCompetitor.isPending}
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
