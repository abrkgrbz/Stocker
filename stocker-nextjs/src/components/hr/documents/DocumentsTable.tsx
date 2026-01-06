'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

interface DocumentsTableProps {
  documents: EmployeeDocumentDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (document: EmployeeDocumentDto) => Promise<void>;
}

const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Kartı',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Özgeçmiş',
  [DocumentType.EmploymentContract]: 'İş Sözleşmesi',
  [DocumentType.MedicalReport]: 'Sağlık Raporu',
  [DocumentType.CriminalRecord]: 'Sabıka Kaydı',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayıt Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotoğraf',
  [DocumentType.Other]: 'Diğer',
};

export function DocumentsTable({
  documents,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DocumentsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeDocumentDto> = [
    {
      title: 'Belge',
      key: 'document',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#3b82f615' }}
          >
            <DocumentIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.title}
            </div>
            <div className="text-xs text-gray-500">
              {record.documentNumber || 'Belge No: -'}
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
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 140,
      render: (type: DocumentType) => (
        <Tag>{documentTypeLabels[type] || 'Bilinmiyor'}</Tag>
      ),
    },
    {
      title: 'Son Geçerlilik',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
      sorter: (a, b) => {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return dayjs(a.expiryDate).unix() - dayjs(b.expiryDate).unix();
      },
      render: (date: string | undefined, record: EmployeeDocumentDto) => {
        if (!date) return <span className="text-gray-400">-</span>;
        const color = record.isExpired ? 'red' : record.isExpiringSoon ? 'orange' : 'default';
        return <Tag color={color}>{dayjs(date).format('DD.MM.YYYY')}</Tag>;
      },
    },
    {
      title: 'Doğrulama',
      key: 'verification',
      width: 120,
      filters: [
        { text: 'Doğrulandı', value: true },
        { text: 'Bekliyor', value: false },
      ],
      onFilter: (value, record) => record.isVerified === value,
      render: (_, record) => (
        <Tag
          color={record.isVerified ? 'green' : 'default'}
          icon={record.isVerified ? <CheckCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
        >
          {record.isVerified ? 'Doğrulandı' : 'Bekliyor'}
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
                    title: 'Belgeyi Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.title}" belgesini silmek istediğinize emin misiniz?
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
      dataSource={documents}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} belge`,
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
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Belge Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun belge bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
