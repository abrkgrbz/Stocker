'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { JobPostingForm } from '@/components/hr';
import { useCreateJobPosting } from '@/lib/api/hooks/useHR';
import type { CreateJobPostingDto } from '@/lib/api/services/hr.types';

export default function NewJobPostingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createJobPosting = useCreateJobPosting();

  const handleSubmit = async (values: CreateJobPostingDto) => {
    try {
      await createJobPosting.mutateAsync(values);
      router.push('/hr/job-postings');
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Yeni İş İlanı
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir iş ilanı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/job-postings')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createJobPosting.isPending}
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
        <JobPostingForm
          form={form}
          onFinish={handleSubmit}
          loading={createJobPosting.isPending}
        />
      </div>
    </div>
  );
}
