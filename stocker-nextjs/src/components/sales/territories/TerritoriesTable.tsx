'use client';

/**
 * Sales Territories Table Component
 * Enterprise-grade design following Linear/Stripe/Vercel principles
 */

import React from 'react';
import { Table, Dropdown, Button } from 'antd';
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, TeamOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import type { SalesTerritoryListDto, TerritoryType, TerritoryStatus } from '@/lib/api/services/sales.service';
import { Badge } from '@/components/ui/enterprise-page';

interface TerritoriesTableProps {
  territories: SalesTerritoryListDto[];
  loading?: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number, size: number) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeLabels: Record<TerritoryType, string> = {
  Country: 'Ülke',
  Region: 'Bölge',
  City: 'Şehir',
  District: 'İlçe',
  Zone: 'Zon',
  Custom: 'Özel',
};

const statusLabels: Record<TerritoryStatus, string> = {
  Active: 'Aktif',
  Inactive: 'Pasif',
  Suspended: 'Askıda',
};

export function TerritoriesTable({
  territories,
  loading = false,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onActivate,
  onDeactivate,
  onDelete,
}: TerritoriesTableProps) {
  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`/sales/territories/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/sales/territories/${id}/edit`);
  };

  const getActionMenu = (record: SalesTerritoryListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => handleView(record.id),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Düzenle',
        onClick: () => handleEdit(record.id),
      },
    ];

    // Status actions
    if (record.status !== 'Active' && onActivate) {
      items.push({
        key: 'activate',
        icon: <CheckCircleOutlined />,
        label: 'Aktifleştir',
        onClick: () => onActivate(record.id),
      });
    }

    if (record.status === 'Active' && onDeactivate) {
      items.push({
        key: 'deactivate',
        icon: <StopOutlined />,
        label: 'Pasifleştir',
        onClick: () => onDeactivate(record.id),
      });
    }

    if (onDelete) {
      items.push(
        { type: 'divider' },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Sil',
          danger: true,
          onClick: () => onDelete(record.id),
        }
      );
    }

    return items;
  };

  const columns: ColumnsType<SalesTerritoryListDto> = [
    {
      title: 'Bölge Kodu',
      dataIndex: 'territoryCode',
      key: 'territoryCode',
      render: (text: string, record) => (
        <button
          onClick={() => handleView(record.id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Bölge Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="text-slate-900 font-medium">{text}</span>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'territoryType',
      key: 'territoryType',
      render: (type: TerritoryType) => (
        <span className="text-slate-600">{typeLabels[type] || type}</span>
      ),
    },
    {
      title: 'Bölge / Şehir',
      key: 'location',
      render: (_, record) => (
        <span className="text-slate-600">
          {[record.region, record.city].filter(Boolean).join(' / ') || '-'}
        </span>
      ),
    },
    {
      title: 'Yönetici',
      dataIndex: 'territoryManagerName',
      key: 'territoryManagerName',
      render: (text: string | null) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Temsilci',
      dataIndex: 'activeAssignmentCount',
      key: 'activeAssignmentCount',
      render: (count: number) => (
        <div className="flex items-center gap-1 text-slate-600">
          <TeamOutlined />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerCount',
      key: 'customerCount',
      render: (count: number) => (
        <span className="text-slate-600">{count || 0}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: TerritoryStatus) => (
        <Badge variant={status === 'Active' ? 'success' : status === 'Suspended' ? 'warning' : 'default'}>
          {statusLabels[status]}
        </Badge>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} className="text-slate-400 hover:text-slate-600" />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={territories}
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: totalCount,
        showSizeChanger: true,
        showTotal: (total) => `Toplam ${total} bölge`,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      className="enterprise-table"
    />
  );
}
