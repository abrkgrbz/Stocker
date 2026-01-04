'use client';

/**
 * Back Orders Page
 * Manage items that were ordered but not in stock
 * Critical backorders (waiting > 7 days) shown at top
 */

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import {
  Package,
  Clock,
  AlertTriangle,
  Search,
  CheckCircle,
  Truck,
  Calendar,
  ArrowRight,
  User,
  ShoppingCart,
  Filter,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/patterns';
import { Select } from '@/components/primitives';
import { ClockIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Types
type BackOrderStatus = 'Waiting' | 'PartiallyAvailable' | 'ReadyToShip' | 'Cancelled';
type BackOrderPriority = 'Normal' | 'High' | 'Critical';

interface BackOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  productSku: string;
  orderedQuantity: number;
  waitingQuantity: number;
  availableQuantity: number;
  estimatedRestockDate: string | null;
  status: BackOrderStatus;
  priority: BackOrderPriority;
  waitingDays: number;
  notes?: string;
}

// Mock data
const mockBackOrders: BackOrder[] = [
  {
    id: '1',
    orderNumber: 'SIP-2024-001250',
    orderDate: '2024-12-10',
    customerId: 'c1',
    customerName: 'MediaMarkt Turkey',
    productId: 'p1',
    productName: 'PlayStation 5 Slim',
    productSku: 'SNY-PS5-SLIM',
    orderedQuantity: 50,
    waitingQuantity: 50,
    availableQuantity: 0,
    estimatedRestockDate: '2024-12-28',
    status: 'Waiting',
    priority: 'Critical',
    waitingDays: 15,
  },
  {
    id: '2',
    orderNumber: 'SIP-2024-001248',
    orderDate: '2024-12-12',
    customerId: 'c2',
    customerName: 'Teknosa A.Ş.',
    productId: 'p2',
    productName: 'iPhone 15 Pro Max 512GB',
    productSku: 'APL-IP15PM-512',
    orderedQuantity: 30,
    waitingQuantity: 20,
    availableQuantity: 10,
    estimatedRestockDate: '2024-12-26',
    status: 'PartiallyAvailable',
    priority: 'High',
    waitingDays: 13,
  },
  {
    id: '3',
    orderNumber: 'SIP-2024-001255',
    orderDate: '2024-12-15',
    customerId: 'c3',
    customerName: 'Hepsiburada',
    productId: 'p3',
    productName: 'MacBook Air M3 15"',
    productSku: 'APL-MBA15-M3',
    orderedQuantity: 25,
    waitingQuantity: 25,
    availableQuantity: 0,
    estimatedRestockDate: null,
    status: 'Waiting',
    priority: 'Critical',
    waitingDays: 10,
  },
  {
    id: '4',
    orderNumber: 'SIP-2024-001260',
    orderDate: '2024-12-18',
    customerId: 'c4',
    customerName: 'Vatan Bilgisayar',
    productId: 'p4',
    productName: 'Samsung Galaxy Tab S9 Ultra',
    productSku: 'SAM-TABS9U',
    orderedQuantity: 15,
    waitingQuantity: 15,
    availableQuantity: 15,
    estimatedRestockDate: '2024-12-25',
    status: 'ReadyToShip',
    priority: 'Normal',
    waitingDays: 7,
  },
  {
    id: '5',
    orderNumber: 'SIP-2024-001262',
    orderDate: '2024-12-19',
    customerId: 'c5',
    customerName: 'n11.com',
    productId: 'p5',
    productName: 'Sony WF-1000XM5',
    productSku: 'SNY-WF1000XM5',
    orderedQuantity: 100,
    waitingQuantity: 60,
    availableQuantity: 40,
    estimatedRestockDate: '2024-12-30',
    status: 'PartiallyAvailable',
    priority: 'Normal',
    waitingDays: 6,
  },
  {
    id: '6',
    orderNumber: 'SIP-2024-001265',
    orderDate: '2024-12-20',
    customerId: 'c6',
    customerName: 'Trendyol',
    productId: 'p6',
    productName: 'Apple Watch Ultra 2',
    productSku: 'APL-AWU2',
    orderedQuantity: 40,
    waitingQuantity: 40,
    availableQuantity: 0,
    estimatedRestockDate: '2025-01-05',
    status: 'Waiting',
    priority: 'High',
    waitingDays: 5,
  },
  {
    id: '7',
    orderNumber: 'SIP-2024-001200',
    orderDate: '2024-12-01',
    customerId: 'c7',
    customerName: 'Amazon Turkey',
    productId: 'p7',
    productName: 'Nintendo Switch OLED',
    productSku: 'NIN-SWOLED',
    orderedQuantity: 80,
    waitingQuantity: 0,
    availableQuantity: 0,
    estimatedRestockDate: null,
    status: 'Cancelled',
    priority: 'Normal',
    waitingDays: 24,
    notes: 'Müşteri talebi ile iptal edildi',
  },
];

export default function BackOrdersPage() {
  const [backOrders, setBackOrders] = useState<BackOrder[]>(mockBackOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BackOrderStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<BackOrderPriority | 'All'>('All');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const getStatusConfig = (status: BackOrderStatus) => {
    const configs = {
      Waiting: {
        label: 'Stok Bekleniyor',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
      },
      PartiallyAvailable: {
        label: 'Kısmen Mevcut',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
      },
      ReadyToShip: {
        label: 'Gönderime Hazır',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
      },
      Cancelled: {
        label: 'İptal Edildi',
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-500',
        borderColor: 'border-slate-200',
      },
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: BackOrderPriority) => {
    const configs = {
      Normal: { label: 'Normal', color: 'text-slate-600', bgColor: 'bg-slate-100' },
      High: { label: 'Yüksek', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      Critical: { label: 'Kritik', color: 'text-red-600', bgColor: 'bg-red-100' },
    };
    return configs[priority];
  };

  const handleAllocateStock = (id: string) => {
    const backOrder = backOrders.find((bo) => bo.id === id);
    if (!backOrder) return;

    if (backOrder.availableQuantity >= backOrder.waitingQuantity) {
      // Full allocation
      setBackOrders((prev) =>
        prev.map((bo) =>
          bo.id === id
            ? { ...bo, status: 'ReadyToShip' as BackOrderStatus, waitingQuantity: 0 }
            : bo
        )
      );
      message.success('Stok tahsis edildi, sipariş gönderime hazır!');
    } else if (backOrder.availableQuantity > 0) {
      // Partial allocation
      Modal.confirm({
        title: 'Kısmi Stok Tahsisi',
        content: `Sadece ${backOrder.availableQuantity} adet mevcut. ${backOrder.waitingQuantity} adet bekleniyor. Mevcut stoku tahsis etmek istiyor musunuz?`,
        okText: 'Tahsis Et',
        cancelText: 'Vazgeç',
        onOk: () => {
          setBackOrders((prev) =>
            prev.map((bo) =>
              bo.id === id
                ? {
                    ...bo,
                    status: 'PartiallyAvailable' as BackOrderStatus,
                    waitingQuantity: bo.waitingQuantity - bo.availableQuantity,
                    availableQuantity: 0,
                  }
                : bo
            )
          );
          message.success('Mevcut stok tahsis edildi');
        },
      });
    } else {
      message.warning('Tahsis edilecek stok bulunmuyor');
    }
  };

  // Filter and sort
  const filteredBackOrders = backOrders.filter((bo) => {
    const matchesSearch =
      bo.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bo.productSku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || bo.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || bo.priority === priorityFilter;
    const matchesCritical = !showCriticalOnly || bo.waitingDays >= 7;

    return matchesSearch && matchesStatus && matchesPriority && matchesCritical;
  });

  // Sort: Critical first (waiting > 7 days), then by waiting days
  const sortedBackOrders = [...filteredBackOrders].sort((a, b) => {
    if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
    if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
    if (a.waitingDays >= 7 && b.waitingDays < 7) return -1;
    if (a.waitingDays < 7 && b.waitingDays >= 7) return 1;
    return b.waitingDays - a.waitingDays;
  });

  const criticalCount = backOrders.filter(
    (bo) => bo.waitingDays >= 7 && bo.status !== 'Cancelled'
  ).length;
  const waitingCount = backOrders.filter((bo) => bo.status === 'Waiting').length;
  const readyCount = backOrders.filter((bo) => bo.status === 'ReadyToShip').length;

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<ClockIcon className="w-5 h-5" />}
        iconColor="#f97316"
        title="Bekleyen Siparişler"
        description="Stokta olmayan ve tedarik beklenen sipariş kalemleri"
        itemCount={backOrders.filter((bo) => bo.status !== 'Cancelled').length}
        secondaryActions={
          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showCriticalOnly
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {showCriticalOnly ? 'Kritik Gösteriliyor' : 'Sadece Kritik'}
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Stok Bekleniyor</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-orange-600">{waitingCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Kritik ({'>'}7 gün)</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-600">{criticalCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Gönderime Hazır</span>
            <Truck className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-green-600">{readyCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Bekleyen Adet</span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {backOrders
              .filter((bo) => bo.status !== 'Cancelled')
              .reduce((sum, bo) => sum + bo.waitingQuantity, 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Sipariş no, müşteri veya ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <Select
            value={statusFilter === 'All' ? null : statusFilter}
            onChange={(val) => setStatusFilter((val as BackOrderStatus) || 'All')}
            className="w-44"
            placeholder="Tüm Durumlar"
            clearable
            options={[
              { value: 'Waiting', label: 'Stok Bekleniyor' },
              { value: 'PartiallyAvailable', label: 'Kısmen Mevcut' },
              { value: 'ReadyToShip', label: 'Gönderime Hazır' },
              { value: 'Cancelled', label: 'İptal Edildi' },
            ]}
          />
          <Select
            value={priorityFilter === 'All' ? null : priorityFilter}
            onChange={(val) => setPriorityFilter((val as BackOrderPriority) || 'All')}
            className="w-36"
            placeholder="Tüm Öncelikler"
            clearable
            options={[
              { value: 'Critical', label: 'Kritik' },
              { value: 'High', label: 'Yüksek' },
              { value: 'Normal', label: 'Normal' },
            ]}
          />
        </div>
      </Card>

      {/* Back Orders List */}
      {sortedBackOrders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="Bekleyen sipariş bulunamadı"
            description="Arama kriterlerinize uygun bekleyen sipariş yok"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedBackOrders.map((backOrder) => {
            const statusConfig = getStatusConfig(backOrder.status);
            const priorityConfig = getPriorityConfig(backOrder.priority);
            const isCritical = backOrder.waitingDays >= 7 && backOrder.status !== 'Cancelled';

            return (
              <div
                key={backOrder.id}
                className={`
                  bg-white border rounded-lg overflow-hidden transition-all
                  ${isCritical ? 'border-red-300 shadow-sm' : 'border-slate-200'}
                  ${backOrder.status === 'Cancelled' ? 'opacity-60' : ''}
                `}
              >
                {/* Critical Banner */}
                {isCritical && (
                  <div className="bg-red-500 text-white px-4 py-1.5 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Kritik: {backOrder.waitingDays} gündür bekleniyor
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Order & Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {backOrder.orderNumber}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}
                        >
                          {priorityConfig.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{backOrder.customerName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">
                          {dayjs(backOrder.orderDate).format('DD MMM YYYY')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {backOrder.productName}
                          </div>
                          <div className="text-xs text-slate-500">{backOrder.productSku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">
                            {backOrder.waitingQuantity} adet
                          </div>
                          <div className="text-xs text-slate-500">bekleniyor</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Info */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {/* Restock Date */}
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Tahmini Stok Tarihi</div>
                        {backOrder.estimatedRestockDate ? (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {dayjs(backOrder.estimatedRestockDate).format('DD MMM YYYY')}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 italic">Belirsiz</div>
                        )}
                      </div>

                      {/* Available Stock */}
                      {backOrder.status !== 'Cancelled' && backOrder.availableQuantity > 0 && (
                        <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-center">
                          <div className="text-xs text-green-600">Mevcut Stok</div>
                          <div className="text-lg font-bold text-green-700">
                            {backOrder.availableQuantity}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {backOrder.status !== 'Cancelled' && backOrder.status !== 'ReadyToShip' && (
                        <button
                          onClick={() => handleAllocateStock(backOrder.id)}
                          disabled={backOrder.availableQuantity === 0}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                            ${
                              backOrder.availableQuantity > 0
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }
                          `}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Stok Tahsis Et
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {backOrder.status === 'ReadyToShip' && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          <Truck className="w-4 h-4" />
                          Gönderime Hazır
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {backOrder.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500 italic">
                      {backOrder.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
