'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, message } from 'antd';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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
          message.warning('Belge olusturuldu ancak dosya yuklenemedi. Detay sayfasindan tekrar deneyebilirsiniz.');
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
    <FormPageLayout
      title="Yeni Belge"
      subtitle="Yeni bir belge kaydi olusturun"
      icon={<DocumentIcon className="w-5 h-5" />}
      cancelPath="/hr/documents"
      loading={isLoading}
      onSave={() => form.submit()}
    >
      <DocumentForm
        form={form}
        onFinish={handleSubmit}
        loading={isLoading}
        onFileChange={handleFileChange}
      />
    </FormPageLayout>
  );
}
