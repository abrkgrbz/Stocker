'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BellIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface AnnouncementsTableProps {
  announcements: AnnouncementDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (announcement: AnnouncementDto) => Promise<void>;
}

const priorityConfig: Record<string, { color: string; text: string }> = {
  Low: { color: 'default', text: 'Düşük' },
  Normal: { color: 'blue', text: 'Normal' },
  High: { color: 'orange', text: 'Yüksek' },
  Urgent: { color: 'red', text: 'Acil' },
};

export function AnnouncementsTable({
  announcements,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: AnnouncementsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<AnnouncementDto> = [
    {
      title: 'Duyuru',
      key: 'announcement',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <BellIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
              {record.isPinned && <MapPinIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />}
              {record.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {record.content?.substring(0, 60)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Yazar',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 150,
      render: (author: string) => (
        <span className="text-sm text-slate-600">{author || '-'}</span>
      ),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      filters: [
        { text: 'Düşük', value: 'Low' },
        { text: 'Normal', value: 'Normal' },
        { text: 'Yüksek', value: 'High' },
        { text: 'Acil', value: 'Urgent' },
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority: string) => {
        const config = priorityConfig[priority] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Yayın Tarihi',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
      sorter: (a, b) => dayjs(a.publishDate).unix() - dayjs(b.publishDate).unix(),
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Hedef',
      dataIndex: 'targetDepartmentName',
      key: 'target',
      width: 130,
      render: (dept: string) => (
        <span className="text-sm text-slate-600">{dept || 'Tüm Şirket'}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Yayında', value: 'published' },
        { text: 'Taslak', value: 'draft' },
      ],
      onFilter: (value, record) => value === 'published' ? record.isPublished : !record.isPublished,
      render: (_, record) => (
        <Tag color={record.isPublished ? 'green' : 'default'}>
          {record.isPublished ? 'Yayında' : 'Taslak'}
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
                    title: 'Duyuruyu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" duyurusunu silmek istediğinize emin misiniz?
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
      dataSource={announcements}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} duyuru`,
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
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Duyuru Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun duyuru bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
