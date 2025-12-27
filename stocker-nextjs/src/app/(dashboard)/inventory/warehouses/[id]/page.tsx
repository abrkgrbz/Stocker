'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty, Progress, Table } from 'antd';
import {
  ArrowLeftIcon,
  ArrowsPointingOutIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  Squares2X2Icon,
  StarIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useWarehouse, useLocations } from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: warehouse, isLoading, error } = useWarehouse(id);
  const { data: locations = [] } = useLocations(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Depo bilgileri yüklenemedi" />
      </div>
    );
  }

  const locationColumns: ColumnsType<LocationDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <span className="font-medium text-slate-900">{code}</span>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="text-slate-700">{name}</span>,
    },
    {
      title: 'Konum',
      key: 'position',
      width: 200,
      render: (_, record) => (
        <span className="text-slate-500">
          {[record.aisle, record.shelf, record.bin].filter(Boolean).join(' / ') || '-'}
        </span>
      ),
    },
    {
      title: 'Kapasite',
      key: 'capacity',
      width: 180,
      render: (_, record) => {
        if (!record.capacity) return <span className="text-slate-400">-</span>;
        const usedPercent = Math.round((record.usedCapacity / record.capacity) * 100);
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={usedPercent}
              size="small"
              status={usedPercent > 90 ? 'exception' : usedPercent > 70 ? 'normal' : 'success'}
              format={() => `${record.usedCapacity}/${record.capacity}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (active) => (
        <Tag
          icon={active ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
          className={`border-0 ${
            active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {active ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => router.push(`/inventory/locations/${record.id}/edit`)}
          className="text-slate-400 hover:text-slate-600"
        />
      ),
    },
  ];

  const address = [
    warehouse.street,
    warehouse.city,
    warehouse.state,
    warehouse.country,
    warehouse.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

  const activeLocations = locations.filter((l) => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const usedCapacitySum = locations.reduce((sum, l) => sum + (l.usedCapacity || 0), 0);
  const capacityPercent = totalCapacity > 0 ? Math.round((usedCapacitySum / totalCapacity) * 100) : 0;

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
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{warehouse.name}</h1>
                  {warehouse.isDefault && (
                    <Tag icon={<StarIcon className="w-4 h-4" />} className="border-0 bg-amber-50 text-amber-700">
                      Varsayılan
                    </Tag>
                  )}
                  <Tag
                    icon={warehouse.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      warehouse.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {warehouse.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {warehouse.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/warehouses/${id}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
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
                <span className="text-3xl font-bold text-slate-900">{warehouse.locationCount}</span>
                <span className="text-sm text-slate-400">{activeLocations} aktif</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Squares2X2Icon className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ürün Çeşidi
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{warehouse.productCount}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Stok Değeri
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {(warehouse.totalStockValue || 0).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-sm text-slate-400">₺</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ArrowsPointingOutIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kapasite
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getCapacityColor(capacityPercent)}`}>
                  %{capacityPercent}
                </span>
                <Progress
                  percent={capacityPercent}
                  showInfo={false}
                  size="small"
                  status={getProgressStatus(capacityPercent)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Warehouse Info Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Depo Bilgileri
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Depo Kodu</p>
                    <p className="text-sm font-medium text-slate-900">{warehouse.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Depo Adı</p>
                    <p className="text-sm font-medium text-slate-900">{warehouse.name}</p>
                  </div>
                </div>
                {warehouse.description && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{warehouse.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {warehouse.manager && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Yönetici</p>
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{warehouse.manager}</span>
                      </div>
                    </div>
                  )}
                  {warehouse.phone && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Telefon</p>
                      <div className="flex items-center gap-1.5">
                        <PhoneIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{warehouse.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
                {warehouse.totalArea > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Toplam Alan</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">
                      {warehouse.totalArea.toLocaleString()} m²
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Adres Bilgileri
              </p>
              {address ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    {warehouse.street && (
                      <p className="text-sm font-medium text-slate-900">{warehouse.street}</p>
                    )}
                    <p className="text-sm text-slate-600">
                      {[warehouse.city, warehouse.state].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {[warehouse.postalCode, warehouse.country].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-slate-400">
                  <span className="text-sm">Adres bilgisi girilmemiş</span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12 md:col-span-3">
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
                    {dayjs(warehouse.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
                {warehouse.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(warehouse.updatedAt).format('DD/MM/YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Locations Table Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lokasyonlar ({locations.length})
                </p>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Yeni Lokasyon
                </Button>
              </div>
              {locations.length > 0 ? (
                <Table
                  columns={locationColumns}
                  dataSource={locations}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} lokasyon`,
                  }}
                  size="small"
                  className="[&_.ant-table]:border-slate-200 [&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:text-slate-600 [&_.ant-table-thead_.ant-table-cell]:font-medium"
                  onRow={(record) => ({
                    onClick: () => router.push(`/inventory/locations/${record.id}`),
                    className: 'cursor-pointer hover:bg-slate-50',
                  })}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MapPinIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">Bu depoda henüz lokasyon tanımlanmamış</p>
                  <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => router.push(`/inventory/locations/new?warehouseId=${id}`)}
                    style={{ background: '#1e293b', borderColor: '#1e293b' }}
                  >
                    Lokasyon Ekle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
