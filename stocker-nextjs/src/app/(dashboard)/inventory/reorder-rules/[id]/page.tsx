'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Spin, Descriptions, Space, Divider } from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import {
  useReorderRule,
  useDeleteReorderRule,
  useActivateReorderRule,
  usePauseReorderRule,
  useDisableReorderRule,
  useExecuteReorderRule,
} from '@/lib/api/hooks/useInventory';
import { ReorderRuleStatus } from '@/lib/api/services/inventory.types';
import { confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

const statusConfig: Record<ReorderRuleStatus, { label: string; color: string }> = {
  [ReorderRuleStatus.Active]: { label: 'Aktif', color: 'green' },
  [ReorderRuleStatus.Paused]: { label: 'Duraklatıldı', color: 'orange' },
  [ReorderRuleStatus.Disabled]: { label: 'Devre Dışı', color: 'default' },
};

export default function ReorderRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: rule, isLoading } = useReorderRule(id);
  const deleteRule = useDeleteReorderRule();
  const activateRule = useActivateReorderRule();
  const pauseRule = usePauseReorderRule();
  const disableRule = useDisableReorderRule();
  const executeRule = useExecuteReorderRule();

  const handleDelete = async () => {
    if (!rule) return;

    const confirmed = await confirmAction(
      'Kuralı Sil',
      `"${rule.name}" kuralını silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteRule.mutateAsync(id);
        router.push('/inventory/reorder-rules');
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleActivate = async () => {
    try {
      await activateRule.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handlePause = async () => {
    try {
      await pauseRule.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDisable = async () => {
    try {
      await disableRule.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleExecute = async () => {
    if (!rule) return;

    const confirmed = await confirmAction(
      'Kuralı Çalıştır',
      `"${rule.name}" kuralını şimdi çalıştırmak istediğinizden emin misiniz?`,
      'Çalıştır'
    );

    if (confirmed) {
      try {
        await executeRule.mutateAsync(id);
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

  if (!rule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Kural bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/reorder-rules')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[rule.status] || { label: 'Bilinmiyor', color: 'default' };

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
              onClick={() => router.push('/inventory/reorder-rules')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                {rule.name}
              </h1>
              <p className="text-sm text-gray-400 m-0">{rule.description || 'Açıklama yok'}</p>
            </div>
          </div>
          <Space>
            {rule.status === 'Active' && (
              <>
                <Button
                  icon={<BoltIcon className="w-4 h-4" />}
                  onClick={handleExecute}
                >
                  Çalıştır
                </Button>
                <Button
                  icon={<PauseIcon className="w-4 h-4" />}
                  onClick={handlePause}
                >
                  Duraklat
                </Button>
              </>
            )}
            {rule.status === 'Paused' && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleActivate}
              >
                Aktifleştir
              </Button>
            )}
            {rule.status !== 'Disabled' && (
              <Button
                icon={<StopIcon className="w-4 h-4" />}
                onClick={handleDisable}
              >
                Devre Dışı
              </Button>
            )}
            {rule.status === 'Disabled' && (
              <Button
                icon={<PlayIcon className="w-4 h-4" />}
                onClick={handleActivate}
              >
                Aktifleştir
              </Button>
            )}
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
              onClick={() => router.push(`/inventory/reorder-rules/${id}/edit`)}
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
                <ArrowsRightLeftIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{rule.name}</h2>
                <p className="text-slate-500">{rule.description || 'Açıklama yok'}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                {rule.requiresApproval && <Tag color="orange">Onay Gerekli</Tag>}
                {rule.isScheduled && <Tag color="blue">Zamanlanmış</Tag>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Kapsam</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Ürün">{rule.productName || 'Tümü'}</Descriptions.Item>
              <Descriptions.Item label="Kategori">{rule.categoryName || 'Tümü'}</Descriptions.Item>
              <Descriptions.Item label="Depo">{rule.warehouseName || 'Tümü'}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi">{rule.supplierName || 'Tümü'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Tetikleyici Koşullar</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Miktar Altına Düşünce">
                {rule.triggerBelowQuantity ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Gün Cinsinden Stok Altına Düşünce">
                {rule.triggerBelowDaysOfStock ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tahmine Göre Tetikle">
                {rule.triggerOnForecast ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
              <Descriptions.Item label="Tahmin Süresi (gün)">
                {rule.forecastLeadTimeDays ?? '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sipariş Ayarları</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Sabit Sipariş Miktarı">
                {rule.fixedReorderQuantity ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Hedef Stok Seviyesi">
                {rule.reorderUpToQuantity ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Dinamik Miktar Kullan">
                {rule.useEconomicOrderQuantity ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
              <Descriptions.Item label="Min-Max Miktar">
                {rule.minimumOrderQuantity && rule.maximumOrderQuantity
                  ? `${rule.minimumOrderQuantity} - ${rule.maximumOrderQuantity}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Paket Boyutuna Yuvarla">
                {rule.roundToPackSize ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
              <Descriptions.Item label="Paket Boyutu">
                {rule.packSize ?? '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Zamanlama</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Zamanlanmış">
                {rule.isScheduled ? 'Evet' : 'Hayır'}
              </Descriptions.Item>
              <Descriptions.Item label="Cron İfadesi">
                {rule.cronExpression ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Sonraki Çalışma">
                {rule.nextScheduledRun ? dayjs(rule.nextScheduledRun).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Çalışma Geçmişi</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Son Çalışma">
                {rule.lastExecutedAt ? dayjs(rule.lastExecutedAt).format('DD/MM/YYYY HH:mm') : 'Hiç çalışmadı'}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Çalışma Sayısı">
                {rule.executionCount}
              </Descriptions.Item>
              <Descriptions.Item label="Oluşturulma">
                {dayjs(rule.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {rule.updatedAt ? dayjs(rule.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </div>
  );
}
