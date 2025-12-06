'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileOutlined } from '@ant-design/icons';
import { DocumentForm } from '@/components/hr';
import { useCreateDocument, useUploadDocumentFile } from '@/lib/api/hooks/useHR';
import type { CreateEmployeeDocumentDto } from '@/lib/api/services/hr.types';

export default function NewDocumentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const createDocument = useCreateDocument();
  const uploadFile = useUploadDocumentFile();

  const isLoading = createDocument.isPending || uploadFile.isPending;

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateEmployeeDocumentDto = {
        employeeId: values.employeeId,
        documentType: values.documentType,
        title: values.title,
        documentNumber: values.documentNumber,
        description: values.description,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        issuingAuthority: values.issuingAuthority,
        notes: values.notes,
      };

      // First create the document
      const newDocument = await createDocument.mutateAsync(data);

      // Then upload file if selected
      if (selectedFile && newDocument?.id) {
        try {
          await uploadFile.mutateAsync({ id: newDocument.id, file: selectedFile });
        } catch (error) {
          message.warning('Belge oluşturuldu ancak dosya yüklenemedi. Detay sayfasından tekrar deneyebilirsiniz.');
        }
      }

      router.push('/hr/documents');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
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
                <FileOutlined className="mr-2" />
                Yeni Belge
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir belge kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/documents')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isLoading}
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
          onFinish={handleSubmit}
          loading={isLoading}
          onFileChange={handleFileChange}
        />
      </div>
    </div>
  );
}
