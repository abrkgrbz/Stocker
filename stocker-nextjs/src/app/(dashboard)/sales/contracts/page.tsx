'use client';

/**
 * Customer Contracts List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, message } from 'antd';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  useCustomerContracts,
  useActivateCustomerContract,
  useSuspendCustomerContract,
  useDeleteCustomerContract,
} from '@/lib/api/hooks/useSales';
import type { CustomerContractQueryParams, ContractStatus, ContractType } from '@/lib/api/services/sales.service';
import { ContractsStats, ContractsTable } from '@/components/sales/contracts';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/patterns';
import { Input, Select, Alert, Spinner } from '@/components/primitives';

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Suspended', label: 'Askıda' },
  { value: 'Terminated', label: 'Feshedildi' },
  { value: 'Expired', label: 'Süresi Doldu' },
  { value: 'PendingApproval', label: 'Onay Bekliyor' },
];

const typeOptions: { value: ContractType; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Enterprise', label: 'Kurumsal' },
  { value: 'Custom', label: 'Özel' },
  { value: 'Framework', label: 'Çerçeve' },
  { value: 'ServiceLevel', label: 'SLA' },
];

export default function ContractsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CustomerContractQueryParams>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch contracts
  const { data, isLoading, error, refetch } = useCustomerContracts({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    ...filters,
  });

  const activateMutation = useActivateCustomerContract();
  const suspendMutation = useSuspendCustomerContract();
  const deleteMutation = useDeleteCustomerContract();

  const contracts = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/sales/contracts/new');
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleSuspend = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Askıya Al',
      content: 'Bu sözleşmeyi askıya almak istediğinizden emin misiniz?',
      okText: 'Askıya Al',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await suspendMutation.mutateAsync({ id, reason: 'Kullanıcı tarafından askıya alındı' });
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const handleTerminate = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Feshet',
      content: 'Bu sözleşmeyi feshetmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Feshet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => {
        router.push(`/sales/contracts/${id}/edit?action=terminate`);
      },
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Sözleşmeyi Sil',
      content: 'Bu sözleşmeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <ContractsStats contracts={contracts} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<DocumentTextIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Müşteri Sözleşmeleri"
        description="Müşteri sözleşmelerini yönetin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Sözleşme',
          onClick: handleCreate,
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

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          title="Sözleşmeler yüklenemedi"
          message={
            error instanceof Error
              ? error.message
              : 'Sözleşmeler getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
          closable
          action={
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          }
          className="mb-6"
        />
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Sözleşme ara... (no, müşteri adı)"
            prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Durum"
            options={statusOptions}
            value={(filters.status as ContractStatus) || null}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value || undefined }))}
          />
          <Select
            placeholder="Tür"
            options={typeOptions}
            value={(filters.contractType as ContractType) || null}
            onChange={(value) => setFilters((prev) => ({ ...prev, contractType: value || undefined }))}
          />
        </div>
      </div>

      {/* Contracts Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <ContractsTable
            contracts={contracts}
            loading={isLoading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onActivate={handleActivate}
            onSuspend={handleSuspend}
            onTerminate={handleTerminate}
            onDelete={handleDelete}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}
