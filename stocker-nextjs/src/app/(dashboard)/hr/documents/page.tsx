'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Select } from 'antd';
import { MagnifyingGlassIcon, DocumentIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { PageContainer, ListPageHeader, DataTableWrapper } from '@/components/patterns';
import { Input } from '@/components/primitives/inputs';
import { Alert } from '@/components/primitives/feedback';
import { DocumentsStats, DocumentsTable } from '@/components/hr/documents';
import { useDocuments, useDeleteDocument, useEmployees } from '@/lib/api/hooks/useHR';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';

const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Kartı',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Özgeçmiş',
  [DocumentType.EmploymentContract]: 'İş Sözleşmesi',
  [DocumentType.MedicalReport]: 'Sağlık Raporu',
  [DocumentType.CriminalRecord]: 'Sabıka Kaydı',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayıt Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotoğraf',
  [DocumentType.Other]: 'Diğer',
};

export default function DocumentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<number | undefined>();
  const [typeFilter, setTypeFilter] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data: documents = [], isLoading, error, refetch } = useDocuments(employeeFilter, typeFilter);
  const { data: employees = [] } = useEmployees();
  const deleteDocument = useDeleteDocument();

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!debouncedSearch.trim()) return documents;
    const search = debouncedSearch.toLowerCase();
    return documents.filter(
      (d) =>
        d.title?.toLowerCase().includes(search) ||
        d.employeeName?.toLowerCase().includes(search) ||
        d.documentNumber?.toLowerCase().includes(search)
    );
  }, [documents, debouncedSearch]);

  // Paginate
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const totalCount = filteredDocuments.length;

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleDelete = async (document: EmployeeDocumentDto) => {
    try {
      await deleteDocument.mutateAsync(document.id);
      showSuccess('Belge Silindi', `"${document.title}" belgesi başarıyla silindi.`);
    } catch (err) {
      showApiError(err, 'Belge silinirken bir hata oluştu');
    }
  };

  const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  }));

  return (
    <PageContainer maxWidth="7xl" className="bg-slate-50 min-h-screen">
      {/* Stats Cards */}
      <div className="mb-8">
        <DocumentsStats documents={documents} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
        title="Belgeler"
        description="Çalışan belgelerini yönetin ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Belge',
          onClick: () => router.push('/hr/documents/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {error && (
        <Alert
          variant="error"
          title="Belgeler yüklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button onClick={() => refetch()} className="text-red-600 hover:text-red-800 font-medium">
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <Card className="mt-6 mb-4 border border-gray-100 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Belge ara... (başlık, çalışan, belge no)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              size="lg"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Çalışan seçin"
              style={{ width: '100%', height: '44px' }}
              value={employeeFilter}
              onChange={(value) => setEmployeeFilter(value)}
              allowClear
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Belge türü seçin"
              style={{ width: '100%', height: '44px' }}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              allowClear
              options={documentTypeOptions}
            />
          </Col>
        </Row>
      </Card>

      <DataTableWrapper>
        <DocumentsTable
          documents={paginatedDocuments}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/hr/documents/${id}`)}
          onEdit={(id) => router.push(`/hr/documents/${id}/edit`)}
          onDelete={handleDelete}
        />
      </DataTableWrapper>
    </PageContainer>
  );
}
