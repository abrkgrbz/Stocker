'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { SegmentForm } from '@/components/crm/segments';
import { useCustomerSegment, useUpdateCustomerSegment } from '@/lib/api/hooks/useCRM';

export default function EditSegmentPage() {
  const router = useRouter();
  const params = useParams();
  const segmentId = params.id as string;
  const [form] = Form.useForm();

  const { data: segment, isLoading, error } = useCustomerSegment(segmentId);
  const updateSegment = useUpdateCustomerSegment();

  const handleSubmit = async (values: any) => {
    try {
      await updateSegment.mutateAsync({ id: segmentId, data: values });
      router.push('/crm/segments');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="p-8">
        <Alert
          message="Segment Bulunamadı"
          description="İstenen segment bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/segments')}>
              Segmentlere Dön
            </Button>
          }
        />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: segment.color || '#1890ff' }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {segment.name}
                  </h1>
                  <Tag color={segment.type === 'Dynamic' ? 'processing' : 'default'}>
                    {segment.type === 'Dynamic' ? 'Dinamik' : 'Statik'}
                  </Tag>
                  {segment.isActive ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Aktif
                    </Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                      Pasif
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-gray-400 m-0">
                  <UserOutlined className="mr-1" />
                  {segment.memberCount || 0} üye
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/segments')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateSegment.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <SegmentForm
          form={form}
          initialValues={segment}
          onFinish={handleSubmit}
          loading={updateSegment.isPending}
        />
      </div>
    </div>
  );
}
