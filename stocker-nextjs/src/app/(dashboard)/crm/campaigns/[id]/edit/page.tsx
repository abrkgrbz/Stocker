'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CampaignForm } from '@/components/crm/campaigns';
import { useCampaign, useUpdateCampaign } from '@/lib/api/hooks/useCRM';

// Status labels and colors
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Planned: { label: 'Planlandı', color: 'default', icon: <ClockCircleOutlined /> },
  InProgress: { label: 'Devam Ediyor', color: 'processing', icon: <PlayCircleOutlined /> },
  Completed: { label: 'Tamamlandı', color: 'success', icon: <CheckCircleOutlined /> },
  OnHold: { label: 'Beklemede', color: 'warning', icon: <PauseCircleOutlined /> },
  Aborted: { label: 'İptal Edildi', color: 'error', icon: <CloseCircleOutlined /> },
};

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const [form] = Form.useForm();

  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign();

  const handleSubmit = async (values: any) => {
    try {
      await updateCampaign.mutateAsync({ id: campaignId, ...values });
      router.push('/crm/campaigns');
    } catch (error) {
      // Error handled by hook
    }
  };

  const statusInfo = statusConfig[campaign?.status || ''] || statusConfig.Planned;

  return (
    <CrmFormPageLayout
      title={campaign?.name || 'Kampanya Düzenle'}
      subtitle={campaign ? `Bütçe: ₺${(campaign.budgetedCost || 0).toLocaleString('tr-TR')} • Hedef: ${campaign.targetLeads || 0} lead` : 'Kampanya bilgilerini güncelleyin'}
      cancelPath="/crm/campaigns"
      loading={updateCampaign.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !campaign)}
      errorMessage="Kampanya Bulunamadı"
      errorDescription="İstenen kampanya bulunamadı veya bir hata oluştu."
      titleExtra={
        campaign && (
          <Tag icon={statusInfo.icon} color={statusInfo.color}>
            {statusInfo.label}
          </Tag>
        )
      }
    >
      <CampaignForm
        form={form}
        initialValues={campaign}
        onFinish={handleSubmit}
        loading={updateCampaign.isPending}
      />
    </CrmFormPageLayout>
  );
}
