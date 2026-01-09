'use client';

import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { DisciplinaryActionDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface DisciplinaryActionsTableProps {
  actions: DisciplinaryActionDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (action: DisciplinaryActionDto) => Promise<void>;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  UnderInvestigation: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Sorusturmada' },
  PendingReview: { bg: 'bg-slate-400', text: 'text-white', label: 'Inceleme Bekliyor' },
  Approved: { bg: 'bg-slate-700', text: 'text-white', label: 'Onaylandi' },
  Implemented: { bg: 'bg-slate-900', text: 'text-white', label: 'Uygulandi' },
  Appealed: { bg: 'bg-slate-500', text: 'text-white', label: 'Itiraz Edildi' },
  Overturned: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Iptal Edildi' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatildi' },
};

const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  Minor: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Hafif' },
  Moderate: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Orta' },
  Major: { bg: 'bg-slate-700', text: 'text-white', label: 'Agir' },
  Critical: { bg: 'bg-slate-900', text: 'text-white', label: 'Kritik' },
};

const actionTypeLabels: Record<string, string> = {
  VerbalWarning: 'Sozlu Uyari',
  WrittenWarning: 'Yazili Uyari',
  FinalWarning: 'Son Uyari',
  Suspension: 'Uzaklastirma',
  Demotion: 'Kademe Indirimi',
  Termination: 'Is Akdi Feshi',
  ProbationExtension: 'Deneme Suresi Uzatma',
  TrainingRequired: 'Egitim Gerekli',
  Other: 'Diger',
};

export function DisciplinaryActionsTable({
  actions,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DisciplinaryActionsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<DisciplinaryActionDto> = [
    {
      title: 'Islem',
      key: 'action',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">
              {actionTypeLabels[record.actionType] || record.actionType}
            </div>
            <div className="text-xs text-slate-500">
              {record.actionCode}
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
      title: 'Siddet',
      key: 'severity',
      width: 100,
      filters: Object.entries(severityConfig).map(([value, config]) => ({ text: config.label, value })),
      onFilter: (value, record) => record.severityLevel === value,
      render: (_, record) => {
        const config = severityConfig[record.severityLevel] || { bg: 'bg-slate-100', text: 'text-slate-600', label: record.severityLevel };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Olay Tarihi',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      width: 120,
      sorter: (a, b) => dayjs(a.incidentDate).unix() - dayjs(b.incidentDate).unix(),
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
                    title: 'Disiplin Islemini Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-slate-900" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu disiplin islemini silmek istediginize emin misiniz?
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
      dataSource={actions}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} islem`,
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
              <ExclamationTriangleIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Disiplin Islemi Bulunamadi</h3>
            <p className="text-slate-500">Arama kriterlerinize uygun disiplin islemi bulunamadi</p>
          </div>
        ),
      }}
    />
  );
}
