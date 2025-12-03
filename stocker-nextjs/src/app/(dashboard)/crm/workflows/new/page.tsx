'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { WorkflowForm } from '@/components/crm/workflows';
import { CRMService } from '@/lib/api/services/crm.service';
import type { CreateWorkflowCommand } from '@/lib/api/services/crm.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const command: CreateWorkflowCommand = {
        name: values.name,
        description: values.description,
        trigger: {
          type: values.triggerType,
          entityType: values.entityType || 'Lead',
          conditions: '{}',
        } as any,
        actions: [],
        isActive: values.isActive || false,
      };

      const workflowId = await CRMService.createWorkflow(command);
      showSuccess('Workflow olusturuldu. Simdi aksiyonlari ekleyebilirsiniz.');
      router.push(`/crm/workflows/${workflowId}`);
    } catch (error) {
      showApiError(error, 'Workflow olusturulamadi');
    } finally {
      setLoading(false);
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
                Yeni Workflow
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni otomasyon olusturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/workflows')}>
              Vazgec
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Olustur
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <WorkflowForm
          form={form}
          onFinish={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
