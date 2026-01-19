'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Tag, Descriptions, Space, Divider, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  PencilIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useQualityControl,
  useApproveQualityControl,
  useRejectQualityControl,
} from '@/lib/api/hooks/useInventory';
import {
  QualityControlStatus,
  QualityControlType,
  QualityControlResult,
  QualityAction,
} from '@/lib/api/services/inventory.types';
import { confirmAction } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

const statusConfig: Record<QualityControlStatus, { label: string; color: string }> = {
  [QualityControlStatus.Pending]: { label: 'Beklemede', color: 'gold' },
  [QualityControlStatus.InProgress]: { label: 'Devam Ediyor', color: 'blue' },
  [QualityControlStatus.Completed]: { label: 'Tamamlandı', color: 'green' },
  [QualityControlStatus.Cancelled]: { label: 'İptal', color: 'red' },
};

const typeConfig: Record<QualityControlType, string> = {
  [QualityControlType.IncomingInspection]: 'Giriş Denetimi',
  [QualityControlType.OutgoingInspection]: 'Çıkış Denetimi',
  [QualityControlType.InProcessInspection]: 'Süreç Denetimi',
  [QualityControlType.FinalInspection]: 'Final Denetimi',
  [QualityControlType.PeriodicInspection]: 'Periyodik Denetim',
  [QualityControlType.CustomerComplaint]: 'Müşteri Şikayeti',
  [QualityControlType.ReturnInspection]: 'İade Denetimi',
};

const resultConfig: Record<QualityControlResult, { label: string; color: string }> = {
  [QualityControlResult.Pending]: { label: 'Beklemede', color: 'default' },
  [QualityControlResult.Passed]: { label: 'Geçti', color: 'green' },
  [QualityControlResult.Failed]: { label: 'Başarısız', color: 'red' },
  [QualityControlResult.PartialPass]: { label: 'Kısmi Geçti', color: 'orange' },
  [QualityControlResult.ConditionalPass]: { label: 'Koşullu Geçti', color: 'gold' },
};

const actionConfig: Record<QualityAction, string> = {
  [QualityAction.None]: 'Yok',
  [QualityAction.Accept]: 'Kabul Et',
  [QualityAction.Reject]: 'Reddet',
  [QualityAction.PartialAccept]: 'Kısmi Kabul',
  [QualityAction.AcceptWithDeviation]: 'Sapma ile Kabul',
  [QualityAction.Rework]: 'Yeniden İşle',
  [QualityAction.ReturnToSupplier]: 'Tedarikçiye İade',
  [QualityAction.Scrap]: 'Hurda',
  [QualityAction.Quarantine]: 'Karantina',
};

export default function QualityControlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: qc, isLoading } = useQualityControl(id);
  const approveQC = useApproveQualityControl();
  const rejectQC = useRejectQualityControl();

  const handleApprove = async () => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Onayla',
      'Bu kalite kontrol kaydını onaylamak istediğinizden emin misiniz?',
      'Onayla'
    );
    if (confirmed) {
      try {
        await approveQC.mutateAsync({ id, notes: 'Onaylandı' });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleReject = async () => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Reddet',
      'Bu kalite kontrol kaydını reddetmek istediğinizden emin misiniz?',
      'Reddet'
    );
    if (confirmed) {
      try {
        await rejectQC.mutateAsync({ id, reason: 'Kalite standartlarını karşılamıyor' });
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

  if (!qc) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Kalite kontrol kaydı bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/quality-control')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[qc.status] || { label: 'Bilinmiyor', color: 'default' };
  const resultInfo = resultConfig[qc.result] || { label: 'Bilinmiyor', color: 'default' };
  const canApproveReject = qc.status === QualityControlStatus.Pending || qc.status === QualityControlStatus.InProgress;

  // Calculate pass rate
  const passRate = qc.inspectedQuantity > 0
    ? Math.round((qc.acceptedQuantity / qc.inspectedQuantity) * 100)
    : 0;

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
              onClick={() => router.push('/inventory/quality-control')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0 font-mono">
                {qc.qcNumber}
              </h1>
              <p className="text-sm text-gray-400 m-0">{qc.productName}</p>
            </div>
          </div>
          <Space>
            {canApproveReject && (
              <>
                <Button
                  icon={<XCircleIcon className="w-4 h-4" />}
                  onClick={handleReject}
                  danger
                >
                  Reddet
                </Button>
                <Button
                  icon={<CheckCircleIcon className="w-4 h-4" />}
                  onClick={handleApprove}
                  style={{ background: '#10b981', borderColor: '#10b981', color: 'white' }}
                >
                  Onayla
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/quality-control/${id}/edit`)}
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
                <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 font-mono">{qc.qcNumber}</h2>
                <p className="text-slate-500">{typeConfig[qc.qcType] || 'Bilinmiyor'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                <Tag color={resultInfo.color}>{resultInfo.label}</Tag>
                {qc.qualityScore !== undefined && (
                  <Tag color="purple">Skor: {qc.qualityScore}</Tag>
                )}
              </div>
            </div>

            {/* Pass Rate Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Geçiş Oranı</span>
                <span className="font-medium">{passRate}%</span>
              </div>
              <Progress
                percent={passRate}
                strokeColor={passRate >= 90 ? '#10b981' : passRate >= 70 ? '#f59e0b' : '#ef4444'}
                showInfo={false}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Kabul: {qc.acceptedQuantity} {qc.unit}</span>
                <span>Red: {qc.rejectedQuantity} {qc.unit}</span>
                <span>Toplam: {qc.inspectedQuantity} {qc.unit}</span>
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
              <Descriptions.Item label="Ürün">{qc.productName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ürün Kodu">{qc.productCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="Lot Numarası">{qc.lotNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tedarikçi">{qc.supplierName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Sipariş No">{qc.purchaseOrderNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="Depo">{qc.warehouseName || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Denetim Bilgileri</h3>
            <Descriptions
              column={3}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Denetim Tarihi">
                {qc.inspectionDate ? dayjs(qc.inspectionDate).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Denetçi">{qc.inspectorName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Denetim Süresi">
                {qc.inspectionDurationMinutes ? `${qc.inspectionDurationMinutes} dakika` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Denetim Lokasyonu">{qc.inspectionLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Denetim Standardı">{qc.inspectionStandard || '-'}</Descriptions.Item>
              <Descriptions.Item label="Numune Miktarı">
                {qc.sampleQuantity ? `${qc.sampleQuantity} ${qc.unit}` : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Sonuç ve Aksiyon</h3>
            <Descriptions
              column={2}
              labelStyle={{ fontWeight: 500, color: '#64748b' }}
              contentStyle={{ color: '#1e293b' }}
            >
              <Descriptions.Item label="Önerilen Aksiyon">
                {actionConfig[qc.recommendedAction] || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Uygulanan Aksiyon">
                {qc.appliedAction !== undefined ? actionConfig[qc.appliedAction] : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Red Nedeni">{qc.rejectionReason || '-'}</Descriptions.Item>
              <Descriptions.Item label="Aksiyon Tarihi">
                {qc.actionDate ? dayjs(qc.actionDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
            </Descriptions>

            {(qc.inspectionNotes || qc.actionDescription) && (
              <>
                <Divider />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Notlar</h3>
                <Descriptions
                  column={1}
                  labelStyle={{ fontWeight: 500, color: '#64748b' }}
                  contentStyle={{ color: '#1e293b' }}
                >
                  {qc.inspectionNotes && (
                    <Descriptions.Item label="Denetim Notları">{qc.inspectionNotes}</Descriptions.Item>
                  )}
                  {qc.actionDescription && (
                    <Descriptions.Item label="Aksiyon Açıklaması">{qc.actionDescription}</Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}

            {qc.items && qc.items.length > 0 && (
              <>
                <Divider />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Kontrol Kalemleri</h3>
                <div className="space-y-2">
                  {qc.items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-500 w-6">{idx + 1}.</span>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{item.checkName}</div>
                        {item.specification && (
                          <div className="text-xs text-slate-500">Spesifikasyon: {item.specification}</div>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item.measuredValue || '-'}
                      </div>
                      <Tag color={item.isPassed ? 'green' : item.isPassed === false ? 'red' : 'default'}>
                        {item.isPassed ? 'Geçti' : item.isPassed === false ? 'Kaldı' : 'Bekliyor'}
                      </Tag>
                    </div>
                  ))}
                </div>
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
                {dayjs(qc.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                {qc.updatedAt ? dayjs(qc.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>
    </div>
  );
}
