'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
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

  const isActive = lead && lead.status !== 'Unqualified' && lead.status !== 'Converted' && lead.status !== 'Lost';

  return (
    <CrmFormPageLayout
      title={lead ? `${lead.firstName} ${lead.lastName}` : 'Lead Düzenle'}
      subtitle={lead?.email || 'Lead bilgilerini güncelleyin'}
      cancelPath="/crm/leads"
      loading={updateLead.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !lead)}
      errorMessage="Lead Bulunamadı"
      errorDescription="İstenen potansiyel müşteri bulunamadı veya bir hata oluştu."
      titleExtra={
        lead && (
          <Tag
            icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            color={isActive ? 'processing' : 'default'}
          >
            {statusLabels[lead.status] || 'Yeni'}
          </Tag>
        )
      }
    >
      <LeadForm
        form={form}
        initialValues={lead}
        onFinish={handleSubmit}
        loading={updateLead.isPending}
      />
    </CrmFormPageLayout>
  );
}
