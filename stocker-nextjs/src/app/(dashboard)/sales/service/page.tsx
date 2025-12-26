'use client';

/**
 * Service Orders Page
 * Kanban board for managing repair and maintenance tickets
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, message } from 'antd';
import { Spinner } from '@/components/primitives';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';
import {
  Wrench,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  Phone,
  Calendar,
  GripVertical,
  Plus,
  RefreshCw,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Badge,
} from '@/components/ui/enterprise-page';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { SalesService, ServiceOrderListDto, ServiceOrderDto, ServiceOrderStatisticsDto } from '@/lib/api/services/sales.service';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// Types
type ServiceStatus = 'Received' | 'Diagnosing' | 'WaitingParts' | 'InProgress' | 'Testing' | 'Completed' | 'Delivered' | 'Cancelled';

interface KanbanColumn {
  id: ServiceStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Kanban columns configuration - mapping to backend statuses
const kanbanColumns: KanbanColumn[] = [
  {
    id: 'Received',
    title: 'Yeni Talep',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'Diagnosing',
    title: 'Teşhis',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'InProgress',
    title: 'Onarımda',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'Completed',
    title: 'Tamamlandı',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
];

// Map backend status to kanban column
const mapStatusToColumn = (status: string): ServiceStatus => {
  const statusMap: Record<string, ServiceStatus> = {
    'Received': 'Received',
    'Diagnosing': 'Diagnosing',
    'WaitingParts': 'InProgress', // Group WaitingParts with InProgress
    'InProgress': 'InProgress',
    'Testing': 'InProgress', // Group Testing with InProgress
    'Completed': 'Completed',
    'Delivered': 'Completed', // Group Delivered with Completed
    'Cancelled': 'Completed', // Show Cancelled in Completed column
  };
  return statusMap[status] || 'Received';
};

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrderListDto[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrderDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState<ServiceOrderListDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statistics, setStatistics] = useState<ServiceOrderStatisticsDto | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResult, statsResult] = await Promise.all([
        SalesService.getServiceOrders({ pageSize: 100 }),
        SalesService.getServiceOrderStatistics().catch(() => null),
      ]);
      setOrders(ordersResult.items);
      if (statsResult) {
        setStatistics(statsResult);
      }
    } catch (error) {
      console.error('Error fetching service orders:', error);
      message.error('Servis talepleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: <AlertTriangle className="w-3 h-3" />,
          label: 'Acil',
        };
      case 'High':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: <AlertTriangle className="w-3 h-3" />,
          label: 'Yüksek',
        };
      case 'Normal':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: null,
          label: 'Normal',
        };
      case 'Low':
        return {
          color: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: null,
          label: 'Düşük',
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: null,
          label: priority,
        };
    }
  };

  const getOrdersByStatus = (columnStatus: ServiceStatus) => {
    return orders.filter((order) => mapStatusToColumn(order.status) === columnStatus);
  };

  const handleDragStart = (e: React.DragEvent, order: ServiceOrderListDto) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ServiceStatus) => {
    e.preventDefault();
    if (!draggedOrder) return;

    const currentColumn = mapStatusToColumn(draggedOrder.status);
    if (currentColumn === targetStatus) {
      setDraggedOrder(null);
      return;
    }

    // Validate status transitions
    const validTransitions: Record<ServiceStatus, ServiceStatus[]> = {
      Received: ['Diagnosing'],
      Diagnosing: ['Received', 'InProgress'],
      InProgress: ['Diagnosing', 'Completed'],
      Completed: ['InProgress'],
      WaitingParts: ['InProgress'],
      Testing: ['InProgress', 'Completed'],
      Delivered: [],
      Cancelled: [],
    };

    if (!validTransitions[currentColumn]?.includes(targetStatus)) {
      message.warning('Bu durum geçişi izin verilmiyor');
      setDraggedOrder(null);
      return;
    }

    try {
      // Use appropriate API methods based on target status
      if (targetStatus === 'InProgress') {
        await SalesService.startServiceOrder(draggedOrder.id);
      } else if (targetStatus === 'Completed') {
        await SalesService.completeServiceOrder(draggedOrder.id, {});
      }
      message.success(`Servis talebi "${targetStatus}" durumuna taşındı`);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating service order status:', error);
      message.error('Durum güncellenirken hata oluştu');
    }

    setDraggedOrder(null);
  };

  const handleCardClick = async (order: ServiceOrderListDto) => {
    try {
      setDetailLoading(true);
      setDetailModalOpen(true);
      const orderDetail = await SalesService.getServiceOrder(order.id);
      setSelectedOrder(orderDetail);
    } catch (error) {
      console.error('Error fetching service order detail:', error);
      message.error('Servis detayı yüklenirken hata oluştu');
    } finally {
      setDetailLoading(false);
    }
  };

  // Calculate stats from statistics or orders
  const totalOrders = statistics?.totalCount ?? orders.length;
  const urgentOrders = orders.filter((o) => o.priority === 'Urgent' || o.priority === 'High').length;
  const inProgressOrders = statistics?.inProgressCount ?? orders.filter((o) =>
    o.status === 'InProgress' || o.status === 'Diagnosing' || o.status === 'WaitingParts' || o.status === 'Testing'
  ).length;
  const completedOrders = statistics?.completedCount ?? orders.filter((o) => o.status === 'Completed').length;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
      Received: { label: 'Alındı', variant: 'info' },
      Diagnosing: { label: 'Teşhis', variant: 'warning' },
      WaitingParts: { label: 'Parça Bekleniyor', variant: 'warning' },
      InProgress: { label: 'Devam Ediyor', variant: 'info' },
      Testing: { label: 'Test', variant: 'info' },
      Completed: { label: 'Tamamlandı', variant: 'success' },
      Delivered: { label: 'Teslim Edildi', variant: 'success' },
      Cancelled: { label: 'İptal', variant: 'error' },
    };
    return statusConfig[status] || { label: status, variant: 'default' as const };
  };

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <ListPageHeader
        icon={<WrenchScrewdriverIcon className="w-5 h-5" />}
        iconColor="#7c3aed"
        title="Servis Talepleri"
        description="Tamir ve bakım taleplerini yönetin"
        itemCount={totalOrders}
        primaryAction={{
          label: 'Yeni Talep',
          onClick: () => {},
          icon: <Plus className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Toplam Talep</div>
              <div className="text-xl font-bold text-slate-900">{totalOrders}</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Acil / Yüksek</div>
              <div className="text-xl font-bold text-red-600">{urgentOrders}</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-purple-200 rounded-lg p-4 bg-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Devam Eden</div>
              <div className="text-xl font-bold text-purple-600">{inProgressOrders}</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Tamamlanan</div>
              <div className="text-xl font-bold text-emerald-600">{completedOrders}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kanbanColumns.map((column) => {
          const columnOrders = getOrdersByStatus(column.id);
          return (
            <div
              key={column.id}
              className={`${column.bgColor} ${column.borderColor} border rounded-lg p-4 min-h-[500px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${column.bgColor} ${column.color} border ${column.borderColor}`}
                >
                  {columnOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnOrders.map((order) => {
                  const priorityConfig = getPriorityConfig(order.priority);
                  return (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order)}
                      onClick={() => handleCardClick(order)}
                      className={`
                        bg-white rounded-lg border border-slate-200 p-3 cursor-pointer
                        hover:shadow-md hover:border-slate-300 transition-all duration-200
                        ${draggedOrder?.id === order.id ? 'opacity-50 scale-95' : ''}
                        ${order.priority === 'Urgent' ? 'ring-2 ring-red-200' : ''}
                      `}
                    >
                      {/* Drag Handle & Ticket Number */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-slate-300" />
                          <span className="text-xs font-mono text-slate-500">
                            {order.serviceOrderNumber}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${priorityConfig.color}`}
                        >
                          {priorityConfig.icon}
                          {priorityConfig.label}
                        </div>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-medium text-slate-900 text-sm mb-1 line-clamp-1">
                        {order.productName || 'Ürün Belirtilmedi'}
                      </h4>

                      {/* Customer */}
                      <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                        {order.customerName}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* Technician */}
                        {order.technicianName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-medium">
                              {order.technicianName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-xs text-slate-500 hidden sm:inline">
                              {order.technicianName.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <User className="w-4 h-4" />
                            <span className="text-xs">Atanmadı</span>
                          </div>
                        )}

                        {/* Created Time */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {dayjs(order.createdAt).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {columnOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Bu durumda talep yok</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-violet-600" />
            <span>Servis Detayı</span>
          </div>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-mono text-slate-500 mb-1">
                  {selectedOrder.serviceOrderNumber}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedOrder.productName || 'Ürün Belirtilmedi'}
                </h3>
                {selectedOrder.serialNumber && (
                  <div className="text-sm text-slate-500">SN: {selectedOrder.serialNumber}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadge(selectedOrder.status).variant}>
                  {getStatusBadge(selectedOrder.status).label}
                </Badge>
                <Badge
                  variant={
                    selectedOrder.priority === 'Urgent' || selectedOrder.priority === 'High'
                      ? 'error'
                      : 'default'
                  }
                >
                  {getPriorityConfig(selectedOrder.priority).label}
                </Badge>
              </div>
            </div>

            {/* Issue Description */}
            {selectedOrder.reportedIssue && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm font-medium text-slate-700 mb-1">Bildirilen Sorun</div>
                <p className="text-slate-600">{selectedOrder.reportedIssue}</p>
              </div>
            )}

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Müşteri</span>
                </div>
                <div className="font-medium text-slate-900">{selectedOrder.customerName}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs">Telefon</span>
                </div>
                <div className="font-medium text-slate-900">{selectedOrder.customerPhone || '-'}</div>
              </div>
            </div>

            {/* Technician & Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs">Atanan Teknisyen</span>
                </div>
                {selectedOrder.technicianName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-medium">
                      {selectedOrder.technicianName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="font-medium text-slate-900">
                      {selectedOrder.technicianName}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Henüz atanmadı</span>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Planlanan Tarih</span>
                </div>
                {selectedOrder.scheduledDate ? (
                  <div className="font-medium text-slate-900">
                    {dayjs(selectedOrder.scheduledDate).format('DD MMM YYYY, HH:mm')}
                  </div>
                ) : (
                  <span className="text-slate-400">Belirlenmedi</span>
                )}
              </div>
            </div>

            {/* Cost Information */}
            {(selectedOrder.laborCost > 0 || selectedOrder.partsCost > 0) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">İşçilik</span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {selectedOrder.laborCost.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="text-xs">Parça</span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {selectedOrder.partsCost.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg p-3 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Toplam</span>
                  </div>
                  <div className="font-medium text-emerald-700">
                    {selectedOrder.totalAmount.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            )}

            {/* Diagnosis Notes */}
            {selectedOrder.diagnosisNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-700 mb-1">Teşhis Notları</div>
                <p className="text-blue-800 text-sm">{selectedOrder.diagnosisNotes}</p>
              </div>
            )}

            {/* Repair Notes */}
            {selectedOrder.repairNotes && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-sm font-medium text-emerald-700 mb-1">Onarım Notları</div>
                <p className="text-emerald-800 text-sm">{selectedOrder.repairNotes}</p>
              </div>
            )}

            {/* Service Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Servis Kalemleri</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id || index} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {item.itemType} • Miktar: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">
                          {item.totalPrice.toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Notes */}
            {selectedOrder.notes && selectedOrder.notes.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Notlar</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.notes.map((note, index) => (
                    <div key={note.id || index} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">{note.type}</span>
                        <span className="text-xs text-slate-400">
                          {dayjs(note.createdAt).format('DD MMM YYYY, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{note.content}</p>
                      {note.createdByName && (
                        <div className="text-xs text-slate-400 mt-1">- {note.createdByName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Zaman Çizelgesi</div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Oluşturulma: {dayjs(selectedOrder.createdAt).format('DD MMM YYYY, HH:mm')}</span>
                </div>
                {selectedOrder.startedDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Başlangıç: {dayjs(selectedOrder.startedDate).format('DD MMM YYYY, HH:mm')}</span>
                  </div>
                )}
                {selectedOrder.completedDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Tamamlanma: {dayjs(selectedOrder.completedDate).format('DD MMM YYYY, HH:mm')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Kapat
              </button>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
                Düzenle
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
