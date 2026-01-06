'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { CertificationForm } from '@/components/hr';
import { useCreateCertification } from '@/lib/api/hooks/useHR';
import type { CreateCertificationDto } from '@/lib/api/services/hr.types';

export default function NewCertificationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCertification = useCreateCertification();

  const handleSubmit = async (values: CreateCertificationDto) => {
    try {
      await createCertification.mutateAsync(values);
      router.push('/hr/certifications');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Sertifika"
      subtitle="Yeni bir sertifika kaydi olusturun"
      icon={<ShieldCheckIcon className="w-5 h-5" />}
      cancelPath="/hr/certifications"
      loading={createCertification.isPending}
      onSave={() => form.submit()}
    >
      <CertificationForm
        form={form}
        onFinish={handleSubmit}
        loading={createCertification.isPending}
      />
    </FormPageLayout>
  );
}
