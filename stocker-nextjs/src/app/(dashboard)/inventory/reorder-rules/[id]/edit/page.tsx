'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Spin } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ReorderRuleForm } from '@/components/inventory/reorder-rules';
import { useReorderRule, useUpdateReorderRule } from '@/lib/api/hooks/useInventory';
import type { CreateReorderRuleDto } from '@/lib/api/services/inventory.types';

export default function EditReorderRulePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: rule, isLoading } = useReorderRule(id);
  const updateRule = useUpdateReorderRule();

  const handleSubmit = async (values: CreateReorderRuleDto) => {
    try {
      await updateRule.mutateAsync({ id, dto: values });
      router.push(`/inventory/reorder-rules/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Kural bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/reorder-rules')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Kuralı Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{rule.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/reorder-rules/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateRule.isPending}
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
        <ReorderRuleForm
          form={form}
          initialValues={rule}
          onFinish={handleSubmit}
          loading={updateRule.isPending}
        />
      </div>
    </div>
  );
}
