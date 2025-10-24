'use client';

import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCustomers } from '@/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import CustomerModal from '@/features/customers/components/CustomerModal';
import { CustomersStats, CustomersTable, CustomersFilters } from '@/components/crm/customers';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';

const { Title } = Typography;

export default function CustomersPage() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch customers from API
  const { data, isLoading, error, refetch } = useCustomers({
    pageNumber: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const customers = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
    refetch();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleView = (customerId: string) => {
    window.location.href = `/crm/customers/${customerId}`;
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Müşteriler
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setSelectedCustomer(null);
              setModalOpen(true);
            }}
          >
            Müşteri Ekle
          </Button>
        </Space>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Müşteriler yüklenemedi"
          description={
            error instanceof Error
              ? error.message
              : 'Müşteriler getirilirken bir hata oluştu. Lütfen tekrar deneyin.'
          }
          type="error"
          showIcon
          closable
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Tekrar Dene
            </Button>
          }
          className="mb-6"
        />
      )}

      {/* Stats Cards */}
      <div className="mb-6">
        <CustomersStats customers={customers} totalCount={totalCount} loading={isLoading} />
      </div>

      {/* Search and Filters */}
      <AnimatedCard className="mb-4">
        <CustomersFilters searchText={searchText} onSearchChange={setSearchText} />
      </AnimatedCard>

      {/* Customers Table */}
      <AnimatedCard>
        <CustomersTable
          customers={customers}
          loading={isLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          onEdit={handleEdit}
          onView={handleView}
        />
      </AnimatedCard>

      {/* Customer Modal */}
      <CustomerModal
        open={modalOpen}
        customer={selectedCustomer}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
