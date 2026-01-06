'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface TrainingsTableProps {
  trainings: TrainingDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (training: TrainingDto) => Promise<void>;
}

const getStatusConfig = (status?: TrainingStatus) => {
  const statusMap: Record<number, { color: string; text: string }> = {
    [TrainingStatus.Scheduled]: { color: 'blue', text: 'Planlandı' },
    [TrainingStatus.InProgress]: { color: 'green', text: 'Devam Ediyor' },
    [TrainingStatus.Completed]: { color: 'default', text: 'Tamamlandı' },
    [TrainingStatus.Cancelled]: { color: 'red', text: 'İptal Edildi' },
    [TrainingStatus.Postponed]: { color: 'orange', text: 'Ertelendi' },
  };
  const defaultConfig = { color: 'default', text: '-' };
  if (status === undefined || status === null) return defaultConfig;
  return statusMap[status] || defaultConfig;
};

export function TrainingsTable({
  trainings,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: TrainingsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<TrainingDto> = [
    {
      title: 'Eğitim',
      key: 'training',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <BookOpenIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.title}
            </div>
            <div className="text-xs text-gray-500">
              {record.provider || 'Sağlayıcı belirtilmemiş'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tarih Aralığı',
      key: 'dateRange',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-700">
            {record.startDate ? dayjs(record.startDate).format('DD.MM.YYYY') : '-'}
          </div>
          <div className="text-xs text-gray-500">
            {record.endDate ? `→ ${dayjs(record.endDate).format('DD.MM.YYYY')}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Kapasite',
      key: 'capacity',
      width: 120,
      render: (_, record) => {
        const current = record.currentParticipants || 0;
        const max = record.maxParticipants || 0;
        const percentage = max > 0 ? (current / max) * 100 : 0;
        return (
          <div>
            <span className="text-sm text-slate-700">
              {current}/{max || '-'}
            </span>
            {max > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: percentage >= 100 ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Süre',
      dataIndex: 'durationHours',
      key: 'durationHours',
      width: 100,
      render: (hours: number) => (
        <span className="text-sm text-slate-600">{hours ? `${hours} saat` : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Planlandı', value: TrainingStatus.Scheduled },
        { text: 'Devam Ediyor', value: TrainingStatus.InProgress },
        { text: 'Tamamlandı', value: TrainingStatus.Completed },
        { text: 'İptal Edildi', value: TrainingStatus.Cancelled },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        const config = getStatusConfig(record.status);
        return <Tag color={config.color}>{config.text}</Tag>;
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
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: 'Eğitimi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" eğitimini silmek istediğinize emin misiniz?
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
      dataSource={trainings}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} eğitim`,
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
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Eğitim Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun eğitim bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
