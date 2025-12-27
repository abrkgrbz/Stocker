'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { TrainingForm } from '@/components/hr';
import { useCreateTraining } from '@/lib/api/hooks/useHR';
import type { CreateTrainingDto } from '@/lib/api/services/hr.types';

export default function NewTrainingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTraining = useCreateTraining();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateTrainingDto = {
        code: values.code || `TRN-${Date.now()}`,
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        provider: values.provider,
        instructor: values.instructor,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        isOnline: values.isOnline ?? false,
        onlineUrl: values.onlineUrl,
        durationHours: values.durationHours || 0,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        currency: values.currency,
        isMandatory: values.isMandatory ?? false,
        hasCertification: values.hasCertification ?? false,
        certificationValidityMonths: values.certificationValidityMonths,
        passingScore: values.passingScore,
        prerequisites: values.prerequisites,
        materials: values.materials,
      };

      await createTraining.mutateAsync(data);
      router.push('/hr/trainings');
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
                <BookOpenIcon className="w-4 h-4" className="mr-2" />
                Yeni Eğitim
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir eğitim programı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/trainings')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createTraining.isPending}
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
        <TrainingForm
          form={form}
          onFinish={handleSubmit}
          loading={createTraining.isPending}
        />
      </div>
    </div>
  );
}
