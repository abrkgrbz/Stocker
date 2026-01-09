'use client';

/**
 * Deals List Page
 * Monochrome design system with Kanban and List views
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Button, Dropdown, Tooltip, Checkbox, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
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
  XMarkIcon,
  ChevronDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
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
  useDeleteDeal,
} from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

// Monochrome deal status configuration
const dealStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Open: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Acik' },
  Won: { color: '#334155', bgColor: '#cbd5e1', label: 'Kazanildi' },
  Lost: { color: '#64748b', bgColor: '#f1f5f9', label: 'Kaybedildi' },
};

// Types for drag & drop components
interface DraggableDealCardProps {
  deal: Deal;
  onNavigate: (id: string) => void;
  onCloseWon: (deal: Deal) => void;
  onCloseLost: (deal: Deal) => void;
  isDragging?: boolean;
}

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  isOver?: boolean;
}

// Draggable Deal Card Component
function DraggableDealCard({
  deal,
  onNavigate,
  onCloseWon,
  onCloseLost,
  isDragging,
}: DraggableDealCardProps) {
  const isWon = deal.status === 'Won';
  const isLost = deal.status === 'Lost';
  const canDrag = deal.status === 'Open';

  const { attributes, listeners, setNodeRef, transform, isDragging: isCurrentlyDragging } = useDraggable({
    id: deal.id,
    disabled: !canDrag,
    data: { deal, type: 'deal' },
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging || isCurrentlyDragging ? 0.5 : 1,
    zIndex: isCurrentlyDragging ? 1000 : undefined,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-draggable={canDrag}
      className={`mb-3 bg-white border rounded-lg p-3 hover:shadow-md transition-all select-none ${
        isWon ? 'border-slate-400 bg-slate-50' : isLost ? 'border-slate-300 bg-slate-50 opacity-75' : 'border-slate-200 hover:border-slate-300'
      } ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${isCurrentlyDragging ? 'shadow-lg ring-2 ring-slate-400' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {canDrag && (
            <div className="p-1 -ml-1 text-slate-400 hover:text-slate-600">
              <Bars3Icon className="w-4 h-4" />
            </div>
          )}
          {isLost && <NoSymbolIcon className="w-3 h-3 text-slate-500" />}
          {isWon && <TrophyIcon className="w-3 h-3 text-slate-700" />}
          <span
            className="text-sm font-medium text-slate-900 truncate cursor-pointer hover:text-slate-600"
            onClick={(e) => { e.stopPropagation(); onNavigate(deal.id); }}
          >
            {deal.title}
          </span>
        </div>
        <span
          className="ml-2 px-2 py-0.5 text-xs font-medium rounded-md"
          style={{
            backgroundColor: dealStatusConfig[deal.status]?.bgColor || '#f1f5f9',
            color: dealStatusConfig[deal.status]?.color || '#64748b',
          }}
        >
          {dealStatusConfig[deal.status]?.label || deal.status}
        </span>
      </div>

      {deal.customerName && (
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <UserIcon className="w-3 h-3 text-slate-400" />
          <span>{deal.customerName}</span>
        </div>
      )}

      <div className="text-xl font-bold text-slate-900 mb-2">
        ₺{deal.amount.toLocaleString('tr-TR')}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
        <Tooltip title="Kazanma Olasiligi">
          <span className="font-medium">{deal.probability}%</span>
        </Tooltip>
        {deal.expectedCloseDate && (
          <Tooltip title="Tahmini Kapanis">
            <span>{dayjs(deal.expectedCloseDate).format('DD/MM/YYYY')}</span>
          </Tooltip>
        )}
      </div>

      {deal.status === 'Open' && (
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onCloseWon(deal); }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircleIcon className="w-3 h-3" /> Kazanildi
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onCloseLost(deal); }}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <NoSymbolIcon className="w-3 h-3" /> Kaybedildi
          </button>
        </div>
      )}

      {isWon && (
        <div className="text-center text-slate-700 font-medium text-xs pt-2 flex items-center justify-center gap-1">
          <TrophyIcon className="w-3 h-3" /> Basariyla tamamlandi!
        </div>
      )}
    </div>
  );
}

// Droppable Stage Column
function DroppableColumn({ id, children, isOver }: DroppableColumnProps) {
  const { setNodeRef, isOver: isOverCurrent } = useDroppable({
    id,
    data: { type: 'stage', stageId: id },
  });

  const showDropIndicator = isOver || isOverCurrent;

  return (
    <div
      ref={setNodeRef}
      data-droppable={id}
      className={`p-3 min-h-[200px] max-h-[600px] overflow-y-auto transition-all duration-200 ${
        showDropIndicator ? 'bg-slate-100 ring-2 ring-slate-400 ring-inset' : ''
      }`}
    >
      {children}
    </div>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // API Hooks
  const { data, isLoading, refetch } = useDeals({});
  const { data: pipelines = [] } = usePipelines();
  const closeDealWon = useCloseDealWon();
  const closeDealLost = useCloseDealLost();
  const moveDealStage = useMoveDealStage();
  const deleteDeal = useDeleteDeal();

  const deals = Array.isArray(data) ? data : (data?.items || []);
  const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
  const stages = defaultPipeline?.stages || [];

  // Calculate statistics
  const stats = useMemo(() => ({
    total: deals.filter((d) => d.status === 'Open').length,
    totalAmount: deals.filter((d) => d.status === 'Open').reduce((sum, d) => sum + d.amount, 0),
    won: deals.filter((d) => d.status === 'Won').length,
    wonAmount: deals.filter((d) => d.status === 'Won').reduce((sum, d) => sum + d.amount, 0),
  }), [deals]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Selection helpers
  const toggleDealSelection = useCallback((dealId: string) => {
    setSelectedDeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) newSet.delete(dealId);
      else newSet.add(dealId);
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedDeals(new Set()), []);

  const selectedDealsData = useMemo(() => deals.filter((d) => selectedDeals.has(d.id)), [deals, selectedDeals]);
  const selectedAmount = useMemo(() => selectedDealsData.reduce((sum, d) => sum + d.amount, 0), [selectedDealsData]);

  // Bulk Actions
  const handleBulkCloseWon = async () => {
    if (selectedDeals.size === 0) return;
    const confirmed = await confirmAction('Toplu Kazanildi Isaretle', `${selectedDeals.size} firsati kazanildi olarak isaretlemek istediginizden emin misiniz?`, 'Tumunu Kazanildi Isaretle');
    if (confirmed) {
      setBulkActionLoading(true);
      try {
        await Promise.allSettled(selectedDealsData.map((deal) => closeDealWon.mutateAsync({ id: deal.id.toString(), actualAmount: deal.amount, closedDate: new Date().toISOString() })));
        showUpdateSuccess('firsatlar', 'kazanildi olarak isaretlendi');
        clearSelection();
        await refetch();
      } catch { showError('Toplu islem basarisiz oldu'); }
      finally { setBulkActionLoading(false); }
    }
  };

  const handleBulkCloseLost = async () => {
    if (selectedDeals.size === 0) return;
    const confirmed = await confirmAction('Toplu Kaybedildi Isaretle', `${selectedDeals.size} firsati kaybedildi olarak isaretlemek istediginizden emin misiniz?`, 'Tumunu Kaybedildi Isaretle');
    if (confirmed) {
      setBulkActionLoading(true);
      try {
        await Promise.allSettled(selectedDealsData.map((deal) => closeDealLost.mutateAsync({ id: deal.id.toString(), lostReason: 'Toplu islem ile kapatildi', closedDate: new Date().toISOString() })));
        showInfo('Firsatlar Isaretlendi', 'Firsatlar kaybedildi olarak isaretlendi');
        clearSelection();
        await refetch();
      } catch { showError('Toplu islem basarisiz oldu'); }
      finally { setBulkActionLoading(false); }
    }
  };

  const handleCreate = () => router.push('/crm/deals/new');
  const handleNavigate = (id: string) => router.push(`/crm/deals/${id}`);

  const handleCloseWon = async (deal: Deal) => {
    const confirmed = await confirmAction('Firsati Kazanildi Olarak Isaretle', `"${deal.title}" firsatini kazanildi olarak isaretlemek istediginizden emin misiniz?`, 'Kazanildi Isaretle');
    if (confirmed) {
      try {
        await closeDealWon.mutateAsync({ id: deal.id.toString(), actualAmount: deal.amount, closedDate: new Date().toISOString() });
        showUpdateSuccess('firsat', 'kazanildi olarak isaretlendi!');
        await refetch();
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || 'Islem basarisiz';
        showError(errorMessage);
      }
    }
  };

  const handleCloseLost = async (deal: Deal) => {
    const confirmed = await confirmAction('Firsati Kaybedildi Olarak Isaretle', `"${deal.title}" firsatini kaybedildi olarak isaretlemek istediginizden emin misiniz?`, 'Kaybedildi Isaretle');
    if (confirmed) {
      try {
        await closeDealLost.mutateAsync({ id: deal.id.toString(), lostReason: 'Kullanici tarafindan kapatildi', closedDate: new Date().toISOString() });
        showInfo('Firsat Isaretlendi', 'Firsat kaybedildi olarak isaretlendi');
        await refetch();
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || 'Islem basarisiz';
        showError(errorMessage);
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => setActiveDealId(event.active.id as string), []);
  const handleDragOver = useCallback((event: DragOverEvent) => setOverId(event.over?.id as string | null), []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDealId(null);
    setOverId(null);
    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stageId === newStageId) return;

    const newStage = stages.find((s) => s.id === newStageId);
    if (!newStage) return;

    try {
      await moveDealStage.mutateAsync({ id: dealId, newStageId });
      showUpdateSuccess('firsat', `"${newStage.name}" asamasina tasindi`);
    } catch { /* Error handled in hook */ }
  }, [deals, stages, moveDealStage]);

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    const searchLower = searchText.toLowerCase();
    return deal.title.toLowerCase().includes(searchLower) || deal.description?.toLowerCase().includes(searchLower) || '';
  });

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    const isWonStage = stage.name.toLowerCase().includes('kazanildi');
    if (isWonStage) {
      acc[stage.id] = filteredDeals.filter((d) => (d.stageId === stage.id && d.status === 'Open') || d.status === 'Won');
    } else {
      acc[stage.id] = filteredDeals.filter((d) => d.stageId === stage.id && d.status === 'Open');
    }
    return acc;
  }, {} as Record<string, Deal[]>);

  const dealsWithoutStage = filteredDeals.filter((d) => !d.stageId && d.status === 'Open');
  const lostDeals = filteredDeals.filter((d) => d.status === 'Lost');
  const lostAmount = lostDeals.reduce((sum, d) => sum + d.amount, 0);
  const activeDeal = activeDealId ? deals.find((d) => d.id === activeDealId) : null;

  // Collision detection
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const stageCollisions = pointerCollisions.filter((collision) => stages.some((s) => s.id === collision.id));
      if (stageCollisions.length > 0) return stageCollisions;
    }
    return rectIntersection(args);
  }, [stages]);

  // Table columns for list view
  const columns: ColumnsType<Deal> = [
    {
      title: 'Firsat',
      key: 'deal',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600" onClick={() => handleNavigate(record.id)}>
            {record.title}
          </span>
          {record.customerName && <div className="text-xs text-slate-500">{record.customerName}</div>}
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount) => <span className="font-semibold text-slate-900">₺{amount.toLocaleString('tr-TR')}</span>,
    },
    {
      title: 'Olasilik',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      align: 'center',
      render: (prob) => <span className="text-slate-600">{prob}%</span>,
    },
    {
      title: 'Tahmini Kapanis',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
      width: 140,
      render: (date) => <span className="text-slate-600">{date ? dayjs(date).format('DD/MM/YYYY') : '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = dealStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status };
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: config.bgColor, color: config.color }}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button type="text" size="small" icon={<EyeIcon className="w-4 h-4" />} onClick={() => handleNavigate(record.id)} className="text-slate-600" />
          {record.status === 'Open' && (
            <>
              <Button type="text" size="small" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={() => handleCloseWon(record)} className="text-slate-600" />
              <Button type="text" size="small" icon={<NoSymbolIcon className="w-4 h-4" />} onClick={() => handleCloseLost(record)} className="text-slate-600" />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <TrophyIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Firsatlar</h1>
            <p className="text-sm text-slate-500">Satis firsatlarinizi yonetin ve takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Squares2X2Icon className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListBulletIcon className="w-4 h-4" /> Liste
            </button>
          </div>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading} className="!border-slate-300 !text-slate-700 hover:!border-slate-400">
            Yenile
          </Button>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={handleCreate} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">
            Yeni Firsat
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Acik Firsat</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">₺{stats.totalAmount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pipeline Degeri</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.won}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kazanilan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₺{stats.wonAmount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kazanilan Tutar</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Firsat ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageDeals = dealsByStage[stage.id] || [];
              const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
              const isOverThis = overId === stage.id;

              return (
                <div key={stage.id} className="flex-shrink-0" style={{ width: 300 }}>
                  <div className={`bg-white border rounded-lg h-full transition-colors ${isOverThis ? 'border-slate-400 border-2' : 'border-slate-200'}`}>
                    <div className="p-3 border-b border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || '#64748b' }} />
                        <span className="text-sm font-medium text-slate-900">{stage.name}</span>
                        <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">{stageDeals.length}</span>
                      </div>
                      <div className="text-xs text-slate-500">₺{stageAmount.toLocaleString('tr-TR')}</div>
                    </div>
                    <DroppableColumn id={stage.id} isOver={isOverThis}>
                      {stageDeals.map((deal) => (
                        <DraggableDealCard key={deal.id} deal={deal} onNavigate={handleNavigate} onCloseWon={handleCloseWon} onCloseLost={handleCloseLost} isDragging={activeDealId === deal.id} />
                      ))}
                      {stageDeals.length === 0 && <div className="text-center text-slate-400 py-8 text-sm">{isOverThis ? 'Buraya birakin' : 'Firsat yok'}</div>}
                    </DroppableColumn>
                  </div>
                </div>
              );
            })}

            {/* Lost Column */}
            <div className="flex-shrink-0" style={{ width: 300 }}>
              <div className="bg-white border-2 border-slate-300 rounded-lg h-full">
                <div className="p-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <NoSymbolIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-900">Kaybedildi</span>
                    <span className="px-1.5 py-0.5 text-xs bg-slate-200 text-slate-700 rounded">{lostDeals.length}</span>
                  </div>
                  <div className="text-xs text-slate-600">₺{lostAmount.toLocaleString('tr-TR')}</div>
                </div>
                <div className="p-3 max-h-[600px] overflow-y-auto bg-slate-50/50">
                  {lostDeals.map((deal) => (
                    <DraggableDealCard key={deal.id} deal={deal} onNavigate={handleNavigate} onCloseWon={handleCloseWon} onCloseLost={handleCloseLost} />
                  ))}
                  {lostDeals.length === 0 && <div className="text-center text-slate-400 py-8 text-sm">Kaybedilen firsat yok</div>}
                </div>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeDeal ? (
              <div className="mb-3 bg-white border-2 border-slate-400 rounded-lg p-3 shadow-xl rotate-2 opacity-90">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-900 truncate">{activeDeal.title}</span>
                </div>
                <div className="text-xl font-bold text-slate-900">₺{activeDeal.amount.toLocaleString('tr-TR')}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="text-sm text-slate-500 mb-4">{filteredDeals.length} firsat listeleniyor</div>
          <Table
            columns={columns}
            dataSource={filteredDeals}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} firsat` }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedDeals.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl">
            <span className="text-sm font-medium">{selectedDeals.size} firsat secili</span>
            <span className="text-slate-400 text-sm">₺{selectedAmount.toLocaleString('tr-TR')}</span>
            <div className="h-4 w-px bg-slate-600" />
            <button onClick={handleBulkCloseWon} disabled={bulkActionLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">
              <CheckCircleIcon className="w-4 h-4" /> Kazanildi
            </button>
            <button onClick={handleBulkCloseLost} disabled={bulkActionLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50">
              <NoSymbolIcon className="w-4 h-4" /> Kaybedildi
            </button>
            <button onClick={clearSelection} className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
