'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from 'antd';
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
  [DocumentType.IdentityCard]: 'Kimlik Karti',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Ozgecmis',
  [DocumentType.EmploymentContract]: 'Is Sozlesmesi',
  [DocumentType.MedicalReport]: 'Saglik Raporu',
  [DocumentType.CriminalRecord]: 'Sabika Kaydi',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayit Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotograf',
  [DocumentType.Other]: 'Diger',
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
      showSuccess('Belge Silindi', `"${document.title}" belgesi basariyla silindi.`);
    } catch (err) {
      showApiError(err, 'Belge silinirken bir hata olustu');
    }
  };

  const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Stats Cards */}
      <div className="mb-8">
        <DocumentsStats documents={documents} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentIcon className="w-5 h-5" />}
        iconColor="#64748b"
        title="Belgeler"
        description="Calisan belgelerini yonetin ve takip edin"
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
          title="Belgeler yuklenemedi"
          message={(error as Error).message}
          closable
          action={
            <button onClick={() => refetch()} className="text-slate-700 hover:text-slate-900 font-medium">
              Tekrar Dene
            </button>
          }
          className="mt-6"
        />
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 mt-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            placeholder="Belge ara... (baslik, calisan, belge no)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            size="lg"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Calisan secin"
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
            className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Belge turu secin"
            style={{ width: '100%', height: '44px' }}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            allowClear
            options={documentTypeOptions}
            className="[&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl">
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
      </div>
    </div>
  );
}
