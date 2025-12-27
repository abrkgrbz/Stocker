'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { CertificationForm } from '@/components/hr';
import { useCertification, useUpdateCertification } from '@/lib/api/hooks/useHR';
import type { UpdateCertificationDto } from '@/lib/api/services/hr.types';

export default function EditCertificationPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: certification, isLoading } = useCertification(id);
  const updateCertification = useUpdateCertification();

  const handleSubmit = async (values: UpdateCertificationDto) => {
    try {
      await updateCertification.mutateAsync({ id, data: values });
      router.push(`/hr/certifications/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

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
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                Sertifika Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{certification?.certificationName}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/certifications/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateCertification.isPending}
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
          initialValues={certification}
          onFinish={handleSubmit}
          loading={updateCertification.isPending}
        />
      </div>
    </div>
  );
}
