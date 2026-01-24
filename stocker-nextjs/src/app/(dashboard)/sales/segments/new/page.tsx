'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Switch, message, Spin } from 'antd';
import {
  UserGroupIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useCreateSegment } from '@/features/sales';
import type { CreateCustomerSegmentDto } from '@/features/sales';
import Link from 'next/link';

const priorityOptions = [
  { value: 1, label: 'Platinum', description: 'En yuksek oncelik' },
  { value: 2, label: 'Gold', description: 'Yuksek oncelik' },
  { value: 3, label: 'Silver', description: 'Orta oncelik' },
  { value: 4, label: 'Bronze', description: 'Dusuk oncelik' },
  { value: 5, label: 'Standard', description: 'Standart oncelik' },
];

export default function NewSegmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreateSegment();
  const [selectedPriority, setSelectedPriority] = React.useState<number>(3);

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateCustomerSegmentDto = {
        code: values.code as string,
        name: values.name as string,
        description: values.description as string | undefined,
        priority: selectedPriority,
      };

      await createMutation.mutateAsync(data);
      message.success('Segment basariyla olusturuldu');
      router.push('/sales/segments');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/segments"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Yeni Segment</h1>
                <p className="text-sm text-slate-500">Yeni bir musteri segmenti olusturun</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/segments"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending && <Spin size="small" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Temel Bilgiler */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Temel Bilgiler</h2>
            <Form.Item
              name="name"
              label={<span className="text-slate-700 font-medium">Ad</span>}
              rules={[{ required: true, message: 'Segment adi zorunludur' }]}
            >
              <Input placeholder="Segment adini girin" className="h-12 text-lg" />
            </Form.Item>
            <Form.Item
              name="code"
              label={<span className="text-slate-700 font-medium">Kod</span>}
              rules={[{ required: true, message: 'Segment kodu zorunludur' }]}
            >
              <Input placeholder="VIP, WHOLESALE, STANDARD vb." />
            </Form.Item>
            <Form.Item
              name="description"
              label={<span className="text-slate-700 font-medium">Aciklama</span>}
            >
              <Input.TextArea rows={3} placeholder="Segment aciklamasi..." />
            </Form.Item>
          </div>

          {/* Segment Ayarlari */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Segment Ayarlari</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Oncelik</label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedPriority(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPriority === option.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {priorityOptions.find(o => o.value === selectedPriority)?.description}
              </p>
            </div>

            <Form.Item
              name="isDefault"
              valuePropName="checked"
              label={<span className="text-slate-700 font-medium">Varsayilan segment olarak ayarla</span>}
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}
