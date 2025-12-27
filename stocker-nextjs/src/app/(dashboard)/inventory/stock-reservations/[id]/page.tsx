'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  Alert,
  Modal,
  Progress,
  InputNumber,
  Input,
  DatePicker,
  Timeline,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MapPinIcon,
  PrinterIcon,
  Squares2X2Icon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useStockReservation,
  useFulfillStockReservation,
  useCancelStockReservation,
  useExtendStockReservation,
} from '@/lib/api/hooks/useInventory';
import type { ReservationStatus, ReservationType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const statusConfig: Record<ReservationStatus, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
  Active: { label: 'Aktif', bgColor: 'bg-blue-50', textColor: 'text-blue-700', icon: <LockClosedIcon className="w-4 h-4" /> },
  PartiallyFulfilled: { label: 'Kısmen Karşılandı', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: <ClockIcon className="w-4 h-4" /> },
  Fulfilled: { label: 'Karşılandı', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Cancelled: { label: 'İptal Edildi', bgColor: 'bg-slate-100', textColor: 'text-slate-600', icon: <XCircleIcon className="w-4 h-4" /> },
  Expired: { label: 'Süresi Doldu', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: <ClockIcon className="w-4 h-4" /> },
};

const reservationTypeConfig: Record<ReservationType, { label: string; bgColor: string; textColor: string }> = {
  SalesOrder: { label: 'Satış Siparişi', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  Production: { label: 'Üretim', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  Transfer: { label: 'Transfer', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  Manual: { label: 'Manuel', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  Project: { label: 'Proje', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
  Assembly: { label: 'Montaj', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  Service: { label: 'Servis', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
};

export default function StockReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [fulfillModalVisible, setFulfillModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [fulfillQuantity, setFulfillQuantity] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [extendDate, setExtendDate] = useState<dayjs.Dayjs | null>(null);

  const { data: reservation, isLoading, error } = useStockReservation(id);
  const fulfillReservation = useFulfillStockReservation();
  const cancelReservation = useCancelStockReservation();
  const extendReservation = useExtendStockReservation();

  const handleFulfill = async () => {
    try {
      await fulfillReservation.mutateAsync({
        id,
        quantity: fulfillQuantity,
      });
      setFulfillModalVisible(false);
      setFulfillQuantity(0);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = async () => {
    try {
      await cancelReservation.mutateAsync({
        id,
        reason: cancelReason || undefined,
      });
      setCancelModalVisible(false);
      setCancelReason('');
    } catch {
      // Error handled by hook
    }
  };

  const handleExtend = async () => {
    if (!extendDate) return;
    try {
      await extendReservation.mutateAsync({
        id,
        newExpirationDate: extendDate.toISOString(),
      });
      setExtendModalVisible(false);
      setExtendDate(null);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Alert
          message="Hata"
          description="Rezervasyon bilgileri yüklenemedi"
          type="error"
          showIcon
          action={<Button onClick={() => router.back()}>Geri Dön</Button>}
        />
      </div>
    );
  }

  const config = statusConfig[reservation.status];
  const typeConfig = reservationTypeConfig[reservation.reservationType];
  const fulfillmentPercent = reservation.quantity > 0
    ? Math.round((reservation.fulfilledQuantity / reservation.quantity) * 100)
    : 0;

  const isExpiringSoon = reservation.expirationDate &&
    dayjs(reservation.expirationDate).diff(dayjs(), 'day') <= 3 &&
    reservation.status === 'Active';

  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    if (reservation.status === 'Active' || reservation.status === 'PartiallyFulfilled') {
      buttons.push(
        <Button
          key="fulfill"
          type="primary"
          icon={<CheckCircleIcon className="w-4 h-4" />}
          onClick={() => {
            setFulfillQuantity(reservation.remainingQuantity);
            setFulfillModalVisible(true);
          }}
          style={{ background: '#1e293b', borderColor: '#1e293b' }}
        >
          Karşıla
        </Button>,
        <Button
          key="extend"
          icon={<ClockIcon className="w-4 h-4" />}
          onClick={() => {
            setExtendDate(
              reservation.expirationDate
                ? dayjs(reservation.expirationDate).add(7, 'day')
                : dayjs().add(7, 'day')
            );
            setExtendModalVisible(true);
          }}
          className="border-slate-200 text-slate-700 hover:border-slate-300"
        >
          Süre Uzat
        </Button>,
        <Button
          key="cancel"
          danger
          icon={<XCircleIcon className="w-4 h-4" />}
          onClick={() => setCancelModalVisible(true)}
        >
          İptal Et
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center">
                <LockClosedIcon className="w-4 h-4 text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {reservation.reservationNumber}
                  </h1>
                  <Tag
                    icon={config.icon}
                    className={`border-0 ${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Tag>
                  {isExpiringSoon && (
                    <Tag className="border-0 bg-amber-50 text-amber-700">Süresi Yakında Doluyor</Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {typeConfig.label}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Yazdır
            </Button>
            {getActionButtons()}
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <LockClosedIcon className="w-4 h-4 text-white text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{reservation.quantity}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Karşılanan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">{reservation.fulfilledQuantity}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-orange-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kalan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-3xl font-bold ${
                    reservation.remainingQuantity > 0 ? 'text-orange-600' : 'text-emerald-600'
                  }`}
                >
                  {reservation.remainingQuantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Karşılanma Durumu
              </p>
              <div className="flex items-center justify-center">
                <Progress
                  type="circle"
                  percent={fulfillmentPercent}
                  size={120}
                  strokeColor={{
                    '0%': '#f97316',
                    '100%': '#10b981',
                  }}
                  format={() => (
                    <div className="text-center">
                      <span className="text-2xl font-bold text-slate-900">
                        {reservation.fulfilledQuantity}
                      </span>
                      <span className="text-slate-400 text-lg">/{reservation.quantity}</span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Rezerve Edilen Ürün
              </p>
              <div
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors mb-4"
                onClick={() => router.push(`/inventory/products/${reservation.productId}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                  <Squares2X2Icon className="w-4 h-4 text-white text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 m-0">{reservation.productName}</p>
                  <p className="text-xs text-slate-500 m-0">{reservation.productCode}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm">Ürüne Git</span>
                  <ChevronRightIcon className="w-4 h-4 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => router.push(`/inventory/warehouses/${reservation.warehouseId}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 m-0">Depo</p>
                    <p className="text-sm font-medium text-slate-900 m-0">{reservation.warehouseName}</p>
                  </div>
                </div>
                {reservation.locationName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 m-0">Lokasyon</p>
                      <p className="text-sm font-medium text-slate-900 m-0">{reservation.locationName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservation Details Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Rezervasyon Detayları
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rezervasyon Tarihi</p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400 text-xs" />
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(reservation.reservationDate).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Geçerlilik</p>
                  {reservation.expirationDate ? (
                    <span
                      className={`text-sm font-medium ${
                        isExpiringSoon ? 'text-orange-600' : 'text-slate-900'
                      }`}
                    >
                      {dayjs(reservation.expirationDate).format('DD/MM/YYYY')}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rezervasyon Türü</p>
                  <Tag className={`border-0 ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturulma</p>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {reservation.referenceDocumentType && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Referans Belge Türü</p>
                      <span className="text-sm font-medium text-slate-900">
                        {reservation.referenceDocumentType}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Referans Belge No</p>
                      <span className="text-sm font-medium text-slate-900">
                        {reservation.referenceDocumentNumber || '-'}
                      </span>
                    </div>
                  </>
                )}
                {reservation.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Notlar</p>
                    <p className="text-sm text-slate-600">{reservation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Geçmiş
              </p>
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <div>
                        <p className="text-sm font-medium text-slate-900 m-0">Oluşturuldu</p>
                        <p className="text-xs text-slate-500 m-0">
                          {dayjs(reservation.createdAt).format('DD/MM/YYYY HH:mm')}
                        </p>
                      </div>
                    ),
                  },
                  ...(reservation.fulfilledQuantity > 0
                    ? [
                        {
                          color: 'blue' as const,
                          children: (
                            <div>
                              <p className="text-sm font-medium text-slate-900 m-0">Kısmen Karşılandı</p>
                              <p className="text-xs text-slate-500 m-0">
                                {reservation.fulfilledQuantity} adet karşılandı
                              </p>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(reservation.status === 'Fulfilled'
                    ? [
                        {
                          color: 'green' as const,
                          children: (
                            <div>
                              <p className="text-sm font-medium text-slate-900 m-0">Tamamen Karşılandı</p>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(reservation.status === 'Cancelled'
                    ? [
                        {
                          color: 'red' as const,
                          children: (
                            <div>
                              <p className="text-sm font-medium text-slate-900 m-0">İptal Edildi</p>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(reservation.status === 'Expired'
                    ? [
                        {
                          color: 'red' as const,
                          children: (
                            <div>
                              <p className="text-sm font-medium text-slate-900 m-0">Süresi Doldu</p>
                              <p className="text-xs text-slate-500 m-0">
                                {dayjs(reservation.expirationDate).format('DD/MM/YYYY')}
                              </p>
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fulfill Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Rezervasyonu Karşıla</span>}
        open={fulfillModalVisible}
        onOk={handleFulfill}
        onCancel={() => {
          setFulfillModalVisible(false);
          setFulfillQuantity(0);
        }}
        confirmLoading={fulfillReservation.isPending}
        okText="Karşıla"
        cancelText="İptal"
        okButtonProps={{ style: { background: '#1e293b', borderColor: '#1e293b' } }}
      >
        <div className="py-4">
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Toplam Miktar:</span>
              <span className="font-medium text-slate-900">{reservation.quantity}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Karşılanan:</span>
              <span className="font-medium text-slate-900">{reservation.fulfilledQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kalan:</span>
              <span className="font-medium text-orange-600">{reservation.remainingQuantity}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-2">Karşılanacak Miktar:</p>
          <InputNumber
            value={fulfillQuantity}
            onChange={(val) => setFulfillQuantity(val || 0)}
            min={1}
            max={reservation.remainingQuantity}
            style={{ width: '100%' }}
            size="large"
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Rezervasyonu İptal Et</span>}
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
        confirmLoading={cancelReservation.isPending}
        okText="İptal Et"
        okButtonProps={{ danger: true }}
        cancelText="Vazgeç"
      >
        <div className="py-4">
          <p className="text-sm text-slate-600 mb-2">İptal Nedeni (opsiyonel):</p>
          <Input.TextArea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="İptal nedenini belirtin..."
          />
        </div>
      </Modal>

      {/* Extend Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Rezervasyon Süresini Uzat</span>}
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false);
          setExtendDate(null);
        }}
        confirmLoading={extendReservation.isPending}
        okText="Uzat"
        cancelText="İptal"
        okButtonProps={{ style: { background: '#1e293b', borderColor: '#1e293b' } }}
      >
        <div className="py-4">
          <p className="text-sm text-slate-600 mb-2">Yeni Son Geçerlilik Tarihi:</p>
          <DatePicker
            value={extendDate}
            onChange={setExtendDate}
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current < dayjs().endOf('day')}
          />
        </div>
      </Modal>
    </div>
  );
}
