'use client';

import React, { useState, useEffect } from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  showCreateSuccess,
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
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useQualifyLead,
  useDisqualifyLead,
  useUpdateLeadScore,
} from '@/lib/api/hooks/useCRM';
import { LeadsStats, LeadsTable, LeadsFilters } from '@/components/crm/leads';
import BulkActionsToolbar from '@/components/crm/leads/BulkActionsToolbar';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import { LeadModal, ConvertLeadModal } from '@/features/leads/components';

const { Title } = Typography;

export default function LeadsPage() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // API Hooks
  const { data, isLoading, refetch } = useLeads({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const qualifyLead = useQualifyLead();
  const disqualifyLead = useDisqualifyLead();
  const updateLeadScore = useUpdateLeadScore();

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
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
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
    setSelectedLead(lead);
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

  const handleSubmit = async (values: any) => {
    try {
      if (selectedLead) {
        await updateLead.mutateAsync({ id: selectedLead.id, data: values });
        showUpdateSuccess('potansiyel müşteri');
      } else {
        await createLead.mutateAsync(values);
        showCreateSuccess('potansiyel müşteri');
      }
      setModalOpen(false);
    } catch (error: any) {
      // Extract API error details
      const apiError = error.response?.data;
      let errorMessage = 'İşlem başarısız';

      if (apiError) {
        // Use API error detail or first error message
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

  const handleConvertSubmit = async (values: any) => {
    if (!selectedLead) return;

    try {
      await convertLead.mutateAsync({
        leadId: selectedLead.id,
        customerData: values,
      });
      showUpdateSuccess('potansiyel müşteri', 'müşteriye dönüştürüldü');
      setConvertModalOpen(false);
    } catch (error: any) {
      // Extract API error details
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
        // Delete each selected lead
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
        // Update each selected lead's status
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
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          Potansiyel Müşteriler
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            data-action="create-lead"
          >
            Yeni Potansiyel Müşteri
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <LeadsStats leads={leads} loading={isLoading} />
      </div>

      {/* Search and Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
                setCurrentPage(1); // Reset to first page when filter changes
              }}
            />
          )}
          <LeadsTable
            leads={filteredLeads}
            loading={
              isLoading || createLead.isPending || updateLead.isPending || deleteLead.isPending
            }
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onQualify={handleQualify}
            onDisqualify={handleDisqualify}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        </Space>
      </AnimatedCard>

      {/* Create/Edit Modal */}
      <LeadModal
        open={modalOpen}
        lead={selectedLead}
        loading={createLead.isPending || updateLead.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Convert to Customer Modal */}
      <ConvertLeadModal
        open={convertModalOpen}
        loading={convertLead.isPending}
        initialValues={
          selectedLead
            ? {
                companyName: selectedLead.company,
                contactPerson: `${selectedLead.firstName} ${selectedLead.lastName}`,
                email: selectedLead.email,
                phone: selectedLead.phone,
              }
            : undefined
        }
        onCancel={() => setConvertModalOpen(false)}
        onSubmit={handleConvertSubmit}
      />
    </div>
  );
}
