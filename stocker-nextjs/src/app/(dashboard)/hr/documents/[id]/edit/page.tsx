'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Spin, Empty, Space } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { DocumentForm } from '@/components/hr';
import { useDocument, useUpdateDocument } from '@/lib/api/hooks/useHR';
import type { UpdateEmployeeDocumentDto } from '@/lib/api/services/hr.types';

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: document, isLoading, error } = useDocument(id);
  const updateDocument = useUpdateDocument();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateEmployeeDocumentDto = {
        documentType: values.documentType,
        title: values.title,
        documentNumber: values.documentNumber,
        description: values.description,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        issuingAuthority: values.issuingAuthority,
        notes: values.notes,
      };

      await updateDocument.mutateAsync({ id, data });
      router.push(`/hr/documents/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6">
        <Empty description="Belge bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/documents')}>Listeye Dön</Button>
        </div>
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/documents/${id}`)}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <DocumentIcon className="w-4 h-4" className="mr-2" />
                Belge Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{document.title}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/documents/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateDocument.isPending}
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
        <DocumentForm
          form={form}
          initialValues={document}
          onFinish={handleSubmit}
          loading={updateDocument.isPending}
        />
      </div>
    </div>
  );
}
