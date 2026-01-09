'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Assigned: { bg: 'bg-slate-700', text: 'text-white', label: 'Atanmis' },
  Available: { bg: 'bg-slate-900', text: 'text-white', label: 'Musait' },
  Returned: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Iade Edildi' },
  UnderMaintenance: { bg: 'bg-slate-400', text: 'text-white', label: 'Bakimda' },
  Lost: { bg: 'bg-slate-800', text: 'text-white', label: 'Kayip' },
  Damaged: { bg: 'bg-slate-600', text: 'text-white', label: 'Hasarli' },
  Disposed: { bg: 'bg-slate-200', text: 'text-slate-500', label: 'Imha Edildi' },
};

const assetTypeLabels: Record<string, string> = {
  Laptop: 'Laptop',
  Desktop: 'Masaustu',
  Mobile: 'Mobil',
  Tablet: 'Tablet',
  Monitor: 'Monitor',
  Keyboard: 'Klavye',
  Mouse: 'Mouse',
  Headset: 'Kulaklik',
  Vehicle: 'Arac',
  AccessCard: 'Giris Karti',
  Uniform: 'Uniforma',
  Tools: 'Aletler',
  Other: 'Diger',
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
      title: 'Varlik',
      key: 'asset',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ComputerDesktopIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.assetName}
            </div>
            <div className="text-xs text-slate-500">
              {record.assetCode || record.serialNumber || 'Kod yok'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Calisan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Tur',
      dataIndex: 'assetType',
      key: 'assetType',
      width: 120,
      render: (type: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
          {assetTypeLabels[type] || type}
        </span>
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
      filters: Object.entries(statusConfig).map(([value, config]) => ({ text: config.label, value })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const config = statusConfig[record.status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: record.status };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
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
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => onView(record.id),
              },
              {
                key: 'edit',
                label: 'Duzenle',
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
                    title: 'Varlik Atamasini Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-900" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.assetName}" varlik atamasini silmek istediginize emin misiniz?
                        </p>
                        <p className="text-sm text-slate-500 mt-2">Bu islem geri alinamaz.</p>
                      </div>
                    ),
                    okText: 'Sil',
                    okButtonProps: { danger: true },
                    cancelText: 'Iptal',
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} varlik`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <ComputerDesktopIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Varlik Bulunamadi</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun varlik bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
