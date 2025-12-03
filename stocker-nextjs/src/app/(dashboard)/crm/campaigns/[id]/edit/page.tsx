'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <Alert
          message="Kampanya Bulunamadı"
          description="İstenen kampanya bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/campaigns')}>
              Kampanyalara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[campaign.status] || statusConfig.Planned;

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
                    {campaign.name}
                  </h1>
                  <Tag
                    icon={statusInfo.icon}
                    color={statusInfo.color}
                    className="ml-2"
                  >
                    {statusInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">
                  Bütçe: ₺{(campaign.budgetedCost || 0).toLocaleString('tr-TR')} • Hedef: {campaign.targetLeads || 0} lead
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/campaigns')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateCampaign.isPending}
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
        <CampaignForm
          form={form}
          initialValues={campaign}
          onFinish={handleSubmit}
          loading={updateCampaign.isPending}
        />
      </div>
    </div>
  );
}
