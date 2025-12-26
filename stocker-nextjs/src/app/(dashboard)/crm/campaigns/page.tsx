'use client';

/**
 * Campaigns List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Tag, Progress, Avatar, Dropdown, Empty, Input } from 'antd';
import {
  showCreateSuccess,
  showDeleteSuccess,
  showUpdateSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  ArrowPathIcon,
  TrophyIcon,
  EllipsisHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { Campaign } from '@/lib/api/services/crm.service';
import {
  useCampaigns,
  useDeleteCampaign,
  useStartCampaign,
  useCompleteCampaign,
  useAbortCampaign,
  useCreateCampaign,
} from '@/lib/api/hooks/useCRM';
import { CampaignsStats } from '@/components/crm/campaigns/CampaignsStats';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/patterns';
import { Spinner } from '@/components/primitives';

const campaignTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Email: { label: 'E-posta', icon: <EnvelopeIcon className="w-4 h-4" />, color: 'blue' },
  SocialMedia: { label: 'Sosyal Medya', icon: <UserPlusIcon className="w-4 h-4" />, color: 'cyan' },
  Webinar: { label: 'Webinar', icon: <PlayCircleIcon className="w-4 h-4" />, color: 'purple' },
  Event: { label: 'Etkinlik', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'green' },
  Conference: { label: 'Konferans', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'geekblue' },
  Advertisement: { label: 'Reklam', icon: <CurrencyDollarIcon className="w-4 h-4" />, color: 'orange' },
  Banner: { label: 'Banner', icon: <CurrencyDollarIcon className="w-4 h-4" />, color: 'gold' },
  Telemarketing: { label: 'Telefonla Pazarlama', icon: <EnvelopeIcon className="w-4 h-4" />, color: 'magenta' },
  PublicRelations: { label: 'Halkla İlişkiler', icon: <UserPlusIcon className="w-4 h-4" />, color: 'volcano' },
};

const campaignStatusLabels: Record<string, { label: string; color: string }> = {
  Planned: { label: 'Planlandı', color: 'default' },
  InProgress: { label: 'Devam Ediyor', color: 'processing' },
  Completed: { label: 'Tamamlandı', color: 'success' },
  Aborted: { label: 'İptal Edildi', color: 'error' },
  OnHold: { label: 'Beklemede', color: 'warning' },
};

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const completeCampaign = useCompleteCampaign();
  const abortCampaign = useAbortCampaign();
  const createCampaign = useCreateCampaign();

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchLower = searchText.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower)
    );
  });

  // Handle query parameters for segment integration
  useEffect(() => {
    const createNew = searchParams.get('createNew');
    const targetSegmentId = searchParams.get('targetSegmentId');
    const targetSegmentName = searchParams.get('targetSegmentName');

    if (createNew === 'true' && targetSegmentId) {
      router.push(`/crm/campaigns/new?targetSegmentId=${targetSegmentId}&targetSegmentName=${encodeURIComponent(targetSegmentName || '')}`);
    }
  }, [searchParams, router]);

  const handleDelete = async (id: string, campaign: Campaign) => {
    const confirmed = await confirmDelete('Kampanya', campaign.name);

    if (confirmed) {
      try {
        await deleteCampaign.mutateAsync(id);
        showDeleteSuccess('kampanya');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme işlemi başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'başlatıldı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'tamamlandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleAbort = async (id: string) => {
    try {
      await abortCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'iptal edildi');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
      showError(errorMessage);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/crm/campaigns/${campaign.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/campaigns/new');
  };

  const handleClone = async (campaign: Campaign) => {
    try {
      const clonedData = {
        name: `${campaign.name} (Kopya)`,
        description: campaign.description,
        type: campaign.type,
        status: 'Planned' as const,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        budgetedCost: campaign.budgetedCost,
        targetLeads: campaign.targetLeads,
      };
      await createCampaign.mutateAsync(clonedData as any);
      showCreateSuccess('kampanya', 'başarıyla kopyalandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama işlemi başarısız';
      showError(errorMessage);
    }
  };

  const columns: ColumnsType<Campaign> = [
    {
      title: 'Kampanya',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const typeConfig = campaignTypeLabels[record.type] || { icon: <TrophyOutlined />, color: 'blue' };
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `#3b82f615` }}
            >
              <span style={{ color: '#3b82f6' }}>{typeConfig.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{text}</div>
              {record.description && (
                <div className="text-xs text-slate-500 truncate">{record.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => {
        const config = campaignTypeLabels[type] || { label: type, icon: null, color: 'default' };
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const config = campaignStatusLabels[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Tarih Aralığı',
      key: 'dateRange',
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-slate-900">{new Date(record.startDate).toLocaleDateString('tr-TR')}</div>
          <div className="text-slate-500">{new Date(record.endDate).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: 'Performans',
      key: 'performance',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-600 mb-1">
            Leads: {record.actualLeads}/{record.targetLeads}
          </div>
          <Progress
            percent={record.targetLeads > 0 ? Math.round((record.actualLeads / record.targetLeads) * 100) : 0}
            size="small"
            status={record.conversionRate > 15 ? 'success' : record.conversionRate > 5 ? 'normal' : 'exception'}
          />
          <div className="text-xs text-slate-500 mt-1">Dönüşüm: %{record.conversionRate.toFixed(1)}</div>
        </div>
      ),
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 120,
      align: 'right',
      render: (roi) => (
        <div className="flex items-center justify-end gap-1">
          {roi > 0 ? (
            <ArrowUpIcon className="w-3 h-3 text-emerald-500" />
          ) : roi < 0 ? (
            <ArrowDownIcon className="w-3 h-3 text-red-500" />
          ) : null}
          <Tag color={roi > 0 ? 'success' : roi < 0 ? 'error' : 'default'}>
            {roi > 0 ? '+' : ''}
            {roi.toFixed(1)}%
          </Tag>
        </div>
      ),
    },
    {
      title: 'Bütçe',
      key: 'budget',
      width: 180,
      render: (_, record) => {
        const budgetPercent = record.budgetedCost > 0
          ? Math.round((record.actualCost / record.budgetedCost) * 100)
          : 0;
        const isOverBudget = record.actualCost > record.budgetedCost;

        return (
          <div>
            <div className="text-xs mb-1 flex justify-between">
              <span className="text-slate-900">₺{record.actualCost.toLocaleString('tr-TR')}</span>
              <span className="text-slate-500">/ ₺{record.budgetedCost.toLocaleString('tr-TR')}</span>
            </div>
            <Progress
              percent={budgetPercent}
              size="small"
              status={isOverBudget ? 'exception' : budgetPercent > 80 ? 'normal' : 'active'}
              strokeColor={isOverBudget ? '#ef4444' : budgetPercent > 80 ? '#f59e0b' : '#10b981'}
            />
            <div className="text-xs mt-1" style={{ color: isOverBudget ? '#ef4444' : '#64748b' }}>
              {budgetPercent}% Kullanıldı
            </div>
          </div>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right' as const,
      render: (_, record) => {
        const menuItems = [];

        menuItems.push({
          key: 'view',
          label: 'Görüntüle',
          icon: <EyeIcon className="w-4 h-4" />,
          onClick: () => router.push(`/crm/campaigns/${record.id}`),
        });

        if (record.status === 'Planned') {
          menuItems.push({
            key: 'start',
            label: 'Başlat',
            icon: <PlayCircleIcon className="w-4 h-4" />,
            onClick: () => handleStart(record.id),
            disabled: startCampaign.isPending,
          });
        }

        if (record.status === 'InProgress') {
          menuItems.push({
            key: 'complete',
            label: 'Tamamla',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            onClick: () => handleComplete(record.id),
            disabled: completeCampaign.isPending,
          });
        }

        menuItems.push({
          key: 'edit',
          label: 'Düzenle',
          icon: <PencilIcon className="w-4 h-4" />,
          onClick: () => handleEdit(record),
        });

        menuItems.push({
          key: 'clone',
          label: 'Kopyala',
          icon: <DocumentDuplicateIcon className="w-4 h-4" />,
          onClick: () => handleClone(record),
          disabled: createCampaign.isPending,
        });

        if (record.status === 'Planned' || record.status === 'InProgress') {
          menuItems.push({ type: 'divider' as const });
          menuItems.push({
            key: 'abort',
            label: 'İptal Et',
            icon: <XCircleIcon className="w-4 h-4" />,
            danger: true,
            onClick: () => handleAbort(record.id),
            disabled: abortCampaign.isPending,
          });
        }

        menuItems.push({ type: 'divider' as const });
        menuItems.push({
          key: 'delete',
          label: 'Sil',
          icon: <TrashIcon className="w-4 h-4" />,
          danger: true,
          onClick: () => handleDelete(record.id, record),
          disabled: deleteCampaign.isPending,
        });

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <CampaignsStats campaigns={campaigns} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<EnvelopeIcon className="w-5 h-5" />}
        iconColor="#ec4899"
        title="Pazarlama Kampanyaları"
        description="Kampanyalarınızı yönetin ve performansını takip edin"
        itemCount={campaigns.length}
        primaryAction={{
          label: 'Yeni Kampanya',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Kampanya ara... (isim, açıklama)"
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="h-10"
        />
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredCampaigns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kampanya`,
            }}
            scroll={{ x: 1400 }}
            locale={{
              emptyText: (
                <Empty
                  image={<TrophyIcon className="w-12 h-12 text-slate-400" />}
                  imageStyle={{ height: 60 }}
                  description={
                    <div className="py-4">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        Henüz kampanya oluşturulmamış
                      </div>
                      <div className="text-xs text-slate-500 mb-4">
                        Hedef kitlenize ulaşmak için ilk kampanyanızı oluşturun
                      </div>
                      <button
                        onClick={handleCreate}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Kampanya Oluştur
                      </button>
                    </div>
                  }
                />
              ),
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
