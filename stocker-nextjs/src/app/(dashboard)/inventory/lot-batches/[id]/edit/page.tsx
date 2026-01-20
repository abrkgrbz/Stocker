'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, Select, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  InboxIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  useLotBatch,
  useUpdateLotBatch,
  useSuppliers,
} from '@/lib/api/hooks/useInventory';
import type { UpdateLotBatchDto } from '@/lib/api/services/inventory.types';
import { LotBatchStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusLabels: Record<LotBatchStatus, string> = {
  [LotBatchStatus.Pending]: 'Beklemede',
  [LotBatchStatus.Received]: 'Alındı',
  [LotBatchStatus.Approved]: 'Onaylandı',
  [LotBatchStatus.Quarantined]: 'Karantinada',
  [LotBatchStatus.Rejected]: 'Reddedildi',
  [LotBatchStatus.Exhausted]: 'Tükendi',
  [LotBatchStatus.Expired]: 'Süresi Doldu',
  [LotBatchStatus.Recalled]: 'Geri Çağrıldı',
};

export default function EditLotBatchPage() {
  const router = useRouter();
  const params = useParams();
  const lotBatchId = Number(params.id);
  const [form] = Form.useForm();

  const { data: lotBatch, isLoading, error } = useLotBatch(lotBatchId);
  const updateLotBatch = useUpdateLotBatch();
  const { data: suppliers } = useSuppliers({ pageSize: 100 });

  useEffect(() => {
    if (lotBatch) {
      form.setFieldsValue({
        supplierId: lotBatch.supplierId,
        supplierLotNumber: lotBatch.supplierLotNumber,
        manufacturedDate: lotBatch.manufacturedDate ? dayjs(lotBatch.manufacturedDate) : null,
        expiryDate: lotBatch.expiryDate ? dayjs(lotBatch.expiryDate) : null,
        certificateNumber: lotBatch.certificateNumber,
        notes: lotBatch.notes,
      });
    }
  }, [lotBatch, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateLotBatchDto = {
        supplierId: values.supplierId,
        supplierLotNumber: values.supplierLotNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
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
        <Spinner size="lg" />
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

  // Check if lot batch can be edited
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
                <InboxIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {lotBatch.lotNumber}
                  </h1>
                  <Tag color={lotBatch.status === LotBatchStatus.Approved ? 'success' : 'default'}>
                    {statusLabels[lotBatch.status]}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {lotBatch.productName} ({lotBatch.productCode})
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
      <div className="px-8 py-8 max-w-4xl mx-auto">
        {!canEdit && (
          <Alert
            message="Düzenleme Yapılamaz"
            description="Bu lot/parti onaylanmış veya karantinada olduğu için düzenlenemez."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          disabled={!canEdit}
          className="space-y-6"
        >
          {/* Lot Info Section */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Lot Bilgileri (Salt Okunur)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Lot Numarası</p>
                <p className="text-sm font-medium text-slate-900">{lotBatch.lotNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ürün</p>
                <p className="text-sm font-medium text-slate-900">{lotBatch.productName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Başlangıç Miktarı</p>
                <p className="text-sm font-medium text-slate-900">{lotBatch.initialQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Mevcut Miktar</p>
                <p className="text-sm font-medium text-slate-900">{lotBatch.currentQuantity}</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Düzenlenebilir Bilgiler</h3>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                label="Tedarikçi"
                name="supplierId"
              >
                <Select
                  placeholder="Tedarikçi seçin"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={suppliers?.map(s => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Tedarikçi Lot Numarası"
                name="supplierLotNumber"
              >
                <Input placeholder="Tedarikçi lot numarası" />
              </Form.Item>

              <Form.Item
                label="Üretim Tarihi"
                name="manufacturedDate"
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Üretim tarihi seçin"
                />
              </Form.Item>

              <Form.Item
                label="Son Kullanma Tarihi"
                name="expiryDate"
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Son kullanma tarihi seçin"
                />
              </Form.Item>

              <Form.Item
                label="Sertifika Numarası"
                name="certificateNumber"
                className="col-span-2"
              >
                <Input placeholder="Sertifika numarası" />
              </Form.Item>

              <Form.Item
                label="Notlar"
                name="notes"
                className="col-span-2"
              >
                <TextArea
                  rows={4}
                  placeholder="Bu lot/parti hakkında notlar..."
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
