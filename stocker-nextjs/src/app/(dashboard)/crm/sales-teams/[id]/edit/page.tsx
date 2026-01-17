'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Spin, Empty } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SalesTeamForm } from '@/components/crm/sales-teams';
import { useSalesTeam, useUpdateSalesTeam } from '@/lib/api/hooks/useCRM';

export default function EditSalesTeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const [form] = Form.useForm();

  const { data: team, isLoading, error } = useSalesTeam(teamId);
  const updateSalesTeam = useUpdateSalesTeam();

  const handleSubmit = async (values: any) => {
    try {
      await updateSalesTeam.mutateAsync({
        id: teamId,
        ...values,
      });
      router.push(`/crm/sales-teams/${teamId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Satış ekibi bulunamadı" />
      </div>
    );
  }

  return (
    <CrmFormPageLayout
      title="Satış Ekibi Düzenle"
      subtitle={team.name}
      cancelPath={`/crm/sales-teams/${teamId}`}
      loading={updateSalesTeam.isPending}
      onSave={() => form.submit()}
    >
      <SalesTeamForm
        form={form}
        initialValues={team}
        onFinish={handleSubmit}
        loading={updateSalesTeam.isPending}
      />
    </CrmFormPageLayout>
  );
}
