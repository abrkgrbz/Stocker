'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { DepartmentDto } from '@/lib/api/services/hr.types';

interface DepartmentsTableProps {
  departments: DepartmentDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (department: DepartmentDto) => Promise<void>;
  onToggleActive?: (department: DepartmentDto) => Promise<void>;
}

export function DepartmentsTable({
  departments,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: DepartmentsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<DepartmentDto> = [
    {
      title: 'Departman',
      key: 'department',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <BuildingOfficeIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.name}</div>
            <div className="text-xs text-gray-500 truncate">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (desc) => desc || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Yönetici',
      dataIndex: 'managerName',
      key: 'manager',
      width: 150,
      render: (name) => name || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeCount',
      key: 'employees',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'} className="m-0">
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
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
                label: 'Görüntüle',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => onEdit(record.id),
              },
              {
                type: 'divider',
              },
              {
                key: 'toggle',
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                icon: record.isActive ? (
                  <NoSymbolIcon className="w-4 h-4" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                ),
                onClick: () => onToggleActive?.(record),
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
                    title: 'Departmanı Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.name}</strong> departmanını silmek istediğinize emin
                          misiniz?
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Bu işlem geri alınamaz.</p>
                      </div>
                    ),
                    okText: 'Sil',
                    okButtonProps: { danger: true },
                    cancelText: 'İptal',
                    onOk: async () => {
                      if (onDelete) {
                        await onDelete(record);
                      }
                    },
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
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
    <Table
      columns={columns}
      dataSource={departments}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} departman`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Departman Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun departman bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
