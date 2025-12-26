'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { PositionForm } from '@/components/hr';
import { useCreatePosition } from '@/lib/api/hooks/useHR';
import type { CreatePositionDto } from '@/lib/api/services/hr.types';

export default function NewPositionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPosition = useCreatePosition();

  const handleSubmit = async (values: CreatePositionDto) => {
    try {
      await createPosition.mutateAsync(values);
      router.push('/hr/positions');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
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
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <ShieldCheckIcon className="w-5 h-5 mr-2 inline" />
                Yeni Pozisyon
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir pozisyon oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/positions')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createPosition.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <PositionForm
          form={form}
          onFinish={handleSubmit}
          loading={createPosition.isPending}
        />
      </div>
    </div>
  );
}
