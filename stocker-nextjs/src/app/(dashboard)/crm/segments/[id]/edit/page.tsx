'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import {
  CheckCircleIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CrmFormPageLayout } from '@/components/crm/shared';
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

  return (
    <CrmFormPageLayout
      title={segment?.name || 'Segment Düzenle'}
      subtitle={segment ? `${segment.memberCount || 0} üye` : 'Segment bilgilerini güncelleyin'}
      cancelPath="/crm/segments"
      loading={updateSegment.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !segment)}
      errorMessage="Segment Bulunamadı"
      errorDescription="İstenen segment bulunamadı veya bir hata oluştu."
      titleExtra={
        segment && (
          <>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: segment.color || '#1890ff' }}
            />
            <Tag color={segment.type === 'Dynamic' ? 'processing' : 'default'}>
              {segment.type === 'Dynamic' ? 'Dinamik' : 'Statik'}
            </Tag>
            {segment.isActive ? (
              <Tag icon={<CheckCircleIcon className="w-4 h-4" />} color="success">
                Aktif
              </Tag>
            ) : (
              <Tag icon={<XCircleIcon className="w-4 h-4" />} color="default">
                Pasif
              </Tag>
            )}
          </>
        )
      }
    >
      <SegmentForm
        form={form}
        initialValues={segment}
        onFinish={handleSubmit}
        loading={updateSegment.isPending}
      />
    </CrmFormPageLayout>
  );
}
