'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { DealForm } from '@/components/crm/deals';
import { useDeal, useUpdateDeal, useDeleteDeal } from '@/lib/api/hooks/useCRM';
import { showUpdateSuccess, showDeleteSuccess, showError, confirmDelete } from '@/lib/utils/sweetalert';

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
        showError('Musteri secimi zorunludur');
        return;
      }

      await updateDeal.mutateAsync({ id, data: values });
      showUpdateSuccess('firsat');
      router.push('/crm/deals');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Guncelleme basarisiz';
      showError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deal) return;

    const confirmed = await confirmDelete('Firsat', deal.title);
    if (confirmed) {
      try {
        await deleteDeal.mutateAsync(id);
        showDeleteSuccess('firsat');
        router.push('/crm/deals');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Firsat bulunamadi</h2>
          <Button onClick={() => router.push('/crm/deals')} className="mt-4">
            Firsatlara Don
          </Button>
        </div>
      </div>
    );
  }

  // Status labels and colors
  const statusLabels: Record<string, string> = {
    Open: 'Acik',
    Won: 'Kazanildi',
    Lost: 'Kaybedildi',
  };

  const statusColors: Record<string, string> = {
    Open: 'blue',
    Won: 'green',
    Lost: 'red',
  };

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
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  {deal.title}
                </h1>
                <Tag color={statusColors[deal.status] || 'default'}>
                  {statusLabels[deal.status] || deal.status}
                </Tag>
              </div>
              <p className="text-sm text-gray-400 m-0">
                TL {deal.amount.toLocaleString('tr-TR')} - {deal.probability}% olasilik
              </p>
            </div>
          </div>
          <Space>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleteDeal.isPending}
            >
              Sil
            </Button>
            <Button onClick={() => router.push('/crm/deals')}>
              Vazgec
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateDeal.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Guncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <DealForm
          form={form}
          initialValues={deal}
          onFinish={handleSubmit}
          loading={updateDeal.isPending}
        />
      </div>
    </div>
  );
}
