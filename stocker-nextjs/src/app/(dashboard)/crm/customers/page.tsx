'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomers } from '@/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import CustomerModal from '@/features/customers/components/CustomerModal';
import Link from 'next/link';

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

  const columns: ColumnsType<Customer> = [
    {
      title: 'Firma Adı',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName, 'tr'),
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.contactPerson && (
            <div className="text-xs text-gray-500">{record.contactPerson}</div>
          )}
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.email}</div>
          {record.phone && (
            <div className="text-xs text-gray-500">{record.phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_, record) => (
        <div>
          {record.city && <div className="text-sm">{record.city}</div>}
          {record.country && (
            <div className="text-xs text-gray-500">{record.country}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'customerType',
      key: 'customerType',
      filters: [
        { text: 'Kurumsal', value: 'Corporate' },
        { text: 'Bireysel', value: 'Individual' },
      ],
      onFilter: (value, record) => record.customerType === value,
      render: (type) => (
        <Tag color={type === 'Corporate' ? 'blue' : 'green'}>
          {type === 'Corporate' ? 'Kurumsal' : 'Bireysel'}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Aktif', value: 'Active' },
        { text: 'Pasif', value: 'Inactive' },
        { text: 'Potansiyel', value: 'Potential' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color =
          status === 'Active'
            ? 'success'
            : status === 'Potential'
            ? 'warning'
            : 'default';
        const text =
          status === 'Active' ? 'Aktif' : status === 'Potential' ? 'Potansiyel' : 'Pasif';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Toplam Alışveriş',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      sorter: (a, b) => a.totalPurchases - b.totalPurchases,
      render: (value) => `₺${value.toLocaleString('tr-TR')}`,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Detayları Gör',
                onClick: () => window.location.href = `/crm/customers/${record.id}`,
              },
              {
                key: 'edit',
                label: 'Düzenle',
                onClick: () => {
                  setSelectedCustomer(record);
                  setModalOpen(true);
                },
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                danger: true,
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleModalSuccess = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
    refetch();
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <Title level={2} style={{ margin: 0 }}>
          Müşteriler
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
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
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Toplam Müşteri"
                value={totalCount}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Aktif Müşteri"
                value={customers.filter((c) => c.status === 'Active').length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Toplam Ciro"
                value={customers.reduce((sum, c) => sum + c.totalPurchases, 0)}
                prefix="₺"
                suffix={<RiseOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Space style={{ width: '100%' }} direction="vertical" size="middle">
          <div className="flex gap-4">
            <Input
              placeholder="İsim, e-posta veya telefona göre ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1 }}
              size="large"
              allowClear
            />
            <Button icon={<FilterOutlined />} size="large">
              Filtreler
            </Button>
          </div>
        </Space>
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} müşteri`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          loading={isLoading}
          locale={{
            emptyText: 'Müşteri bulunamadı',
            filterConfirm: 'Tamam',
            filterReset: 'Sıfırla',
            filterTitle: 'Filtrele',
          }}
        />
      </Card>

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
