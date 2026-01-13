'use client';

import React from 'react';
import { Form, Input, DatePicker, Select, InputNumber, Row, Col, Card } from 'antd';
import type { FormInstance } from 'antd';
import { useProducts, useWarehouses } from '@/lib/api/hooks/useInventory';
import { useProductionOrders } from '@/lib/api/hooks/useManufacturing';
import type { CreateMaterialReservationRequest, UpdateMaterialReservationRequest, MaterialReservationDto } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

interface MaterialReservationFormProps {
  form: FormInstance;
  initialValues?: MaterialReservationDto;
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
  isEdit?: boolean;
}

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

export function MaterialReservationForm({ form, initialValues, onFinish, loading, isEdit }: MaterialReservationFormProps) {
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: productionOrders = [] } = useProductionOrders({});

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        productionOrderId: initialValues.productionOrderId,
        productId: initialValues.productId,
        warehouseId: initialValues.warehouseId,
        requiredQuantity: initialValues.requiredQuantity,
        requiredDate: initialValues.requiredDate ? dayjs(initialValues.requiredDate) : undefined,
        priority: initialValues.priority,
        lotNumber: initialValues.lotNumber,
        notes: initialValues.notes,
      });
    } else {
      form.setFieldsValue({
        priority: 'Normal',
        requiredDate: dayjs(),
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: Record<string, unknown>) => {
    const submitData = {
      ...values,
      requiredDate: (values.requiredDate as dayjs.Dayjs)?.format('YYYY-MM-DD'),
    };
    onFinish(submitData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="max-w-4xl"
    >
      {/* Kaynak Bilgileri */}
      <Card
        title="Kaynak Bilgileri"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="productionOrderId"
              label="Üretim Emri"
              rules={[{ required: true, message: 'Üretim emri seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Üretim emri seçiniz"
                optionFilterProp="label"
                options={productionOrders.map(po => ({
                  value: po.id,
                  label: `${po.orderNumber} - ${po.productName}`,
                }))}
                disabled={isEdit}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="productId"
              label="Malzeme"
              rules={[{ required: true, message: 'Malzeme seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Malzeme seçiniz"
                optionFilterProp="label"
                options={products.map(p => ({
                  value: p.id.toString(),
                  label: `${p.code} - ${p.name}`,
                }))}
                disabled={isEdit}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="warehouseId"
              label="Depo"
              rules={[{ required: true, message: 'Depo seçiniz' }]}
            >
              <Select
                showSearch
                placeholder="Depo seçiniz"
                optionFilterProp="label"
                options={warehouses.map(w => ({
                  value: w.id,
                  label: w.name,
                }))}
                disabled={isEdit}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lotNumber"
              label="Lot No"
            >
              <Input
                placeholder="Lot numarası (opsiyonel)"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Miktar ve Tarih */}
      <Card
        title="Miktar ve Zamanlama"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="requiredQuantity"
              label="Gerekli Miktar"
              rules={[{ required: true, message: 'Miktar gereklidir' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                className="!w-full !border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="requiredDate"
              label="Gerekli Tarih"
              rules={[{ required: true, message: 'Tarih gereklidir' }]}
            >
              <DatePicker
                className="!w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="priority"
              label="Öncelik"
              rules={[{ required: true, message: 'Öncelik seçiniz' }]}
            >
              <Select
                placeholder="Öncelik seçiniz"
                options={priorityOptions}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Notlar */}
      <Card
        title="Notlar"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Form.Item
          name="notes"
          label="Not"
        >
          <Input.TextArea
            placeholder="Ek notlar..."
            rows={3}
            className="!border-slate-300 !rounded-lg"
          />
        </Form.Item>
      </Card>
    </Form>
  );
}
