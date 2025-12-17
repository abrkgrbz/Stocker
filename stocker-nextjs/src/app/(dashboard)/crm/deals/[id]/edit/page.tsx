'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Tag, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { DealForm } from '@/components/crm/deals';
import { useDeal, useUpdateDeal, useDeleteDeal } from '@/lib/api/hooks/useCRM';
import { showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/lib/utils/sweetalert';

// Status labels and colors
const statusLabels: Record<string, string> = {
  Open: 'Açık',
  Won: 'Kazanıldı',
  Lost: 'Kaybedildi',
};

const statusColors: Record<string, string> = {
  Open: 'blue',
  Won: 'green',
  Lost: 'red',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDealPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();

  const handleSubmit = async (values: any) => {
    try {
      // Validation: CustomerId is required by backend
      if (!values.customerId) {
        showError('Müşteri seçimi zorunludur');
        return;
      }

      await updateDeal.mutateAsync({ id, data: values });
      showUpdateSuccess('fırsat');
      router.push('/crm/deals');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Güncelleme başarısız';
      showError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deal) return;

    const confirmed = await confirmDelete('Fırsat', deal.title);
    if (confirmed) {
      try {
        await deleteDeal.mutateAsync(id);
        showDeleteSuccess('fırsat');
        router.push('/crm/deals');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  return (
    <CrmFormPageLayout
      title={deal?.title || 'Fırsat Düzenle'}
      subtitle={deal ? `₺${deal.amount.toLocaleString('tr-TR')} - %${deal.probability} olasılık` : 'Fırsat bilgilerini güncelleyin'}
      cancelPath="/crm/deals"
      loading={updateDeal.isPending}
      onSave={() => form.submit()}
      saveButtonText="Güncelle"
      isDataLoading={isLoading}
      dataError={!isLoading && !deal}
      errorMessage="Fırsat Bulunamadı"
      errorDescription="İstenen fırsat bulunamadı veya bir hata oluştu."
      titleExtra={
        deal && (
          <Tag color={statusColors[deal.status] || 'default'}>
            {statusLabels[deal.status] || deal.status}
          </Tag>
        )
      }
      extraActions={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          loading={deleteDeal.isPending}
        >
          Sil
        </Button>
      }
    >
      <DealForm
        form={form}
        initialValues={deal}
        onFinish={handleSubmit}
        loading={updateDeal.isPending}
      />
    </CrmFormPageLayout>
  );
}
