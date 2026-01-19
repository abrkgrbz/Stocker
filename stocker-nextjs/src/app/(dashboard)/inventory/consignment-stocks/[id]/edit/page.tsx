'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import {
  useConsignmentStock,
  useUpdateConsignmentStock,
  useWarehouses,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { UpdateConsignmentStockDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function EditConsignmentStockPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  const { data: consignment, isLoading } = useConsignmentStock(id);
  const updateConsignment = useUpdateConsignmentStock();
  const { data: warehouses } = useWarehouses();

  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const { data: locations } = useLocations(
    selectedWarehouseId ? { warehouseId: selectedWarehouseId, pageSize: 100 } : { pageSize: 0 }
  );

  useEffect(() => {
    if (consignment) {
      form.setFieldsValue({
        warehouseId: consignment.warehouseId,
        locationId: consignment.locationId,
        sellingPrice: consignment.sellingPrice,
        commissionRate: consignment.commissionRate,
        agreementEndDate: consignment.agreementEndDate ? dayjs(consignment.agreementEndDate) : null,
        maxConsignmentDays: consignment.maxConsignmentDays,
        reconciliationPeriodDays: consignment.reconciliationPeriodDays,
        agreementNotes: consignment.agreementNotes,
        internalNotes: consignment.internalNotes,
      });
    }
  }, [consignment, form]);

  const handleSubmit = async (values: UpdateConsignmentStockDto) => {
    try {
      const data: UpdateConsignmentStockDto = {
        ...values,
        agreementEndDate: values.agreementEndDate
          ? dayjs(values.agreementEndDate).toISOString()
          : undefined,
      };
      await updateConsignment.mutateAsync({ id, data });
      router.push(`/inventory/consignment-stocks/${id}`);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!consignment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Konsinye stok bulunamadı</p>
          <Button onClick={() => router.push('/inventory/consignment-stocks')}>
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push(`/inventory/consignment-stocks/${id}`)}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  Konsinye Stok Düzenle
                </h1>
                <p className="text-sm text-slate-500 m-0">
                  {consignment.consignmentNumber} - {consignment.productName}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/consignment-stocks/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateConsignment.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={updateConsignment.isPending}
          className="w-full"
          scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
        >
          {/* Mevcut Bilgiler (Read-only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <div className="px-8 py-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-200">
                Mevcut Bilgiler (Salt Okunur)
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-xs text-slate-500 mb-1">Konsinye No</label>
                  <p className="text-sm font-medium text-slate-900">
                    {consignment.consignmentNumber}
                  </p>
                </div>
                <div className="col-span-4">
                  <label className="block text-xs text-slate-500 mb-1">Tedarikçi</label>
                  <p className="text-sm font-medium text-slate-900">{consignment.supplierName}</p>
                </div>
                <div className="col-span-4">
                  <label className="block text-xs text-slate-500 mb-1">Ürün</label>
                  <p className="text-sm font-medium text-slate-900">{consignment.productName}</p>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Başlangıç Miktarı</label>
                  <p className="text-sm font-medium text-slate-900">
                    {consignment.initialQuantity?.toLocaleString('tr-TR')} {consignment.unit}
                  </p>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Mevcut Miktar</label>
                  <p className="text-sm font-medium text-slate-900">
                    {consignment.currentQuantity?.toLocaleString('tr-TR')} {consignment.unit}
                  </p>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Birim Maliyet</label>
                  <p className="text-sm font-medium text-slate-900">
                    {consignment.unitCost?.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    {consignment.currency}
                  </p>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Durum</label>
                  <p className="text-sm font-medium text-slate-900">{consignment.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            {/* Form Body */}
            <div className="px-8 py-6">
              {/* Lokasyon Bilgileri */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Lokasyon Bilgileri
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                    <Form.Item name="warehouseId" className="mb-0">
                      <Select
                        placeholder="Depo seçin"
                        showSearch
                        optionFilterProp="label"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={warehouses?.map((w) => ({ value: w.id, label: w.name }))}
                        onChange={() => form.setFieldValue('locationId', undefined)}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Lokasyon
                    </label>
                    <Form.Item name="locationId" className="mb-0">
                      <Select
                        placeholder="Lokasyon seçin"
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        disabled={!selectedWarehouseId}
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={locations?.items?.map((l) => ({ value: l.id, label: l.name }))}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Fiyat ve Komisyon */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Fiyat ve Komisyon
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Satış Fiyatı
                    </label>
                    <Form.Item name="sellingPrice" className="mb-0">
                      <InputNumber
                        placeholder="0.00"
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Komisyon Oranı (%)
                    </label>
                    <Form.Item name="commissionRate" className="mb-0">
                      <InputNumber
                        placeholder="0.00"
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                        addonAfter="%"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Anlaşma Ayarları */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Anlaşma Ayarları
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Anlaşma Bitiş Tarihi
                    </label>
                    <Form.Item name="agreementEndDate" className="mb-0">
                      <DatePicker
                        placeholder="Tarih seçin"
                        className="w-full !bg-slate-50 !border-slate-300"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Maksimum Konsinye Süresi (Gün)
                    </label>
                    <Form.Item name="maxConsignmentDays" className="mb-0">
                      <InputNumber
                        placeholder="0"
                        min={0}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Mutabakat Periyodu (Gün)
                    </label>
                    <Form.Item name="reconciliationPeriodDays" className="mb-0">
                      <InputNumber
                        placeholder="30"
                        min={1}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Notlar */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Notlar
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Anlaşma Notları
                    </label>
                    <Form.Item name="agreementNotes" className="mb-4">
                      <TextArea
                        rows={3}
                        placeholder="Tedarikçi ile yapılan anlaşma hakkında notlar..."
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-12">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Dahili Notlar
                    </label>
                    <Form.Item name="internalNotes" className="mb-0">
                      <TextArea
                        rows={3}
                        placeholder="Sadece şirket içi kullanım için notlar..."
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden submit button */}
          <Form.Item hidden>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
