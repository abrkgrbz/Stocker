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
        description: values.description || '',
        triggerType: values.triggerType || 'Manual',
        entityType: values.entityType || 'Lead',
        triggerConditions: JSON.stringify(values.triggerConditions || {}),
        steps: [], // Start with empty steps, user can add them in the detail page
      };

      console.log('🔥 Workflow Command:', JSON.stringify(command, null, 2));

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
