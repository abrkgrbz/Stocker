'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { LoyaltyProgramForm } from '@/components/crm/loyalty-programs';
import { useLoyaltyProgram, useUpdateLoyaltyProgram } from '@/lib/api/hooks/useCRM';

export default function EditLoyaltyProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: program, isLoading } = useLoyaltyProgram(id);
  const updateLoyaltyProgram = useUpdateLoyaltyProgram();

  const handleSubmit = async (values: any) => {
    try {
      await updateLoyaltyProgram.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/loyalty-programs');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Sadakat Programı Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{program?.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/loyalty-programs')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateLoyaltyProgram.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <LoyaltyProgramForm
          form={form}
          initialValues={program}
          onFinish={handleSubmit}
          loading={updateLoyaltyProgram.isPending}
        />
      </div>
    </div>
  );
}
