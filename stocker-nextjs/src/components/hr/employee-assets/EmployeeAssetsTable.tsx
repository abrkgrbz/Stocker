'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeAssetDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface EmployeeAssetsTableProps {
  assets: EmployeeAssetDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (asset: EmployeeAssetDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Assigned: 'processing',
  Available: 'success',
  Returned: 'default',
  UnderMaintenance: 'warning',
  Lost: 'error',
  Damaged: 'error',
  Disposed: 'default',
};

const statusLabels: Record<string, string> = {
  Assigned: 'Atanmış',
  Available: 'Müsait',
  Returned: 'İade Edildi',
  UnderMaintenance: 'Bakımda',
  Lost: 'Kayıp',
  Damaged: 'Hasarlı',
  Disposed: 'İmha Edildi',
};

const assetTypeColors: Record<string, string> = {
  Laptop: 'blue',
  Desktop: 'cyan',
  Mobile: 'purple',
  Tablet: 'magenta',
  Monitor: 'geekblue',
  Keyboard: 'default',
  Mouse: 'default',
  Headset: 'default',
  Vehicle: 'orange',
  AccessCard: 'green',
  Uniform: 'lime',
  Tools: 'volcano',
  Other: 'default',
};

export function EmployeeAssetsTable({
  assets,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: EmployeeAssetsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeAssetDto> = [
    {
      title: 'Varlık',
      key: 'asset',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#3b82f615' }}
          >
            <ComputerDesktopIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.assetName}
            </div>
            <div className="text-xs text-gray-500">
              {record.assetCode || record.serialNumber || 'Kod yok'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'assetType',
      key: 'assetType',
      width: 120,
      render: (type: string) => (
        <Tag color={assetTypeColors[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: 'Seri No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 140,
      render: (serial: string) => (
        <span className="text-sm text-slate-600 font-mono">{serial || '-'}</span>
      ),
    },
    {
      title: 'Atama Tarihi',
      dataIndex: 'assignmentDate',
      key: 'assignmentDate',
      width: 120,
      sorter: (a, b) => dayjs(a.assignmentDate).unix() - dayjs(b.assignmentDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      filters: Object.entries(statusLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag color={statusColors[record.status] || 'default'}>
          {statusLabels[record.status] || record.status}
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
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Varlık Atamasını Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.assetName}" varlık atamasını silmek istediğinize emin misiniz?
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
      dataSource={assets}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} varlık`,
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
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Varlık Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun varlık bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
