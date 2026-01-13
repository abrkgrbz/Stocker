'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Select, Card, InputNumber, DatePicker, Input } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useKpiDefinitions, useCreateKpiValue } from '@/lib/api/hooks/useManufacturing';
import type { CreateKpiValueRequest } from '@/lib/api/services/manufacturing.types';
import { KpiCategory } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

const categoryConfig: Record<KpiCategory, { color: string; label: string }> = {
  [KpiCategory.Efficiency]: { color: 'blue', label: 'Verimlilik' },
  [KpiCategory.Quality]: { color: 'green', label: 'Kalite' },
  [KpiCategory.Delivery]: { color: 'orange', label: 'Teslimat' },
  [KpiCategory.Cost]: { color: 'purple', label: 'Maliyet' },
  [KpiCategory.Safety]: { color: 'red', label: 'Güvenlik' },
};

export default function NewKpiValuePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: definitions = [], isLoading: definitionsLoading } = useKpiDefinitions();
  const createValue = useCreateKpiValue();

  const selectedKpiId = Form.useWatch('kpiDefinitionId', form);
  const selectedKpi = definitions.find((d) => d.id === selectedKpiId);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateKpiValueRequest = {
        kpiDefinitionId: values.kpiDefinitionId as string,
        recordDate: (values.recordDate as dayjs.Dayjs).toISOString(),
        value: values.value as number,
        notes: values.notes as string | undefined,
      };
      await createValue.mutateAsync(data);
      router.push('/manufacturing/kpi-dashboard');
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni KPI Değeri</h1>
              <p className="text-sm text-slate-400 m-0">KPI ölçüm değerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/kpi-dashboard')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createValue.isPending}
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
          <Card title="KPI Seçimi" className="mb-6">
            <Form.Item
              name="kpiDefinitionId"
              label="KPI"
              rules={[{ required: true, message: 'KPI seçimi zorunludur' }]}
            >
              <Select
                placeholder="Değer girmek istediğiniz KPI'yı seçin"
                loading={definitionsLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={definitions.map((d) => ({
                  value: d.id,
                  label: `${d.code} - ${d.name}`,
                  category: d.category,
                }))}
                optionRender={(option) => {
                  const cfg = categoryConfig[option.data.category as KpiCategory];
                  return (
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${cfg?.color}20`, color: cfg?.color }}>
                        {cfg?.label}
                      </span>
                    </div>
                  );
                }}
              />
            </Form.Item>

            {selectedKpi && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Birim:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedKpi.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Hedef:</span>
                    <span className="ml-2 font-medium text-slate-900">
                      {selectedKpi.targetValue !== undefined ? `${selectedKpi.targetValue} ${selectedKpi.unit}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Uyarı Eşiği:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {selectedKpi.warningThreshold !== undefined ? `${selectedKpi.warningThreshold} ${selectedKpi.unit}` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="Değer Bilgileri" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="recordDate"
                label="Kayıt Tarihi"
                initialValue={dayjs()}
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" />
              </Form.Item>
              <Form.Item
                name="value"
                label={`Değer${selectedKpi ? ` (${selectedKpi.unit})` : ''}`}
                rules={[{ required: true, message: 'Değer zorunludur' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  className="w-full"
                  placeholder="0"
                  addonAfter={selectedKpi?.unit}
                />
              </Form.Item>
            </div>
            <Form.Item name="notes" label="Notlar">
              <Input.TextArea rows={3} placeholder="Ölçümle ilgili notlar..." />
            </Form.Item>
          </Card>
        </Form>
      </div>
    </div>
  );
}
