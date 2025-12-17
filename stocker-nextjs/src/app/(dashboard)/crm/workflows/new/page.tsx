'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
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
    <CrmFormPageLayout
      title="Yeni Workflow"
      subtitle="Yeni otomasyon oluşturun"
      cancelPath="/crm/workflows"
      loading={loading}
      onSave={() => form.submit()}
    >
      <WorkflowForm
        form={form}
        onFinish={handleSubmit}
        loading={loading}
      />
    </CrmFormPageLayout>
  );
}
