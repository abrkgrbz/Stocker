'use client';

import React, { useState } from 'react';
import { Table, Tag, Dropdown, Modal, Progress } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  WrenchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeSkillDto } from '@/lib/api/services/hr.types';

interface EmployeeSkillsTableProps {
  skills: EmployeeSkillDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete?: (skill: EmployeeSkillDto) => Promise<void>;
}

const proficiencyColors: Record<string, string> = {
  Beginner: 'default',
  Elementary: 'blue',
  Intermediate: 'cyan',
  Advanced: 'green',
  Expert: 'gold',
  Master: 'red',
};

const proficiencyPercent: Record<string, number> = {
  Beginner: 16,
  Elementary: 33,
  Intermediate: 50,
  Advanced: 66,
  Expert: 83,
  Master: 100,
};

const proficiencyLabels: Record<string, string> = {
  Beginner: 'Başlangıç',
  Elementary: 'Temel',
  Intermediate: 'Orta',
  Advanced: 'İleri',
  Expert: 'Uzman',
  Master: 'Usta',
};

export function EmployeeSkillsTable({
  skills,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: EmployeeSkillsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: TableColumnsType<EmployeeSkillDto> = [
    {
      title: 'Yetkinlik',
      key: 'skill',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#7c3aed15' }}
          >
            <WrenchIcon className="w-5 h-5" style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.skillName}
            </div>
            <div className="text-xs text-gray-500">
              {record.category || 'Kategori belirtilmemiş'}
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
      render: (name: string) => (
        <span className="text-sm text-slate-700">{name || '-'}</span>
      ),
    },
    {
      title: 'Seviye',
      key: 'proficiency',
      width: 150,
      filters: Object.entries(proficiencyLabels).map(([value, label]) => ({ text: label, value })),
      onFilter: (value, record) => record.proficiencyLevel === value,
      render: (_, record) => (
        <div style={{ minWidth: 100 }}>
          <Tag color={proficiencyColors[record.proficiencyLevel] || 'default'}>
            {proficiencyLabels[record.proficiencyLevel] || record.proficiencyLevel}
          </Tag>
          <Progress
            percent={proficiencyPercent[record.proficiencyLevel] || 0}
            size="small"
            showInfo={false}
            className="mt-1"
          />
        </div>
      ),
    },
    {
      title: 'Deneyim',
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      width: 100,
      sorter: (a, b) => (a.yearsOfExperience || 0) - (b.yearsOfExperience || 0),
      render: (years: number) => (
        <span className="text-sm text-slate-600">{years ? `${years} yıl` : '-'}</span>
      ),
    },
    {
      title: 'Sertifikalı',
      dataIndex: 'isCertified',
      key: 'isCertified',
      width: 100,
      filters: [
        { text: 'Evet', value: true },
        { text: 'Hayır', value: false },
      ],
      onFilter: (value, record) => record.isCertified === value,
      render: (val: boolean) => (
        <Tag color={val ? 'success' : 'default'}>{val ? 'Evet' : 'Hayır'}</Tag>
      ),
    },
    {
      title: 'Doğrulanmış',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 110,
      filters: [
        { text: 'Evet', value: true },
        { text: 'Hayır', value: false },
      ],
      onFilter: (value, record) => record.isVerified === value,
      render: (val: boolean) => (
        <Tag
          color={val ? 'green' : 'default'}
          icon={val ? <CheckCircleIcon className="w-3 h-3" /> : undefined}
        >
          {val ? 'Evet' : 'Hayır'}
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
                    title: 'Yetkinliği Sil',
                    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
                    content: (
                      <div>
                        <p className="text-slate-600">
                          "{record.skillName}" yetkinliğini silmek istediğinize emin misiniz?
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
      dataSource={skills}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} yetkinlik`,
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
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Yetkinlik Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun yetkinlik bulunamadı</p>
          </div>
        ),
      }}
    />
  );
}
