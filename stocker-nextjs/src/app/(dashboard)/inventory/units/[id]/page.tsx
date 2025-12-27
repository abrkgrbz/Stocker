'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  PencilIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useUnit, useUnits } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export default function UnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = Number(params.id);

  const { data: unit, isLoading } = useUnit(unitId);
  const { data: allUnits = [] } = useUnits();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Birim bulunamadı" />
      </div>
    );
  }

  // Find base unit if this unit has a conversion
  const baseUnit = unit.baseUnitId ? allUnits.find((u) => u.id === unit.baseUnitId) : null;

  // Find derived units (units that use this as base)
  const derivedUnits = allUnits.filter((u) => u.baseUnitId === unitId);

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
                <CalculatorOutlined className="text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{unit.name}</h1>
                  <Tag
                    icon={unit.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      unit.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {unit.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  Kod: {unit.code} | Sembol: {unit.symbol}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/units/${unitId}/edit`)}
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
                  <span className="text-white font-bold text-lg">{unit.symbol}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sembol
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{unit.symbol}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <SwapOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dönüşüm Faktörü
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {unit.conversionFactor || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalculatorOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Türetilmiş Birim
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{derivedUnits.length}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          {/* Unit Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Birim Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Birim Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{unit.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Birim Adı</p>
                  <p className="text-sm font-medium text-slate-900">{unit.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sembol</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-sm font-medium">
                    {unit.symbol}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={unit.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      unit.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {unit.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
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
                    {dayjs(unit.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {unit.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(unit.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Info */}
          {baseUnit && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Dönüşüm Bilgileri
                </p>
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-2xl">{unit.symbol}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">1 {unit.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl text-slate-400">=</span>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-xl bg-emerald-600 flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-xl">{unit.conversionFactor}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{baseUnit.name}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => router.push(`/inventory/units/${baseUnit.id}`)}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Temel Birim: {baseUnit.name} ({baseUnit.symbol})
                    <ChevronRightIcon className="w-4 h-4 text-xs" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Derived Units Section */}
          {derivedUnits.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Türetilmiş Birimler ({derivedUnits.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {derivedUnits.map((derived) => (
                    <div
                      key={derived.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/inventory/units/${derived.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <span className="text-slate-700 font-bold">{derived.symbol}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 m-0">{derived.name}</p>
                          <p className="text-xs text-slate-400 m-0">{derived.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          1 {derived.symbol} = {derived.conversionFactor} {unit.symbol}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-slate-300 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
