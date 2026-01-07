'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CalendarIcon,
  CheckCircleIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  LockClosedIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useWarehouseZone } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const zoneTypeLabels: Record<string, string> = {
  'General': 'Genel',
  'ColdStorage': 'Soğuk Depo',
  'Freezer': 'Dondurucu',
  'DryStorage': 'Kuru Depo',
  'Hazardous': 'Tehlikeli Madde',
  'Quarantine': 'Karantina',
  'Returns': 'İade',
  'Picking': 'Toplama',
  'Shipping': 'Sevkiyat',
  'Receiving': 'Kabul',
  'CrossDocking': 'Cross-Docking',
  'HighValue': 'Yüksek Değerli',
  'Bulk': 'Toplu Depolama',
  'Other': 'Diğer',
};

const zoneTypeColors: Record<string, string> = {
  'General': 'default',
  'ColdStorage': 'blue',
  'Freezer': 'cyan',
  'DryStorage': 'orange',
  'Hazardous': 'red',
  'Quarantine': 'purple',
  'Returns': 'magenta',
  'Picking': 'green',
  'Shipping': 'geekblue',
  'Receiving': 'lime',
  'CrossDocking': 'gold',
  'HighValue': 'volcano',
  'Bulk': 'default',
  'Other': 'default',
};

export default function WarehouseZoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: zone, isLoading, error } = useWarehouseZone(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Bölge bilgileri yüklenemedi" />
      </div>
    );
  }

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
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
                <MapPinIcon className="w-5 h-5" style={{ color: '#10b981' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{zone.name}</h1>
                  <Tag color={zoneTypeColors[zone.zoneType] || 'default'}>
                    {zoneTypeLabels[zone.zoneType] || zone.zoneType}
                  </Tag>
                  <Tag
                    icon={zone.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      zone.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {zone.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {zone.code} • {zone.warehouseName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/warehouse-zones/${id}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/locations/new?warehouseId=${zone.warehouseId}&zoneId=${id}`)}
              style={{ background: '#1e293b', borderColor: '#1e293b' }}
            >
              Lokasyon Ekle
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lokasyonlar
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{zone.locationCount}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam Alan
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {zone.totalArea ? zone.totalArea.toLocaleString('tr-TR') : '-'}
                </span>
                <span className="text-sm text-slate-400">m²</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Palet Kapasitesi
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {zone.maxPalletCapacity ?? '-'}
                </span>
                <span className="text-sm text-slate-400">palet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Max Yükseklik
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {zone.maxHeight ? zone.maxHeight.toLocaleString('tr-TR') : '-'}
                </span>
                <span className="text-sm text-slate-400">m</span>
              </div>
            </div>
          </div>

          {/* Zone Info Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Bölge Bilgileri
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bölge Kodu</p>
                    <p className="text-sm font-medium text-slate-900">{zone.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bölge Adı</p>
                    <p className="text-sm font-medium text-slate-900">{zone.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Depo</p>
                    <div className="flex items-center gap-1.5">
                      <HomeIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{zone.warehouseName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bölge Tipi</p>
                    <Tag color={zoneTypeColors[zone.zoneType] || 'default'}>
                      {zoneTypeLabels[zone.zoneType] || zone.zoneType}
                    </Tag>
                  </div>
                </div>
                {zone.description && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{zone.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Öncelik</p>
                    <p className="text-sm font-medium text-slate-900">{zone.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Kullanılabilir Alan</p>
                    <p className="text-sm font-medium text-slate-900">
                      {zone.usableArea ? `${zone.usableArea.toLocaleString('tr-TR')} m²` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Controls Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Çevre Kontrolleri
              </p>
              <div className="space-y-4">
                {/* Temperature Control */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.isTemperatureControlled ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <BeakerIcon className={`w-5 h-5 ${zone.isTemperatureControlled ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Sıcaklık Kontrolü</p>
                      <Tag color={zone.isTemperatureControlled ? 'blue' : 'default'}>
                        {zone.isTemperatureControlled ? 'Aktif' : 'Pasif'}
                      </Tag>
                    </div>
                    {zone.isTemperatureControlled && (
                      <div className="mt-2 text-sm text-slate-600">
                        <span>Min: {zone.minTemperature}°C</span>
                        <span className="mx-2">|</span>
                        <span>Max: {zone.maxTemperature}°C</span>
                        {zone.targetTemperature && (
                          <>
                            <span className="mx-2">|</span>
                            <span>Hedef: {zone.targetTemperature}°C</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Humidity Control */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.isHumidityControlled ? 'bg-cyan-100' : 'bg-slate-100'
                  }`}>
                    <BeakerIcon className={`w-5 h-5 ${zone.isHumidityControlled ? 'text-cyan-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Nem Kontrolü</p>
                      <Tag color={zone.isHumidityControlled ? 'cyan' : 'default'}>
                        {zone.isHumidityControlled ? 'Aktif' : 'Pasif'}
                      </Tag>
                    </div>
                    {zone.isHumidityControlled && (
                      <div className="mt-2 text-sm text-slate-600">
                        <span>Min: %{zone.minHumidity}</span>
                        <span className="mx-2">|</span>
                        <span>Max: %{zone.maxHumidity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hazardous */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.isHazardous ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    <ExclamationTriangleIcon className={`w-5 h-5 ${zone.isHazardous ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Tehlikeli Madde</p>
                      <Tag color={zone.isHazardous ? 'red' : 'default'}>
                        {zone.isHazardous ? 'Evet' : 'Hayır'}
                      </Tag>
                    </div>
                    {zone.isHazardous && (zone.hazardClass || zone.unNumber) && (
                      <div className="mt-2 text-sm text-slate-600">
                        {zone.hazardClass && <span>Sınıf: {zone.hazardClass}</span>}
                        {zone.hazardClass && zone.unNumber && <span className="mx-2">|</span>}
                        {zone.unNumber && <span>UN: {zone.unNumber}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Access Control */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    zone.requiresSpecialAccess ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <LockClosedIcon className={`w-5 h-5 ${zone.requiresSpecialAccess ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Özel Erişim</p>
                      <Tag color={zone.requiresSpecialAccess ? 'orange' : 'default'}>
                        {zone.requiresSpecialAccess ? 'Gerekli' : 'Gerekli Değil'}
                      </Tag>
                    </div>
                    {zone.requiresSpecialAccess && zone.accessLevel && (
                      <div className="mt-2 text-sm text-slate-600">
                        Erişim Seviyesi: {zone.accessLevel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Flags Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Operasyon Özellikleri
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Tag color={zone.isDefaultPickingZone ? 'green' : 'default'}>
                    {zone.isDefaultPickingZone ? '✓' : '✗'}
                  </Tag>
                  <span className="text-sm text-slate-700">Varsayılan Toplama Bölgesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={zone.isDefaultPutawayZone ? 'green' : 'default'}>
                    {zone.isDefaultPutawayZone ? '✓' : '✗'}
                  </Tag>
                  <span className="text-sm text-slate-700">Varsayılan Yerleştirme Bölgesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={zone.isQuarantineZone ? 'purple' : 'default'}>
                    {zone.isQuarantineZone ? '✓' : '✗'}
                  </Tag>
                  <span className="text-sm text-slate-700">Karantina Bölgesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={zone.isReturnsZone ? 'magenta' : 'default'}>
                    {zone.isReturnsZone ? '✓' : '✗'}
                  </Tag>
                  <span className="text-sm text-slate-700">İade Bölgesi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12 md:col-span-6">
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
                    {dayjs(zone.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {zone.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Son Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(zone.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Locations Info Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Bu Bölgedeki Lokasyonlar
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {zone.locationCount} lokasyon
                    </p>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => router.push(`/inventory/locations/new?warehouseId=${zone.warehouseId}&zoneId=${id}`)}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Yeni Lokasyon Ekle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
