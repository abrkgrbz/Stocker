'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { PayslipForm } from '@/components/hr/payslips';
import { useCreatePayslip } from '@/lib/api/hooks/useHR';

export default function NewPayslipPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPayslip = useCreatePayslip();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        payPeriodStart: values.payPeriodStart?.toISOString(),
        payPeriodEnd: values.payPeriodEnd?.toISOString(),
        paymentDate: values.paymentDate?.toISOString(),
      };
      await createPayslip.mutateAsync(data);
      router.push('/hr/payslips');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Bordro"
      subtitle="Calisan bordrosu olusturun"
      icon={<CurrencyDollarIcon className="w-5 h-5" />}
      cancelPath="/hr/payslips"
      loading={createPayslip.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <PayslipForm
        form={form}
        onFinish={handleSubmit}
        loading={createPayslip.isPending}
      />
    </FormPageLayout>
  );
}
