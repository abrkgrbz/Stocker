'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import type { PositionDto } from '@/lib/api/services/hr.types';

interface PositionsTableProps {
  positions: PositionDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (position: PositionDto) => Promise<void>;
  onToggleActive?: (position: PositionDto) => Promise<void>;
}

export function PositionsTable({
  positions,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: PositionsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const columns: TableColumnsType<PositionDto> = [
    {
      title: 'Pozisyon',
      key: 'position',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <ShieldCheckIcon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.title}</div>
            <div className="text-xs text-gray-500 truncate">{record.code}</div>
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
      title: 'Maaş Aralığı',
      key: 'salary',
      width: 180,
      render: (_, record) => {
        if (!record.minSalary && !record.maxSalary) return <span className="text-slate-400">-</span>;
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <CurrencyDollarIcon className="w-3 h-3 text-slate-400" />
            <span>
              {formatCurrency(record.minSalary)} - {formatCurrency(record.maxSalary)}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Çalışan',
      dataIndex: 'filledPositions',
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
                    title: 'Pozisyonu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          <strong>{record.title}</strong> pozisyonunu silmek istediğinize emin
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
      dataSource={positions}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} pozisyon`,
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
            <div className="text-6xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Pozisyon Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun pozisyon bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
