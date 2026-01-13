'use client';

import React from 'react';
import { Form, Input, InputNumber, Select, Switch, Row, Col, Card } from 'antd';
import type { FormInstance } from 'antd';
import type { CreateWorkCenterRequest, UpdateWorkCenterRequest, WorkCenterDto } from '@/lib/api/services/manufacturing.types';

interface WorkCenterFormProps {
  form: FormInstance;
  initialValues?: WorkCenterDto;
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
}

const workCenterTypes = [
  { value: 'Machine', label: 'Makine' },
  { value: 'Labor', label: 'İşçilik' },
  { value: 'Subcontract', label: 'Fason' },
  { value: 'Mixed', label: 'Karma' },
];

export function WorkCenterForm({ form, initialValues, onFinish, loading }: WorkCenterFormProps) {
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        code: initialValues.code,
        name: initialValues.name,
        description: initialValues.description,
        type: initialValues.type,
        capacityPerHour: initialValues.capacityPerHour,
        setupTime: initialValues.setupTime,
        efficiency: initialValues.efficiency,
        hourlyRate: initialValues.hourlyRate,
        setupCost: initialValues.setupCost,
        isActive: initialValues.isActive,
      });
    } else {
      form.setFieldsValue({
        type: 'Machine',
        capacityPerHour: 1,
        setupTime: 0,
        efficiency: 100,
        hourlyRate: 0,
        setupCost: 0,
        isActive: true,
      });
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="max-w-4xl"
    >
      {/* Temel Bilgiler */}
      <Card
        title="Temel Bilgiler"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="code"
              label="Kod"
              rules={[
                { required: true, message: 'Kod gereklidir' },
                { max: 50, message: 'Kod en fazla 50 karakter olabilir' },
              ]}
            >
              <Input
                placeholder="WC001"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Ad"
              rules={[
                { required: true, message: 'Ad gereklidir' },
                { max: 200, message: 'Ad en fazla 200 karakter olabilir' },
              ]}
            >
              <Input
                placeholder="İş merkezi adı"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="type"
              label="Tür"
              rules={[{ required: true, message: 'Tür seçiniz' }]}
            >
              <Select
                placeholder="Tür seçiniz"
                options={workCenterTypes}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item
              name="description"
              label="Açıklama"
            >
              <Input.TextArea
                placeholder="İş merkezi açıklaması..."
                rows={2}
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Kapasite ve Maliyet */}
      <Card
        title="Kapasite ve Maliyet"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="capacityPerHour"
              label="Kapasite/Saat"
              rules={[
                { required: true, message: 'Kapasite gereklidir' },
              ]}
              tooltip="Saatlik üretim kapasitesi (birim)"
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
              name="hourlyRate"
              label="Maliyet/Saat (₺)"
              rules={[
                { required: true, message: 'Maliyet gereklidir' },
              ]}
              tooltip="Saatlik çalışma maliyeti"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                prefix="₺"
                className="!w-full !border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="efficiency"
              label="Verimlilik (%)"
              rules={[
                { required: true, message: 'Verimlilik gereklidir' },
              ]}
              tooltip="İş merkezinin verimlilik oranı (0-100)"
            >
              <InputNumber
                min={0}
                max={100}
                step={1}
                precision={0}
                placeholder="100"
                suffix="%"
                className="!w-full !border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Durum */}
      <Card
        title="Durum"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Form.Item
          name="isActive"
          label="Aktif"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>
    </Form>
  );
}
