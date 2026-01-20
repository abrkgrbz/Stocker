'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Spin, Descriptions, Space, Divider } from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { useBarcodeDefinition, useDeleteBarcodeDefinition } from '@/lib/api/hooks/useInventory';
import { BarcodeType } from '@/lib/api/services/inventory.types';
import { confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

const barcodeTypeLabels: Record<string, { label: string; color: string }> = {
  [BarcodeType.EAN13]: { label: 'EAN-13', color: 'blue' },
  [BarcodeType.EAN8]: { label: 'EAN-8', color: 'cyan' },
  [BarcodeType.UPCA]: { label: 'UPC-A', color: 'purple' },
  [BarcodeType.UPCE]: { label: 'UPC-E', color: 'magenta' },
  [BarcodeType.Code128]: { label: 'Code 128', color: 'green' },
  [BarcodeType.Code39]: { label: 'Code 39', color: 'lime' },
  [BarcodeType.QRCode]: { label: 'QR Code', color: 'orange' },
  [BarcodeType.DataMatrix]: { label: 'Data Matrix', color: 'gold' },
  [BarcodeType.PDF417]: { label: 'PDF417', color: 'volcano' },
  [BarcodeType.ITF14]: { label: 'ITF-14', color: 'geekblue' },
  [BarcodeType.GS1_128]: { label: 'GS1-128', color: 'cyan' },
  [BarcodeType.Internal]: { label: 'Dahili', color: 'default' },
};

export default function BarcodeDefinitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: barcodeDefinition, isLoading } = useBarcodeDefinition(id);
  const deleteBarcodeDefinition = useDeleteBarcodeDefinition();

  const handleDelete = async () => {
    if (!barcodeDefinition) return;

    const confirmed = await confirmAction(
      'Barkod Tanımını Sil',
      `"${barcodeDefinition.barcode}" barkodunu silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteBarcodeDefinition.mutateAsync(id);
        router.push('/inventory/barcode-definitions');
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

  if (!barcodeDefinition) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Barkod tanımı bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/barcode-definitions')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const barcodeTypeInfo = barcodeTypeLabels[barcodeDefinition.barcodeType] || { label: 'Bilinmiyor', color: 'default' };

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
              onClick={() => router.push('/inventory/barcode-definitions')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0 font-mono">
                {barcodeDefinition.barcode}
              </h1>
              <p className="text-sm text-gray-400 m-0">{barcodeDefinition.productName}</p>
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
              onClick={() => router.push(`/inventory/barcode-definitions/${id}/edit`)}
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
              <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <QrCodeIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-mono">{barcodeDefinition.barcode}</h2>
                <p className="text-slate-500">{barcodeDefinition.description || 'Açıklama yok'}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Tag color={barcodeTypeInfo.color}>{barcodeTypeInfo.label}</Tag>
                {barcodeDefinition.isPrimary && <Tag color="green">Birincil</Tag>}
                {barcodeDefinition.isManufacturerBarcode && <Tag color="purple">Üretici</Tag>}
                <Tag color={barcodeDefinition.isActive ? 'green' : 'default'}>
                  {barcodeDefinition.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Ürün Bilgileri</h3>
            <Descriptions
              column={3}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Ürün">{barcodeDefinition.productName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ürün Kodu">{barcodeDefinition.productCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="Birim">{barcodeDefinition.unitName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Birim Başına Miktar">{barcodeDefinition.quantityPerUnit}</Descriptions.Item>
              <Descriptions.Item label="Ambalaj Tipi">{barcodeDefinition.packagingTypeName || '-'}</Descriptions.Item>
              <Descriptions.Item label="GTIN">{barcodeDefinition.gtin || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Üretici Bilgileri</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Üretici Barkodu">{barcodeDefinition.isManufacturerBarcode ? 'Evet' : 'Hayır'}</Descriptions.Item>
              <Descriptions.Item label="Üretici Kodu">{barcodeDefinition.manufacturerCode || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Geçerlilik</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Geçerlilik Başlangıcı">
                {barcodeDefinition.validFrom ? dayjs(barcodeDefinition.validFrom).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Geçerlilik Bitişi">
                {barcodeDefinition.validUntil ? dayjs(barcodeDefinition.validUntil).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sistem Bilgileri</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Oluşturulma">
                {dayjs(barcodeDefinition.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {barcodeDefinition.updatedAt ? dayjs(barcodeDefinition.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </div>
  );
}
