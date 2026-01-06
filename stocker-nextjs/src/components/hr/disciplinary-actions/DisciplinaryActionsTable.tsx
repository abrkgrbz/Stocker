'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
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

const statusColors: Record<string, string> = {
  Draft: 'default',
  UnderInvestigation: 'processing',
  PendingReview: 'warning',
  Approved: 'success',
  Implemented: 'success',
  Appealed: 'orange',
  Overturned: 'error',
  Closed: 'default',
};

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  UnderInvestigation: 'Soruşturmada',
  PendingReview: 'İnceleme Bekliyor',
  Approved: 'Onaylandı',
  Implemented: 'Uygulandı',
  Appealed: 'İtiraz Edildi',
  Overturned: 'İptal Edildi',
  Closed: 'Kapatıldı',
};

const severityColors: Record<string, string> = {
  Minor: 'blue',
  Moderate: 'orange',
  Major: 'red',
  Critical: 'magenta',
};

const severityLabels: Record<string, string> = {
  Minor: 'Hafif',
  Moderate: 'Orta',
  Major: 'Ağır',
  Critical: 'Kritik',
};

const actionTypeLabels: Record<string, string> = {
  VerbalWarning: 'Sözlü Uyarı',
  WrittenWarning: 'Yazılı Uyarı',
  FinalWarning: 'Son Uyarı',
  Suspension: 'Uzaklaştırma',
  Demotion: 'Kademe İndirimi',
  Termination: 'İş Akdi Feshi',
  ProbationExtension: 'Deneme Süresi Uzatma',
  TrainingRequired: 'Eğitim Gerekli',
  Other: 'Diğer',
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
      title: 'İşlem',
      key: 'action',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#ef444415' }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {actionTypeLabels[record.actionType] || record.actionType}
            </div>
            <div className="text-xs text-gray-500">
              {record.actionCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      sorter: (a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Şiddet',
      key: 'severity',
      width: 100,
      filters: Object.entries(severityLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.severityLevel === value,
      render: (_, record) => (
        <Tag color={severityColors[record.severityLevel] || 'default'}>
          {severityLabels[record.severityLevel] || record.severityLevel}
        </Tag>
      ),
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
                    title: 'Disiplin İşlemini Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          Bu disiplin işlemini silmek istediğinize emin misiniz?
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} işlem`,
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
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Disiplin İşlemi Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun disiplin işlemi bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
