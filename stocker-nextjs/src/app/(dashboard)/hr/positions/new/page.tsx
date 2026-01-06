'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { PositionForm } from '@/components/hr';
import { useCreatePosition } from '@/lib/api/hooks/useHR';
import type { CreatePositionDto } from '@/lib/api/services/hr.types';

export default function NewPositionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPosition = useCreatePosition();

  const handleSubmit = async (values: CreatePositionDto) => {
    try {
      await createPosition.mutateAsync(values);
      router.push('/hr/positions');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Pozisyon"
      subtitle="Yeni bir pozisyon oluşturun"
      icon={<ShieldCheckIcon className="w-5 h-5" />}
      cancelPath="/hr/positions"
      loading={createPosition.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <PositionForm
        form={form}
        onFinish={handleSubmit}
        loading={createPosition.isPending}
      />
    </FormPageLayout>
  );
}
