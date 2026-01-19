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
  DatePicker,
  InputNumber,
  Select,
} from 'antd';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  useLotBatch,
  useUpdateLotBatch,
  useProducts,
  useWarehouses,
  useSuppliers,
} from '@/lib/api/hooks/useInventory';
import type { UpdateLotBatchDto } from '@/lib/api/services/inventory.types';
import { LotBatchStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<LotBatchStatus, { color: string; label: string }> = {
  [LotBatchStatus.Pending]: { color: 'warning', label: 'Beklemede' },
  [LotBatchStatus.Received]: { color: 'processing', label: 'Alındı' },
  [LotBatchStatus.Approved]: { color: 'success', label: 'Onaylandı' },
  [LotBatchStatus.Quarantined]: { color: 'error', label: 'Karantinada' },
  [LotBatchStatus.Rejected]: { color: 'error', label: 'Reddedildi' },
  [LotBatchStatus.Exhausted]: { color: 'default', label: 'Tükendi' },
  [LotBatchStatus.Expired]: { color: 'default', label: 'Süresi Doldu' },
  [LotBatchStatus.Recalled]: { color: 'warning', label: 'Geri Çağrıldı' },
};

export default function EditLotBatchPage() {
  const router = useRouter();
  const params = useParams();
  const lotBatchId = Number(params.id);
  const [form] = Form.useForm();

  const { data: lotBatch, isLoading, error } = useLotBatch(lotBatchId);
  const updateLotBatch = useUpdateLotBatch();
  const { data: products } = useProducts({ pageSize: 1000 });
  const { data: warehouses } = useWarehouses({ pageSize: 100 });
  const { data: suppliers } = useSuppliers({ pageSize: 100 });

  useEffect(() => {
    if (lotBatch) {
      form.setFieldsValue({
        lotNumber: lotBatch.lotNumber,
        productId: lotBatch.productId,
        warehouseId: lotBatch.warehouseId,
        supplierId: lotBatch.supplierId,
        supplierLotNumber: lotBatch.supplierLotNumber,
        initialQuantity: lotBatch.initialQuantity,
        manufacturedDate: lotBatch.manufacturedDate ? dayjs(lotBatch.manufacturedDate) : null,
        expiryDate: lotBatch.expiryDate ? dayjs(lotBatch.expiryDate) : null,
        receivedDate: lotBatch.receivedDate ? dayjs(lotBatch.receivedDate) : null,
        certificateNumber: lotBatch.certificateNumber,
        notes: lotBatch.notes,
      });
    }
  }, [lotBatch, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateLotBatchDto = {
        lotNumber: values.lotNumber,
        supplierLotNumber: values.supplierLotNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        receivedDate: values.receivedDate?.toISOString(),
        certificateNumber: values.certificateNumber,
        notes: values.notes,
      };

      await updateLotBatch.mutateAsync({ id: lotBatchId, data });
      router.push(`/inventory/lot-batches/${lotBatchId}`);
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

  if (error || !lotBatch) {
    return (
      <div className="p-8">
        <Alert
          message="Lot/Parti Bulunamadı"
          description="İstenen lot/parti bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/lot-batches')}>
              Lot/Partilere Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[lotBatch.status];
  const canEdit = lotBatch.status === LotBatchStatus.Pending || lotBatch.status === LotBatchStatus.Received;

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
                <BeakerIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {lotBatch.lotNumber}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {lotBatch.productName} • Düzenle
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/lot-batches/${lotBatchId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateLotBatch.isPending}
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
              Bu lot/parti düzenlenemez durumda. Sadece Beklemede veya Alındı durumundaki kayıtlar düzenlenebilir.
            </p>
          </div>
        )}

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Lot Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Lot Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="lotNumber"
                    label="Lot Numarası"
                    rules={[{ required: true, message: 'Lot numarası zorunludur' }]}
                  >
                    <Input
                      placeholder="LOT-001"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="supplierLotNumber" label="Tedarikçi Lot No">
                    <Input
                      placeholder="Tedarikçi lot numarası"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="productId" label="Ürün">
                    <Select
                      placeholder="Ürün seçin"
                      disabled
                      showSearch
                      optionFilterProp="children"
                      options={products?.items?.map((p) => ({
                        value: p.id,
                        label: `${p.name} (${p.code})`,
                      }))}
                      className="[&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>

                  <Form.Item name="warehouseId" label="Depo">
                    <Select
                      placeholder="Depo seçin"
                      disabled
                      options={warehouses?.items?.map((w) => ({
                        value: w.id,
                        label: w.name,
                      }))}
                      className="[&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>

                  <Form.Item name="supplierId" label="Tedarikçi">
                    <Select
                      placeholder="Tedarikçi seçin"
                      disabled
                      allowClear
                      options={suppliers?.items?.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      className="[&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>

                  <Form.Item name="certificateNumber" label="Sertifika No">
                    <Input
                      placeholder="Sertifika numarası"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Tarihler
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Form.Item name="manufacturedDate" label="Üretim Tarihi">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      placeholder="Üretim tarihi"
                      disabled={!canEdit}
                    />
                  </Form.Item>

                  <Form.Item name="receivedDate" label="Alım Tarihi">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      placeholder="Alım tarihi"
                      disabled={!canEdit}
                    />
                  </Form.Item>

                  <Form.Item name="expiryDate" label="Son Kullanma Tarihi">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      placeholder="Son kullanma tarihi"
                      disabled={!canEdit}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Notlar
                </h3>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={4}
                    placeholder="Lot/parti ile ilgili notlar..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quantity Info - Read Only */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Miktar Bilgileri
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Başlangıç Miktarı</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {lotBatch.initialQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-slate-600">Mevcut Miktar</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {lotBatch.currentQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm text-slate-600">Rezerve</span>
                    <span className="text-lg font-semibold text-amber-600">
                      {lotBatch.reservedQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-sm text-slate-600">Kullanılabilir</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      {lotBatch.availableQuantity}
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
                      {dayjs(lotBatch.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  {lotBatch.inspectedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Denetim</span>
                      <span className="text-sm text-slate-900">
                        {dayjs(lotBatch.inspectedDate).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quarantine Info */}
              {lotBatch.isQuarantined && (
                <div className="bg-white border border-red-200 rounded-xl p-6">
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider pb-2 mb-4 border-b border-red-100">
                    Karantina Durumu
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Karantina Tarihi</span>
                      <span className="text-sm text-slate-900">
                        {lotBatch.quarantinedDate
                          ? dayjs(lotBatch.quarantinedDate).format('DD/MM/YYYY HH:mm')
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Sebep</span>
                      <span className="text-sm text-red-600">
                        {lotBatch.quarantineReason || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
