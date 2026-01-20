'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Spin, Descriptions, Space, Divider } from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { usePackagingType, useDeletePackagingType } from '@/lib/api/hooks/useInventory';
import { PackagingCategory } from '@/lib/api/services/inventory.types';
import { confirmAction } from '@/lib/utils/sweetalert';

const categoryLabels: Record<string, { label: string; color: string }> = {
  [PackagingCategory.Box]: { label: 'Kutu', color: 'blue' },
  [PackagingCategory.Carton]: { label: 'Karton', color: 'orange' },
  [PackagingCategory.Pallet]: { label: 'Palet', color: 'purple' },
  [PackagingCategory.Crate]: { label: 'Kasa', color: 'cyan' },
  [PackagingCategory.Bag]: { label: 'Torba', color: 'green' },
  [PackagingCategory.Drum]: { label: 'Varil', color: 'volcano' },
  [PackagingCategory.Container]: { label: 'Konteyner', color: 'geekblue' },
  [PackagingCategory.Bottle]: { label: 'Şişe', color: 'lime' },
  [PackagingCategory.Jar]: { label: 'Kavanoz', color: 'gold' },
  [PackagingCategory.Tube]: { label: 'Tüp', color: 'magenta' },
  [PackagingCategory.Pouch]: { label: 'Poşet', color: 'cyan' },
  [PackagingCategory.Roll]: { label: 'Rulo', color: 'purple' },
  [PackagingCategory.Other]: { label: 'Diğer', color: 'default' },
};

export default function PackagingTypeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: packagingType, isLoading } = usePackagingType(id);
  const deletePackagingType = useDeletePackagingType();

  const handleDelete = async () => {
    if (!packagingType) return;

    const confirmed = await confirmAction(
      'Ambalaj Tipini Sil',
      `"${packagingType.name}" ambalaj tipini silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deletePackagingType.mutateAsync(id);
        router.push('/inventory/packaging-types');
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!packagingType) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Ambalaj tipi bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/packaging-types')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = categoryLabels[packagingType.category] || { label: 'Bilinmiyor', color: 'default' };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/inventory/packaging-types')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                {packagingType.name}
              </h1>
              <p className="text-sm text-gray-400 m-0">{packagingType.code}</p>
            </div>
          </div>
          <Space>
            <Button
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={handleDelete}
              danger
            >
              Sil
            </Button>
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/packaging-types/${id}/edit`)}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Düzenle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CubeIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{packagingType.name}</h2>
                <p className="text-slate-500">{packagingType.description || 'Açıklama yok'}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Tag color={categoryInfo.color}>{categoryInfo.label}</Tag>
                <Tag color={packagingType.isActive ? 'green' : 'default'}>
                  {packagingType.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <Descriptions
              column={3}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Kod">{packagingType.code}</Descriptions.Item>
              <Descriptions.Item label="Materyal">{packagingType.materialType || '-'}</Descriptions.Item>
              <Descriptions.Item label="Barkod Öneki">{packagingType.barcodePrefix || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Boyutlar</h3>
            <Descriptions
              column={4}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Uzunluk">{packagingType.length ? `${packagingType.length} cm` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Genişlik">{packagingType.width ? `${packagingType.width} cm` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Yükseklik">{packagingType.height ? `${packagingType.height} cm` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Hacim">{packagingType.volume ? `${packagingType.volume} cm³` : '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Ağırlık</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Boş Ağırlık">{packagingType.emptyWeight ? `${packagingType.emptyWeight} kg` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Max Kapasite">{packagingType.maxWeightCapacity ? `${packagingType.maxWeightCapacity} kg` : '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Kapasite</h3>
            <Descriptions
              column={4}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Varsayılan Miktar">{packagingType.defaultQuantity || '-'}</Descriptions.Item>
              <Descriptions.Item label="Max Miktar">{packagingType.maxQuantity || '-'}</Descriptions.Item>
              <Descriptions.Item label="Palet Başına">{packagingType.unitsPerPallet || '-'}</Descriptions.Item>
              <Descriptions.Item label="Katman Başına">{packagingType.unitsPerPalletLayer || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Özellikler</h3>
            <div className="flex flex-wrap gap-2">
              {packagingType.isStackable && (
                <Tag color="blue">İstiflenebilir ({packagingType.stackableCount || '-'} adet)</Tag>
              )}
              {packagingType.isRecyclable && <Tag color="green">Geri Dönüştürülebilir</Tag>}
              {packagingType.isReturnable && (
                <Tag color="orange">İade Edilebilir (₺{packagingType.depositAmount || 0} depozito)</Tag>
              )}
              {!packagingType.isStackable && !packagingType.isRecyclable && !packagingType.isReturnable && (
                <span className="text-slate-400">Özel özellik tanımlanmamış</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
