'use client';

import React from 'react';
import { Table, Tag, Dropdown, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Customer } from '@/lib/api/services/crm.service';
import { formatCurrency } from '@/lib/crm/formatters';
import { CRM_COLORS, CRM_STATUS_LABELS } from '@/lib/crm/constants';

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (customer: Customer) => void;
  onView: (customerId: string) => void;
}

export function CustomersTable({
  customers,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onView,
}: CustomersTableProps) {
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
          {record.phone && <div className="text-xs text-gray-500">{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_, record) => (
        <div>
          {record.city && <div className="text-sm">{record.city}</div>}
          {record.country && <div className="text-xs text-gray-500">{record.country}</div>}
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
        const color = CRM_COLORS.customers[status as keyof typeof CRM_COLORS.customers] || 'default';
        const label = CRM_STATUS_LABELS.customers[status as keyof typeof CRM_STATUS_LABELS.customers] || status;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Toplam Alışveriş',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      sorter: (a, b) => (a.totalPurchases || 0) - (b.totalPurchases || 0),
      render: (value) => formatCurrency(value || 0),
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
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                onClick: () => onEdit(record),
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

  return (
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
        onChange: onPageChange,
      }}
      loading={loading}
      locale={{
        emptyText: 'Müşteri bulunamadı',
        filterConfirm: 'Tamam',
        filterReset: 'Sıfırla',
        filterTitle: 'Filtrele',
      }}
    />
  );
}
