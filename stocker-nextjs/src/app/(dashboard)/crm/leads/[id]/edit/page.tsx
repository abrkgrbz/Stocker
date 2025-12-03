'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { LeadForm } from '@/components/crm/leads';
import { useLead, useUpdateLead } from '@/lib/api/hooks/useCRM';

// Status labels
const statusLabels: Record<string, string> = {
  New: 'Yeni',
  Contacted: 'İletişime Geçildi',
  Working: 'Çalışılıyor',
  Qualified: 'Nitelikli',
  Unqualified: 'Niteliksiz',
  Converted: 'Dönüştürüldü',
  Lost: 'Kayıp',
};

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const [form] = Form.useForm();

  const { data: lead, isLoading, error } = useLead(leadId);
  const updateLead = useUpdateLead();

  const handleSubmit = async (values: any) => {
    try {
      await updateLead.mutateAsync({ id: leadId, data: values });
      router.push('/crm/leads');
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

  if (error || !lead) {
    return (
      <div className="p-8">
        <Alert
          message="Lead Bulunamadı"
          description="İstenen potansiyel müşteri bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/leads')}>
              Lead&apos;lere Dön
            </Button>
          }
        />
      </div>
    );
  }

  const isActive = lead.status !== 'Unqualified' && lead.status !== 'Converted' && lead.status !== 'Lost';

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
                    {lead.firstName} {lead.lastName}
                  </h1>
                  <Tag
                    icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={isActive ? 'processing' : 'default'}
                    className="ml-2"
                  >
                    {statusLabels[lead.status] || 'Yeni'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{lead.email}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/leads')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateLead.isPending}
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
        <LeadForm
          form={form}
          initialValues={lead}
          onFinish={handleSubmit}
          loading={updateLead.isPending}
        />
      </div>
    </div>
  );
}
