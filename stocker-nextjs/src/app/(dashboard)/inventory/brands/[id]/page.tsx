'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PencilIcon,
  TagIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useBrand } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export default function BrandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = Number(params.id);

  const { data: brand, isLoading, error } = useBrand(brandId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Marka bulunamadı" />
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
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <TagIcon className="w-4 h-4 text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{brand.name}</h1>
                  <Tag
                    icon={brand.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      brand.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {brand.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {brand.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/brands/${brandId}/edit`)}
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
          {/* Logo Section */}
          {brand.logoUrl && (
            <div className="col-span-12 md:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Logo
                </p>
                <div className="flex justify-center items-center">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-w-full max-h-48 object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Brand Info Section */}
          <div className={`col-span-12 ${brand.logoUrl ? 'md:col-span-8' : 'md:col-span-12'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Marka Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Marka Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{brand.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Marka Adı</p>
                  <p className="text-sm font-medium text-slate-900">{brand.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={brand.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      brand.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {brand.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturulma</p>
                  <p className="text-sm font-medium text-slate-900">
                    {dayjs(brand.createdAt).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              </div>

              {/* Description */}
              {brand.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Açıklama</p>
                  </div>
                  <p className="text-sm text-slate-700">{brand.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Website Section */}
          {brand.website && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-slate-600 text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Web Sitesi
                    </p>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {brand.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps Section */}
          <div className={`col-span-12 ${brand.website ? 'md:col-span-6' : 'md:col-span-12'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(brand.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {brand.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(brand.updatedAt).format('DD/MM/YYYY HH:mm')}
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
