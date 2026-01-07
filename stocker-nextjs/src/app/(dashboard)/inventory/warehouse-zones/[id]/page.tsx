'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Modal, Tag, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CalendarIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  LockClosedIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  StopIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouseZone,
  useDeleteWarehouseZone,
} from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

const zoneTypeConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  General: { color: '#475569', label: 'Genel', bgColor: '#f1f5f9' },
  ColdStorage: { color: '#0369a1', label: 'Soğuk Depo', bgColor: '#e0f2fe' },
  Freezer: { color: '#0e7490', label: 'Dondurucu', bgColor: '#cffafe' },
  DryStorage: { color: '#c2410c', label: 'Kuru Depo', bgColor: '#ffedd5' },
  Hazardous: { color: '#dc2626', label: 'Tehlikeli Madde', bgColor: '#fee2e2' },
  Quarantine: { color: '#7c3aed', label: 'Karantina', bgColor: '#ede9fe' },
  Returns: { color: '#be185d', label: 'İade', bgColor: '#fce7f3' },
  Picking: { color: '#059669', label: 'Toplama', bgColor: '#d1fae5' },
  Shipping: { color: '#1d4ed8', label: 'Sevkiyat', bgColor: '#dbeafe' },
  Receiving: { color: '#65a30d', label: 'Kabul', bgColor: '#ecfccb' },
  CrossDocking: { color: '#ca8a04', label: 'Cross-Docking', bgColor: '#fef9c3' },
  HighValue: { color: '#ea580c', label: 'Yüksek Değerli', bgColor: '#fff7ed' },
  Bulk: { color: '#475569', label: 'Toplu Depolama', bgColor: '#f1f5f9' },
  Other: { color: '#64748b', label: 'Diğer', bgColor: '#f8fafc' },
};

export default function WarehouseZoneDetailPage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = Number(params.id);

  const { data: zone, isLoading, error } = useWarehouseZone(zoneId);
  const deleteZone = useDeleteWarehouseZone();

  const handleDelete = () => {
    if (!zone) return;
    Modal.confirm({
      title: 'Bölgeyi Sil',
      content: `"${zone.name}" bölgesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteZone.mutateAsync(zoneId);
          router.push('/inventory/warehouse-zones');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !zone) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Bölge Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen depo bölgesi bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/inventory/warehouse-zones')} className="!border-slate-300">
            Bölgelere Dön
          </Button>
        </div>
      </div>
    );
  }

  const typeConfig = zoneTypeConfig[zone.zoneType] || { color: '#64748b', label: zone.zoneType, bgColor: '#f1f5f9' };
  const capacityPercentage = zone.totalArea && zone.usableArea
    ? Math.round((zone.usableArea / zone.totalArea) * 100)
    : 0;

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
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{zone.name}</h1>
                {zone.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                    <CheckCircleIcon className="w-3 h-3" /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                    <StopIcon className="w-3 h-3" /> Pasif
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 m-0">{zone.code}</p>
            </div>
          </div>
          <Space size="small">
            <Button
              icon={<PencilSquareIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/warehouse-zones/${zoneId}/edit`)}
              className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
              loading={deleteZone.isPending}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* ─────────────── KPI CARDS (Top Row) ─────────────── */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasyonlar</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{zone.locationCount}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Alan</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {zone.totalArea ? zone.totalArea.toLocaleString('tr-TR') : '-'}
                </span>
                <span className="text-sm text-slate-400">m²</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Palet Kapasitesi</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{zone.maxPalletCapacity ?? '-'}</span>
                <span className="text-sm text-slate-400">palet</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Yükseklik</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {zone.maxHeight ? zone.maxHeight.toLocaleString('tr-TR') : '-'}
                </span>
                <span className="text-sm text-slate-400">m</span>
              </div>
            </div>
          </div>

          {/* ─────────────── MAIN CONTENT AREA ─────────────── */}

          {/* Zone Info - Left Side */}
          <div className="col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Bölge Bilgileri</p>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bölge Kodu</label>
                  <p className="text-sm font-medium text-slate-900 m-0">{zone.code}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Bölge Tipi</label>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                  >
                    {typeConfig.label}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Öncelik</label>
                  <p className="text-sm font-medium text-slate-900 m-0">{zone.priority}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Depo</label>
                  <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                    <HomeIcon className="w-4 h-4 text-slate-400" />
                    {zone.warehouseName || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kullanılabilir Alan</label>
                  <p className="text-sm font-medium text-slate-900 m-0">
                    {zone.usableArea ? `${zone.usableArea.toLocaleString('tr-TR')} m²` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Ağırlık/m²</label>
                  <p className="text-sm font-medium text-slate-900 m-0">
                    {zone.maxWeightPerArea ? `${zone.maxWeightPerArea.toLocaleString('tr-TR')} kg` : '-'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {zone.description && (
                <div className="mb-6">
                  <label className="text-xs text-slate-400 block mb-1">Açıklama</label>
                  <p className="text-sm text-slate-600 m-0">{zone.description}</p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100 my-6" />

              {/* Capacity Progress */}
              {zone.totalArea && zone.usableArea && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Kullanılabilir Alan Oranı</span>
                    <span className="text-xs font-medium text-slate-700">{capacityPercentage}%</span>
                  </div>
                  <Progress
                    percent={capacityPercentage}
                    showInfo={false}
                    strokeColor="#1e293b"
                    trailColor="#e2e8f0"
                    size="small"
                  />
                </div>
              )}

              {/* Operation Flags */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Cog6ToothIcon className="w-4 h-4" /> Operasyon Özellikleri
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${zone.isDefaultPickingZone ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">Varsayılan Toplama</span>
                  {zone.isDefaultPickingZone && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${zone.isDefaultPutawayZone ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">Varsayılan Yerleştirme</span>
                  {zone.isDefaultPutawayZone && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${zone.isQuarantineZone ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">Karantina</span>
                  {zone.isQuarantineZone && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${zone.isReturnsZone ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="text-xs font-medium">İade Bölgesi</span>
                  {zone.isReturnsZone && <CheckCircleIcon className="w-3 h-3" />}
                </div>
              </div>
            </div>
          </div>

          {/* Environment Controls - Right Side */}
          <div className="col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Çevre Kontrolleri</p>

              <div className="space-y-5">
                {/* Temperature Control */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${zone.isTemperatureControlled ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <BeakerIcon className={`w-5 h-5 ${zone.isTemperatureControlled ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Sıcaklık Kontrolü</span>
                      <Tag color={zone.isTemperatureControlled ? 'blue' : 'default'}>
                        {zone.isTemperatureControlled ? 'Aktif' : 'Pasif'}
                      </Tag>
                    </div>
                    {zone.isTemperatureControlled && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-blue-600">Min</div>
                          <div className="text-sm font-semibold text-blue-700">{zone.minTemperature}°C</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-blue-600">Max</div>
                          <div className="text-sm font-semibold text-blue-700">{zone.maxTemperature}°C</div>
                        </div>
                        {zone.targetTemperature && (
                          <div className="bg-blue-100 rounded-lg p-2 text-center">
                            <div className="text-xs text-blue-600">Hedef</div>
                            <div className="text-sm font-semibold text-blue-700">{zone.targetTemperature}°C</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Humidity Control */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${zone.isHumidityControlled ? 'bg-cyan-100' : 'bg-slate-100'}`}>
                    <BeakerIcon className={`w-5 h-5 ${zone.isHumidityControlled ? 'text-cyan-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Nem Kontrolü</span>
                      <Tag color={zone.isHumidityControlled ? 'cyan' : 'default'}>
                        {zone.isHumidityControlled ? 'Aktif' : 'Pasif'}
                      </Tag>
                    </div>
                    {zone.isHumidityControlled && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-cyan-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-cyan-600">Min</div>
                          <div className="text-sm font-semibold text-cyan-700">%{zone.minHumidity}</div>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-cyan-600">Max</div>
                          <div className="text-sm font-semibold text-cyan-700">%{zone.maxHumidity}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hazardous */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${zone.isHazardous ? 'bg-red-100' : 'bg-slate-100'}`}>
                    <ExclamationTriangleIcon className={`w-5 h-5 ${zone.isHazardous ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Tehlikeli Madde</span>
                      <Tag color={zone.isHazardous ? 'red' : 'default'}>
                        {zone.isHazardous ? 'Evet' : 'Hayır'}
                      </Tag>
                    </div>
                    {zone.isHazardous && (zone.hazardClass || zone.unNumber) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {zone.hazardClass && (
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-red-600">Sınıf</div>
                            <div className="text-sm font-semibold text-red-700">{zone.hazardClass}</div>
                          </div>
                        )}
                        {zone.unNumber && (
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-red-600">UN No</div>
                            <div className="text-sm font-semibold text-red-700">{zone.unNumber}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Access Control */}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${zone.requiresSpecialAccess ? 'bg-amber-100' : 'bg-slate-100'}`}>
                    <LockClosedIcon className={`w-5 h-5 ${zone.requiresSpecialAccess ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Özel Erişim</span>
                      <Tag color={zone.requiresSpecialAccess ? 'orange' : 'default'}>
                        {zone.requiresSpecialAccess ? 'Gerekli' : 'Gerekli Değil'}
                      </Tag>
                    </div>
                    {zone.requiresSpecialAccess && zone.accessLevel && (
                      <div className="bg-amber-50 rounded-lg p-2 text-center mt-2">
                        <div className="text-xs text-amber-600">Erişim Seviyesi</div>
                        <div className="text-sm font-semibold text-amber-700">{zone.accessLevel}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── BOTTOM ROW ─────────────── */}

          {/* Locations Card */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Bu Bölgedeki Lokasyonlar</p>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => router.push(`/inventory/locations/new?warehouseId=${zone.warehouseId}&zoneId=${zoneId}`)}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Lokasyon Ekle
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                  <MapPinIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-slate-900">{zone.locationCount}</div>
                  <div className="text-sm text-slate-500">lokasyon tanımlı</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Tarihler</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(zone.createdAt).format('DD MMMM YYYY, HH:mm')}
                  </span>
                </div>
                {zone.updatedAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Son Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(zone.updatedAt).format('DD MMMM YYYY, HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
