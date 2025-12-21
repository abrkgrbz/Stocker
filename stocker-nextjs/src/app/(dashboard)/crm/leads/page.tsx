'use client';

/**
 * Leads List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import {
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
  confirmDelete,
  confirmAction,
  showInfo,
} from '@/lib/utils/sweetalert';
import type { Lead } from '@/lib/api/services/crm.service';
import {
  useLeads,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useQualifyLead,
  useDisqualifyLead,
} from '@/lib/api/hooks/useCRM';
import { LeadsStats, LeadsTable, LeadsFilters } from '@/components/crm/leads';
import BulkActionsToolbar from '@/components/crm/leads/BulkActionsToolbar';
import { ConvertLeadModal } from '@/features/leads/components';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

export default function LeadsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // API Hooks
  const { data, isLoading, refetch } = useLeads({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const qualifyLead = useQualifyLead();
  const disqualifyLead = useDisqualifyLead();

  const leads = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Apply client-side status filter
  const filteredLeads = statusFilter
    ? leads.filter((lead) => lead.status === statusFilter)
    : leads;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/leads/new');
  };

  const handleView = (lead: Lead) => {
    router.push(`/crm/leads/${lead.id}`);
  };

  const handleEdit = (lead: Lead) => {
    router.push(`/crm/leads/${lead.id}/edit`);
  };

  const handleDelete = async (id: string, lead: Lead) => {
    const confirmed = await confirmDelete(
      'Potansiyel Müşteri',
      `${lead.firstName} ${lead.lastName}`
    );

    if (confirmed) {
      try {
        await deleteLead.mutateAsync(id);
        showDeleteSuccess('potansiyel müşteri');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const handleConvert = (lead: Lead) => {
    setLeadToConvert(lead);
    setConvertModalOpen(true);
  };

  const handleQualify = async (lead: Lead) => {
    const confirmed = await confirmAction(
      'Lead\'i Nitelikli Olarak İşaretle',
      `"${lead.firstName} ${lead.lastName}" lead'ini nitelikli olarak işaretlemek istediğinizden emin misiniz?`,
      'Nitelikli İşaretle'
    );

    if (confirmed) {
      try {
        await qualifyLead.mutateAsync({ id: lead.id.toString() });
        showUpdateSuccess('Lead', 'nitelikli olarak işaretlendi');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleDisqualify = async (lead: Lead) => {
    const confirmed = await confirmAction(
      'Lead\'i Niteliksiz Olarak İşaretle',
      `"${lead.firstName} ${lead.lastName}" lead'ini niteliksiz olarak işaretlemek istediğinizden emin misiniz?`,
      'Niteliksiz İşaretle'
    );

    if (confirmed) {
      try {
        await disqualifyLead.mutateAsync({
          id: lead.id.toString(),
          reason: 'Kullanıcı tarafından niteliksiz işaretlendi',
        });
        showInfo('Lead İşaretlendi', 'Lead niteliksiz olarak işaretlendi');
      } catch (error: any) {
        const apiError = error.response?.data;
        const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'İşlem başarısız';
        showError(errorMessage);
      }
    }
  };

  const handleConvertSubmit = async (values: any) => {
    if (!leadToConvert) return;

    try {
      await convertLead.mutateAsync({
        leadId: leadToConvert.id,
        customerData: values,
      });
      showUpdateSuccess('potansiyel müşteri', 'müşteriye dönüştürüldü');
      setConvertModalOpen(false);
    } catch (error: any) {
      const apiError = error.response?.data;
      let errorMessage = 'Dönüştürme işlemi başarısız';

      if (apiError) {
        errorMessage = apiError.detail ||
                      apiError.errors?.[0]?.message ||
                      apiError.title ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleBulkDelete = async () => {
    const confirmed = await confirmDelete(
      'Seçili Potansiyel Müşteriler',
      `${selectedRowKeys.length} potansiyel müşteri silinecek`
    );

    if (confirmed) {
      try {
        await Promise.all(
          selectedRowKeys.map((key) => deleteLead.mutateAsync(String(key)))
        );
        showDeleteSuccess(`${selectedRowKeys.length} potansiyel müşteri`);
        setSelectedRowKeys([]);
      } catch (error) {
        showError('Toplu silme işlemi başarısız');
      }
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    const confirmed = await confirmAction(
      'Durum Değiştir',
      `${selectedRowKeys.length} potansiyel müşterinin durumu değiştirilecek`,
      'Değiştir'
    );

    if (confirmed) {
      try {
        await Promise.all(
          selectedRowKeys.map((key) => {
            const lead = leads.find((l) => l.id === String(key));
            if (lead) {
              return updateLead.mutateAsync({
                id: lead.id,
                data: { ...lead, status: status as any },
              });
            }
            return Promise.resolve();
          })
        );
        showUpdateSuccess(`${selectedRowKeys.length} potansiyel müşteri`, 'durum güncellendi');
        setSelectedRowKeys([]);
      } catch (error) {
        showError('Toplu durum değiştirme işlemi başarısız');
      }
    }
  };

  const handleBulkScoreAssign = async () => {
    showInfo('Yakında', 'Toplu puan atama özelliği yakında eklenecek');
  };

  const handleBulkTagAssign = async () => {
    showInfo('Yakında', 'Toplu etiketleme özelliği yakında eklenecek');
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <LeadsStats leads={leads} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<UserAddOutlined />}
        iconColor="#0f172a"
        title="Potansiyel Müşteriler"
        description="Lead'leri yönetin ve müşteriye dönüştürün"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Lead',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters / Bulk Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        {selectedRowKeys.length > 0 ? (
          <BulkActionsToolbar
            selectedCount={selectedRowKeys.length}
            onClearSelection={handleClearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkScoreAssign={handleBulkScoreAssign}
            onBulkTagAssign={handleBulkTagAssign}
          />
        ) : (
          <LeadsFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            activeStatusFilter={statusFilter || undefined}
            onStatusFilterChange={(status) => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <LeadsTable
            leads={filteredLeads}
            loading={isLoading || updateLead.isPending || deleteLead.isPending}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onQualify={handleQualify}
            onDisqualify={handleDisqualify}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        </DataTableWrapper>
      )}

      {/* Convert to Customer Modal */}
      <ConvertLeadModal
        open={convertModalOpen}
        loading={convertLead.isPending}
        initialValues={
          leadToConvert
            ? {
                companyName: leadToConvert.company,
                contactPerson: `${leadToConvert.firstName} ${leadToConvert.lastName}`,
                email: leadToConvert.email,
                phone: leadToConvert.phone,
              }
            : undefined
        }
        onCancel={() => setConvertModalOpen(false)}
        onSubmit={handleConvertSubmit}
      />
    </PageContainer>
  );
}
