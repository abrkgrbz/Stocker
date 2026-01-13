'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Card, Switch } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateCapacityPlan, useMrpPlans } from '@/lib/api/hooks/useManufacturing';
import type { CreateCapacityPlanRequest } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

export default function NewCapacityPlanPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPlan = useCreateCapacityPlan();
  const { data: mrpPlans = [] } = useMrpPlans();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateCapacityPlanRequest = {
        name: values.name as string,
        description: values.description as string | undefined,
        mrpPlanId: values.mrpPlanId as string | undefined,
        planningHorizonStart: (values.planningHorizon as [dayjs.Dayjs, dayjs.Dayjs])[0].toISOString(),
        planningHorizonEnd: (values.planningHorizon as [dayjs.Dayjs, dayjs.Dayjs])[1].toISOString(),
        includeSetupTimes: values.includeSetupTimes as boolean ?? true,
        includeEfficiency: values.includeEfficiency as boolean ?? true,
      };
      const result = await createPlan.mutateAsync(data);
      router.push(`/manufacturing/capacity-plans/${result.id}`);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Kapasite Planı</h1>
              <p className="text-sm text-slate-400 m-0">Plan bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/capacity-plans')}>Vazgeç</Button>
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

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ includeSetupTimes: true, includeEfficiency: true }}>
          <Card title="Temel Bilgiler" className="mb-6">
            <Form.Item
              name="name"
              label="Plan Adı"
              rules={[{ required: true, message: 'Plan adı zorunludur' }]}
            >
              <Input placeholder="Örn: Ocak 2024 Kapasite Planı" />
            </Form.Item>
            <Form.Item
              name="planningHorizon"
              label="Planlama Dönemi"
              rules={[{ required: true, message: 'Planlama dönemi zorunludur' }]}
            >
              <DatePicker.RangePicker className="w-full" format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="mrpPlanId" label="MRP Planı (Opsiyonel)">
              <Select
                allowClear
                placeholder="MRP planı seçin"
                options={mrpPlans.map(plan => ({ value: plan.id, label: plan.name }))}
              />
            </Form.Item>
            <Form.Item name="description" label="Açıklama">
              <Input.TextArea rows={3} placeholder="Plan hakkında notlar..." />
            </Form.Item>
          </Card>

          <Card title="Hesaplama Seçenekleri">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item name="includeSetupTimes" label="Hazırlık Sürelerini Dahil Et" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="includeEfficiency" label="Verimlilik Oranını Dahil Et" valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
