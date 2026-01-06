'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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
        notes: values.notes,
        // Kazanclar
        baseSalary: values.baseSalary || 0,
        overtimePay: values.overtimePay || 0,
        bonus: values.bonus || 0,
        allowances: values.allowances || 0,
        // Otomatik Hesaplama
        autoCalculate: values.autoCalculate ?? true,
        cumulativeGrossEarnings: values.cumulativeGrossEarnings || 0,
        applyMinWageExemption: values.applyMinWageExemption ?? true,
      };

      await createPayroll.mutateAsync(data);
      router.push('/hr/payroll');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Bordro"
      subtitle="Yeni bir bordro kaydi olusturun"
      icon={<CurrencyDollarIcon className="w-5 h-5" />}
      cancelPath="/hr/payroll"
      loading={createPayroll.isPending}
      onSave={() => form.submit()}
    >
      <PayrollForm
        form={form}
        onFinish={handleSubmit}
        loading={createPayroll.isPending}
      />
    </FormPageLayout>
  );
}
