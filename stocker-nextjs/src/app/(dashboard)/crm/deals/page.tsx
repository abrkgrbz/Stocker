'use client';

/**
 * Deals List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * Supports both Kanban and List views with drag & drop
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Tag, Tooltip } from 'antd';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PlusIcon,
  Squares2X2Icon,
  TrophyIcon,
  UserIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  showUpdateSuccess,
  showError,
  confirmAction,
  showInfo,
} from '@/lib/utils/sweetalert';
import type { Deal } from '@/lib/api/services/crm.service';
import {
  useDeals,
  useCloseDealWon,
  useCloseDealLost,
  usePipelines,
  useMoveDealStage,
} from '@/lib/api/hooks/useCRM';
import { DealsStats } from '@/components/crm/deals/DealsStats';
import dayjs from 'dayjs';
import {
  PageContainer,
  ListPageHeader,
  Card,
} from '@/components/patterns';
import { Spinner } from '@/components/primitives';

// Status colors
const statusColors: Record<Deal['status'], string> = {
  Open: 'blue',
  Won: 'green',
  Lost: 'red',
};

// Draggable Deal Card Component
const DraggableDealCard = ({
  deal,
  onNavigate,
  onCloseWon,
  onCloseLost,
  isDragging,
}: {
  deal: Deal;
  onNavigate: (id: string) => void;
  onCloseWon: (deal: Deal) => void;
  onCloseLost: (deal: Deal) => void;
  isDragging?: boolean;
}) => {
  const isWon = deal.status === 'Won';
  const isLost = deal.status === 'Lost';
  const canDrag = deal.status === 'Open';

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id,
    disabled: !canDrag,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-3 bg-white border rounded-lg p-3 hover:shadow-md transition-all ${
        isWon
          ? 'border-emerald-400 bg-emerald-50'
          : isLost
          ? 'border-red-400 bg-red-50 opacity-75'
          : 'border-slate-200 hover:border-slate-300'
      } ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      {/* Drag Handle + Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {canDrag && (
            <div
              {...attributes}
              {...listeners}
              className="p-1 -ml-1 text-slate-400 hover:text-slate-600 cursor-grab"
            >
              <Bars3Icon className="w-4 h-4" />
            </div>
          )}
          {isLost && <NoSymbolIcon className="w-3 h-3 text-red-500" />}
          {isWon && <TrophyIcon className="w-3 h-3 text-emerald-500" />}
          <span
            className="text-sm font-medium text-slate-900 truncate cursor-pointer hover:text-blue-600"
            onClick={() => onNavigate(deal.id)}
          >
            {deal.title}
          </span>
        </div>
        <Tag color={statusColors[deal.status]} className="ml-2 text-xs">
          {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? '🎉 Kazanıldı' : '❌ Kaybedildi'}
        </Tag>
      </div>

      {/* Customer */}
      {deal.customerName && (
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <UserIcon className="w-3 h-3 text-slate-400" />
          <span>{deal.customerName}</span>
        </div>
      )}

      {/* Amount */}
      <div className="text-xl font-bold text-slate-900 mb-2">
        ₺{deal.amount.toLocaleString('tr-TR')}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
        <Tooltip title="Kazanma Olasılığı">
          <span className="font-medium">{deal.probability}%</span>
        </Tooltip>
        {deal.expectedCloseDate && (
          <Tooltip title="Tahmini Kapanış">
            <span>{dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}</span>
          </Tooltip>
        )}
      </div>

      {/* Actions - Only for Open deals */}
      {deal.status === 'Open' && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseWon(deal);
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircleIcon className="w-3 h-3" />
            Kazanıldı
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseLost(deal);
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
          >
            <NoSymbolIcon className="w-3 h-3" />
            Kaybedildi
          </button>
        </div>
      )}

      {/* Status Message for Won Deals */}
      {isWon && (
        <div className="text-center text-emerald-600 font-medium text-xs pt-2 flex items-center justify-center gap-1">
          <TrophyIcon className="w-3 h-3" /> Başarıyla tamamlandı!
        </div>
      )}
    </div>
  );
};

// Droppable Stage Column
const DroppableColumn = ({
  id,
  children,
  isOver,
}: {
  id: string;
  children: React.ReactNode;
  isOver?: boolean;
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-3 max-h-[600px] overflow-y-auto transition-colors ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default function DealsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // API Hooks
  const { data, isLoading, refetch } = useDeals({});
  const { data: pipelines = [] } = usePipelines();
  const closeDealWon = useCloseDealWon();
  const closeDealLost = useCloseDealLost();
  const moveDealStage = useMoveDealStage();

  // Handle both response formats: array or { items: [] }
  const deals = Array.isArray(data) ? data : (data?.items || []);

  // Get default pipeline's stages for kanban/list view
  const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
  const stages = defaultPipeline?.stages || [];

  // Calculate statistics
  const stats = {
    total: deals.filter((d) => d.status === 'Open').length,
    totalAmount: deals.filter((d) => d.status === 'Open').reduce((sum, d) => sum + d.amount, 0),
    won: deals.filter((d) => d.status === 'Won').length,
    wonAmount: deals.filter((d) => d.status === 'Won').reduce((sum, d) => sum + d.amount, 0),
  };

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleCreate = () => {
    router.push('/crm/deals/new');
  };

  const handleNavigate = (id: string) => {
    router.push(`/crm/deals/${id}`);
  };

  const handleCloseWon = async (deal: Deal) => {
    const confirmed = await confirmAction(
      'Fırsatı Kazanıldı Olarak İşaretle',
      `"${deal.title}" fırsatını kazanıldı olarak işaretlemek istediğinizden emin misiniz?`,
      'Kazanıldı İşaretle'
    );

    if (confirmed) {
      try {
        await closeDealWon.mutateAsync({
          id: deal.id.toString(),
          actualAmount: deal.amount,
          closedDate: new Date().toISOString(),
        });
        showUpdateSuccess('fırsat', '🎉 kazanıldı olarak işaretlendi!');
        await refetch();
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleCloseLost = async (deal: Deal) => {
    const confirmed = await confirmAction(
      'Fırsatı Kaybedildi Olarak İşaretle',
      `"${deal.title}" fırsatını kaybedildi olarak işaretlemek istediğinizden emin misiniz?`,
      'Kaybedildi İşaretle'
    );

    if (confirmed) {
      try {
        await closeDealLost.mutateAsync({
          id: deal.id.toString(),
          lostReason: 'Kullanıcı tarafından kapatıldı',
          closedDate: new Date().toISOString(),
        });
        showInfo('Fırsat İşaretlendi', 'Fırsat kaybedildi olarak işaretlendi');
        await refetch();
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDealId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDealId(null);
      setOverId(null);

      if (!over) return;

      const dealId = active.id as string;
      const newStageId = over.id as string;

      // Find the deal
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) return;

      // Check if it's the same stage
      if (deal.stageId === newStageId) return;

      // Find the new stage to verify it's valid
      const newStage = stages.find((s) => s.id === newStageId);
      if (!newStage) return;

      try {
        await moveDealStage.mutateAsync({
          id: dealId,
          newStageId: newStageId,
        });
        showUpdateSuccess('fırsat', `"${newStage.name}" aşamasına taşındı`);
        await refetch();
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Aşama değiştirilemedi';
        showError(errorMessage);
      }
    },
    [deals, stages, moveDealStage, refetch]
  );

  // Filter deals based on search
  const filteredDeals = deals.filter((deal) => {
    const searchLower = searchText.toLowerCase();
    return deal.title.toLowerCase().includes(searchLower) || deal.description?.toLowerCase().includes(searchLower) || '';
  });

  // Group deals by stage for Kanban view
  const dealsByStage = stages.reduce(
    (acc, stage) => {
      const isWonStage = stage.name.toLowerCase().includes('kazanıldı') || stage.name.toLowerCase().includes('kazanildi');
      if (isWonStage) {
        acc[stage.id] = filteredDeals.filter((d) =>
          (d.stageId === stage.id && d.status === 'Open') || d.status === 'Won'
        );
      } else {
        acc[stage.id] = filteredDeals.filter((d) => d.stageId === stage.id && d.status === 'Open');
      }
      return acc;
    },
    {} as Record<string, Deal[]>
  );

  // Get deals without a stage
  const dealsWithoutStage = filteredDeals.filter((d) => !d.stageId && d.status === 'Open');

  // Get lost deals
  const lostDeals = filteredDeals.filter((d) => d.status === 'Lost');
  const lostAmount = lostDeals.reduce((sum, d) => sum + d.amount, 0);

  // Get active deal for drag overlay
  const activeDeal = activeDealId ? deals.find((d) => d.id === activeDealId) : null;

  // Kanban View with Drag & Drop
  const KanbanView = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = dealsByStage[stage.id] || [];
          const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
          const isOverThis = overId === stage.id;

          return (
            <div key={stage.id} className="flex-shrink-0" style={{ width: 300 }}>
              <div
                className={`bg-white border rounded-lg h-full transition-colors ${
                  isOverThis ? 'border-blue-400 border-2' : 'border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-medium text-slate-900">{stage.name}</span>
                    <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ₺{stageAmount.toLocaleString('tr-TR')}
                  </div>
                </div>
                {/* Column Body - Droppable */}
                <DroppableColumn id={stage.id} isOver={isOverThis}>
                  {stageDeals.map((deal) => (
                    <DraggableDealCard
                      key={deal.id}
                      deal={deal}
                      onNavigate={handleNavigate}
                      onCloseWon={handleCloseWon}
                      onCloseLost={handleCloseLost}
                      isDragging={activeDealId === deal.id}
                    />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-sm">
                      {isOverThis ? 'Buraya bırakın' : 'Fırsat yok'}
                    </div>
                  )}
                </DroppableColumn>
              </div>
            </div>
          );
        })}

        {/* No Stage Column */}
        {dealsWithoutStage.length > 0 && (
          <div className="flex-shrink-0" style={{ width: 300 }}>
            <div className="bg-white border border-slate-200 rounded-lg h-full">
              <div className="p-3 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Aşamasız</span>
                  <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                    {dealsWithoutStage.length}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  ₺{dealsWithoutStage.reduce((sum, d) => sum + d.amount, 0).toLocaleString('tr-TR')}
                </div>
              </div>
              <div className="p-3 max-h-[600px] overflow-y-auto">
                {dealsWithoutStage.map((deal) => (
                  <DraggableDealCard
                    key={deal.id}
                    deal={deal}
                    onNavigate={handleNavigate}
                    onCloseWon={handleCloseWon}
                    onCloseLost={handleCloseLost}
                    isDragging={activeDealId === deal.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lost Column - Not droppable */}
        <div className="flex-shrink-0" style={{ width: 300 }}>
          <div className="bg-white border-2 border-red-300 rounded-lg h-full">
            <div className="p-3 border-b border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-1">
                <NoSymbolIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-slate-900">❌ Kaybedildi</span>
                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded">
                  {lostDeals.length}
                </span>
              </div>
              <div className="text-xs text-red-600">
                ₺{lostAmount.toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="p-3 max-h-[600px] overflow-y-auto bg-red-50/50">
              {lostDeals.map((deal) => (
                <DraggableDealCard
                  key={deal.id}
                  deal={deal}
                  onNavigate={handleNavigate}
                  onCloseWon={handleCloseWon}
                  onCloseLost={handleCloseLost}
                />
              ))}
              {lostDeals.length === 0 && (
                <div className="text-center text-slate-400 py-8 text-sm">Kaybedilen fırsat yok</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDeal ? (
          <div className="mb-3 bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl rotate-2 opacity-90">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-slate-900 truncate">{activeDeal.title}</span>
              <Tag color={statusColors[activeDeal.status]} className="ml-2 text-xs">
                Açık
              </Tag>
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₺{activeDeal.amount.toLocaleString('tr-TR')}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  // List View
  const ListView = () => (
    <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
      {filteredDeals.map((deal) => {
        const isWon = deal.status === 'Won';
        const isLost = deal.status === 'Lost';
        const stage = stages.find((s) => s.id === deal.stageId);

        return (
          <div
            key={deal.id}
            onClick={() => router.push(`/crm/deals/${deal.id}`)}
            className={`flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
              isWon ? 'bg-emerald-50' : isLost ? 'bg-red-50 opacity-75' : ''
            }`}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isWon ? 'bg-emerald-100' : isLost ? 'bg-red-100' : 'bg-amber-100'
                }`}
              >
                {isLost ? (
                  <NoSymbolIcon className="w-5 h-5 text-red-500" />
                ) : isWon ? (
                  <TrophyIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrophyIcon className="w-5 h-5 text-amber-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">{deal.title}</span>
                  {stage && (
                    <Tag color={stage.color} className="text-xs">
                      {stage.name}
                    </Tag>
                  )}
                  <Tag color={statusColors[deal.status as Deal['status']]} className="text-xs">
                    {deal.status === 'Open' ? 'Açık' : deal.status === 'Won' ? '🎉 Kazanıldı' : '❌ Kaybedildi'}
                  </Tag>
                </div>
                {deal.customerName && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>{deal.customerName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount & Meta */}
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900">
                ₺{deal.amount.toLocaleString('tr-TR')}
              </div>
              <div className="text-xs text-slate-500">{deal.probability}% olasılık</div>
              {deal.expectedCloseDate && (
                <div className="text-xs text-slate-500">
                  {dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {filteredDeals.length === 0 && (
        <div className="text-center text-slate-400 py-12 text-sm">Fırsat bulunamadı</div>
      )}
    </div>
  );

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <DealsStats
          totalDeals={stats.total}
          totalAmount={stats.totalAmount}
          wonDeals={stats.won}
          wonAmount={stats.wonAmount}
          loading={isLoading}
        />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TrophyIcon className="w-5 h-5" />}
        iconColor="#f59e0b"
        title="Fırsatlar"
        description="Satış fırsatlarınızı yönetin ve takip edin • Kartları sürükleyerek aşama değiştirin"
        itemCount={deals.length}
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
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
                Liste
              </button>
            </div>
            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Fırsat ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="h-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <ListView />
      )}
    </PageContainer>
  );
}
