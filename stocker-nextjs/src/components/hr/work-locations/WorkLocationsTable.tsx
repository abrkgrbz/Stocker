'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
  StopCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';

interface WorkLocationsTableProps {
  locations: WorkLocationDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (location: WorkLocationDto) => Promise<void>;
  onToggleActive?: (location: WorkLocationDto) => Promise<void>;
}

export function WorkLocationsTable({
  locations,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: WorkLocationsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<WorkLocationDto> = [
    {
      title: 'Lokasyon',
      key: 'location',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <MapPinIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
              {record.name}
              {record.isHeadquarters && <Tag color="gold" className="ml-2">Merkez</Tag>}
              {record.isRemote && <Tag color="purple">Uzaktan</Tag>}
            </div>
            <div className="text-xs text-gray-500">
              {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city: string) => (
        <span className="text-sm text-slate-600">{city || '-'}</span>
      ),
    },
    {
      title: 'Ülke',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (country: string) => (
        <span className="text-sm text-slate-600">{country || '-'}</span>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.employeeCount || 0) - (b.employeeCount || 0),
      render: (count: number) => (
        <span className="font-semibold text-blue-600">{count || 0}</span>
      ),
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      align: 'center',
      render: (capacity: number) => (
        <span className="text-sm text-slate-600">{capacity || '-'}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
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
                key: 'toggle',
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                icon: record.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
                onClick: () => onToggleActive?.(record),
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
                    title: 'Lokasyonu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.name}" lokasyonunu silmek istediğinize emin misiniz?
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
      dataSource={locations}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} lokasyon`,
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
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Lokasyon Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun lokasyon bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
