'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Avatar, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeSummaryDto } from '@/lib/api/services/hr.types';
import { EmployeeStatus } from '@/lib/api/services/hr.types';

// Employee status configuration
const employeeStatusConfig: Record<number, { color: string; label: string }> = {
  [EmployeeStatus.Active]: { color: 'green', label: 'Aktif' },
  [EmployeeStatus.Inactive]: { color: 'default', label: 'Pasif' },
  [EmployeeStatus.OnLeave]: { color: 'blue', label: 'İzinde' },
  [EmployeeStatus.Terminated]: { color: 'red', label: 'İşten Çıkarıldı' },
  [EmployeeStatus.Resigned]: { color: 'orange', label: 'İstifa' },
  [EmployeeStatus.Retired]: { color: 'gray', label: 'Emekli' },
  [EmployeeStatus.Probation]: { color: 'purple', label: 'Deneme Süresinde' },
  [EmployeeStatus.MilitaryService]: { color: 'cyan', label: 'Askerde' },
  [EmployeeStatus.MaternityLeave]: { color: 'magenta', label: 'Doğum İzni' },
  [EmployeeStatus.SickLeave]: { color: 'volcano', label: 'Hastalık İzni' },
};

interface EmployeesTableProps {
  employees: EmployeeSummaryDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (employee: EmployeeSummaryDto) => Promise<void>;
  onToggleActive?: (employee: EmployeeSummaryDto) => Promise<void>;
}

export function EmployeesTable({
  employees,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: EmployeesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeSummaryDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.photoUrl}
            icon={<UserIcon className="w-5 h-5" />}
            style={{ backgroundColor: record.photoUrl ? undefined : '#7c3aed' }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.fullName}</div>
            <div className="text-xs text-gray-500 truncate">{record.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'department',
      width: 150,
      render: (name) => name || <span className="text-slate-400">-</span>,
    },
    {
      title: 'Pozisyon',
      dataIndex: 'positionTitle',
      key: 'position',
      width: 150,
      render: (title) => title || <span className="text-slate-400">-</span>,
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email) =>
        email ? (
          <div className="flex items-center gap-1 text-gray-600">
            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
            <span className="truncate">{email}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'İşe Giriş',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 110,
      render: (date) =>
        date ? (
          <span className="text-gray-600">
            {new Date(date).toLocaleDateString('tr-TR')}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: Object.entries(employeeStatusConfig).map(([value, config]) => ({
        text: config.label,
        value: Number(value),
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: EmployeeStatus) => {
        const config = employeeStatusConfig[status];
        return config ? (
          <Tag color={config.color} className="m-0">
            {config.label}
          </Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
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
                label: record.status === EmployeeStatus.Active ? 'Pasifleştir' : 'Aktifleştir',
                icon: record.status === EmployeeStatus.Active ? (
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
                    title: 'Çalışanı Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.fullName}</strong> çalışanını silmek istediğinize emin misiniz?
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
      dataSource={employees}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} çalışan`,
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
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Çalışan Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun çalışan bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
