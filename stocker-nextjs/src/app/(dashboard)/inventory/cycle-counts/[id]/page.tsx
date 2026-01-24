'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Descriptions, Space, Divider, Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalculatorIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useCycleCount,
  useStartCycleCount,
  useCompleteCycleCount,
} from '@/lib/api/hooks/useInventory';
import { CycleCountStatus, CycleCountType, CycleCountItemDto } from '@/lib/api/services/inventory.types';
import { confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

const statusConfig: Record<CycleCountStatus, { label: string; color: string }> = {
  [CycleCountStatus.Planned]: { label: 'Planlandı', color: 'default' },
  [CycleCountStatus.InProgress]: { label: 'Devam Ediyor', color: 'blue' },
  [CycleCountStatus.Completed]: { label: 'Tamamlandı', color: 'green' },
  [CycleCountStatus.Approved]: { label: 'Onaylandı', color: 'cyan' },
  [CycleCountStatus.Processed]: { label: 'İşlendi', color: 'purple' },
  [CycleCountStatus.Cancelled]: { label: 'İptal Edildi', color: 'red' },
};

const countTypeLabels: Record<CycleCountType, string> = {
  [CycleCountType.Standard]: 'Standart',
  [CycleCountType.AbcBased]: 'ABC Bazlı',
  [CycleCountType.ZoneBased]: 'Bölge Bazlı',
  [CycleCountType.CategoryBased]: 'Kategori Bazlı',
  [CycleCountType.Random]: 'Rastgele',
  [CycleCountType.MovementBased]: 'Hareket Bazlı',
};

export default function CycleCountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: count, isLoading } = useCycleCount(id);
  const startCount = useStartCycleCount();
  const completeCount = useCompleteCycleCount();

  const handleStart = async () => {
    const confirmed = await confirmAction(
      'Sayımı Başlat',
      'Bu sayımı başlatmak istediğinizden emin misiniz?',
      'Başlat'
    );
    if (confirmed) {
      try {
        await startCount.mutateAsync(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleComplete = async () => {
    const confirmed = await confirmAction(
      'Sayımı Tamamla',
      'Bu sayımı tamamlamak istediğinizden emin misiniz?',
      'Tamamla'
    );
    if (confirmed) {
      try {
        await completeCount.mutateAsync(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!count) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Sayım kaydı bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/cycle-counts')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[count.status] || { label: 'Bilinmiyor', color: 'default' };

  // Calculate progress
  const progressPercent = count.totalItems > 0
    ? Math.round((count.countedItems / count.totalItems) * 100)
    : 0;

  const canStart = count.status === CycleCountStatus.Planned;
  const canComplete = count.status === CycleCountStatus.InProgress;

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
              onClick={() => router.push('/inventory/cycle-counts')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0 font-mono">
                {count.planNumber}
              </h1>
              <p className="text-sm text-gray-400 m-0">{count.planName || 'Dönemsel Sayım'}</p>
            </div>
          </div>
          <Space>
            {canStart && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleStart}
                style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
              >
                Başlat
              </Button>
            )}
            {canComplete && (
              <Button
                icon={<CheckCircleIcon className="w-4 h-4" />}
                onClick={handleComplete}
                style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
              >
                Tamamla
              </Button>
            )}
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/cycle-counts/${id}/edit`)}
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
                <CalculatorIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 font-mono">{count.planNumber}</h2>
                <p className="text-slate-500">{count.planName || 'Dönemsel Sayım'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                {count.countType && (
                  <Tag color="purple">{countTypeLabels[count.countType] || count.countType}</Tag>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Sayım İlerlemesi</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress
                percent={progressPercent}
                strokeColor={progressPercent >= 100 ? '#10b981' : progressPercent >= 50 ? '#f59e0b' : '#3b82f6'}
                showInfo={false}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Sayılan: {count.countedItems || 0}</span>
                <span>Toplam: {count.totalItems || 0}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sayım Bilgileri</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Depo">{count.warehouseName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sayım Türü">
                {count.countType ? (countTypeLabels[count.countType] || count.countType) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Planlanan Başlangıç">
                {count.scheduledStartDate ? dayjs(count.scheduledStartDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Planlanan Bitiş">
                {count.scheduledEndDate ? dayjs(count.scheduledEndDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Gerçekleşen Tarihler</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Başlama Tarihi">
                {count.actualStartDate ? dayjs(count.actualStartDate).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bitiş Tarihi">
                {count.actualEndDate ? dayjs(count.actualEndDate).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sayım Sonuçları</h3>
            <Descriptions
              column={3}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Toplam Kalem">{count.totalItems || 0}</Descriptions.Item>
              <Descriptions.Item label="Sayılan">{count.countedItems || 0}</Descriptions.Item>
              <Descriptions.Item label="Fark Tespit Edilen">{count.itemsWithVariance || 0}</Descriptions.Item>
              <Descriptions.Item label="İlerleme">{count.progressPercent ? `%${count.progressPercent.toFixed(1)}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Doğruluk Oranı">
                {count.accuracyPercent ? `%${count.accuracyPercent.toFixed(1)}` : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* Items Table */}
            {count.items && count.items.length > 0 && (
              <>
                <Divider />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Sayım Kalemleri ({count.items.length})
                </h3>
                <Table<CycleCountItemDto>
                  dataSource={count.items}
                  rowKey="id"
                  size="small"
                  pagination={count.items.length > 10 ? { pageSize: 10 } : false}
                  columns={[
                    {
                      title: 'Ürün',
                      dataIndex: 'productName',
                      key: 'productName',
                      render: (text: string) => text || '-',
                    },
                    {
                      title: 'Konum',
                      dataIndex: 'locationName',
                      key: 'locationName',
                      render: (text: string) => text || '-',
                    },
                    {
                      title: 'Sistem Miktarı',
                      dataIndex: 'systemQuantity',
                      key: 'systemQuantity',
                      align: 'right' as const,
                      render: (val: number) => val?.toLocaleString('tr-TR') ?? '0',
                    },
                    {
                      title: 'Sayılan Miktar',
                      dataIndex: 'countedQuantity',
                      key: 'countedQuantity',
                      align: 'right' as const,
                      render: (val: number | null) => val != null ? val.toLocaleString('tr-TR') : '-',
                    },
                    {
                      title: 'Durum',
                      dataIndex: 'isCounted',
                      key: 'isCounted',
                      align: 'center' as const,
                      render: (isCounted: boolean, record: CycleCountItemDto) => {
                        if (!isCounted) return <Tag color="default">Bekliyor</Tag>;
                        if (record.hasVariance) return <Tag color="orange">Fark Var</Tag>;
                        return <Tag color="green">Sayıldı</Tag>;
                      },
                    },
                    {
                      title: 'Fark',
                      dataIndex: 'varianceQuantity',
                      key: 'varianceQuantity',
                      align: 'right' as const,
                      render: (val: number, record: CycleCountItemDto) => {
                        if (!record.isCounted) return '-';
                        if (val === 0) return <span className="text-green-600">0</span>;
                        return <span className={val > 0 ? 'text-blue-600' : 'text-red-600'}>{val > 0 ? '+' : ''}{val.toLocaleString('tr-TR')}</span>;
                      },
                    },
                  ] as ColumnsType<CycleCountItemDto>}
                />
              </>
            )}

            {count.description && (
              <>
                <Divider />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Açıklama</h3>
                <p className="text-slate-700">{count.description}</p>
              </>
            )}

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sistem Bilgileri</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Oluşturulma">
                {dayjs(count.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {count.updatedAt ? dayjs(count.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </div>
  );
}
