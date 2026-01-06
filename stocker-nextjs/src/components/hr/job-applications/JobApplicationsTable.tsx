'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { JobApplicationDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface JobApplicationsTableProps {
  applications: JobApplicationDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (application: JobApplicationDto) => Promise<void>;
}

const statusColors: Record<string, string> = {
  New: 'default',
  Screening: 'processing',
  Interview: 'blue',
  Assessment: 'cyan',
  Reference: 'gold',
  Offer: 'orange',
  Hired: 'success',
  Rejected: 'error',
  Withdrawn: 'default',
  OnHold: 'warning',
};

const statusLabels: Record<string, string> = {
  New: 'Yeni',
  Screening: 'Ön Eleme',
  Interview: 'Mülakat',
  Assessment: 'Değerlendirme',
  Reference: 'Referans',
  Offer: 'Teklif',
  Hired: 'İşe Alındı',
  Rejected: 'Reddedildi',
  Withdrawn: 'Geri Çekildi',
  OnHold: 'Beklemede',
};

const sourceLabels: Record<string, string> = {
  Website: 'Web Sitesi',
  LinkedIn: 'LinkedIn',
  Indeed: 'Indeed',
  Referral: 'Referans',
  Agency: 'Ajans',
  JobFair: 'Kariyer Fuarı',
  SocialMedia: 'Sosyal Medya',
  Direct: 'Doğrudan',
  Other: 'Diğer',
};

export function JobApplicationsTable({
  applications,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: JobApplicationsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<JobApplicationDto> = [
    {
      title: 'Aday',
      key: 'candidate',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#3b82f615' }}
          >
            <UserIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.fullName}
            </div>
            <div className="text-xs text-gray-500">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Pozisyon',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      width: 200,
      render: (title: string) => (
        <span className="text-sm text-slate-700">{title || '-'}</span>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => (
        <Tag>{sourceLabels[source] || source || '-'}</Tag>
      ),
    },
    {
      title: 'Başvuru Tarihi',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 120,
      sorter: (a, b) => dayjs(a.applicationDate).unix() - dayjs(b.applicationDate).unix(),
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
                    title: 'Başvuruyu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.fullName}" adayının başvurusunu silmek istediğinize emin misiniz?
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
      dataSource={applications}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} başvuru`,
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
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Başvuru Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun başvuru bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
