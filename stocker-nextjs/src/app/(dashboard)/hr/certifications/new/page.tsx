'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CertificationForm } from '@/components/hr';
import { useCreateCertification } from '@/lib/api/hooks/useHR';
import type { CreateCertificationDto } from '@/lib/api/services/hr.types';

export default function NewCertificationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCertification = useCreateCertification();

  const handleSubmit = async (values: CreateCertificationDto) => {
    try {
      await createCertification.mutateAsync(values);
      router.push('/hr/certifications');
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
                <ShieldCheckIcon className="w-4 h-4" className="mr-2" />
                Yeni Sertifika
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir sertifika kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/certifications')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createCertification.isPending}
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
        <CertificationForm
          form={form}
          onFinish={handleSubmit}
          loading={createCertification.isPending}
        />
      </div>
    </div>
  );
}
