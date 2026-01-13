'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Input, Select, Card, InputNumber, Switch } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useKpiDefinition, useUpdateKpiDefinition } from '@/lib/api/hooks/useManufacturing';
import type { UpdateKpiDefinitionRequest } from '@/lib/api/services/manufacturing.types';
import { KpiCategory } from '@/lib/api/services/manufacturing.types';

const categoryOptions = [
  { value: KpiCategory.Efficiency, label: 'Verimlilik' },
  { value: KpiCategory.Quality, label: 'Kalite' },
  { value: KpiCategory.Delivery, label: 'Teslimat' },
];

export default function EditKpiDefinitionPage() {
  const router = useRouter();
  const params = useParams();
  const definitionId = params.id as string;
  const [form] = Form.useForm();

  const { data: definition, isLoading, error } = useKpiDefinition(definitionId);
  const updateDefinition = useUpdateKpiDefinition();

  useEffect(() => {
    if (definition) {
      form.setFieldsValue({
        name: definition.name,
        description: definition.description,
        category: definition.category,
        unit: definition.unit,
        formula: definition.formula,
        targetValue: definition.targetValue,
        warningThreshold: definition.warningThreshold,
        criticalThreshold: definition.criticalThreshold,
        isActive: definition.isActive,
      });
    }
  }, [definition, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: UpdateKpiDefinitionRequest = {
        name: values.name as string,
        description: values.description as string | undefined,
        category: values.category as KpiCategory,
        unit: values.unit as string,
        formula: values.formula as string | undefined,
        targetValue: values.targetValue as number | undefined,
        warningThreshold: values.warningThreshold as number | undefined,
        criticalThreshold: values.criticalThreshold as number | undefined,
      };
      await updateDefinition.mutateAsync({ id: definitionId, data });
      router.push(`/manufacturing/kpi-dashboard/definitions/${definitionId}`);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !definition) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <ExclamationTriangleIcon className="w-12 h-12 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">KPI Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen KPI tanımı bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/manufacturing/kpi-dashboard/definitions')} className="!border-slate-300">
            KPI Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-slate-900 m-0">KPI Düzenle</h1>
              <p className="text-sm text-slate-400 m-0">{definition.code} - {definition.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/kpi-dashboard/definitions/${definitionId}`)}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateDefinition.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card title="Temel Bilgiler" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item label="KPI Kodu">
                <Input value={definition.code} disabled />
              </Form.Item>
              <Form.Item
                name="name"
                label="KPI Adı"
                rules={[{ required: true, message: 'KPI adı zorunludur' }]}
              >
                <Input placeholder="Örn: Genel Ekipman Etkinliği" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="category"
                label="Kategori"
                rules={[{ required: true, message: 'Kategori zorunludur' }]}
              >
                <Select options={categoryOptions} placeholder="Seçiniz" />
              </Form.Item>
              <Form.Item
                name="unit"
                label="Birim"
                rules={[{ required: true, message: 'Birim zorunludur' }]}
              >
                <Input placeholder="Örn: %, adet, saat" />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Açıklama">
              <Input.TextArea rows={3} placeholder="KPI açıklaması..." />
            </Form.Item>
            <Form.Item name="formula" label="Formül (Opsiyonel)">
              <Input placeholder="Örn: (Kullanılabilirlik × Performans × Kalite) × 100" />
            </Form.Item>
          </Card>

          <Card title="Eşik Değerleri" className="mb-6">
            <div className="grid grid-cols-3 gap-6">
              <Form.Item name="targetValue" label="Hedef Değer">
                <InputNumber min={0} className="w-full" placeholder="85" />
              </Form.Item>
              <Form.Item name="warningThreshold" label="Uyarı Eşiği">
                <InputNumber min={0} className="w-full" placeholder="70" />
              </Form.Item>
              <Form.Item name="criticalThreshold" label="Kritik Eşik">
                <InputNumber min={0} className="w-full" placeholder="50" />
              </Form.Item>
            </div>
          </Card>

          <Card title="Durum">
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>
        </Form>
      </div>
    </div>
  );
}
