'use client';

import { ProtectedRoute } from '@/components/auth';

/**
 * Campaigns List Page
 * Monochrome design system following inventory/HR patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown, Spin, Progress } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  PlayCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
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
import {
  showCreateSuccess,
  showDeleteSuccess,
  showUpdateSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

// Monochrome campaign type configuration
const campaignTypeConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Email: { color: '#1e293b', bgColor: '#e2e8f0', label: 'E-posta' },
  SocialMedia: { color: '#334155', bgColor: '#f1f5f9', label: 'Sosyal Medya' },
  Webinar: { color: '#475569', bgColor: '#e2e8f0', label: 'Webinar' },
  Event: { color: '#64748b', bgColor: '#f1f5f9', label: 'Etkinlik' },
  Conference: { color: '#334155', bgColor: '#e2e8f0', label: 'Konferans' },
  Advertisement: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Reklam' },
  Banner: { color: '#475569', bgColor: '#f1f5f9', label: 'Banner' },
  Telemarketing: { color: '#64748b', bgColor: '#e2e8f0', label: 'Telefonla Pazarlama' },
  PublicRelations: { color: '#334155', bgColor: '#f1f5f9', label: 'Halkla Iliskiler' },
};

// Monochrome campaign status configuration
const campaignStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Planned: { color: '#64748b', bgColor: '#f1f5f9', label: 'Planlandi' },
  InProgress: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Devam Ediyor' },
  Completed: { color: '#334155', bgColor: '#cbd5e1', label: 'Tamamlandi' },
  Aborted: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Iptal Edildi' },
  OnHold: { color: '#475569', bgColor: '#e2e8f0', label: 'Beklemede' },
};

function CampaignsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const startCampaign = useStartCampaign();
  const completeCampaign = useCompleteCampaign();
  const abortCampaign = useAbortCampaign();
  const createCampaign = useCreateCampaign();

  // Handle query parameters for segment integration
  useEffect(() => {
    const createNew = searchParams.get('createNew');
    const targetSegmentId = searchParams.get('targetSegmentId');
    const targetSegmentName = searchParams.get('targetSegmentName');

    if (createNew === 'true' && targetSegmentId) {
      router.push(`/crm/campaigns/new?targetSegmentId=${targetSegmentId}&targetSegmentName=${encodeURIComponent(targetSegmentName || '')}`);
    }
  }, [searchParams, router]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch ||
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.description?.toLowerCase().includes(searchLower);
      const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
      const matchesType = !selectedType || campaign.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaigns, debouncedSearch, selectedStatus, selectedType]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === 'InProgress').length;
    const completed = campaigns.filter((c) => c.status === 'Completed').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetedCost || 0), 0);
    return { total, active, completed, totalBudget };
  }, [campaigns]);

  // CRUD Handlers
  const handleView = (id: string) => {
    router.push(`/crm/campaigns/${id}`);
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/crm/campaigns/${campaign.id}/edit`);
  };

  const handleDelete = async (id: string, campaign: Campaign) => {
    const confirmed = await confirmDelete('Kampanya', campaign.name);
    if (confirmed) {
      try {
        await deleteCampaign.mutateAsync(id);
        showDeleteSuccess('kampanya');
      } catch (error: any) {
        showError(error.response?.data?.detail || 'Silme islemi basarisiz');
      }
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'baslatildi');
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Islem basarisiz');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'tamamlandi');
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Islem basarisiz');
    }
  };

  const handleAbort = async (id: string) => {
    try {
      await abortCampaign.mutateAsync(id);
      showUpdateSuccess('kampanya', 'iptal edildi');
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Islem basarisiz');
    }
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
      showCreateSuccess('kampanya', 'basariyla kopyalandi');
    } catch (error: any) {
      showError(error.response?.data?.detail || 'Kopyalama islemi basarisiz');
    }
  };

  const handleCreate = () => {
    router.push('/crm/campaigns/new');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setSelectedType(undefined);
  };

  // Table columns
  const columns: ColumnsType<Campaign> = [
    {
      title: 'Kampanya',
      key: 'campaign',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.name}
          </span>
          {record.description && (
            <div className="text-xs text-slate-500 truncate max-w-[240px]">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => {
        const config = campaignTypeConfig[type] || { color: '#64748b', bgColor: '#f1f5f9', label: type };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const config = campaignStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tarih Araligi',
      key: 'dateRange',
      width: 150,
      render: (_, record) => (
        <div className="text-xs text-slate-600">
          <div>{new Date(record.startDate).toLocaleDateString('tr-TR')}</div>
          <div className="text-slate-400">{new Date(record.endDate).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: 'Performans',
      key: 'performance',
      width: 160,
      render: (_, record) => {
        const percent = record.targetLeads > 0 ? Math.round((record.actualLeads / record.targetLeads) * 100) : 0;
        return (
          <div>
            <div className="text-xs text-slate-600 mb-1">
              {record.actualLeads}/{record.targetLeads} Lead
            </div>
            <Progress
              percent={percent}
              size="small"
              strokeColor="#475569"
              trailColor="#e2e8f0"
              showInfo={false}
            />
          </div>
        );
      },
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      width: 100,
      align: 'right',
      render: (roi) => (
        <div className="flex items-center justify-end gap-1">
          {roi > 0 ? (
            <ArrowUpIcon className="w-3 h-3 text-slate-700" />
          ) : roi < 0 ? (
            <ArrowDownIcon className="w-3 h-3 text-slate-500" />
          ) : null}
          <span className={`font-medium ${roi > 0 ? 'text-slate-900' : roi < 0 ? 'text-slate-500' : 'text-slate-600'}`}>
            {roi > 0 ? '+' : ''}{(roi || 0).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      title: 'Butce',
      key: 'budget',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <div className="text-right">
          <div className="font-semibold text-slate-900">
            ₺{(record.actualCost || 0).toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-slate-500">
            / ₺{(record.budgetedCost || 0).toLocaleString('tr-TR')}
          </div>
        </div>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record),
          },
          {
            key: 'clone',
            icon: <DocumentDuplicateIcon className="w-4 h-4" />,
            label: 'Kopyala',
            onClick: () => handleClone(record),
          },
          { type: 'divider' as const },
          ...(record.status === 'Planned' ? [
            {
              key: 'start',
              icon: <PlayCircleIcon className="w-4 h-4" />,
              label: 'Baslat',
              onClick: () => handleStart(record.id),
            },
          ] : []),
          ...(record.status === 'InProgress' ? [
            {
              key: 'complete',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Tamamla',
              onClick: () => handleComplete(record.id),
            },
          ] : []),
          ...(['Planned', 'InProgress'].includes(record.status) ? [
            {
              key: 'abort',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Iptal Et',
              danger: true,
              onClick: () => handleAbort(record.id),
            },
          ] : []),
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record.id, record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <MegaphoneIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pazarlama Kampanyalari</h1>
            <p className="text-sm text-slate-500">Kampanyalarinizi yonetin ve performansini takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isLoading}
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
            Yeni Kampanya
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <MegaphoneIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Kampanya</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Kampanya</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlanan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₺{stats.totalBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Butce</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kampanya ara... (isim, aciklama)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(campaignStatusConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Tip"
            allowClear
            style={{ width: 180 }}
            value={selectedType}
            onChange={setSelectedType}
            options={Object.entries(campaignTypeConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredCampaigns.length} kampanya listeleniyor
        </div>

        <Table
          columns={columns}
          dataSource={filteredCampaigns}
          rowKey="id"
          loading={isLoading || deleteCampaign.isPending}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredCampaigns.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kampanya`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}


export default function CampaignsPage() {
  return (
    <ProtectedRoute permission="CRM.Campaigns:View">
      <CampaignsPageContent />
    </ProtectedRoute>
  );
}
