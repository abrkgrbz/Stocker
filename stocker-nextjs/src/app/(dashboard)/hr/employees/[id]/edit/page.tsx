'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { UserIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { Badge } from '@/components/primitives';
import { EmployeeForm } from '@/components/hr';
import { useEmployee, useUpdateEmployee } from '@/lib/api/hooks/useHR';
import type { UpdateEmployeeDto, EmployeeStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const statusConfig: Record<number, { color: 'success' | 'error' | 'warning' | 'info' | 'neutral'; label: string }> = {
  0: { color: 'success', label: 'Aktif' },
  1: { color: 'neutral', label: 'Pasif' },
  2: { color: 'info', label: 'İzinde' },
  3: { color: 'error', label: 'İşten Çıktı' },
};

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: employee, isLoading, error } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  // Populate form when employee data loads
  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        nationalId: employee.nationalId,
        birthDate: employee.birthDate ? dayjs(employee.birthDate) : null,
        birthPlace: employee.birthPlace,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        bloodType: employee.bloodType,
        street: employee.street,
        city: employee.city,
        state: employee.state,
        postalCode: employee.postalCode,
        country: employee.country,
        hireDate: employee.hireDate ? dayjs(employee.hireDate) : null,
        employmentType: employee.employmentType,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        managerId: employee.managerId,
        shiftId: employee.shiftId,
        workLocationId: employee.workLocationId,
        baseSalary: employee.baseSalary,
        emergencyContactName: employee.emergencyContactName,
        emergencyContactPhone: employee.emergencyContactPhone,
        emergencyContactRelation: employee.emergencyContactRelation,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateEmployeeDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        birthDate: values.birthDate?.toISOString(),
        birthPlace: values.birthPlace,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        bloodType: values.bloodType,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        employmentType: values.employmentType,
        departmentId: values.departmentId,
        positionId: values.positionId,
        managerId: values.managerId,
        shiftId: values.shiftId,
        workLocationId: values.workLocationId,
        baseSalary: values.baseSalary,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        emergencyContactRelation: values.emergencyContactRelation,
      };

      await updateEmployee.mutateAsync({ id, data });
      router.push(`/hr/employees/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const statusInfo = employee ? statusConfig[employee.status] || { color: 'gray' as const, label: '-' } : null;

  return (
    <FormPageLayout
      title={employee?.fullName || 'Çalışan Düzenle'}
      subtitle={employee ? `${employee.employeeCode} - ${employee.positionTitle || 'Pozisyon belirtilmedi'}` : 'Çalışan bilgilerini güncelleyin'}
      icon={<UserIcon className="w-5 h-5" />}
      cancelPath={`/hr/employees/${id}`}
      loading={updateEmployee.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !employee)}
      errorMessage="Çalışan Bulunamadı"
      errorDescription="İstenen çalışan bulunamadı veya bir hata oluştu."
      maxWidth="max-w-7xl"
      titleExtra={
        statusInfo && (
          <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
        )
      }
    >
      <EmployeeForm
        form={form}
        initialValues={employee}
        onFinish={handleSubmit}
        loading={updateEmployee.isPending}
      />
    </FormPageLayout>
  );
}
