'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { GrievanceDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface GrievancesTableProps {
  grievances: GrievanceDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (grievance: GrievanceDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  Open: 'processing',
  UnderReview: 'warning',
  Investigating: 'orange',
  PendingResolution: 'gold',
  Resolved: 'success',
  Closed: 'default',
  Escalated: 'red',
  Withdrawn: 'default',
};

const statusLabels: Record<string, string> = {
  Open: 'Açık',
  UnderReview: 'İnceleniyor',
  Investigating: 'Soruşturmada',
  PendingResolution: 'Çözüm Bekliyor',
  Resolved: 'Çözüldü',
  Closed: 'Kapatıldı',
  Escalated: 'Yükseltildi',
  Withdrawn: 'Geri Çekildi',
};

const priorityColors: Record<string, string> = {
  Low: 'default',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
};

const priorityLabels: Record<string, string> = {
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Critical: 'Kritik',
};

const grievanceTypeLabels: Record<string, string> = {
  Harassment: 'Taciz',
  Discrimination: 'Ayrımcılık',
  WorkplaceViolence: 'İşyeri Şiddeti',
  SafetyViolation: 'Güvenlik İhlali',
  WageDispute: 'Ücret Anlaşmazlığı',
  WorkConditions: 'Çalışma Koşulları',
  ManagementIssue: 'Yönetim Sorunu',
  PolicyViolation: 'Politika İhlali',
  Retaliation: 'Misilleme',
  Other: 'Diğer',
};

export function GrievancesTable({
  grievances,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: GrievancesTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<GrievanceDto> = [
    {
      title: 'Şikayet',
      key: 'grievance',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <ExclamationCircleIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.subject}
            </div>
            <div className="text-xs text-gray-500">
              {record.grievanceCode} • {grievanceTypeLabels[record.grievanceType] || record.grievanceType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Şikayet Eden',
      dataIndex: 'complainantName',
      key: 'complainantName',
      width: 150,
      sorter: (a, b) => (a.complainantName || '').localeCompare(b.complainantName || ''),
      render: (name: string, record) => (
        <span className="text-sm text-slate-700">
          {record.isAnonymous ? 'Anonim' : (name || '-')}
        </span>
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
      title: 'Başvuru Tarihi',
      dataIndex: 'filedDate',
      key: 'filedDate',
      width: 120,
      sorter: (a, b) => dayjs(a.filedDate).unix() - dayjs(b.filedDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{date ? dayjs(date).format('DD.MM.YYYY') : '-'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 140,
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
                    title: 'Şikayeti Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu şikayeti silmek istediğinize emin misiniz?
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
      dataSource={grievances}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} şikayet`,
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
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Şikayet Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun şikayet bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
