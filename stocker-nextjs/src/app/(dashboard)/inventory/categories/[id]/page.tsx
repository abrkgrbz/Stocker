'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  AppstoreOutlined,
  FolderOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SortAscendingOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useCategory, useCategories } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const { data: category, isLoading } = useCategory(categoryId);
  const { data: allCategories = [] } = useCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Kategori bulunamadı" />
      </div>
    );
  }

  // Find parent category
  const parentCategory = category.parentCategoryId
    ? allCategories.find((c) => c.id === category.parentCategoryId)
    : null;

  // Find child categories
  const childCategories = allCategories.filter((c) => c.parentCategoryId === categoryId);

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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <AppstoreOutlined className="text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{category.name}</h1>
                  <Tag
                    icon={category.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      category.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {category.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/categories/${categoryId}/edit`)}
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
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <SortAscendingOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sıralama
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{category.displayOrder}</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FolderOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Alt Kategori
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{childCategories.length}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Oluşturulma
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {dayjs(category.createdAt).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Category Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kategori Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kategori Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{category.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kategori Adı</p>
                  <p className="text-sm font-medium text-slate-900">{category.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={category.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      category.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sıralama</p>
                  <p className="text-sm font-medium text-slate-900">{category.displayOrder}</p>
                </div>
              </div>

              {/* Parent Category */}
              {parentCategory && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Üst Kategori</p>
                  <button
                    onClick={() => router.push(`/inventory/categories/${parentCategory.id}`)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <FolderOutlined />
                    {parentCategory.name}
                    <RightOutlined className="text-xs" />
                  </button>
                </div>
              )}

              {/* Description */}
              {category.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Açıklama</p>
                  </div>
                  <p className="text-sm text-slate-700">{category.description}</p>
                </div>
              )}
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
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(category.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                {category.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(category.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Child Categories Section */}
          {childCategories.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Alt Kategoriler ({childCategories.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {childCategories.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => router.push(`/inventory/categories/${child.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <FolderOutlined className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 m-0">{child.name}</p>
                          <p className="text-xs text-slate-400 m-0">{child.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag
                          className={`border-0 text-xs ${
                            child.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {child.isActive ? 'Aktif' : 'Pasif'}
                        </Tag>
                        <RightOutlined className="text-slate-300 text-xs" />
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
