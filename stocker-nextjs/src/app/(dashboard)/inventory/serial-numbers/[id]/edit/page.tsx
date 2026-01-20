'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, Select, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  QrCodeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  useSerialNumber,
  useUpdateSerialNumber,
  useWarehouses,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { UpdateSerialNumberDto } from '@/lib/api/services/inventory.types';
import { SerialNumberStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusLabels: Record<SerialNumberStatus, string> = {
  [SerialNumberStatus.Available]: 'Kullanılabilir',
  [SerialNumberStatus.InStock]: 'Stokta',
  [SerialNumberStatus.Reserved]: 'Rezerve',
  [SerialNumberStatus.Sold]: 'Satıldı',
  [SerialNumberStatus.Returned]: 'İade Edildi',
  [SerialNumberStatus.Defective]: 'Arızalı',
  [SerialNumberStatus.InRepair]: 'Tamirde',
  [SerialNumberStatus.Scrapped]: 'Hurda',
  [SerialNumberStatus.Lost]: 'Kayıp',
  [SerialNumberStatus.OnLoan]: 'Ödünç Verildi',
};

export default function EditSerialNumberPage() {
  const router = useRouter();
  const params = useParams();
  const serialNumberId = Number(params.id);
  const [form] = Form.useForm();

  const { data: serialNumber, isLoading, error } = useSerialNumber(serialNumberId);
  const updateSerialNumber = useUpdateSerialNumber();
  const { data: warehouses } = useWarehouses({ pageSize: 100 });

  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const { data: locations } = useLocations(
    selectedWarehouseId ? { warehouseId: selectedWarehouseId, pageSize: 100 } : undefined
  );

  useEffect(() => {
    if (serialNumber) {
      form.setFieldsValue({
        warehouseId: serialNumber.warehouseId,
        locationId: serialNumber.locationId,
        manufacturedDate: serialNumber.manufacturedDate ? dayjs(serialNumber.manufacturedDate) : null,
        batchNumber: serialNumber.batchNumber,
        supplierSerial: serialNumber.supplierSerial,
        notes: serialNumber.notes,
      });
    }
  }, [serialNumber, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateSerialNumberDto = {
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        batchNumber: values.batchNumber,
        supplierSerial: values.supplierSerial,
        notes: values.notes,
      };

      await updateSerialNumber.mutateAsync({ id: serialNumberId, data });
      router.push(`/inventory/serial-numbers/${serialNumberId}`);
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

  if (error || !serialNumber) {
    return (
      <div className="p-8">
        <Alert
          message="Seri Numarası Bulunamadı"
          description="İstenen seri numarası bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/serial-numbers')}>
              Seri Numaralarına Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Check if serial number can be edited
  const canEdit = serialNumber.status === SerialNumberStatus.Available ||
                  serialNumber.status === SerialNumberStatus.InStock;

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
                <QrCodeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {serialNumber.serial}
                  </h1>
                  <Tag color={serialNumber.status === SerialNumberStatus.InStock ? 'success' : 'default'}>
                    {statusLabels[serialNumber.status]}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {serialNumber.productName} ({serialNumber.productCode})
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/serial-numbers/${serialNumberId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateSerialNumber.isPending}
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
            description="Bu seri numarası satılmış, rezerve veya başka bir durumda olduğu için düzenlenemez."
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
          {/* Serial Info Section */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Seri Bilgileri (Salt Okunur)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Seri Numarası</p>
                <p className="text-sm font-medium text-slate-900">{serialNumber.serial}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ürün</p>
                <p className="text-sm font-medium text-slate-900">{serialNumber.productName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Durum</p>
                <Tag color={serialNumber.status === SerialNumberStatus.InStock ? 'success' : 'default'}>
                  {statusLabels[serialNumber.status]}
                </Tag>
              </div>
              {serialNumber.isUnderWarranty && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Garanti Durumu</p>
                  <Tag color="blue">Garanti Kapsamında</Tag>
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Düzenlenebilir Bilgiler</h3>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                label="Depo"
                name="warehouseId"
              >
                <Select
                  placeholder="Depo seçin"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={warehouses?.map(w => ({
                    value: w.id,
                    label: w.name,
                  }))}
                  onChange={() => form.setFieldValue('locationId', undefined)}
                />
              </Form.Item>

              <Form.Item
                label="Konum"
                name="locationId"
              >
                <Select
                  placeholder="Konum seçin"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedWarehouseId}
                  options={locations?.map(l => ({
                    value: l.id,
                    label: l.name,
                  }))}
                />
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
                label="Batch Numarası"
                name="batchNumber"
              >
                <Input placeholder="Batch numarası" />
              </Form.Item>

              <Form.Item
                label="Tedarikçi Seri Numarası"
                name="supplierSerial"
                className="col-span-2"
              >
                <Input placeholder="Tedarikçi seri numarası" />
              </Form.Item>

              <Form.Item
                label="Notlar"
                name="notes"
                className="col-span-2"
              >
                <TextArea
                  rows={4}
                  placeholder="Bu seri numarası hakkında notlar..."
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
