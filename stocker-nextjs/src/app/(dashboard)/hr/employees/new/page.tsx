'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
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
        bloodType: values.bloodType,
        address: values.address,
        city: values.city,
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
        notes: values.notes,
      };

      await createEmployee.mutateAsync(data);
      router.push('/hr/employees');
    } catch (error) {
      // Error handled by hook
    }
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
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <UserOutlined className="mr-2" />
                Yeni Çalışan
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir çalışan kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/employees')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createEmployee.isPending}
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
        <EmployeeForm
          form={form}
          onFinish={handleSubmit}
          loading={createEmployee.isPending}
        />
      </div>
    </div>
  );
}
