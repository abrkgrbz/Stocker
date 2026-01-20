'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Space,
  Spin,
  Alert,
  Tag,
  Select,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  useInventoryAdjustment,
  useUpdateInventoryAdjustment,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { UpdateInventoryAdjustmentDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<string, { color: string; label: string }> = {
  Draft: { color: 'default', label: 'Taslak' },
  PendingApproval: { color: 'warning', label: 'Onay Bekliyor' },
  Approved: { color: 'success', label: 'Onaylandı' },
  Rejected: { color: 'error', label: 'Reddedildi' },
  Processed: { color: 'default', label: 'İşlendi' },
  Cancelled: { color: 'default', label: 'İptal' },
};

const adjustmentTypeLabels: Record<string, string> = {
  Increase: 'Artış',
  Decrease: 'Azalış',
  Correction: 'Düzeltme',
  Scrap: 'Fire',
  InternalTransfer: 'Dahili Transfer',
};

const reasonLabels: Record<string, string> = {
  StockCountVariance: 'Sayım Farkı',
  Damage: 'Hasar',
  Loss: 'Kayıp',
  Theft: 'Hırsızlık',
  ProductionScrap: 'Üretim Fire',
  Expired: 'Son Kullanma Tarihi',
  QualityRejection: 'Kalite Reddi',
  CustomerReturn: 'Müşteri İadesi',
  SupplierReturn: 'Tedarikçi İadesi',
  SystemCorrection: 'Sistem Düzeltmesi',
  OpeningStock: 'Açılış Stoğu',
  Other: 'Diğer',
};

export default function EditStockAdjustmentPage() {
  const router = useRouter();
  const params = useParams();
  const adjustmentId = Number(params.id);
  const [form] = Form.useForm();

  const { data: adjustment, isLoading, error } = useInventoryAdjustment(adjustmentId);
  const updateAdjustment = useUpdateInventoryAdjustment();

  const { data: locations } = useLocations(adjustment?.warehouseId);

  useEffect(() => {
    if (adjustment) {
      form.setFieldsValue({
        locationId: adjustment.locationId,
        description: adjustment.description,
        referenceNumber: adjustment.referenceNumber,
        referenceType: adjustment.referenceType,
        internalNotes: adjustment.internalNotes,
        accountingNotes: adjustment.accountingNotes,
      });
    }
  }, [adjustment, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateInventoryAdjustmentDto = {
        locationId: values.locationId,
        description: values.description,
        referenceNumber: values.referenceNumber,
        referenceType: values.referenceType,
        internalNotes: values.internalNotes,
        accountingNotes: values.accountingNotes,
      };

      await updateAdjustment.mutateAsync({ id: adjustmentId, data });
      router.push(`/inventory/stock-adjustments/${adjustmentId}`);
    } catch {
      // Validation error
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="p-8">
        <Alert
          message="Stok Düzeltmesi Bulunamadı"
          description="İstenen stok düzeltmesi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/stock-adjustments')}>
              Stok Düzeltmelerine Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[adjustment.status] || statusConfig.Draft;
  const canEdit = adjustment.status === 'Draft';

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
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {adjustment.adjustmentNumber}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {adjustmentTypeLabels[adjustment.adjustmentType]} • Düzenle
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/stock-adjustments/${adjustmentId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateAdjustment.isPending}
              onClick={handleSubmit}
              disabled={!canEdit}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {!canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 m-0">
              Bu stok düzeltmesi düzenlenemez durumda. Sadece Taslak durumundaki kayıtlar düzenlenebilir.
            </p>
          </div>
        )}

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Adjustment Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Düzeltme Bilgileri (Salt Okunur)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Düzeltme No</label>
                    <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-900">
                      {adjustment.adjustmentNumber}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Düzeltme Tarihi</label>
                    <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-900">
                      {dayjs(adjustment.adjustmentDate).format('DD/MM/YYYY')}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Düzeltme Tipi</label>
                    <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-900">
                      {adjustmentTypeLabels[adjustment.adjustmentType]}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Sebep</label>
                    <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-900">
                      {reasonLabels[adjustment.reason] || adjustment.reason}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Depo</label>
                    <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-900">
                      {adjustment.warehouseName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Düzenlenebilir Bilgiler
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item name="locationId" label="Lokasyon">
                    <Select
                      placeholder="Lokasyon seçin"
                      allowClear
                      disabled={!canEdit}
                      options={locations?.map((l) => ({
                        value: l.id,
                        label: l.name,
                      }))}
                      className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>

                  <Form.Item name="referenceType" label="Referans Tipi">
                    <Input
                      placeholder="Referans tipi"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="referenceNumber" label="Referans No" className="col-span-2">
                    <Input
                      placeholder="Referans numarası"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Açıklama" className="col-span-2">
                    <TextArea
                      rows={3}
                      placeholder="Düzeltme açıklaması..."
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Notlar
                </h3>
                <div className="space-y-4">
                  <Form.Item name="internalNotes" label="Dahili Notlar">
                    <TextArea
                      rows={3}
                      placeholder="Dahili kullanım için notlar..."
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="accountingNotes" label="Muhasebe Notları" className="mb-0">
                    <TextArea
                      rows={3}
                      placeholder="Muhasebe departmanı için notlar..."
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Cost Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Maliyet Özeti
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Kalem Sayısı</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {adjustment.items?.length || 0}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg ${
                    adjustment.totalCostImpact >= 0 ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    <span className="text-sm text-slate-600">Toplam Maliyet Etkisi</span>
                    <span className={`text-lg font-semibold ${
                      adjustment.totalCostImpact >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {adjustment.totalCostImpact >= 0 ? '+' : ''}
                      {adjustment.totalCostImpact?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {adjustment.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Kayıt Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                    <span className="text-sm text-slate-900">
                      {dayjs(adjustment.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  {adjustment.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Son Güncelleme</span>
                      <span className="text-sm text-slate-900">
                        {dayjs(adjustment.updatedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  )}
                  {adjustment.approvedBy && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Onaylayan</span>
                      <span className="text-sm text-slate-900">{adjustment.approvedBy}</span>
                    </div>
                  )}
                  {adjustment.approvedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Onay Tarihi</span>
                      <span className="text-sm text-slate-900">
                        {dayjs(adjustment.approvedDate).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Kalem Bilgileri
                </h3>
                <p className="text-sm text-slate-500">
                  Bu düzeltme {adjustment.items?.length || 0} kalem içermektedir.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Not: Kalemler bu sayfadan düzenlenemez. Kalemleri düzenlemek için düzeltmeyi iptal edip yeniden oluşturmanız gerekmektedir.
                </p>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
