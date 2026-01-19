'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { PriceListForm } from '@/components/inventory/price-lists';
import { usePriceList, useUpdatePriceList } from '@/lib/api/hooks/useInventory';
import type { UpdatePriceListDto } from '@/lib/api/services/inventory.types';

export default function EditPriceListPage() {
  const router = useRouter();
  const params = useParams();
  const priceListId = Number(params.id);
  const [form] = Form.useForm();

  const { data: priceList, isLoading, error } = usePriceList(priceListId);
  const updatePriceList = useUpdatePriceList();

  const handleSubmit = async (values: UpdatePriceListDto) => {
    try {
      await updatePriceList.mutateAsync({ id: priceListId, data: values });
      router.push('/inventory/price-lists');
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

  if (error || !priceList) {
    return (
      <div className="p-8">
        <Alert
          message="Fiyat Listesi Bulunamadı"
          description="İstenen fiyat listesi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/price-lists')}>
              Fiyat Listelerine Dön
            </Button>
          }
        />
      </div>
    );
  }

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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {priceList.name}
                  </h1>
                  {priceList.isDefault && (
                    <Tag icon={<StarIcon className="w-4 h-4" />} color="success" className="ml-1">
                      Varsayılan
                    </Tag>
                  )}
                  <Tag
                    icon={priceList.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    color={priceList.isActive ? 'success' : 'default'}
                    className="ml-1"
                  >
                    {priceList.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{priceList.code} - {priceList.currency}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/price-lists')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updatePriceList.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <PriceListForm
          form={form}
          initialValues={priceList}
          onFinish={handleSubmit}
          loading={updatePriceList.isPending}
        />
      </div>
    </div>
  );
}
