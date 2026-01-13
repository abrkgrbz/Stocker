'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, Card, InputNumber } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateKpiDefinition } from '@/lib/api/hooks/useManufacturing';
import type { CreateKpiDefinitionRequest } from '@/lib/api/services/manufacturing.types';
import { KpiCategory } from '@/lib/api/services/manufacturing.types';

const categoryOptions = [
  { value: KpiCategory.Efficiency, label: 'Verimlilik' },
  { value: KpiCategory.Quality, label: 'Kalite' },
  { value: KpiCategory.Delivery, label: 'Teslimat' },
];

export default function NewKpiDefinitionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createDefinition = useCreateKpiDefinition();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateKpiDefinitionRequest = {
        code: values.code as string,
        name: values.name as string,
        description: values.description as string | undefined,
        category: values.category as KpiCategory,
        unit: values.unit as string,
        formula: values.formula as string | undefined,
        targetValue: values.targetValue as number | undefined,
        warningThreshold: values.warningThreshold as number | undefined,
        criticalThreshold: values.criticalThreshold as number | undefined,
      };
      const result = await createDefinition.mutateAsync(data);
      router.push(`/manufacturing/kpi-dashboard/definitions/${result.id}`);
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni KPI Tanımı</h1>
              <p className="text-sm text-slate-400 m-0">Anahtar performans göstergesi bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/kpi-dashboard/definitions')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createDefinition.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card title="Temel Bilgiler" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="code"
                label="KPI Kodu"
                rules={[{ required: true, message: 'KPI kodu zorunludur' }]}
              >
                <Input placeholder="Örn: OEE, FPY, OTD" />
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
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
              <p className="mb-2"><strong>Not:</strong> Eşik değerleri KPI durumunu belirlemek için kullanılır.</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="text-green-600 font-medium">Hedefte:</span> Değer {">"} Uyarı Eşiği</li>
                <li><span className="text-orange-600 font-medium">Uyarı:</span> Kritik Eşik {"<"} Değer ≤ Uyarı Eşiği</li>
                <li><span className="text-red-600 font-medium">Kritik:</span> Değer ≤ Kritik Eşik</li>
              </ul>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
