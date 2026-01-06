'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Progress, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { CertificationDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface CertificationsTableProps {
  certifications: CertificationDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (certification: CertificationDto) => Promise<void>;
}

const certificationTypeLabels: Record<string, string> = {
  Professional: 'Profesyonel',
  Technical: 'Teknik',
  Industry: 'Sektörel',
  Academic: 'Akademik',
  Government: 'Devlet',
  Vendor: 'Vendor/Ürün',
  Safety: 'Güvenlik',
  Quality: 'Kalite',
  Other: 'Diğer',
};

const getStatusInfo = (cert: CertificationDto) => {
  if (cert.isExpired) {
    return { color: 'red', text: 'Süresi Doldu', icon: <ExclamationCircleIcon className="w-3 h-3" /> };
  }
  if (cert.isExpiringSoon) {
    return { color: 'orange', text: 'Yakında Dolacak', icon: <ExclamationTriangleIcon className="w-3 h-3" /> };
  }
  return { color: 'green', text: 'Geçerli', icon: <CheckCircleIcon className="w-3 h-3" /> };
};

export function CertificationsTable({
  certifications,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: CertificationsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<CertificationDto> = [
    {
      title: 'Sertifika',
      key: 'certification',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <ShieldCheckIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.certificationName}
            </div>
            <div className="text-xs text-gray-500">
              {record.employeeName}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Veren Kurum',
      key: 'authority',
      width: 160,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-700">{record.issuingAuthority || '-'}</div>
          {record.issuingCountry && (
            <div className="text-xs text-gray-400">{record.issuingCountry}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'certificationType',
      key: 'type',
      width: 120,
      filters: Object.entries(certificationTypeLabels).map(([value, label]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.certificationType === value,
      render: (type: string) => (
        <Tag>{certificationTypeLabels[type] || type}</Tag>
      ),
    },
    {
      title: 'Tarihler',
      key: 'dates',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-600">{dayjs(record.issueDate).format('DD.MM.YYYY')}</div>
          {record.expiryDate && (
            <div className="text-xs text-gray-400">→ {dayjs(record.expiryDate).format('DD.MM.YYYY')}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Eğitim',
      key: 'training',
      width: 100,
      render: (_, record) => {
        if (!record.trainingRequired) return <span className="text-gray-400">-</span>;
        const completed = record.completedTrainingHours || 0;
        const total = record.totalTrainingHours || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return (
          <Tooltip title={`${completed}/${total} saat`}>
            <Progress percent={percent} size="small" />
          </Tooltip>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Geçerli', value: 'valid' },
        { text: 'Yakında Dolacak', value: 'expiring' },
        { text: 'Süresi Dolmuş', value: 'expired' },
      ],
      onFilter: (value, record) => {
        if (value === 'expired') return record.isExpired;
        if (value === 'expiring') return record.isExpiringSoon && !record.isExpired;
        return !record.isExpired && !record.isExpiringSoon;
      },
      render: (_, record) => {
        const status = getStatusInfo(record);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Link',
      key: 'link',
      width: 60,
      align: 'center',
      render: (_, record) => {
        if (!record.verificationUrl) return <span className="text-gray-400">-</span>;
        return (
          <Tooltip title="Doğrulama Linki">
            <a
              href={record.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon className="w-4 h-4" />
            </a>
          </Tooltip>
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
                    title: 'Sertifikayı Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.certificationName}" sertifikasını silmek istediğinize emin misiniz?
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
      dataSource={certifications}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sertifika`,
        pageSizeOptions: ['10', '20', '50', '100'],
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1200 }}
      onRow={(record) => ({
        onClick: () => onView(record.id),
        className: 'cursor-pointer hover:bg-gray-50',
      })}
      locale={{
        emptyText: (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Sertifika Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun sertifika bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
