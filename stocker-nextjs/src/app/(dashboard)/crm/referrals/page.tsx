'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, ShareAltOutlined, SearchOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { ReferralDto } from '@/lib/api/services/crm.types';
import { ReferralStatus, ReferralType } from '@/lib/api/services/crm.types';
import { useReferrals, useDeleteReferral } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusLabels: Record<ReferralStatus, { label: string; color: string }> = {
  [ReferralStatus.New]: { label: 'Yeni', color: 'blue' },
  [ReferralStatus.Contacted]: { label: 'İletişime Geçildi', color: 'cyan' },
  [ReferralStatus.Qualified]: { label: 'Nitelikli', color: 'green' },
  [ReferralStatus.Converted]: { label: 'Dönüştürüldü', color: 'purple' },
  [ReferralStatus.Rejected]: { label: 'Reddedildi', color: 'red' },
  [ReferralStatus.Expired]: { label: 'Süresi Doldu', color: 'default' },
};

const typeLabels: Record<ReferralType, { label: string; color: string }> = {
  [ReferralType.Customer]: { label: 'Müşteri', color: 'blue' },
  [ReferralType.Partner]: { label: 'Partner', color: 'green' },
  [ReferralType.Employee]: { label: 'Çalışan', color: 'purple' },
  [ReferralType.Influencer]: { label: 'Influencer', color: 'magenta' },
  [ReferralType.Affiliate]: { label: 'Affiliate', color: 'orange' },
  [ReferralType.Other]: { label: 'Diğer', color: 'default' },
};

export default function ReferralsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<ReferralType | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useReferrals({
    page: currentPage,
    pageSize,
    status: statusFilter,
    referralType: typeFilter,
  });
  const deleteReferral = useDeleteReferral();

  const referrals = data?.items || [];
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
    router.push('/crm/referrals/new');
  };

  const handleDelete = async (id: string, referral: ReferralDto) => {
    const confirmed = await confirmDelete(
      'Referans',
      `${referral.referrerName} → ${referral.referredName}`
    );

    if (confirmed) {
      try {
        await deleteReferral.mutateAsync(id);
        showDeleteSuccess('referans');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const columns: ColumnsType<ReferralDto> = [
    {
      title: 'Kod',
      dataIndex: 'referralCode',
      key: 'referralCode',
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: 'Referans Veren',
      dataIndex: 'referrerName',
      key: 'referrerName',
      render: (text: string, record: ReferralDto) => (
        <div>
          <span className="font-medium">{text}</span>
          {record.referrerCustomerName && (
            <span className="text-xs text-gray-500 block">{record.referrerCustomerName}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Referans Edilen',
      dataIndex: 'referredName',
      key: 'referredName',
      render: (text: string, record: ReferralDto) => (
        <div>
          <span className="font-medium">{text}</span>
          {record.referredCompany && (
            <span className="text-xs text-gray-500 block">{record.referredCompany}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'referralType',
      key: 'referralType',
      width: 110,
      render: (type: ReferralType) => {
        const info = typeLabels[type];
        return <Tag color={info?.color}>{info?.label || type}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ReferralStatus) => {
        const info = statusLabels[status];
        return <Tag color={info?.color}>{info?.label || status}</Tag>;
      },
    },
    {
      title: 'Referans Tarihi',
      dataIndex: 'referralDate',
      key: 'referralDate',
      width: 130,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: 'Ödül',
      key: 'reward',
      width: 100,
      render: (_: unknown, record: ReferralDto) => (
        <span>
          {record.rewardPaid ? (
            <Tag color="green">Ödendi</Tag>
          ) : (
            <Tag color="default">Bekliyor</Tag>
          )}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: ReferralDto) => (
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
          <ShareAltOutlined className="mr-2" />
          Referanslar
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
            Yeni Referans
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Referans ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Durum"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
              allowClear
              options={Object.entries(statusLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
            <Select
              placeholder="Tip"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 130 }}
              allowClear
              options={Object.entries(typeLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={referrals}
            rowKey="id"
            loading={isLoading || deleteReferral.isPending}
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
