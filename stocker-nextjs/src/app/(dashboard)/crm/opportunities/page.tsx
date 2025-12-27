'use client';

/**
 * Opportunities List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, Tag, Progress, Space, Button, Modal, message, Input } from 'antd';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  StopCircleIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useOpportunities,
  useWinOpportunity,
  useLoseOpportunity,
  usePipelines,
} from '@/lib/api/hooks/useCRM';
import type { OpportunityDto, OpportunityStatus } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
} from '@/components/ui/enterprise-page';

// Opportunity status configuration
const statusConfig: Record<OpportunityStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Prospecting: { color: 'blue', label: 'Araştırma', icon: <ChartBarIcon className="w-4 h-4" /> },
  Qualification: { color: 'cyan', label: 'Nitelendirme', icon: <CheckCircleIcon className="w-4 h-4" /> },
  NeedsAnalysis: { color: 'geekblue', label: 'İhtiyaç Analizi', icon: <ChartBarIcon className="w-4 h-4" /> },
  Proposal: { color: 'purple', label: 'Teklif', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  Negotiation: { color: 'orange', label: 'Müzakere', icon: <ArrowTrendingUpIcon className="w-4 h-4" /> },
  ClosedWon: { color: 'green', label: 'Kazanıldı', icon: <TrophyIcon className="w-4 h-4" /> },
  ClosedLost: { color: 'red', label: 'Kaybedildi', icon: <StopCircleIcon className="w-4 h-4" /> },
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data, isLoading, refetch } = useOpportunities();
  const { data: pipelines = [] } = usePipelines();
  const winOpportunity = useWinOpportunity();
  const loseOpportunity = useLoseOpportunity();

  const opportunities = data?.items || [];

  // Filter opportunities by search text
  const filteredOpportunities = searchText
    ? opportunities.filter((o: OpportunityDto) =>
        o.name.toLowerCase().includes(searchText.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchText.toLowerCase())
      )
    : opportunities;

  // Get default pipeline's stages for kanban view
  const defaultPipeline = pipelines.find((p: any) => p.isDefault) || pipelines[0];
  const stages = defaultPipeline?.stages || [];

  // Calculate statistics
  const stats = {
    total: filteredOpportunities.length,
    totalValue: filteredOpportunities.reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0),
    avgProbability: filteredOpportunities.length > 0
      ? filteredOpportunities.reduce((sum: number, o: OpportunityDto) => sum + o.probability, 0) / filteredOpportunities.length
      : 0,
    won: filteredOpportunities.filter((o: OpportunityDto) => o.status === 'ClosedWon').length,
    wonValue: filteredOpportunities.filter((o: OpportunityDto) => o.status === 'ClosedWon').reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0),
    active: filteredOpportunities.filter((o: OpportunityDto) => o.status !== 'ClosedWon' && o.status !== 'ClosedLost').length,
  };

  const handleCreate = () => {
    router.push('/crm/opportunities/new');
  };

  const handleWin = async (opportunity: OpportunityDto) => {
    Modal.confirm({
      title: 'Fırsatı Kazanıldı Olarak İşaretle',
      content: `"${opportunity.name}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kazanıldı İşaretle',
      okType: 'primary',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await winOpportunity.mutateAsync({
            id: opportunity.id,
            actualAmount: opportunity.amount,
            closedDate: new Date().toISOString(),
          });
          message.success('🎉 Fırsat kazanıldı!');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleLose = async (opportunity: OpportunityDto) => {
    Modal.confirm({
      title: 'Fırsatı Kaybedildi Olarak İşaretle',
      content: `"${opportunity.name}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      okText: 'Kaybedildi İşaretle',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await loseOpportunity.mutateAsync({
            id: opportunity.id,
            lostReason: 'Kullanıcı tarafından kapatıldı',
            closedDate: new Date().toISOString(),
          });
          message.info('Fırsat kaybedildi olarak işaretlendi');
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || 'İşlem başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  // OpportunityCard Component
  const OpportunityCard = ({ opportunity }: { opportunity: OpportunityDto }) => {
    const config = statusConfig[opportunity.status];
    const isActive = opportunity.status !== 'ClosedWon' && opportunity.status !== 'ClosedLost';

    return (
      <div
        className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(`/crm/opportunities/${opportunity.id}`)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="font-medium text-slate-900 text-base mb-1">
              {opportunity.name}
            </div>
            {opportunity.description && (
              <div className="text-xs text-slate-500 mb-2">
                {opportunity.description}
              </div>
            )}
          </div>
          <Tag color={config.color} className="ml-2">
            {config.icon} {config.label}
          </Tag>
        </div>

        <div className="mb-3">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            ₺{opportunity.amount.toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Olasılık:</span>
            <Progress
              percent={opportunity.probability}
              size="small"
              className="flex-1"
              strokeColor={{
                '0%': '#3b82f6',
                '100%': '#10b981',
              }}
            />
          </div>
        </div>

        {opportunity.customerName && (
          <div className="mb-2 text-xs text-slate-600 flex items-center gap-1">
            <UserIcon className="w-4 h-4" className="text-slate-400" />
            <span>{opportunity.customerName}</span>
          </div>
        )}

        {opportunity.expectedCloseDate && (
          <div className="mb-3 text-xs text-slate-500">
            📅 Tahmini Kapanış: {dayjs(opportunity.expectedCloseDate).format('DD MMMM YYYY')}
          </div>
        )}

        {isActive && (
          <Space size="small" className="w-full">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleWin(opportunity);
              }}
              block
            >
              Kazanıldı
            </Button>
            <Button
              danger
              size="small"
              icon={<StopCircleIcon className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleLose(opportunity);
              }}
              block
            >
              Kaybedildi
            </Button>
          </Space>
        )}
      </div>
    );
  };

  // Group opportunities by status
  const opportunitiesByStatus = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status as OpportunityStatus] = filteredOpportunities.filter(
      (o: OpportunityDto) => o.status === status
    );
    return acc;
  }, {} as Record<OpportunityStatus, OpportunityDto[]>);

  // Group opportunities by stage for Kanban view (active opportunities only)
  const activeOpportunities = filteredOpportunities.filter(
    (o: OpportunityDto) => o.status !== 'ClosedWon' && o.status !== 'ClosedLost'
  );

  const opportunitiesByStage = stages.reduce((acc: Record<string, OpportunityDto[]>, stage: any) => {
    acc[stage.id] = activeOpportunities.filter((o: OpportunityDto) => o.stageId === stage.id);
    return acc;
  }, {} as Record<string, OpportunityDto[]>);

  // Get closed opportunities for special columns
  const wonOpportunities = filteredOpportunities.filter((o: OpportunityDto) => o.status === 'ClosedWon');
  const lostOpportunities = filteredOpportunities.filter((o: OpportunityDto) => o.status === 'ClosedLost');

  // Stats Component
  const OpportunitiesStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Toplam Fırsat</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg">
            <ChartBarIcon className="w-4 h-4" className="text-2xl text-slate-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Toplam Değer</div>
            <div className="text-2xl font-bold text-emerald-600">₺{stats.totalValue.toLocaleString('tr-TR')}</div>
          </div>
          <div className="p-3 bg-emerald-100 rounded-lg">
            <CurrencyDollarIcon className="w-4 h-4" className="text-2xl text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Kazanılan</div>
            <div className="text-2xl font-bold text-green-600">{stats.won}</div>
            <div className="text-xs text-slate-500 mt-1">₺{stats.wonValue.toLocaleString('tr-TR')}</div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <TrophyIcon className="w-4 h-4" className="text-2xl text-green-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm font-medium mb-1">Ortalama Olasılık</div>
            <div className="text-2xl font-bold text-blue-600">{stats.avgProbability.toFixed(0)}%</div>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <ArrowTrendingUpIcon className="w-4 h-4" className="text-2xl text-blue-600" />
          </div>
        </div>
      </Card>
    </div>
  );

  // Kanban View Component
  const KanbanView = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage: any) => {
        const stageOpps = opportunitiesByStage[stage.id] || [];
        const stageAmount = stageOpps.reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0);

        return (
          <div key={stage.id} className="flex-shrink-0" style={{ width: 320 }}>
            <div className="bg-white border border-slate-200 rounded-lg h-full">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium text-slate-900">{stage.name}</span>
                  <Tag className="ml-auto">{stageOpps.length}</Tag>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  ₺{stageAmount.toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="p-3 space-y-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {stageOpps.map((opportunity: OpportunityDto) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
                {stageOpps.length === 0 && (
                  <div className="text-center text-slate-400 py-8">Fırsat yok</div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Won Column */}
      <div className="flex-shrink-0" style={{ width: 320 }}>
        <div className="bg-white border-2 border-green-400 rounded-lg h-full">
          <div className="p-4 border-b border-green-200 bg-green-50">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-4 h-4" className="text-green-500" />
              <span className="font-medium text-slate-900">Kazanıldı</span>
              <Tag color="green" className="ml-auto">{wonOpportunities.length}</Tag>
            </div>
            <div className="text-sm text-green-600 font-medium mt-1">
              ₺{wonOpportunities.reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0).toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="p-3 space-y-3 bg-green-50/50" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {wonOpportunities.map((opportunity: OpportunityDto) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
            {wonOpportunities.length === 0 && (
              <div className="text-center text-slate-400 py-8">Kazanılan fırsat yok</div>
            )}
          </div>
        </div>
      </div>

      {/* Lost Column */}
      <div className="flex-shrink-0" style={{ width: 320 }}>
        <div className="bg-white border-2 border-red-400 rounded-lg h-full">
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <StopCircleIcon className="w-4 h-4" className="text-red-500" />
              <span className="font-medium text-slate-900">Kaybedildi</span>
              <Tag color="red" className="ml-auto">{lostOpportunities.length}</Tag>
            </div>
            <div className="text-sm text-red-600 font-medium mt-1">
              ₺{lostOpportunities.reduce((sum: number, o: OpportunityDto) => sum + o.amount, 0).toLocaleString('tr-TR')}
            </div>
          </div>
          <div className="p-3 space-y-3 bg-red-50/50" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {lostOpportunities.map((opportunity: OpportunityDto) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
            {lostOpportunities.length === 0 && (
              <div className="text-center text-slate-400 py-8">Kaybedilen fırsat yok</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Grid View Component (existing status-based grouping)
  const GridView = () => (
    <div className="space-y-6">
      {Object.entries(opportunitiesByStatus).map(([status, opps]) => {
        if (opps.length === 0) return null;
        const config = statusConfig[status as OpportunityStatus];

        return (
          <div key={status}>
            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span className="font-medium text-slate-900">{config.label}</span>
                  <Tag color={config.color}>{opps.length}</Tag>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {opps.map((opportunity: OpportunityDto) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <OpportunitiesStats />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CurrencyDollarIcon className="w-4 h-4" />}
        iconColor="#0f172a"
        title="Fırsatlar"
        description="Satış fırsatlarınızı yönetin ve takip edin"
        itemCount={filteredOpportunities.length}
        primaryAction={{
          label: 'Yeni Fırsat',
          onClick: handleCreate,
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" className="mr-1" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" className="mr-1" />
                Grid
              </button>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Fırsat ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4" className="text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="max-w-md"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-slate-400 text-5xl mb-4">
              <ChartBarIcon className="w-4 h-4" />
            </div>
            <div className="text-slate-500 mb-4">
              {searchText ? 'Aramanızla eşleşen fırsat bulunamadı' : 'Henüz fırsat yok'}
            </div>
            {!searchText && (
              <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={handleCreate}>
                İlk Fırsatı Oluştur
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <GridView />
      )}
    </PageContainer>
  );
}
