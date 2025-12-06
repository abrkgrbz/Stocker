'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DollarOutlined } from '@ant-design/icons';
import { PayrollForm } from '@/components/hr';
import { useCreatePayroll } from '@/lib/api/hooks/useHR';
import type { CreatePayrollDto } from '@/lib/api/services/hr.types';

export default function NewPayrollPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPayroll = useCreatePayroll();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePayrollDto = {
        employeeId: values.employeeId,
        month: values.period.month() + 1,
        year: values.period.year(),
        baseSalary: values.baseSalary,
        overtimePay: values.overtimePay,
        bonus: values.bonus,
        allowances: values.allowances,
        taxDeduction: values.taxDeduction,
        socialSecurityDeduction: values.socialSecurityDeduction,
        otherDeductions: values.otherDeductions,
        notes: values.notes,
      };

      await createPayroll.mutateAsync(data);
      router.push('/hr/payroll');
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
                <DollarOutlined className="mr-2" />
                Yeni Bordro
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir bordro kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/payroll')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createPayroll.isPending}
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
        <PayrollForm
          form={form}
          onFinish={handleSubmit}
          loading={createPayroll.isPending}
        />
      </div>
    </div>
  );
}
