'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
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

const statusStyles: Record<string, string> = {
  New: 'bg-slate-100 text-slate-600',
  Screening: 'bg-slate-200 text-slate-700',
  Interview: 'bg-slate-300 text-slate-700',
  Assessment: 'bg-slate-400 text-white',
  Reference: 'bg-slate-500 text-white',
  Offer: 'bg-slate-600 text-white',
  Hired: 'bg-slate-900 text-white',
  Rejected: 'bg-slate-200 text-slate-500',
  Withdrawn: 'bg-slate-100 text-slate-400',
  OnHold: 'bg-slate-300 text-slate-600',
};

const statusLabels: Record<string, string> = {
  New: 'Yeni',
  Screening: 'On Eleme',
  Interview: 'Mulakat',
  Assessment: 'Degerlendirme',
  Reference: 'Referans',
  Offer: 'Teklif',
  Hired: 'Ise Alindi',
  Rejected: 'Reddedildi',
  Withdrawn: 'Geri Cekildi',
  OnHold: 'Beklemede',
};

const sourceLabels: Record<string, string> = {
  Website: 'Web Sitesi',
  LinkedIn: 'LinkedIn',
  Indeed: 'Indeed',
  Referral: 'Referans',
  Agency: 'Ajans',
  JobFair: 'Kariyer Fuari',
  SocialMedia: 'Sosyal Medya',
  Direct: 'Dogrudan',
  Other: 'Diger',
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
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.fullName}
            </div>
            <div className="text-xs text-slate-400">
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
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
          {sourceLabels[source] || source || '-'}
        </span>
      ),
    },
    {
      title: 'Basvuru Tarihi',
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
        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${statusStyles[record.status] || 'bg-slate-100 text-slate-600'}`}>
          {statusLabels[record.status] || record.status}
        </span>
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
                    title: 'Basvuruyu Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-700" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.fullName}" adayinin basvurusunu silmek istediginize emin misiniz?
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} basvuru`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Basvuru Bulunamadi</h3>
            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun basvuru bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
