'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import {
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LeadForm } from '@/components/crm/leads';
import { useLead, useUpdateLead, useUpdateLeadScore } from '@/lib/api/hooks/useCRM';

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
  const updateLeadScore = useUpdateLeadScore();

  const handleSubmit = async (values: any) => {
    try {
      // Extract score for separate update (backend has separate endpoint for score)
      const { score, ...leadData } = values;

      // Update lead data
      await updateLead.mutateAsync({ id: leadId, data: leadData });

      // Update score separately if it changed
      if (score !== undefined && score !== null && lead && score !== lead.score) {
        await updateLeadScore.mutateAsync({ id: leadId, score: Number(score) });
      }

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
            icon={isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
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
