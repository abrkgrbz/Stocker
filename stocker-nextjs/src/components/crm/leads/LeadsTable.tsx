'use client';

import React from 'react';
import { Table, Tag, Dropdown, Button, Avatar } from 'antd';
import {
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  StarOutlined,
  SwapOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Lead } from '@/lib/api/services/crm.service';
import { CRM_COLORS, CRM_STATUS_LABELS } from '@/lib/crm/constants';
import { formatDate } from '@/lib/crm/formatters';

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: number) => void;
  onConvert: (lead: Lead) => void;
}

// Source colors
const sourceColors: Record<Lead['source'], string> = {
  Website: 'blue',
  Referral: 'green',
  SocialMedia: 'cyan',
  Event: 'orange',
  Other: 'default',
};

export function LeadsTable({
  leads,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  onConvert,
}: LeadsTableProps) {
  const columns: ColumnsType<Lead> = [
    {
      title: 'İsim',
      key: 'name',
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'tr'),
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0"
            icon={<UserOutlined />}
          >
            {record.firstName.charAt(0)}{record.lastName.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {`${record.firstName} ${record.lastName}`}
            </div>
            {record.company && (
              <div className="text-xs text-gray-500 truncate">{record.company}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm flex items-center gap-2 text-gray-700">
            <MailOutlined className="text-blue-500" />
            <span className="truncate">{record.email}</span>
          </div>
          {record.phone && (
            <div className="text-xs flex items-center gap-2 text-gray-500">
              <PhoneOutlined className="text-green-500" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'Web Sitesi', value: 'Website' },
        { text: 'Referans', value: 'Referral' },
        { text: 'Sosyal Medya', value: 'SocialMedia' },
        { text: 'Etkinlik', value: 'Event' },
        { text: 'Diğer', value: 'Other' },
      ],
      onFilter: (value, record) => record.source === value,
      render: (source: Lead['source']) => (
        <Tag className="rounded-full px-3 py-1 font-medium border-0" color={sourceColors[source]}>
          {source}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Yeni', value: 'New' },
        { text: 'İletişime Geçildi', value: 'Contacted' },
        { text: 'Nitelikli', value: 'Qualified' },
        { text: 'Niteliksiz', value: 'Unqualified' },
        { text: 'Dönüştürüldü', value: 'Converted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Lead['status']) => {
        const color = CRM_COLORS.leads[status as keyof typeof CRM_COLORS.leads] || 'default';
        const label =
          CRM_STATUS_LABELS.leads[status as keyof typeof CRM_STATUS_LABELS.leads] || status;
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Puan',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => a.score - b.score,
      render: (score: number) => (
        <div className="flex items-center gap-1">
          <StarOutlined className={score >= 70 ? 'text-yellow-500' : 'text-gray-400'} />
          <span className={score >= 70 ? 'font-medium' : ''}>{score}</span>
        </div>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => formatDate(date),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => onEdit(record),
              },
              {
                key: 'convert',
                label: 'Müşteriye Dönüştür',
                icon: <SwapOutlined />,
                disabled: record.status === 'Converted',
                onClick: () => onConvert(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onDelete(record.id),
              },
            ],
            trigger: ['click'] as const,
          }}
        >
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100" />
        </Dropdown>
      ),
      width: 60,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={leads}
      rowKey="id"
      pagination={{
        current: currentPage,
        pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} potansiyel müşteri`,
        onChange: onPageChange,
      }}
      loading={loading}
      locale={{
        emptyText: 'Potansiyel müşteri bulunamadı',
        filterConfirm: 'Tamam',
        filterReset: 'Sıfırla',
        filterTitle: 'Filtrele',
      }}
      className="rounded-lg overflow-hidden"
      rowClassName="hover:bg-purple-50 transition-colors cursor-pointer"
    />
  );
}
