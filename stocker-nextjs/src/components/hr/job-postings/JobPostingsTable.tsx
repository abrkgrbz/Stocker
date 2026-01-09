'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  EyeSlashIcon,
  StopCircleIcon,
  FireIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { JobPostingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface JobPostingsTableProps {
  postings: JobPostingDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (posting: JobPostingDto) => Promise<void>;
  onPublish?: (posting: JobPostingDto) => Promise<void>;
  onUnpublish?: (posting: JobPostingDto) => Promise<void>;
  onClose?: (posting: JobPostingDto) => Promise<void>;
}

const statusStyles: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Published: 'bg-slate-900 text-white',
  Closed: 'bg-slate-200 text-slate-500',
  OnHold: 'bg-slate-300 text-slate-700',
  Filled: 'bg-slate-700 text-white',
};

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  Published: 'Yayinda',
  Closed: 'Kapali',
  OnHold: 'Beklemede',
  Filled: 'Dolu',
};

const employmentTypeLabels: Record<string, string> = {
  FullTime: 'Tam Zamanli',
  PartTime: 'Yari Zamanli',
  Contract: 'Sozlesmeli',
  Temporary: 'Gecici',
  Intern: 'Stajyer',
  Freelance: 'Serbest',
};

const remoteLabels: Record<string, string> = {
  OnSite: 'Ofiste',
  Remote: 'Uzaktan',
  Hybrid: 'Hibrit',
};

export function JobPostingsTable({
  postings,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onClose,
}: JobPostingsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  };

  const columns: TableColumnsType<JobPostingDto> = [
    {
      title: 'Ilan',
      key: 'posting',
      fixed: 'left',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate flex items-center gap-1">
              {record.title}
              {record.isUrgent && (
                <Tooltip title="Acil">
                  <FireIcon className="w-4 h-4 text-slate-700" />
                </Tooltip>
              )}
              {record.isFeatured && (
                <Tooltip title="One Cikan">
                  <MapPinIcon className="w-4 h-4 text-slate-500" />
                </Tooltip>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {record.postingCode} - {employmentTypeLabels[record.employmentType] || record.employmentType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      width: 130,
      render: (_, record) => (
        <div>
          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
            record.remoteWorkType === 'Remote' ? 'bg-slate-900 text-white' :
            record.remoteWorkType === 'Hybrid' ? 'bg-slate-200 text-slate-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {remoteLabels[record.remoteWorkType] || record.remoteWorkType}
          </span>
          {record.city && (
            <div className="text-xs text-slate-400 mt-1">{record.city}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Maas Araligi',
      key: 'salary',
      width: 150,
      render: (_, record) => {
        if (!record.showSalary || (!record.salaryMin && !record.salaryMax)) {
          return <span className="text-slate-400">Belirtilmedi</span>;
        }
        return (
          <span className="text-sm text-slate-700">
            {formatCurrency(record.salaryMin)} - {formatCurrency(record.salaryMax)}
          </span>
        );
      },
    },
    {
      title: 'Basvuru',
      dataIndex: 'totalApplications',
      key: 'applications',
      width: 80,
      align: 'center',
      sorter: (a, b) => (a.totalApplications || 0) - (b.totalApplications || 0),
      render: (count: number) => (
        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Son Basvuru',
      dataIndex: 'applicationDeadline',
      key: 'deadline',
      width: 110,
      render: (date: string) => {
        if (!date) return <span className="text-slate-400">-</span>;
        const isExpired = dayjs(date).isBefore(dayjs());
        return (
          <span className={`text-sm ${isExpired ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
            {dayjs(date).format('DD.MM.YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 110,
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
      render: (_, record) => {
        const menuItems: any[] = [
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
        ];

        if (record.status === 'Draft' && onPublish) {
          menuItems.push({
            key: 'publish',
            label: 'Yayinla',
            icon: <PaperAirplaneIcon className="w-4 h-4" />,
            onClick: () => onPublish(record),
          });
        } else if (record.status === 'Published') {
          if (onUnpublish) {
            menuItems.push({
              key: 'unpublish',
              label: 'Yayindan Kaldir',
              icon: <EyeSlashIcon className="w-4 h-4" />,
              onClick: () => onUnpublish(record),
            });
          }
          if (onClose) {
            menuItems.push({
              key: 'close',
              label: 'Ilani Kapat',
              icon: <StopCircleIcon className="w-4 h-4" />,
              onClick: () => onClose(record),
            });
          }
        }

        menuItems.push({ type: 'divider' });
        menuItems.push({
          key: 'delete',
          label: 'Sil',
          icon: <TrashIcon className="w-4 h-4" />,
          danger: true,
          onClick: (e: { domEvent: { stopPropagation: () => void } }) => {
            e.domEvent.stopPropagation();
            Modal.confirm({
              title: 'Is Ilanini Sil',
              icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-700" />,
              content: (
                <div>
                  <p className="text-slate-600">
                    "{record.title}" ilanini silmek istediginize emin misiniz?
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
        });

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
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
      dataSource={postings}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ilan`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1300 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-slate-50',
      })}
      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Is Ilani Bulunamadi</h3>
            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun is ilani bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
