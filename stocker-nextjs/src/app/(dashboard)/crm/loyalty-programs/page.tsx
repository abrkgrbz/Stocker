'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, GiftOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { LoyaltyProgramDto } from '@/lib/api/services/crm.types';
import { LoyaltyProgramType } from '@/lib/api/services/crm.types';
import { useLoyaltyPrograms, useDeleteLoyaltyProgram } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const programTypeLabels: Record<LoyaltyProgramType, { label: string; color: string }> = {
  [LoyaltyProgramType.PointsBased]: { label: 'Puan Tabanlı', color: 'blue' },
  [LoyaltyProgramType.TierBased]: { label: 'Kademe Tabanlı', color: 'purple' },
  [LoyaltyProgramType.SpendBased]: { label: 'Harcama Tabanlı', color: 'green' },
  [LoyaltyProgramType.Subscription]: { label: 'Abonelik', color: 'cyan' },
  [LoyaltyProgramType.Hybrid]: { label: 'Hibrit', color: 'orange' },
};

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
        <span>
          {record.pointsPerSpend} puan / {formatCurrency(record.spendUnit)}
        </span>
      ),
    },
    {
      title: 'Puan Değeri',
      dataIndex: 'pointValue',
      key: 'pointValue',
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Min. Kullanım',
      dataIndex: 'minimumRedemptionPoints',
      key: 'minimumRedemptionPoints',
      width: 120,
      render: (value: number) => `${value} puan`,
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
      render: (_: unknown, record: LoyaltyProgramDto) => (
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
          <GiftOutlined className="mr-2" />
          Sadakat Programları
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
            Yeni Program
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Program ara..."
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
              style={{ width: 160 }}
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
            dataSource={programs}
            rowKey="id"
            loading={isLoading || deleteLoyaltyProgram.isPending}
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
