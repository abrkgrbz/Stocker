'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, ShareAltOutlined, SearchOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { ReferralDto } from '@/lib/api/services/crm.types';
import { ReferralStatus, ReferralType } from '@/lib/api/services/crm.types';
import { useReferrals, useDeleteReferral } from '@/lib/api/hooks/useCRM';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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

interface ReferralsStatsProps {
  referrals: ReferralDto[];
  loading: boolean;
}

function ReferralsStats({ referrals, loading }: ReferralsStatsProps) {
  const stats = React.useMemo(() => {
    if (loading || !referrals.length) {
      return {
        total: 0,
        new: 0,
        converted: 0,
        totalRevenue: 0,
      };
    }

    return {
      total: referrals.length,
      new: referrals.filter(r => r.status === ReferralStatus.New).length,
      converted: referrals.filter(r => r.status === ReferralStatus.Converted).length,
      totalRevenue: referrals.reduce((sum, r) => sum + (r.rewardPaid ? ((r as any).rewardAmount || 0) : 0), 0),
    };
  }, [referrals, loading]);

  const statCards = [
    {
      icon: <FileTextOutlined className="text-2xl" />,
      label: 'Toplam Referans',
      value: stats.total.toLocaleString('tr-TR'),
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
    },
    {
      icon: <SyncOutlined className="text-2xl" />,
      label: 'Yeni',
      value: stats.new.toLocaleString('tr-TR'),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: <CheckCircleOutlined className="text-2xl" />,
      label: 'Dönüştürülen',
      value: stats.converted.toLocaleString('tr-TR'),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      icon: <DollarOutlined className="text-2xl" />,
      label: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">{stat.label}</p>
              <p className="text-2xl font-semibold text-slate-900">
                {loading ? '-' : stat.value}
              </p>
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
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{text}</span>
      ),
    },
    {
      title: 'Referans Veren',
      dataIndex: 'referrerName',
      key: 'referrerName',
      render: (text: string, record: ReferralDto) => (
        <div>
          <span className="font-medium text-slate-900">{text}</span>
          {record.referrerCustomerName && (
            <span className="text-xs text-slate-500 block">{record.referrerCustomerName}</span>
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
          <span className="font-medium text-slate-900">{text}</span>
          {record.referredCompany && (
            <span className="text-xs text-slate-500 block">{record.referredCompany}</span>
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ReferralsStats referrals={referrals} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<ShareAltOutlined />}
        iconColor="#0f172a"
        title="Referanslar"
        description="Müşteri referanslarını yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Referans',
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
            dataSource={referrals}
            rowKey="id"
            loading={deleteReferral.isPending}
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
