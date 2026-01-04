'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { OpportunityForm } from '@/components/crm/opportunities';
import { useOpportunity, useUpdateOpportunity } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

// Status labels and colors (matches backend OpportunityStatus enum)
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Open: { label: 'Açık', color: 'blue', icon: <ClockIcon className="w-4 h-4" /> },
  Won: { label: 'Kazanıldı', color: 'success', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Lost: { label: 'Kaybedildi', color: 'error', icon: <XCircleIcon className="w-4 h-4" /> },
  OnHold: { label: 'Beklemede', color: 'warning', icon: <ClockIcon className="w-4 h-4" /> },
};

// Stage labels and colors for pipeline stages
const stageConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Prospecting: { label: 'Araştırma', color: 'blue', icon: <ClockIcon className="w-4 h-4" /> },
  Qualification: { label: 'Nitelendirme', color: 'cyan', icon: <ClockIcon className="w-4 h-4" /> },
  NeedsAnalysis: { label: 'İhtiyaç Analizi', color: 'purple', icon: <ClockIcon className="w-4 h-4" /> },
  Proposal: { label: 'Teklif', color: 'orange', icon: <ClockIcon className="w-4 h-4" /> },
  Negotiation: { label: 'Müzakere', color: 'gold', icon: <ClockIcon className="w-4 h-4" /> },
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

  const statusInfo = statusConfig[opportunity?.status || ''] || statusConfig.Prospecting;

  return (
    <CrmFormPageLayout
      title={opportunity?.name || 'Fırsat Düzenle'}
      subtitle={opportunity ? `₺${(opportunity.amount || 0).toLocaleString('tr-TR')} • %${opportunity.probability || 0} olasılık` : 'Fırsat bilgilerini güncelleyin'}
      cancelPath="/crm/opportunities"
      loading={updateOpportunity.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !opportunity)}
      errorMessage="Fırsat Bulunamadı"
      errorDescription="İstenen satış fırsatı bulunamadı veya bir hata oluştu."
      titleExtra={
        opportunity && (
          <Tag icon={statusInfo.icon} color={statusInfo.color}>
            {statusInfo.label}
          </Tag>
        )
      }
    >
      <OpportunityForm
        form={form}
        initialValues={opportunity}
        onFinish={handleSubmit}
        loading={updateOpportunity.isPending}
      />
    </CrmFormPageLayout>
  );
}
