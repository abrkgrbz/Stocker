'use client';

import React from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Card } from 'antd';
import type { FormInstance } from 'antd';
import type { CreateMasterProductionScheduleRequest, UpdateMasterProductionScheduleRequest, MasterProductionScheduleDto } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

interface MpsFormProps {
  form: FormInstance;
  initialValues?: MasterProductionScheduleDto;
  onFinish: (values: CreateMasterProductionScheduleRequest | UpdateMasterProductionScheduleRequest) => void;
  loading?: boolean;
}

const periodTypes = [
  { value: 'Daily', label: 'Günlük' },
  { value: 'Weekly', label: 'Haftalık' },
  { value: 'Monthly', label: 'Aylık' },
];

export function MpsForm({ form, initialValues, onFinish, loading }: MpsFormProps) {
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        periodType: initialValues.periodType,
        planningHorizonStart: initialValues.planningHorizonStart ? dayjs(initialValues.planningHorizonStart) : undefined,
        planningHorizonEnd: initialValues.planningHorizonEnd ? dayjs(initialValues.planningHorizonEnd) : undefined,
      });
    } else {
      form.setFieldsValue({
        periodType: 'Monthly',
        planningHorizonStart: dayjs(),
        planningHorizonEnd: dayjs().add(3, 'month'),
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: Record<string, unknown>) => {
    const submitData = {
      ...values,
      planningHorizonStart: (values.planningHorizonStart as dayjs.Dayjs)?.format('YYYY-MM-DD'),
      planningHorizonEnd: (values.planningHorizonEnd as dayjs.Dayjs)?.format('YYYY-MM-DD'),
    };
    onFinish(submitData as CreateMasterProductionScheduleRequest | UpdateMasterProductionScheduleRequest);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="max-w-4xl"
    >
      {/* Temel Bilgiler */}
      <Card
        title="Plan Bilgileri"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              name="name"
              label="Plan Adı"
              rules={[
                { required: true, message: 'Plan adı gereklidir' },
                { max: 200, message: 'Plan adı en fazla 200 karakter olabilir' },
              ]}
            >
              <Input
                placeholder="2024 Q1 Üretim Planı"
                className="!border-slate-300 !rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="periodType"
              label="Periyot Tipi"
              rules={[{ required: true, message: 'Periyot tipi seçiniz' }]}
            >
              <Select
                placeholder="Periyot seçiniz"
                options={periodTypes}
                className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Açıklama"
        >
          <Input.TextArea
            placeholder="Plan açıklaması..."
            rows={3}
            className="!border-slate-300 !rounded-lg"
          />
        </Form.Item>
      </Card>

      {/* Planlama Dönemi */}
      <Card
        title="Planlama Dönemi"
        className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="planningHorizonStart"
              label="Başlangıç Tarihi"
              rules={[{ required: true, message: 'Başlangıç tarihi gereklidir' }]}
            >
              <DatePicker
                className="!w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="planningHorizonEnd"
              label="Bitiş Tarihi"
              rules={[{ required: true, message: 'Bitiş tarihi gereklidir' }]}
            >
              <DatePicker
                className="!w-full !border-slate-300 !rounded-lg"
                format="DD.MM.YYYY"
                placeholder="Tarih seçiniz"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
