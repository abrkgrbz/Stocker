'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { OpportunityForm } from '@/components/crm/opportunities';
import { useOpportunity, useUpdateOpportunity } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

// Status labels and colors
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Prospecting: { label: 'Araştırma', color: 'blue', icon: <ClockCircleOutlined /> },
  Qualification: { label: 'Nitelendirme', color: 'cyan', icon: <ClockCircleOutlined /> },
  NeedsAnalysis: { label: 'İhtiyaç Analizi', color: 'purple', icon: <ClockCircleOutlined /> },
  Proposal: { label: 'Teklif', color: 'orange', icon: <ClockCircleOutlined /> },
  Negotiation: { label: 'Müzakere', color: 'gold', icon: <ClockCircleOutlined /> },
  ClosedWon: { label: 'Kazanıldı', color: 'success', icon: <CheckCircleOutlined /> },
  ClosedLost: { label: 'Kaybedildi', color: 'error', icon: <CloseCircleOutlined /> },
};

export default function EditOpportunityPage() {
  const router = useRouter();
  const params = useParams();
  const opportunityId = params.id as string;
  const [form] = Form.useForm();

  const { data: opportunity, isLoading, error } = useOpportunity(opportunityId);
  const updateOpportunity = useUpdateOpportunity();

  const handleSubmit = async (values: any) => {
    try {
      // Format the data for API
      const formattedData = {
        ...values,
        expectedCloseDate: values.expectedCloseDate ? dayjs(values.expectedCloseDate).toISOString() : null,
      };
      await updateOpportunity.mutateAsync({ id: opportunityId, data: formattedData });
      router.push('/crm/opportunities');
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

  if (error || !opportunity) {
    return (
      <div className="p-8">
        <Alert
          message="Fırsat Bulunamadı"
          description="İstenen satış fırsatı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/opportunities')}>
              Fırsatlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusConfig[opportunity.status] || statusConfig.Prospecting;

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
                    {opportunity.name}
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
                  ₺{(opportunity.amount || 0).toLocaleString('tr-TR')} • %{opportunity.probability || 0} olasılık
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/opportunities')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateOpportunity.isPending}
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
        <OpportunityForm
          form={form}
          initialValues={opportunity}
          onFinish={handleSubmit}
          loading={updateOpportunity.isPending}
        />
      </div>
    </div>
  );
}
