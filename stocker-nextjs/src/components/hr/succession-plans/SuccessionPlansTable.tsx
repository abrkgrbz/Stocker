'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { SuccessionPlanDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface SuccessionPlansTableProps {
  plans: SuccessionPlanDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (plan: SuccessionPlanDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Draft: 'default',
  Active: 'processing',
  UnderReview: 'warning',
  Approved: 'success',
  Implemented: 'blue',
  Archived: 'default',
};

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Active: 'Aktif',
  UnderReview: 'İncelemede',
  Approved: 'Onaylandı',
  Implemented: 'Uygulandı',
  Archived: 'Arşivlendi',
};

const priorityColors: Record<string, string> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'blue',
  Low: 'default',
};

const priorityLabels: Record<string, string> = {
  Critical: 'Kritik',
  High: 'Yüksek',
  Medium: 'Orta',
  Low: 'Düşük',
};

export function SuccessionPlansTable({
  plans,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: SuccessionPlansTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<SuccessionPlanDto> = [
    {
      title: 'Pozisyon',
      key: 'position',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: record.isCriticalPosition ? '#ef444415' : '#7c3aed15' }}
          >
            <StarIcon className="w-5 h-5" style={{ color: record.isCriticalPosition ? '#ef4444' : '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
              {record.positionTitle}
              {record.isCriticalPosition && (
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {record.departmentName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mevcut Kişi',
      dataIndex: 'currentIncumbentName',
      key: 'currentIncumbentName',
      width: 150,
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={record.completionPercentage}
            size="small"
            status={record.hasReadyCandidate ? 'success' : 'active'}
          />
          <div className="text-xs text-gray-400 mt-1">
            {record.hasReadyCandidate ? 'Aday Hazır' : 'Aday Yok'}
          </div>
        </div>
      ),
    },
    {
      title: 'Öncelik',
      key: 'priority',
      width: 100,
      filters: Object.entries(priorityLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.priority === value,
      render: (_, record) => (
        <Tag color={priorityColors[record.priority] || 'default'}>
          {priorityLabels[record.priority] || record.priority}
        </Tag>
      ),
    },
    {
      title: 'Hedef Tarih',
      dataIndex: 'targetDate',
      key: 'targetDate',
      width: 120,
      sorter: (a, b) => {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return dayjs(a.targetDate).unix() - dayjs(b.targetDate).unix();
      },
      render: (date: string) => (
        <span className="text-sm text-slate-700">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
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
                    title: 'Yedekleme Planını Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu yedekleme planını silmek istediğinize emin misiniz?
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
      dataSource={plans}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} plan`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1100 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Yedekleme Planı Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun yedekleme planı bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
