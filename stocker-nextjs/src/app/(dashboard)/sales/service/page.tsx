'use client';

/**
 * Service Orders Page
 * Kanban board for managing repair and maintenance tickets
 */

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
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
  ChevronRight,
  GripVertical,
  Plus,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
} from '@/components/ui/enterprise-page';
import { ToolOutlined } from '@ant-design/icons';

dayjs.locale('tr');

// Types
type ServiceStatus = 'NewRequest' | 'TechnicianAssigned' | 'InRepair' | 'Completed';
type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

interface ServiceOrder {
  id: string;
  ticketNumber: string;
  productName: string;
  productSku: string;
  customerName: string;
  customerPhone: string;
  issue: string;
  priority: Priority;
  status: ServiceStatus;
  technicianId: string | null;
  technicianName: string | null;
  technicianAvatar: string | null;
  createdAt: string;
  estimatedCompletion: string | null;
  notes: string;
}

interface KanbanColumn {
  id: ServiceStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Kanban columns configuration
const kanbanColumns: KanbanColumn[] = [
  {
    id: 'NewRequest',
    title: 'Yeni Talep',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'TechnicianAssigned',
    title: 'Teknisyen Atandı',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'InRepair',
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

// Mock technicians
const technicians = [
  { id: 't1', name: 'Ahmet Yılmaz', avatar: 'AY' },
  { id: 't2', name: 'Mehmet Kaya', avatar: 'MK' },
  { id: 't3', name: 'Ali Demir', avatar: 'AD' },
];

// Mock data
const mockServiceOrders: ServiceOrder[] = [
  {
    id: '1',
    ticketNumber: 'SRV-2024-001',
    productName: 'Samsung Galaxy S24 Ultra',
    productSku: 'SAM-S24U-256',
    customerName: 'Ahmet Yıldırım',
    customerPhone: '+90 532 111 2233',
    issue: 'Ekran kırığı - Sol alt köşe',
    priority: 'High',
    status: 'NewRequest',
    technicianId: null,
    technicianName: null,
    technicianAvatar: null,
    createdAt: '2024-12-24T10:30:00',
    estimatedCompletion: null,
    notes: 'Müşteri acil tamir istiyor',
  },
  {
    id: '2',
    ticketNumber: 'SRV-2024-002',
    productName: 'iPhone 15 Pro Max',
    productSku: 'APL-15PM-512',
    customerName: 'Zeynep Arslan',
    customerPhone: '+90 533 222 3344',
    issue: 'Batarya şişmesi',
    priority: 'Urgent',
    status: 'NewRequest',
    technicianId: null,
    technicianName: null,
    technicianAvatar: null,
    createdAt: '2024-12-24T09:15:00',
    estimatedCompletion: null,
    notes: 'Güvenlik riski - öncelikli işlem',
  },
  {
    id: '3',
    ticketNumber: 'SRV-2024-003',
    productName: 'MacBook Pro 14"',
    productSku: 'APL-MBP14-M3',
    customerName: 'Can Özkan',
    customerPhone: '+90 534 333 4455',
    issue: 'Klavye tuşları çalışmıyor',
    priority: 'Medium',
    status: 'TechnicianAssigned',
    technicianId: 't1',
    technicianName: 'Ahmet Yılmaz',
    technicianAvatar: 'AY',
    createdAt: '2024-12-23T14:00:00',
    estimatedCompletion: '2024-12-26T18:00:00',
    notes: 'Parça siparişi verildi',
  },
  {
    id: '4',
    ticketNumber: 'SRV-2024-004',
    productName: 'Sony PlayStation 5',
    productSku: 'SNY-PS5-DISC',
    customerName: 'Emre Demir',
    customerPhone: '+90 535 444 5566',
    issue: 'Disk okuyucu arızası',
    priority: 'Low',
    status: 'TechnicianAssigned',
    technicianId: 't2',
    technicianName: 'Mehmet Kaya',
    technicianAvatar: 'MK',
    createdAt: '2024-12-22T11:30:00',
    estimatedCompletion: '2024-12-27T18:00:00',
    notes: '',
  },
  {
    id: '5',
    ticketNumber: 'SRV-2024-005',
    productName: 'Dell XPS 15',
    productSku: 'DEL-XPS15-I9',
    customerName: 'Ayşe Kara',
    customerPhone: '+90 536 555 6677',
    issue: 'Fan gürültüsü ve aşırı ısınma',
    priority: 'Medium',
    status: 'InRepair',
    technicianId: 't1',
    technicianName: 'Ahmet Yılmaz',
    technicianAvatar: 'AY',
    createdAt: '2024-12-21T09:00:00',
    estimatedCompletion: '2024-12-25T12:00:00',
    notes: 'Termal macun değişimi yapılıyor',
  },
  {
    id: '6',
    ticketNumber: 'SRV-2024-006',
    productName: 'Apple Watch Series 9',
    productSku: 'APL-AW9-45',
    customerName: 'Murat Şahin',
    customerPhone: '+90 537 666 7788',
    issue: 'Ekran dokunmatik tepkisiz',
    priority: 'High',
    status: 'InRepair',
    technicianId: 't3',
    technicianName: 'Ali Demir',
    technicianAvatar: 'AD',
    createdAt: '2024-12-20T16:45:00',
    estimatedCompletion: '2024-12-25T18:00:00',
    notes: 'Yeni ekran takıldı, test ediliyor',
  },
  {
    id: '7',
    ticketNumber: 'SRV-2024-007',
    productName: 'Samsung Galaxy Tab S9',
    productSku: 'SAM-TABS9-256',
    customerName: 'Deniz Yıldız',
    customerPhone: '+90 538 777 8899',
    issue: 'Şarj portu arızası',
    priority: 'Low',
    status: 'Completed',
    technicianId: 't2',
    technicianName: 'Mehmet Kaya',
    technicianAvatar: 'MK',
    createdAt: '2024-12-18T10:00:00',
    estimatedCompletion: '2024-12-24T14:00:00',
    notes: 'Başarıyla tamamlandı - müşteri bilgilendirildi',
  },
  {
    id: '8',
    ticketNumber: 'SRV-2024-008',
    productName: 'LG OLED TV 55"',
    productSku: 'LG-OLED55-C3',
    customerName: 'Elif Aksoy',
    customerPhone: '+90 539 888 9900',
    issue: 'Panel burn-in sorunu',
    priority: 'Medium',
    status: 'Completed',
    technicianId: 't1',
    technicianName: 'Ahmet Yılmaz',
    technicianAvatar: 'AY',
    createdAt: '2024-12-15T13:30:00',
    estimatedCompletion: '2024-12-23T16:00:00',
    notes: 'Panel değişimi yapıldı, 1 yıl garanti verildi',
  },
];

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>(mockServiceOrders);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState<ServiceOrder | null>(null);

  const getPriorityConfig = (priority: Priority) => {
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
      case 'Medium':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: null,
          label: 'Orta',
        };
      case 'Low':
        return {
          color: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: null,
          label: 'Düşük',
        };
    }
  };

  const getOrdersByStatus = (status: ServiceStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const handleDragStart = (e: React.DragEvent, order: ServiceOrder) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ServiceStatus) => {
    e.preventDefault();
    if (draggedOrder && draggedOrder.status !== targetStatus) {
      // Validate status transitions
      const validTransitions: Record<ServiceStatus, ServiceStatus[]> = {
        NewRequest: ['TechnicianAssigned'],
        TechnicianAssigned: ['NewRequest', 'InRepair'],
        InRepair: ['TechnicianAssigned', 'Completed'],
        Completed: ['InRepair'],
      };

      if (!validTransitions[draggedOrder.status].includes(targetStatus)) {
        message.warning('Bu durum geçişi izin verilmiyor');
        setDraggedOrder(null);
        return;
      }

      // Auto-assign technician if moving to TechnicianAssigned
      let updatedOrder = { ...draggedOrder, status: targetStatus };
      if (targetStatus === 'TechnicianAssigned' && !draggedOrder.technicianId) {
        const randomTech = technicians[Math.floor(Math.random() * technicians.length)];
        updatedOrder = {
          ...updatedOrder,
          technicianId: randomTech.id,
          technicianName: randomTech.name,
          technicianAvatar: randomTech.avatar,
          estimatedCompletion: dayjs().add(3, 'day').format('YYYY-MM-DDTHH:mm:ss'),
        };
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === draggedOrder.id ? updatedOrder : o))
      );
      message.success(`Servis talebi "${targetStatus}" durumuna taşındı`);
    }
    setDraggedOrder(null);
  };

  const handleCardClick = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const urgentOrders = orders.filter((o) => o.priority === 'Urgent' || o.priority === 'High').length;
  const inProgressOrders = orders.filter((o) => o.status === 'InRepair').length;
  const completedToday = orders.filter(
    (o) => o.status === 'Completed' && dayjs(o.estimatedCompletion).isSame(dayjs(), 'day')
  ).length;

  return (
    <PageContainer maxWidth="full">
      <ListPageHeader
        icon={<ToolOutlined />}
        iconColor="#7c3aed"
        title="Servis Talepleri"
        description="Tamir ve bakım taleplerini yönetin"
        itemCount={totalOrders}
        actions={
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Yeni Talep
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
              <div className="text-sm text-slate-500">Onarımda</div>
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
              <div className="text-sm text-slate-500">Bugün Biten</div>
              <div className="text-xl font-bold text-emerald-600">{completedToday}</div>
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
                            {order.ticketNumber}
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
                        {order.productName}
                      </h4>

                      {/* Issue */}
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {order.issue}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* Technician Avatar */}
                        {order.technicianAvatar ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-medium">
                              {order.technicianAvatar}
                            </div>
                            <span className="text-xs text-slate-500 hidden sm:inline">
                              {order.technicianName?.split(' ')[0]}
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
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-mono text-slate-500 mb-1">
                  {selectedOrder.ticketNumber}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedOrder.productName}
                </h3>
                <div className="text-sm text-slate-500">{selectedOrder.productSku}</div>
              </div>
              <Badge
                variant={
                  selectedOrder.priority === 'Urgent' || selectedOrder.priority === 'High'
                    ? 'error'
                    : 'default'
                }
              >
                {getPriorityConfig(selectedOrder.priority).label} Öncelik
              </Badge>
            </div>

            {/* Issue Description */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-slate-700 mb-1">Sorun Açıklaması</div>
              <p className="text-slate-600">{selectedOrder.issue}</p>
            </div>

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
                <div className="font-medium text-slate-900">{selectedOrder.customerPhone}</div>
              </div>
            </div>

            {/* Technician & Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs">Teknisyen</span>
                </div>
                {selectedOrder.technicianName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-medium">
                      {selectedOrder.technicianAvatar}
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
                  <span className="text-xs">Tahmini Tamamlanma</span>
                </div>
                {selectedOrder.estimatedCompletion ? (
                  <div className="font-medium text-slate-900">
                    {dayjs(selectedOrder.estimatedCompletion).format('DD MMM YYYY, HH:mm')}
                  </div>
                ) : (
                  <span className="text-slate-400">Belirlenmedi</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm font-medium text-amber-700 mb-1">Notlar</div>
                <p className="text-amber-800 text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-sm font-medium text-slate-700 mb-2">Zaman Çizelgesi</div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Oluşturulma: {dayjs(selectedOrder.createdAt).format('DD MMM YYYY, HH:mm')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Kapat
              </button>
              <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
                Düzenle
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
