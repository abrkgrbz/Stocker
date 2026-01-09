'use client';

/**
 * Referrals List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Spin, Button, Space, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { ReferralDto } from '@/lib/api/services/crm.types';
import { ReferralStatus, ReferralType } from '@/lib/api/services/crm.types';
import { useReferrals, useDeleteReferral } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusLabels: Record<ReferralStatus, string> = {
  [ReferralStatus.New]: 'Yeni',
  [ReferralStatus.Contacted]: 'Iletisime Gecildi',
  [ReferralStatus.Qualified]: 'Nitelikli',
  [ReferralStatus.Converted]: 'Donusturuldu',
  [ReferralStatus.Rejected]: 'Reddedildi',
  [ReferralStatus.Expired]: 'Suresi Doldu',
};

const typeLabels: Record<ReferralType, string> = {
  [ReferralType.Customer]: 'Musteri',
  [ReferralType.Partner]: 'Partner',
  [ReferralType.Employee]: 'Calisan',
  [ReferralType.Influencer]: 'Influencer',
  [ReferralType.Affiliate]: 'Affiliate',
  [ReferralType.Other]: 'Diger',
};

const getStatusStyle = (status: ReferralStatus): string => {
  switch (status) {
    case ReferralStatus.Converted:
      return 'bg-slate-900 text-white';
    case ReferralStatus.Qualified:
      return 'bg-slate-700 text-white';
    case ReferralStatus.Contacted:
      return 'bg-slate-500 text-white';
    case ReferralStatus.New:
      return 'bg-slate-400 text-white';
    case ReferralStatus.Rejected:
    case ReferralStatus.Expired:
      return 'bg-slate-200 text-slate-600';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

const getTypeStyle = (type: ReferralType): string => {
  switch (type) {
    case ReferralType.Customer:
      return 'bg-slate-700 text-white';
    case ReferralType.Partner:
      return 'bg-slate-600 text-white';
    case ReferralType.Employee:
      return 'bg-slate-500 text-white';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

export default function ReferralsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
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

  // Stats calculation
  const stats = useMemo(() => ({
    total: referrals.length,
    new: referrals.filter(r => r.status === ReferralStatus.New).length,
    converted: referrals.filter(r => r.status === ReferralStatus.Converted).length,
    totalRevenue: referrals.reduce((sum, r) => sum + (r.rewardPaid ? ((r as any).rewardAmount || 0) : 0), 0),
  }), [referrals]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/referrals/new');
  };

  const handleView = (id: string) => {
    router.push(`/crm/referrals/${id}`);
  };

  const handleDelete = async (id: string, referral: ReferralDto) => {
    const confirmed = await confirmDelete(
      'Referans',
      `${referral.referrerName} -> ${referral.referredName}`
    );

    if (confirmed) {
      try {
        await deleteReferral.mutateAsync(id);
        showDeleteSuccess('referans');
      } catch (error) {
        showError('Silme islemi basarisiz');
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
          <span className="text-sm font-medium text-slate-900">{text}</span>
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
          <span className="text-sm font-medium text-slate-900">{text}</span>
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
      render: (type: ReferralType) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getTypeStyle(type)}`}>
          {typeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ReferralStatus) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(status)}`}>
          {statusLabels[status] || status}
        </span>
      ),
    },
    {
      title: 'Referans Tarihi',
      dataIndex: 'referralDate',
      key: 'referralDate',
      width: 130,
      render: (date: string) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Odul',
      key: 'reward',
      width: 100,
      render: (_: unknown, record: ReferralDto) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            record.rewardPaid ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {record.rewardPaid ? 'Odendi' : 'Bekliyor'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_: unknown, record: ReferralDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleView(record.id),
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
            <ShareIcon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Referanslar</h1>
            <p className="text-sm text-slate-500">Musteri referanslarini yonetin</p>
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
            Yeni Referans
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Referans</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.new}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yeni</div>
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
              <div className="text-2xl font-bold text-slate-900">{stats.converted}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Donusturulen</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.totalRevenue.toLocaleString('tr-TR')} TL</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Gelir</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          <Input
            placeholder="Referans ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 240 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
          <Select
            placeholder="Durum"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            allowClear
            options={Object.entries(statusLabels).map(([key, val]) => ({
              value: key,
              label: val,
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
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}
