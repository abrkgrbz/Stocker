'use client';

import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Modal, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
} from '@/hooks/useCRM';
import { LeadsStats, LeadsTable, LeadsFilters } from '@/components/crm/leads';
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

  const leads = data?.items || [];
  const totalCount = data?.totalCount || 0;

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

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Potansiyel Müşteriyi Sil',
      content: 'Bu potansiyel müşteriyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLead.mutateAsync(id);
          message.success('Potansiyel müşteri silindi');
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleConvert = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedLead) {
        await updateLead.mutateAsync({ id: selectedLead.id, data: values });
        message.success('Potansiyel müşteri güncellendi');
      } else {
        await createLead.mutateAsync(values);
        message.success('Potansiyel müşteri oluşturuldu');
      }
      setModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || 'İşlem başarısız');
    }
  };

  const handleConvertSubmit = async (values: any) => {
    if (!selectedLead) return;

    try {
      await convertLead.mutateAsync({
        leadId: selectedLead.id,
        customerData: values,
      });
      message.success('Potansiyel müşteri, müşteriye dönüştürüldü');
      setConvertModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || 'Dönüştürme işlemi başarısız');
    }
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
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
          <LeadsFilters searchText={searchText} onSearchChange={setSearchText} />
          <LeadsTable
            leads={leads}
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
