'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { Badge } from '@/components/primitives';
import { DepartmentForm } from '@/components/hr';
import { useDepartment, useUpdateDepartment } from '@/lib/api/hooks/useHR';
import type { UpdateDepartmentDto } from '@/lib/api/services/hr.types';

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: department, isLoading, error } = useDepartment(id);
  const updateDepartment = useUpdateDepartment();

  // Populate form when department data loads
  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
        code: department.code,
        description: department.description,
        parentDepartmentId: department.parentDepartmentId,
        managerId: department.managerId,
      });
    }
  }, [department, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateDepartmentDto = {
        name: values.name,
        description: values.description,
        parentDepartmentId: values.parentDepartmentId,
        managerId: values.managerId,
        displayOrder: values.displayOrder ?? 0,
      };

      await updateDepartment.mutateAsync({ id, data });
      router.push(`/hr/departments/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title={department?.name || 'Departman Düzenle'}
      subtitle={department ? `${department.code} - Departman bilgilerini güncelleyin` : 'Departman bilgilerini güncelleyin'}
      icon={<BuildingOfficeIcon className="w-5 h-5" />}
      cancelPath={`/hr/departments/${id}`}
      loading={updateDepartment.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !department)}
      errorMessage="Departman Bulunamadı"
      errorDescription="İstenen departman bulunamadı veya bir hata oluştu."
      maxWidth="max-w-5xl"
      titleExtra={
        department && (
          <Badge variant={department.isActive ? 'success' : 'neutral'}>
            {department.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        )
      }
    >
      <DepartmentForm
        form={form}
        initialValues={department}
        onFinish={handleSubmit}
        loading={updateDepartment.isPending}
      />
    </FormPageLayout>
  );
}
