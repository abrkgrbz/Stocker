'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, DatePicker, Select, Switch, Row, Col, Card } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateMrpPlan } from '@/lib/api/hooks/useManufacturing';
import type { CreateMrpPlanRequest, MrpPlanType } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

const planTypes = [
  { value: 'Regenerative', label: 'Yeniden Oluşturma (Regenerative)' },
  { value: 'NetChange', label: 'Net Değişim (Net Change)' },
];

export default function NewMrpPlanPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPlan = useCreateMrpPlan();

  React.useEffect(() => {
    form.setFieldsValue({
      planType: 'Regenerative',
      planningHorizonStart: dayjs(),
      planningHorizonEnd: dayjs().add(1, 'month'),
      includeSafetyStock: true,
      includeLeadTimes: true,
    });
  }, [form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const submitData: CreateMrpPlanRequest = {
      name: values.name as string,
      description: values.description as string | undefined,
      planType: values.planType as MrpPlanType,
      planningHorizonStart: (values.planningHorizonStart as dayjs.Dayjs).format('YYYY-MM-DD'),
      planningHorizonEnd: (values.planningHorizonEnd as dayjs.Dayjs).format('YYYY-MM-DD'),
      includeSafetyStock: values.includeSafetyStock as boolean,
      includeLeadTimes: values.includeLeadTimes as boolean,
    };

    try {
      const result = await createPlan.mutateAsync(submitData);
      router.push(`/manufacturing/mrp-plans/${result.id}`);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
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
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">
                Yeni MRP Planı
              </h1>
              <p className="text-sm text-slate-400 m-0">Plan bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/mrp-plans')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createPlan.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
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
          disabled={createPlan.isPending}
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
                    placeholder="MRP Planı - Ocak 2024"
                    className="!border-slate-300 !rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="planType"
                  label="Plan Tipi"
                  rules={[{ required: true, message: 'Plan tipi seçiniz' }]}
                >
                  <Select
                    placeholder="Tip seçiniz"
                    options={planTypes}
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

          {/* Seçenekler */}
          <Card
            title="Hesaplama Seçenekleri"
            className="mb-6 [&_.ant-card-head]:bg-slate-50 [&_.ant-card-head]:border-slate-200"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="includeSafetyStock"
                  label="Emniyet Stoğunu Dahil Et"
                  valuePropName="checked"
                  tooltip="MRP hesaplamasında emniyet stok seviyelerini dikkate al"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="includeLeadTimes"
                  label="Tedarik Sürelerini Dahil Et"
                  valuePropName="checked"
                  tooltip="MRP hesaplamasında tedarik sürelerini dikkate al"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
}
