'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, StarFilled } from '@ant-design/icons';
import { PipelineForm } from '@/components/crm/pipelines';
import { usePipeline, useUpdatePipeline } from '@/lib/api/hooks/useCRM';

export default function EditPipelinePage() {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params.id as string;
  const [form] = Form.useForm();

  const { data: pipeline, isLoading, error } = usePipeline(pipelineId);
  const updatePipeline = useUpdatePipeline();

  const handleSubmit = async (values: any) => {
    try {
      await updatePipeline.mutateAsync({ id: pipelineId, ...values });
      router.push('/crm/pipelines');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="p-8">
        <Alert
          message="Pipeline Bulunamadı"
          description="İstenen pipeline bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/pipelines')}>
              Pipeline'lara Dön
            </Button>
          }
        />
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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {pipeline.name}
                  </h1>
                  {(pipeline as any).isDefault && (
                    <StarFilled className="text-yellow-500" title="Varsayılan Pipeline" />
                  )}
                  {pipeline.isActive ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Aktif
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                      Pasif
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-gray-400 m-0">
                  {pipeline.stages?.length || 0} aşama • {pipeline.type}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/pipelines')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updatePipeline.isPending}
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
          initialValues={pipeline}
          onFinish={handleSubmit}
          loading={updatePipeline.isPending}
        />
      </div>
    </div>
  );
}
