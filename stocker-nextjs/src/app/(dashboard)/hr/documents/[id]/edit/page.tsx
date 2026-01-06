'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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

  return (
    <FormPageLayout
      title="Belge Duzenle"
      subtitle={document?.title || 'Yukleniyor...'}
      icon={<DocumentIcon className="w-5 h-5" />}
      cancelPath={`/hr/documents/${id}`}
      loading={updateDocument.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !document}
      errorMessage="Belge Bulunamadi"
      errorDescription="Istenen belge bulunamadi veya bir hata olustu."
    >
      <DocumentForm
        form={form}
        initialValues={document}
        onFinish={handleSubmit}
        loading={updateDocument.isPending}
      />
    </FormPageLayout>
  );
}
