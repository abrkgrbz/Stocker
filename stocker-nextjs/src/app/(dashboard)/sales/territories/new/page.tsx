'use client';

/**
 * New Sales Territory Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { TerritoryForm } from '@/components/sales/territories';
import { useCreateSalesTerritory, useSalesTerritories } from '@/lib/api/hooks/useSales';
import type { CreateSalesTerritoryCommand } from '@/lib/api/services/sales.service';

export default function NewTerritoryPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTerritory = useCreateSalesTerritory();

  // Fetch parent territories for dropdown
  const { data: territoriesData } = useSalesTerritories({ pageSize: 1000, status: 'Active' });
  const parentTerritories = territoriesData?.items || [];

  const handleSubmit = async (values: CreateSalesTerritoryCommand) => {
    try {
      await createTerritory.mutateAsync(values);
      router.push('/sales/territories');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Satış Bölgesi"
      subtitle="Yeni satış bölgesi oluşturun"
      cancelPath="/sales/territories"
      loading={createTerritory.isPending}
      onSave={() => form.submit()}
    >
      <TerritoryForm
        form={form}
        onFinish={handleSubmit}
        loading={createTerritory.isPending}
        parentTerritories={parentTerritories}
      />
    </CrmFormPageLayout>
  );
}
