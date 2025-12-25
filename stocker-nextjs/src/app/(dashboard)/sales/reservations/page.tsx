'use client';

/**
 * Inventory Reservations Page
 * Track stock reserved for specific orders
 * Shows countdown warnings for expiring reservations
 */

import React, { useState } from 'react';
import { Modal, message, Input, InputNumber, Form } from 'antd';
import {
  Package,
  Clock,
  AlertTriangle,
  Search,
  MoreVertical,
  RefreshCw,
  Unlock,
  Timer,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  PageContainer,
  ListPageHeader,
  Card,
  Badge,
  EmptyState,
} from '@/components/ui/enterprise-page';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// Types
type ReservationStatus = 'Active' | 'Expired' | 'Released' | 'Fulfilled';

interface InventoryReservation {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseName: string;
  reservedQuantity: number;
  reservedForType: 'Order' | 'Customer' | 'Transfer';
  reservedForId: string;
  reservedForName: string;
  orderNumber?: string;
  reservedAt: string;
  expiresAt: string;
  status: ReservationStatus;
  notes?: string;
}

// Mock data
const mockReservations: InventoryReservation[] = [
  {
    id: '1',
    productId: 'p1',
    productName: 'iPhone 15 Pro Max 256GB',
    productSku: 'APL-IP15PM-256',
    warehouseName: 'Ana Depo',
    reservedQuantity: 5,
    reservedForType: 'Order',
    reservedForId: 'ord1',
    reservedForName: 'Apple Turkey A.Ş.',
    orderNumber: 'SIP-2024-001234',
    reservedAt: '2024-12-24T10:00:00',
    expiresAt: dayjs().add(2, 'hour').toISOString(), // Expires in 2 hours - CRITICAL
    status: 'Active',
  },
  {
    id: '2',
    productId: 'p2',
    productName: 'Samsung Galaxy S24 Ultra',
    productSku: 'SAM-S24U-512',
    warehouseName: 'İstanbul Depo',
    reservedQuantity: 10,
    reservedForType: 'Order',
    reservedForId: 'ord2',
    reservedForName: 'MediaMarkt Turkey',
    orderNumber: 'SIP-2024-001235',
    reservedAt: '2024-12-23T14:00:00',
    expiresAt: dayjs().add(18, 'hour').toISOString(), // Expires in 18 hours - WARNING
    status: 'Active',
  },
  {
    id: '3',
    productId: 'p3',
    productName: 'MacBook Pro 14" M3',
    productSku: 'APL-MBP14-M3',
    warehouseName: 'Ana Depo',
    reservedQuantity: 3,
    reservedForType: 'Customer',
    reservedForId: 'cust3',
    reservedForName: 'Teknosa A.Ş.',
    reservedAt: '2024-12-22T09:00:00',
    expiresAt: dayjs().add(3, 'day').toISOString(),
    status: 'Active',
  },
  {
    id: '4',
    productId: 'p4',
    productName: 'Sony WH-1000XM5',
    productSku: 'SNY-WH1000XM5',
    warehouseName: 'Ankara Depo',
    reservedQuantity: 20,
    reservedForType: 'Order',
    reservedForId: 'ord4',
    reservedForName: 'Hepsiburada',
    orderNumber: 'SIP-2024-001200',
    reservedAt: '2024-12-20T11:00:00',
    expiresAt: dayjs().subtract(1, 'day').toISOString(), // Already expired
    status: 'Expired',
  },
  {
    id: '5',
    productId: 'p5',
    productName: 'iPad Pro 12.9" M2',
    productSku: 'APL-IPADP-129',
    warehouseName: 'Ana Depo',
    reservedQuantity: 8,
    reservedForType: 'Transfer',
    reservedForId: 'tr5',
    reservedForName: 'İzmir Şubesi',
    reservedAt: '2024-12-21T16:00:00',
    expiresAt: dayjs().add(5, 'day').toISOString(),
    status: 'Active',
  },
  {
    id: '6',
    productId: 'p6',
    productName: 'Dell XPS 15',
    productSku: 'DEL-XPS15-I7',
    warehouseName: 'İstanbul Depo',
    reservedQuantity: 2,
    reservedForType: 'Order',
    reservedForId: 'ord6',
    reservedForName: 'Vatan Bilgisayar',
    orderNumber: 'SIP-2024-001180',
    reservedAt: '2024-12-19T10:00:00',
    expiresAt: '2024-12-23T10:00:00',
    status: 'Fulfilled',
  },
  {
    id: '7',
    productId: 'p7',
    productName: 'AirPods Pro 2',
    productSku: 'APL-APP2',
    warehouseName: 'Ana Depo',
    reservedQuantity: 50,
    reservedForType: 'Customer',
    reservedForId: 'cust7',
    reservedForName: 'n11.com',
    reservedAt: '2024-12-18T08:00:00',
    expiresAt: '2024-12-22T08:00:00',
    status: 'Released',
    notes: 'Müşteri siparişi iptal etti',
  },
];

export default function InventoryReservationsPage() {
  const [reservations, setReservations] = useState<InventoryReservation[]>(mockReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'All'>('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<InventoryReservation | null>(null);
  const [extendDays, setExtendDays] = useState(3);

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = dayjs();
    const expiry = dayjs(expiresAt);
    const diffHours = expiry.diff(now, 'hour');
    const diffMinutes = expiry.diff(now, 'minute');

    if (diffMinutes <= 0) return { text: 'Süresi Doldu', critical: true, warning: false };
    if (diffHours < 24) {
      if (diffHours < 1) {
        return { text: `${diffMinutes} dakika`, critical: true, warning: false };
      }
      return { text: `${diffHours} saat`, critical: diffHours < 6, warning: true };
    }
    const diffDays = expiry.diff(now, 'day');
    return { text: `${diffDays} gün`, critical: false, warning: false };
  };

  const getStatusConfig = (status: ReservationStatus) => {
    const configs = {
      Active: { label: 'Aktif', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: CheckCircle },
      Expired: { label: 'Süresi Doldu', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: XCircle },
      Released: { label: 'Serbest Bırakıldı', bgColor: 'bg-slate-50', textColor: 'text-slate-600', icon: Unlock },
      Fulfilled: { label: 'Tamamlandı', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle },
    };
    return configs[status];
  };

  const handleExtendClick = (reservation: InventoryReservation) => {
    setSelectedReservation(reservation);
    setExtendDays(3);
    setExtendModalOpen(true);
    setOpenDropdown(null);
  };

  const handleExtendConfirm = () => {
    if (!selectedReservation) return;

    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id
          ? {
              ...r,
              expiresAt: dayjs(r.expiresAt).add(extendDays, 'day').toISOString(),
              status: 'Active' as ReservationStatus,
            }
          : r
      )
    );
    message.success(`Rezervasyon süresi ${extendDays} gün uzatıldı`);
    setExtendModalOpen(false);
    setSelectedReservation(null);
  };

  const handleReleaseClick = (id: string) => {
    Modal.confirm({
      title: 'Rezervasyonu Serbest Bırak',
      content: 'Bu rezervasyonu zorla serbest bırakmak istediğinizden emin misiniz? Stok tekrar satışa açılacaktır.',
      okText: 'Serbest Bırak',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: 'Released' as ReservationStatus } : r
          )
        );
        message.success('Rezervasyon serbest bırakıldı');
      },
    });
    setOpenDropdown(null);
  };

  // Filter reservations
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reservedForName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort: Critical first, then by expiry
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    if (a.status === 'Active' && b.status !== 'Active') return -1;
    if (a.status !== 'Active' && b.status === 'Active') return 1;
    return dayjs(a.expiresAt).diff(dayjs(b.expiresAt));
  });

  const activeCount = reservations.filter((r) => r.status === 'Active').length;
  const expiringCount = reservations.filter((r) => {
    if (r.status !== 'Active') return false;
    return dayjs(r.expiresAt).diff(dayjs(), 'hour') < 24;
  }).length;

  return (
    <PageContainer maxWidth="7xl">
      <ListPageHeader
        icon={<InboxOutlined />}
        iconColor="#3b82f6"
        title="Stok Rezervasyonları"
        description="Siparişler için ayrılmış stok rezervasyonlarını yönetin"
        itemCount={reservations.length}
        secondaryActions={
          <div className="flex items-center gap-2">
            {expiringCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {expiringCount} yakında dolacak
              </div>
            )}
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Aktif Rezervasyon</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Kritik (24 saat)</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-orange-600">{expiringCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Süresi Dolan</span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-600">
            {reservations.filter((r) => r.status === 'Expired').length}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Toplam Ayrılan Adet</span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {reservations
              .filter((r) => r.status === 'Active')
              .reduce((sum, r) => sum + r.reservedQuantity, 0)}
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
              placeholder="Ürün, SKU, müşteri veya sipariş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['All', 'Active', 'Expired', 'Released', 'Fulfilled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'Tümü' : getStatusConfig(status as ReservationStatus).label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reservations Table */}
      {sortedReservations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="Rezervasyon bulunamadı"
            description="Arama kriterlerinize uygun rezervasyon bulunmuyor"
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Ürün
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Rezerve Edildi
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Miktar
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Kalan Süre
                  </th>
                  <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    Durum
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReservations.map((reservation) => {
                  const timeRemaining = getTimeRemaining(reservation.expiresAt);
                  const statusConfig = getStatusConfig(reservation.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={reservation.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        timeRemaining.critical && reservation.status === 'Active'
                          ? 'bg-red-50/50'
                          : timeRemaining.warning && reservation.status === 'Active'
                          ? 'bg-orange-50/30'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {reservation.productName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {reservation.productSku} • {reservation.warehouseName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {reservation.reservedForName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-xs ${
                                reservation.reservedForType === 'Order'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : reservation.reservedForType === 'Customer'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {reservation.reservedForType === 'Order'
                                ? 'Sipariş'
                                : reservation.reservedForType === 'Customer'
                                ? 'Müşteri'
                                : 'Transfer'}
                            </span>
                            {reservation.orderNumber && (
                              <span className="text-slate-400">
                                {reservation.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-semibold">
                          {reservation.reservedQuantity} adet
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reservation.status === 'Active' ? (
                          <div className="flex items-center gap-2">
                            <Timer
                              className={`w-4 h-4 ${
                                timeRemaining.critical
                                  ? 'text-red-500'
                                  : timeRemaining.warning
                                  ? 'text-orange-500'
                                  : 'text-slate-400'
                              }`}
                            />
                            <div>
                              <div
                                className={`font-medium ${
                                  timeRemaining.critical
                                    ? 'text-red-600'
                                    : timeRemaining.warning
                                    ? 'text-orange-600'
                                    : 'text-slate-700'
                                }`}
                              >
                                {timeRemaining.text}
                              </div>
                              <div className="text-xs text-slate-400">
                                {dayjs(reservation.expiresAt).format('DD MMM HH:mm')}
                              </div>
                            </div>
                            {timeRemaining.critical && (
                              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reservation.status === 'Active' && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === reservation.id ? null : reservation.id
                                )
                              }
                              className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                            {openDropdown === reservation.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdown(null)}
                                />
                                <div className="absolute right-0 z-20 mt-1 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleExtendClick(reservation)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                      Süre Uzat
                                    </button>
                                    <button
                                      onClick={() => handleReleaseClick(reservation.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Unlock className="w-4 h-4" />
                                      Zorla Serbest Bırak
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Extend Duration Modal */}
      <Modal
        title="Rezervasyon Süresini Uzat"
        open={extendModalOpen}
        onOk={handleExtendConfirm}
        onCancel={() => {
          setExtendModalOpen(false);
          setSelectedReservation(null);
        }}
        okText="Uzat"
        cancelText="Vazgeç"
        width={400}
      >
        {selectedReservation && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="font-medium text-slate-900">
                {selectedReservation.productName}
              </div>
              <div className="text-sm text-slate-500">
                {selectedReservation.reservedForName} için {selectedReservation.reservedQuantity} adet
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kaç gün uzatılsın?
              </label>
              <InputNumber
                min={1}
                max={30}
                value={extendDays}
                onChange={(value) => setExtendDays(value || 3)}
                className="w-full"
                addonAfter="gün"
              />
            </div>
            <div className="text-sm text-slate-500">
              Yeni son tarih:{' '}
              <span className="font-medium text-slate-900">
                {dayjs(selectedReservation.expiresAt)
                  .add(extendDays, 'day')
                  .format('DD MMMM YYYY HH:mm')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
