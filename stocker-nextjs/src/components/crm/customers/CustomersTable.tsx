'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Button, Avatar, Space, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Customer } from '@/lib/api/services/crm.service';
import { formatCurrency } from '@/lib/crm/formatters';
import { CRM_STATUS_LABELS } from '@/lib/crm/constants';
import { CustomerTagList } from './CustomerTags';

interface CustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (customer: Customer) => void;
  onView: (customerId: number) => void;
  onDelete?: (customerId: string) => Promise<void>;
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
  onDelete,
}: CustomersTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? '✓ Aktif' : '✕ Pasif';
  };

  const columns: TableColumnsType<Customer> = [
    {
      title: 'Müşteri Adı',
      dataIndex: 'companyName',
      key: 'companyName',
      fixed: 'left',
      width: 300,
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<BuildingStorefrontIcon className="w-5 h-5" />}
            className={record.isActive ? 'bg-blue-500' : 'bg-gray-400'}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{text}</div>
            <div className="text-xs text-gray-500 truncate">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={getStatusColor(isActive)} className="m-0">
          {getStatusText(isActive)}
        </Tag>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 120,
      filters: [
        { text: 'Kurumsal', value: 'Corporate' },
        { text: 'Bireysel', value: 'Individual' },
      ],
      onFilter: (value, record) => record.customerType === value,
      render: (type) => (
        <Tag color={type === 'Corporate' ? 'purple' : 'green'} className="m-0">
          {type === 'Corporate' ? 'Kurumsal' : 'Bireysel'}
        </Tag>
      ),
    },
    {
      title: 'Toplam Ciro',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      width: 150,
      sorter: (a, b) => (a.totalPurchases || 0) - (b.totalPurchases || 0),
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      title: 'Konum',
      dataIndex: 'city',
      key: 'location',
      width: 200,
      render: (city, record) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="truncate">
            {city || 'N/A'}, {record.country || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => (
        <div className="flex items-center gap-1 text-gray-600">
          <PhoneIcon className="w-4 h-4 text-gray-400" />
          <span>{phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Eylemler',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Detayları Gör',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => onEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Müşteriyi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.companyName}</strong> müşterisini silmek istediğinize emin misiniz?
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Bu işlem geri alınamaz.
                        </p>
                      </div>
                    ),
                    okText: 'Sil',
                    okButtonProps: { danger: true },
                    cancelText: 'İptal',
                    onOk: async () => {
                      if (onDelete) {
                        await onDelete(String(record.id));
                      }
                    },
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div>
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalCount,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} müşteri`,
          pageSizeOptions: ['10', '20', '50', '100'],
          position: ['bottomCenter'],
        }}
        scroll={{ x: 1200 }}
        onRow={(record) => ({
          onClick: () => onView(record.id),
          className: 'cursor-pointer hover:bg-gray-50',
        })}
        locale={{
          emptyText: (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Müşteri Bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinize uygun müşteri bulunamadı</p>
            </div>
          ),
        }}
      />
    </div>
  );
}
