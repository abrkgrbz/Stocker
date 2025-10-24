'use client';

import React from 'react';
import { Table, Tag, Dropdown, Button, Avatar, Badge } from 'antd';
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
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
      title: 'Firma',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName, 'tr'),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0"
            icon={<ShopOutlined />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{text}</div>
            {record.contactPerson && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <UserOutlined className="text-xs" />
                <span className="truncate">{record.contactPerson}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MailOutlined className="text-blue-500" />
            <span className="truncate">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <PhoneOutlined className="text-green-500" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {(record.city || record.country) && (
            <>
              <EnvironmentOutlined className="text-orange-500" />
              <div>
                {record.city && <div className="text-sm text-gray-700">{record.city}</div>}
                {record.country && <div className="text-xs text-gray-500">{record.country}</div>}
              </div>
            </>
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
        <Tag
          className="rounded-full px-3 py-1 font-medium border-0"
          color={type === 'Corporate' ? 'blue' : 'green'}
        >
          {type === 'Corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
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
        const label = CRM_STATUS_LABELS.customers[status as keyof typeof CRM_STATUS_LABELS.customers] || status;
        const statusConfig = {
          Active: { icon: '●', className: 'bg-green-50 text-green-700 border border-green-200' },
          Inactive: { icon: '●', className: 'bg-gray-50 text-gray-700 border border-gray-200' },
          Potential: { icon: '●', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { icon: '●', className: 'bg-gray-50 text-gray-700 border border-gray-200' };

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
            <span className="text-[10px]">{config.icon}</span>
            {label}
          </span>
        );
      },
    },
    {
      title: 'Toplam Alışveriş',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      sorter: (a, b) => (a.totalPurchases || 0) - (b.totalPurchases || 0),
      render: (value) => (
        <div className="text-right">
          <div className="font-bold text-gray-900">{formatCurrency(value || 0)}</div>
          <div className="text-xs text-gray-500">Toplam ciro</div>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Detayları Gör',
                icon: <EyeOutlined />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => onEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          />
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
        className: 'px-4',
      }}
      loading={loading}
      locale={{
        emptyText: 'Müşteri bulunamadı',
        filterConfirm: 'Tamam',
        filterReset: 'Sıfırla',
        filterTitle: 'Filtrele',
      }}
      className="rounded-lg overflow-hidden"
      rowClassName="hover:bg-blue-50 transition-colors cursor-pointer"
      onRow={(record) => ({
        onClick: () => onView(record.id),
      })}
    />
  );
}
