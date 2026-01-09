'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
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

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Open: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Acik' },
  UnderReview: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Inceleniyor' },
  Investigating: { bg: 'bg-slate-400', text: 'text-white', label: 'Sorusturmada' },
  PendingResolution: { bg: 'bg-slate-500', text: 'text-white', label: 'Cozum Bekliyor' },
  Resolved: { bg: 'bg-slate-900', text: 'text-white', label: 'Cozuldu' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Kapatildi' },
  Escalated: { bg: 'bg-slate-800', text: 'text-white', label: 'Yukseltildi' },
  Withdrawn: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Geri Cekildi' },
};

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Dusuk' },
  Medium: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Orta' },
  High: { bg: 'bg-slate-700', text: 'text-white', label: 'Yuksek' },
  Critical: { bg: 'bg-slate-900', text: 'text-white', label: 'Kritik' },
};

const grievanceTypeLabels: Record<string, string> = {
  Harassment: 'Taciz',
  Discrimination: 'Ayrimcilik',
  WorkplaceViolence: 'Isyeri Siddeti',
  SafetyViolation: 'Guvenlik Ihlali',
  WageDispute: 'Ucret Anlasmazligi',
  WorkConditions: 'Calisma Kosullari',
  ManagementIssue: 'Yonetim Sorunu',
  PolicyViolation: 'Politika Ihlali',
  Retaliation: 'Misilleme',
  Other: 'Diger',
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
      title: 'Sikayet',
      key: 'grievance',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {record.subject}
            </div>
            <div className="text-xs text-slate-500">
              {record.grievanceCode} - {grievanceTypeLabels[record.grievanceType] || record.grievanceType}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Sikayet Eden',
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
      title: 'Oncelik',
      key: 'priority',
      width: 100,
      filters: Object.entries(priorityConfig).map(([value, config]) => ({ text: config.label, value })),
      onFilter: (value, record) => record.priority === value,
      render: (_, record) => {
        const config = priorityConfig[record.priority] || { bg: 'bg-slate-100', text: 'text-slate-600', label: record.priority };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Basvuru Tarihi',
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
                    title: 'Sikayeti Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-900" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu sikayeti silmek istediginize emin misiniz?
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sikayet`,
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
              <ExclamationCircleIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Sikayet Bulunamadi</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun sikayet bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
