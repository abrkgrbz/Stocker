'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Card } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateMaintenanceRecord, useWorkCenters } from '@/lib/api/hooks/useManufacturing';
import type { CreateMaintenanceRecordRequest } from '@/lib/api/services/manufacturing.types';
import { MaintenanceType } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

const maintenanceTypeOptions = [
  { value: MaintenanceType.Preventive, label: 'Önleyici Bakım' },
  { value: MaintenanceType.Corrective, label: 'Düzeltici Bakım' },
  { value: MaintenanceType.Predictive, label: 'Tahminsel Bakım' },
  { value: MaintenanceType.Breakdown, label: 'Arıza Bakımı' },
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createRecord = useCreateMaintenanceRecord();
  const { data: workCenters = [] } = useWorkCenters();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateMaintenanceRecordRequest = {
        machineId: values.machineId as string,
        planId: values.planId as string | undefined,
        maintenanceType: values.maintenanceType as MaintenanceType,
        description: values.description as string | undefined,
        scheduledDate: (values.scheduledDate as dayjs.Dayjs).toISOString(),
      };
      const result = await createRecord.mutateAsync(data);
      router.push(`/manufacturing/maintenance/${result.id}`);
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Bakım Emri</h1>
              <p className="text-sm text-slate-400 m-0">Bakım bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/maintenance')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createRecord.isPending}
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
          <Card title="Bakım Bilgileri" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="machineId"
                label="Makine / Ekipman"
                rules={[{ required: true, message: 'Makine zorunludur' }]}
              >
                <Select
                  placeholder="Seçiniz"
                  options={workCenters.map(wc => ({ value: wc.id, label: `${wc.code} - ${wc.name}` }))}
                />
              </Form.Item>
              <Form.Item
                name="maintenanceType"
                label="Bakım Tipi"
                rules={[{ required: true, message: 'Bakım tipi zorunludur' }]}
              >
                <Select options={maintenanceTypeOptions} placeholder="Seçiniz" />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Açıklama">
              <Input.TextArea rows={3} placeholder="Bakım açıklaması..." />
            </Form.Item>
          </Card>

          <Card title="Planlama" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="scheduledDate"
                label="Planlanan Tarih"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY HH:mm" showTime />
              </Form.Item>
              <Form.Item name="planId" label="Bakım Planı (Opsiyonel)">
                <Input placeholder="Bakım Planı ID" />
              </Form.Item>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
