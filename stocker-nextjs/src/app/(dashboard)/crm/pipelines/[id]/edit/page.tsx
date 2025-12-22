'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StarFilled } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
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
      await updatePipeline.mutateAsync({ id: pipelineId, data: values });
      router.push('/crm/pipelines');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={pipeline?.name || 'Pipeline Düzenle'}
      subtitle={pipeline ? `${pipeline.stages?.length || 0} aşama • ${pipeline.type}` : 'Pipeline bilgilerini güncelleyin'}
      cancelPath="/crm/pipelines"
      loading={updatePipeline.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !pipeline)}
      errorMessage="Pipeline Bulunamadı"
      errorDescription="İstenen pipeline bulunamadı veya bir hata oluştu."
      titleExtra={
        pipeline && (
          <>
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
          </>
        )
      }
    >
      <PipelineForm
        form={form}
        initialValues={pipeline}
        onFinish={handleSubmit}
        loading={updatePipeline.isPending}
      />
    </CrmFormPageLayout>
  );
}
