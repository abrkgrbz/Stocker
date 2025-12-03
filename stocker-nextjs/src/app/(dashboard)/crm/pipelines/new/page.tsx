'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PipelineForm } from '@/components/crm/pipelines';
import { useCreatePipeline } from '@/lib/api/hooks/useCRM';

export default function NewPipelinePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPipeline = useCreatePipeline();

  const handleSubmit = async (values: any) => {
    try {
      await createPipeline.mutateAsync(values);
      router.push('/crm/pipelines');
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Pipeline
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni satış süreci oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/pipelines')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createPipeline.isPending}
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
        <PipelineForm
          form={form}
          onFinish={handleSubmit}
          loading={createPipeline.isPending}
        />
      </div>
    </div>
  );
}
