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
  Select,
} from 'antd';
import {
  ArrowLeftIcon,
  HashtagIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import {
  useSerialNumber,
  useUpdateSerialNumber,
  useProducts,
  useWarehouses,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { UpdateSerialNumberDto } from '@/lib/api/services/inventory.types';
import { SerialNumberStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<SerialNumberStatus, { color: string; label: string }> = {
  [SerialNumberStatus.Available]: { color: 'processing', label: 'Kullanılabilir' },
  [SerialNumberStatus.InStock]: { color: 'success', label: 'Stokta' },
  [SerialNumberStatus.Reserved]: { color: 'warning', label: 'Rezerve' },
  [SerialNumberStatus.Sold]: { color: 'purple', label: 'Satıldı' },
  [SerialNumberStatus.Returned]: { color: 'cyan', label: 'İade Edildi' },
  [SerialNumberStatus.Defective]: { color: 'error', label: 'Arızalı' },
  [SerialNumberStatus.InRepair]: { color: 'orange', label: 'Tamirde' },
  [SerialNumberStatus.Scrapped]: { color: 'default', label: 'Hurda' },
  [SerialNumberStatus.Lost]: { color: 'default', label: 'Kayıp' },
  [SerialNumberStatus.OnLoan]: { color: 'lime', label: 'Ödünç Verildi' },
  [SerialNumberStatus.InTransit]: { color: 'geekblue', label: 'Transfer Halinde' },
};

export default function EditSerialNumberPage() {
  const router = useRouter();
  const params = useParams();
  const serialId = Number(params.id);
  const [form] = Form.useForm();

  const { data: serialNumber, isLoading, error } = useSerialNumber(serialId);
  const updateSerialNumber = useUpdateSerialNumber();
  const { data: products } = useProducts({ pageSize: 1000 });
  const { data: warehouses } = useWarehouses({ pageSize: 100 });

  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const { data: locations } = useLocations(
    selectedWarehouseId ? { warehouseId: selectedWarehouseId, pageSize: 100 } : { pageSize: 0 }
  );

  useEffect(() => {
    if (serialNumber) {
      form.setFieldsValue({
        serial: serialNumber.serial,
        productId: serialNumber.productId,
        warehouseId: serialNumber.warehouseId,
        locationId: serialNumber.locationId,
        supplierSerial: serialNumber.supplierSerial,
        batchNumber: serialNumber.batchNumber,
        manufacturedDate: serialNumber.manufacturedDate ? dayjs(serialNumber.manufacturedDate) : null,
        warrantyStartDate: serialNumber.warrantyStartDate ? dayjs(serialNumber.warrantyStartDate) : null,
        warrantyEndDate: serialNumber.warrantyEndDate ? dayjs(serialNumber.warrantyEndDate) : null,
        notes: serialNumber.notes,
      });
    }
  }, [serialNumber, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data: UpdateSerialNumberDto = {
        serial: values.serial,
        supplierSerial: values.supplierSerial,
        batchNumber: values.batchNumber,
        manufacturedDate: values.manufacturedDate?.toISOString(),
        warrantyStartDate: values.warrantyStartDate?.toISOString(),
        warrantyEndDate: values.warrantyEndDate?.toISOString(),
        notes: values.notes,
      };

      await updateSerialNumber.mutateAsync({ id: serialId, data });
      router.push(`/inventory/serial-numbers/${serialId}`);
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

  const statusInfo = statusConfig[serialNumber.status];
  const canEdit = [
    SerialNumberStatus.Available,
    SerialNumberStatus.InStock,
    SerialNumberStatus.Reserved,
  ].includes(serialNumber.status as SerialNumberStatus);

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
                <HashtagIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {serialNumber.serial}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  {serialNumber.isUnderWarranty && (
                    <Tag
                      icon={<ShieldCheckIcon className="w-3 h-3" />}
                      className="border-0 bg-emerald-50 text-emerald-700"
                    >
                      Garantili
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {serialNumber.productName} • Düzenle
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/serial-numbers/${serialId}`)}>
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
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {!canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 m-0">
              Bu seri numarası düzenlenemez durumda. Sadece Kullanılabilir, Stokta veya Rezerve durumundaki kayıtlar düzenlenebilir.
            </p>
          </div>
        )}

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Serial Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Seri Numarası Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="serial"
                    label="Seri Numarası"
                    rules={[{ required: true, message: 'Seri numarası zorunludur' }]}
                  >
                    <Input
                      placeholder="SN-001"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>

                  <Form.Item name="supplierSerial" label="Tedarikçi Seri No">
                    <Input
                      placeholder="Tedarikçi seri numarası"
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

                  <Form.Item name="batchNumber" label="Parti/Lot No">
                    <Input
                      placeholder="Parti numarası"
                      disabled={!canEdit}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
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

                  <Form.Item name="locationId" label="Lokasyon">
                    <Select
                      placeholder="Lokasyon seçin"
                      disabled
                      allowClear
                      options={locations?.items?.map((l) => ({
                        value: l.id,
                        label: l.name,
                      }))}
                      className="[&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-slate-300"
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

                  <Form.Item name="warrantyStartDate" label="Garanti Başlangıç">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      placeholder="Garanti başlangıç"
                      disabled={!canEdit}
                    />
                  </Form.Item>

                  <Form.Item name="warrantyEndDate" label="Garanti Bitiş">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                      placeholder="Garanti bitiş"
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
                    placeholder="Seri numarası ile ilgili notlar..."
                    disabled={!canEdit}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>

            <div className="space-y-6">
              {/* Warranty Status */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Garanti Durumu
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Garanti Durumu</span>
                    <Tag
                      icon={serialNumber.isUnderWarranty ? <ShieldCheckIcon className="w-3 h-3" /> : undefined}
                      className={`border-0 ${serialNumber.isUnderWarranty ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {serialNumber.isUnderWarranty ? 'Aktif' : 'Yok'}
                    </Tag>
                  </div>

                  {serialNumber.remainingWarrantyDays !== undefined && serialNumber.remainingWarrantyDays > 0 && (
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Kalan Garanti Süresi</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {serialNumber.remainingWarrantyDays} gün
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Konum Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Depo</span>
                    <span className="text-sm text-slate-900">
                      {serialNumber.warehouseName || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Lokasyon</span>
                    <span className="text-sm text-slate-900">
                      {serialNumber.locationName || '-'}
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
                      {dayjs(serialNumber.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  {serialNumber.receivedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Teslim Tarihi</span>
                      <span className="text-sm text-slate-900">
                        {dayjs(serialNumber.receivedDate).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  )}
                  {serialNumber.soldDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Satış Tarihi</span>
                      <span className="text-sm text-slate-900">
                        {dayjs(serialNumber.soldDate).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sales Info */}
              {(serialNumber.customerId || serialNumber.salesOrderId) && (
                <div className="bg-white border border-purple-200 rounded-xl p-6">
                  <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider pb-2 mb-4 border-b border-purple-100">
                    Satış Bilgileri
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Müşteri ID</span>
                      <span className="text-sm text-slate-900">
                        {serialNumber.customerId || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Sipariş No</span>
                      <span className="text-sm text-slate-900">
                        {serialNumber.salesOrderId || '-'}
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
