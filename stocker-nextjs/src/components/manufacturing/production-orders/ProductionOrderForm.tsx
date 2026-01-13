'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
} from 'antd';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { useBillOfMaterialsByProduct, useRoutingsByProduct } from '@/lib/api/hooks/useManufacturing';
import type { ProductionOrderDto, CreateProductionOrderRequest, OrderPriority } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ProductionOrderFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductionOrderDto;
  onFinish: (values: CreateProductionOrderRequest) => void;
  loading?: boolean;
}

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

export default function ProductionOrderForm({ form, initialValues, onFinish, loading }: ProductionOrderFormProps) {
  const { data: products = [], isLoading: productsLoading } = useProducts(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  // Fetch BOMs and Routings for selected product
  const { data: boms = [], isLoading: bomsLoading } = useBillOfMaterialsByProduct(selectedProductId || '');
  const { data: routings = [], isLoading: routingsLoading } = useRoutingsByProduct(selectedProductId || '');

  // Initialize form with existing values
  useEffect(() => {
    if (initialValues) {
      setSelectedProductId(initialValues.productId);
      form.setFieldsValue({
        productId: initialValues.productId,
        billOfMaterialId: initialValues.billOfMaterialId,
        routingId: initialValues.routingId,
        plannedQuantity: initialValues.plannedQuantity,
        unitOfMeasure: initialValues.unitOfMeasure,
        plannedStartDate: dayjs(initialValues.plannedStartDate),
        plannedEndDate: dayjs(initialValues.plannedEndDate),
        priority: initialValues.priority,
        notes: initialValues.notes,
      });
    }
  }, [initialValues, form]);

  // Handle product change - reset BOM and Routing
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    form.setFieldsValue({
      billOfMaterialId: undefined,
      routingId: undefined,
    });

    // Get unit from product
    const product = products.find(p => p.id.toString() === productId);
    if (product) {
      form.setFieldsValue({
        unitOfMeasure: product.unitName || 'adet',
      });
    }
  };

  // Handle form submission
  const handleFinish = (values: any) => {
    const orderData: CreateProductionOrderRequest = {
      productId: values.productId,
      billOfMaterialId: values.billOfMaterialId,
      routingId: values.routingId,
      plannedQuantity: values.plannedQuantity,
      unitOfMeasure: values.unitOfMeasure,
      plannedStartDate: values.plannedStartDate.format('YYYY-MM-DD'),
      plannedEndDate: values.plannedEndDate.format('YYYY-MM-DD'),
      priority: values.priority,
      notes: values.notes,
    };
    onFinish(orderData);
  };

  // Filter to only show products that have active BOMs
  const finishedProducts = products.filter(p =>
    p.productType === 'Finished' || p.productType === 'SemiFinished'
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        priority: 'Normal' as OrderPriority,
        unitOfMeasure: 'adet',
        plannedStartDate: dayjs(),
        plannedEndDate: dayjs().add(7, 'day'),
      }}
    >
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">

        {/* Product Selection */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Ürün Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="productId"
                label={<span className="text-slate-700 font-medium">Ürün</span>}
                rules={[{ required: true, message: 'Lütfen ürün seçin' }]}
                className="col-span-2 lg:col-span-1"
              >
                <Select
                  placeholder="Ürün seçin"
                  options={finishedProducts.map(p => ({
                    value: p.id.toString(),
                    label: `${p.name} (${p.code})`,
                  }))}
                  showSearch
                  optionFilterProp="label"
                  loading={productsLoading}
                  onChange={handleProductChange}
                  disabled={!!initialValues}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="billOfMaterialId"
                label={<span className="text-slate-700 font-medium">Ürün Reçetesi (BOM)</span>}
                rules={[{ required: true, message: 'Lütfen reçete seçin' }]}
                className="col-span-2 lg:col-span-1"
              >
                <Select
                  placeholder={selectedProductId ? 'Reçete seçin' : 'Önce ürün seçin'}
                  options={boms
                    .filter(b => b.status === 'Active' || b.status === 'Approved')
                    .map(b => ({
                      value: b.id,
                      label: `${b.bomNumber} (v${b.version})${b.isDefault ? ' - Varsayılan' : ''}`,
                    }))}
                  loading={bomsLoading}
                  disabled={!selectedProductId || !!initialValues}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="routingId"
                label={<span className="text-slate-700 font-medium">Rota (Opsiyonel)</span>}
                className="col-span-2 lg:col-span-1"
              >
                <Select
                  placeholder={selectedProductId ? 'Rota seçin' : 'Önce ürün seçin'}
                  options={routings
                    .filter(r => r.status === 'Active' || r.status === 'Approved')
                    .map(r => ({
                      value: r.id,
                      label: `${r.routingNumber} (v${r.version})${r.isDefault ? ' - Varsayılan' : ''}`,
                    }))}
                  loading={routingsLoading}
                  allowClear
                  disabled={!selectedProductId}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="priority"
                label={<span className="text-slate-700 font-medium">Öncelik</span>}
                rules={[{ required: true, message: 'Lütfen öncelik seçin' }]}
                className="col-span-2 lg:col-span-1"
              >
                <Select
                  options={priorityOptions}
                  className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Quantity & Dates */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Miktar & Tarihler</h3>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="plannedQuantity"
                label={<span className="text-slate-700 font-medium">Miktar</span>}
                rules={[{ required: true, message: 'Lütfen miktar girin' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="0"
                  className="w-full [&.ant-input-number]:!border-slate-300 [&.ant-input-number]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="unitOfMeasure"
                label={<span className="text-slate-700 font-medium">Birim</span>}
                rules={[{ required: true, message: 'Lütfen birim girin' }]}
              >
                <Input
                  placeholder="adet"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="plannedStartDate"
              label={<span className="text-slate-700 font-medium">Planlanan Başlangıç</span>}
              rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
            >
              <DatePicker
                className="w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Başlangıç tarihi"
              />
            </Form.Item>

            <Form.Item
              name="plannedEndDate"
              label={<span className="text-slate-700 font-medium">Planlanan Bitiş</span>}
              rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
            >
              <DatePicker
                className="w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Bitiş tarihi"
              />
            </Form.Item>
          </div>
        </div>

        {/* Notes */}
        <div className="col-span-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Ek Bilgiler</h3>
            <Form.Item
              name="notes"
              label={<span className="text-slate-700 font-medium">Notlar</span>}
            >
              <TextArea
                rows={3}
                placeholder="Üretim emri ile ilgili notlar (opsiyonel)"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </div>
        </div>

      </div>
    </Form>
  );
}
