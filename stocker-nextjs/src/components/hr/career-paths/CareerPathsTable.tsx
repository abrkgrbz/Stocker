'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import type { CareerPathDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface CareerPathsTableProps {
  careerPaths: CareerPathDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (careerPath: CareerPathDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Draft: 'default',
  Active: 'processing',
  OnTrack: 'success',
  AtRisk: 'warning',
  Completed: 'success',
  Cancelled: 'error',
  OnHold: 'default',
};

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Active: 'Aktif',
  OnTrack: 'Yolunda',
  AtRisk: 'Risk Altında',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
  OnHold: 'Beklemede',
};

export function CareerPathsTable({
  careerPaths,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: CareerPathsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<CareerPathDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      fixed: 'left',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <RocketLaunchIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.employeeName}
            </div>
            <div className="text-xs text-gray-500">
              {record.pathName || record.careerTrack}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mevcut Pozisyon',
      dataIndex: 'currentPositionName',
      key: 'currentPositionName',
      width: 180,
      render: (position: string, record) => (
        <div>
          <div className="text-sm text-slate-700">{position || '-'}</div>
          <div className="text-xs text-gray-400">Seviye {record.currentLevel}</div>
        </div>
      ),
    },
    {
      title: 'Hedef Pozisyon',
      dataIndex: 'targetPositionName',
      key: 'targetPositionName',
      width: 180,
      render: (position: string, record) => (
        <div>
          <div className="text-sm text-slate-700">{position || '-'}</div>
          {record.targetLevel && (
            <div className="text-xs text-gray-400">Seviye {record.targetLevel}</div>
          )}
        </div>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.progressPercentage || 0}
            size="small"
            status={record.status === 'AtRisk' ? 'exception' : undefined}
          />
          {record.readyForPromotion && (
            <Tag color="gold" className="mt-1" icon={<ArrowTrendingUpIcon className="w-3 h-3" />}>
              Terfi Hazır
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Mentor',
      dataIndex: 'mentorName',
      key: 'mentorName',
      width: 150,
      render: (mentor: string) => (
        <span className="text-sm text-slate-600">{mentor || '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Aktif', value: 'Active' },
        { text: 'Yolunda', value: 'OnTrack' },
        { text: 'Risk Altında', value: 'AtRisk' },
        { text: 'Tamamlandı', value: 'Completed' },
      ],
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
                disabled: record.status === 'Completed',
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
                    title: 'Kariyer Planını Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.employeeName}" için kariyer planını silmek istediğinize emin misiniz?
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
      dataSource={careerPaths}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kariyer planı`,
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
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Kariyer Planı Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun kariyer planı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
