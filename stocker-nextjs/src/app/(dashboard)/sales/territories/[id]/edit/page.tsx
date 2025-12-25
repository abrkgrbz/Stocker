'use client';

/**
 * Edit Sales Territory Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Button, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { TerritoryForm } from '@/components/sales/territories';
import {
  useSalesTerritory,
  useUpdateSalesTerritory,
  useDeleteSalesTerritory,
  useSalesTerritories,
} from '@/lib/api/hooks/useSales';
import type { UpdateSalesTerritoryCommand } from '@/lib/api/services/sales.service';
import { Badge } from '@/components/ui/enterprise-page';

export default function EditTerritoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: territory, isLoading, error } = useSalesTerritory(id);
  const updateTerritory = useUpdateSalesTerritory();
  const deleteTerritory = useDeleteSalesTerritory();

  // Fetch parent territories for dropdown (excluding current territory)
  const { data: territoriesData } = useSalesTerritories({ pageSize: 1000, status: 'Active' });
  const parentTerritories = (territoriesData?.items || []).filter((t) => t.id !== id);

  // Populate form with existing data
  useEffect(() => {
    if (territory) {
      form.setFieldsValue({
        territoryCode: territory.territoryCode,
        name: territory.name,
        description: territory.description,
        territoryType: territory.territoryType,
        parentTerritoryId: territory.parentTerritoryId,
        country: territory.country,
        region: territory.region,
        city: territory.city,
        district: territory.district,
        geoBoundary: territory.geoBoundary,
        territoryManagerId: territory.territoryManagerId,
        notes: territory.notes,
        annualTargetAmount: territory.annualTarget?.amount,
        annualTargetCurrency: territory.annualTarget?.currency,
      });
    }
  }, [territory, form]);

  const handleSubmit = async (values: UpdateSalesTerritoryCommand) => {
    try {
      await updateTerritory.mutateAsync({ id, data: values });
      router.push(`/sales/territories/${id}`);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Bölgeyi Sil',
      content: 'Bu bölgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteTerritory.mutateAsync(id);
          router.push('/sales/territories');
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  return (
    <CrmFormPageLayout
      title="Bölge Düzenle"
      subtitle={territory?.name || 'Yükleniyor...'}
      cancelPath={`/sales/territories/${id}`}
      loading={updateTerritory.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || !territory}
      errorMessage="Bölge Bulunamadı"
      errorDescription="Düzenlemek istediğiniz bölge bulunamadı veya bir hata oluştu."
      titleExtra={
        territory && (
          <Badge variant={territory.status === 'Active' ? 'success' : territory.status === 'Suspended' ? 'warning' : 'default'}>
            {territory.status === 'Active' ? 'Aktif' : territory.status === 'Suspended' ? 'Askıda' : 'Pasif'}
          </Badge>
        )
      }
      extraActions={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          loading={deleteTerritory.isPending}
        >
          Sil
        </Button>
      }
    >
      <TerritoryForm
        form={form}
        onFinish={handleSubmit}
        loading={updateTerritory.isPending}
        isEdit
        parentTerritories={parentTerritories}
      />
    </CrmFormPageLayout>
  );
}
