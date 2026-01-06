'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { UserIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { EmployeeForm } from '@/components/hr';
import { useCreateEmployee } from '@/lib/api/hooks/useHR';
import type { CreateEmployeeDto } from '@/lib/api/services/hr.types';

export default function NewEmployeePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createEmployee = useCreateEmployee();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateEmployeeDto = {
        employeeCode: values.employeeCode,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        nationalId: values.nationalId,
        birthDate: values.birthDate?.toISOString(),
        birthPlace: values.birthPlace,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        nationality: values.nationality,
        bloodType: values.bloodType,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        hireDate: values.hireDate?.toISOString(),
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

      await createEmployee.mutateAsync(data);
      router.push('/hr/employees');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Çalışan"
      subtitle="Yeni bir çalışan kaydı oluşturun"
      icon={<UserIcon className="w-5 h-5" />}
      cancelPath="/hr/employees"
      loading={createEmployee.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <EmployeeForm
        form={form}
        onFinish={handleSubmit}
        loading={createEmployee.isPending}
      />
    </FormPageLayout>
  );
}
