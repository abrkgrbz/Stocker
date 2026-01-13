'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Card } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateCapa } from '@/lib/api/hooks/useManufacturing';
import type { CreateCapaRequest } from '@/lib/api/services/manufacturing.types';
import { CapaType, OrderPriority } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

const typeOptions = [
  { value: CapaType.Corrective, label: 'Düzeltici Aksiyon' },
  { value: CapaType.Preventive, label: 'Önleyici Aksiyon' },
];

export default function NewCapaPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCapa = useCreateCapa();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateCapaRequest = {
        title: values.title as string,
        description: values.description as string,
        type: values.capaType as CapaType,
        ncrId: values.ncrId as string | undefined,
        priority: OrderPriority.Normal,
        responsibleUserId: values.responsibleUserId as string,
        dueDate: (values.dueDate as dayjs.Dayjs)?.toISOString(),
      };
      const result = await createCapa.mutateAsync(data);
      router.push(`/manufacturing/quality-management/capa/${result.id}`);
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni CAPA</h1>
              <p className="text-sm text-slate-400 m-0">Düzeltici veya önleyici aksiyon oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/quality-management/capa')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createCapa.isPending}
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
          <Card title="CAPA Bilgileri" className="mb-6">
            <Form.Item
              name="title"
              label="Başlık"
              rules={[{ required: true, message: 'Başlık zorunludur' }]}
            >
              <Input placeholder="CAPA başlığı" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="capaType"
                label="CAPA Tipi"
                rules={[{ required: true, message: 'Tip zorunludur' }]}
              >
                <Select options={typeOptions} placeholder="Seçiniz" />
              </Form.Item>
              <Form.Item
                name="dueDate"
                label="Hedef Bitiş Tarihi"
                rules={[{ required: true, message: 'Tarih zorunludur' }]}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" />
              </Form.Item>
            </div>
            <Form.Item
              name="description"
              label="Açıklama"
              rules={[{ required: true, message: 'Açıklama zorunludur' }]}
            >
              <Input.TextArea rows={4} placeholder="Detaylı açıklama..." />
            </Form.Item>
          </Card>

          <Card title="İlişkili Kayıtlar" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item name="ncrId" label="NCR (Opsiyonel)">
                <Input placeholder="NCR ID" />
              </Form.Item>
              <Form.Item name="responsibleUserId" label="Sorumlu Kullanıcı (Opsiyonel)">
                <Input placeholder="Kullanıcı ID" />
              </Form.Item>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
