'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { Badge } from '@/components/primitives';
import { PositionForm } from '@/components/hr';
import { usePosition, useUpdatePosition } from '@/lib/api/hooks/useHR';
import type { UpdatePositionDto } from '@/lib/api/services/hr.types';

export default function EditPositionPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: position, isLoading, error } = usePosition(id);
  const updatePosition = useUpdatePosition();

  // Populate form when position data loads
  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        title: position.title,
        description: position.description,
        departmentId: position.departmentId,
        level: position.level,
        minSalary: position.minSalary,
        maxSalary: position.maxSalary,
        currency: position.currency,
        headCount: position.headCount,
        requirements: position.requirements,
        responsibilities: position.responsibilities,
      });
    }
  }, [position, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePositionDto = {
        title: values.title,
        description: values.description,
        departmentId: values.departmentId,
        level: values.level || 1,
        minSalary: values.minSalary || 0,
        maxSalary: values.maxSalary || 0,
        currency: values.currency,
        headCount: values.headCount,
        requirements: values.requirements,
        responsibilities: values.responsibilities,
      };

      await updatePosition.mutateAsync({ id, data });
      router.push(`/hr/positions/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title={position?.title || 'Pozisyon Düzenle'}
      subtitle={position ? `${position.code} - Pozisyon bilgilerini güncelleyin` : 'Pozisyon bilgilerini güncelleyin'}
      icon={<ShieldCheckIcon className="w-5 h-5" />}
      cancelPath={`/hr/positions/${id}`}
      loading={updatePosition.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !position)}
      errorMessage="Pozisyon Bulunamadı"
      errorDescription="İstenen pozisyon bulunamadı veya bir hata oluştu."
      maxWidth="max-w-5xl"
      titleExtra={
        position && (
          <Badge variant={position.isActive ? 'success' : 'neutral'}>
            {position.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        )
      }
    >
      <PositionForm
        form={form}
        initialValues={position}
        onFinish={handleSubmit}
        loading={updatePosition.isPending}
      />
    </FormPageLayout>
  );
}
