'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateConsignmentStock,
  useSuppliers,
  useProducts,
  useWarehouses,
  useLocations,
} from '@/lib/api/hooks/useInventory';
import type { CreateConsignmentStockDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function NewConsignmentStockPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createConsignment = useCreateConsignmentStock();

  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();

  const selectedWarehouseId = Form.useWatch('warehouseId', form);
  const { data: locations } = useLocations(selectedWarehouseId);

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateConsignmentStockDto = {
        supplierId: values.supplierId,
        productId: values.productId,
        warehouseId: values.warehouseId,
        locationId: values.locationId,
        initialQuantity: values.initialQuantity,
        unit: values.unit || 'Adet',
        unitCost: values.unitCost,
        sellingPrice: values.sellingPrice,
        currency: values.currency,
        commissionRate: values.commissionRate,
        lotNumber: values.lotNumber,
        agreementEndDate: values.agreementEndDate ? dayjs(values.agreementEndDate).toISOString() : undefined,
        maxConsignmentDays: values.maxConsignmentDays,
        reconciliationPeriodDays: values.reconciliationPeriodDays,
        agreementNotes: values.agreementNotes,
      };
      const result = await createConsignment.mutateAsync(data);
      router.push(`/inventory/consignment-stocks/${result.id}`);
    } catch {
      // Error handled by hook
    }
  };

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
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  Yeni Konsinye Stok
                </h1>
                <p className="text-sm text-slate-500 m-0">Tedarikçi konsinye anlaşması oluştur</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/consignment-stocks')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createConsignment.isPending}
              onClick={() => form.submit()}
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={createConsignment.isPending}
          className="w-full"
          scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
        >
          <div className="bg-white border border-slate-200 rounded-xl">
            {/* Form Body */}
            <div className="px-8 py-6">
              {/* Temel Bilgiler */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Temel Bilgiler
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Tedarikçi <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="supplierId"
                      rules={[{ required: true, message: 'Tedarikçi seçimi zorunludur' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Tedarikçi seçin"
                        showSearch
                        optionFilterProp="label"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={suppliers?.map((s) => ({ value: s.id, label: s.name }))}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Ürün <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="productId"
                      rules={[{ required: true, message: 'Ürün seçimi zorunludur' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="Ürün seçin"
                        showSearch
                        optionFilterProp="label"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={products?.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.sku})`
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Depo <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="warehouseId"
                      rules={[{ required: true, message: 'Depo seçimi zorunludur' }]}
                      className="mb-0"
                    >
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
                        options={locations?.map((l) => ({ value: l.id, label: l.name }))}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Miktar ve Fiyat */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Miktar ve Fiyat
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Başlangıç Miktarı <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="initialQuantity"
                      rules={[{ required: true, message: 'Miktar zorunludur' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="0"
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Birim
                    </label>
                    <Form.Item
                      name="unit"
                      initialValue="Adet"
                      className="mb-0"
                    >
                      <Input
                        placeholder="Adet"
                        className="!bg-slate-50 !border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Birim Maliyet <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name="unitCost"
                      rules={[{ required: true, message: 'Birim maliyet zorunludur' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        placeholder="0.00"
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Para Birimi
                    </label>
                    <Form.Item
                      name="currency"
                      initialValue="TRY"
                      className="mb-0"
                    >
                      <Select
                        placeholder="Para birimi seçin"
                        className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                        options={[
                          { value: 'TRY', label: 'TRY - Türk Lirası' },
                          { value: 'USD', label: 'USD - Amerikan Doları' },
                          { value: 'EUR', label: 'EUR - Euro' },
                        ]}
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
                      Maks. Konsinye Süresi (Gün)
                    </label>
                    <Form.Item name="maxConsignmentDays" className="mb-0">
                      <InputNumber
                        placeholder="90"
                        min={1}
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

              {/* Fiyat ve Komisyon Ayarları */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                  Fiyat ve Komisyon
                </h3>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
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

                  <div className="col-span-4">
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

                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Lot Numarası
                    </label>
                    <Form.Item name="lotNumber" className="mb-0">
                      <Input
                        placeholder="Lot numarası"
                        className="!bg-slate-50 !border-slate-300"
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
                    <Form.Item name="agreementNotes" className="mb-0">
                      <TextArea
                        rows={3}
                        placeholder="Tedarikçi ile yapılan anlaşma hakkında notlar..."
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
