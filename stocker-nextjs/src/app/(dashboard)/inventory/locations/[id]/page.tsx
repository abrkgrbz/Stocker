'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Progress } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  HomeIcon,
  InboxIcon,
  MapPinIcon,
  PencilIcon,
  Squares2X2Icon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useLocation, useWarehouse } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = Number(params.id);

  const { data: location, isLoading } = useLocation(locationId);
  const { data: warehouse } = useWarehouse(location?.warehouseId || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Lokasyon bulunamadı" />
      </div>
    );
  }

  const capacityPercent = location.capacity
    ? Math.round((location.usedCapacity / location.capacity) * 100)
    : 0;

  const availableCapacity = (location.capacity || 0) - (location.usedCapacity || 0);
  const positionPath = [location.aisle, location.shelf, location.bin].filter(Boolean).join(' / ');

  const getCapacityColor = (percent: number) => {
    if (percent > 90) return 'text-red-600';
    if (percent > 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getProgressStatus = (percent: number) => {
    if (percent > 90) return 'exception';
    if (percent > 70) return 'normal';
    return 'success';
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
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{location.name}</h1>
                  <Tag
                    icon={location.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      location.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {location.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  Kod: {location.code}
                  {warehouse && ` | Depo: ${warehouse.name}`}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/locations/${locationId}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
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
                  <Squares2X2Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam Kapasite
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{location.capacity || 0}</span>
                <span className="text-sm text-slate-400">birim</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kullanılan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {location.usedCapacity || 0}
                </span>
                <span className="text-sm text-slate-400">birim</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Boş Kapasite
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">{availableCapacity}</span>
                <span className="text-sm text-slate-400">birim</span>
              </div>
            </div>
          </div>

          {/* Location Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Lokasyon Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lokasyon Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{location.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Lokasyon Adı</p>
                  <p className="text-sm font-medium text-slate-900">{location.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Depo</p>
                  {warehouse ? (
                    <button
                      onClick={() => router.push(`/inventory/warehouses/${warehouse.id}`)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <HomeIcon className="w-4 h-4" />
                      {warehouse.name}
                    </button>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={location.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      location.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {location.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                {positionPath && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Konum Yolu</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                      {positionPath}
                    </span>
                  </div>
                )}
                {location.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{location.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(location.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {location.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(location.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Position Details Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Konum Detayları
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Koridor</p>
                  <p className="text-2xl font-bold text-slate-900">{location.aisle || '-'}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Raf</p>
                  <p className="text-2xl font-bold text-slate-900">{location.shelf || '-'}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Bölme</p>
                  <p className="text-2xl font-bold text-slate-900">{location.bin || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Status Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kapasite Durumu
              </p>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <Progress
                    type="circle"
                    percent={capacityPercent}
                    status={getProgressStatus(capacityPercent)}
                    size={100}
                    format={(percent) => (
                      <span className={`text-lg font-bold ${getCapacityColor(percent || 0)}`}>
                        {percent}%
                      </span>
                    )}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Toplam Kapasite</span>
                    <span className="text-sm font-medium text-slate-900">
                      {location.capacity || 0} birim
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Kullanılan</span>
                    <span className="text-sm font-medium text-amber-600">
                      {location.usedCapacity || 0} birim
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Boş</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {availableCapacity} birim
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
