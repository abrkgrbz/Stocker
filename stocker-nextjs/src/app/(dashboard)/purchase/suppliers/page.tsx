'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Card,
  Typography,
  Tooltip,
  Modal,
  Select,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PhoneOutlined,
  MailOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useSuppliers,
  useDeleteSupplier,
  useActivateSupplier,
  useDeactivateSupplier,
  useBlockSupplier,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierListDto, SupplierStatus, SupplierType } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { confirm } = Modal;

const statusColors: Record<SupplierStatus, string> = {
  Active: 'green',
  Inactive: 'default',
  Blocked: 'red',
  PendingApproval: 'orange',
  OnHold: 'yellow',
};

const statusLabels: Record<SupplierStatus, string> = {
  Active: 'Aktif',
  Inactive: 'Pasif',
  Blocked: 'Bloklu',
  PendingApproval: 'Onay Bekliyor',
  OnHold: 'Beklemede',
};

const typeLabels: Record<SupplierType, string> = {
  Manufacturer: 'Üretici',
  Distributor: 'Distribütör',
  Wholesaler: 'Toptancı',
  Retailer: 'Perakendeci',
  ServiceProvider: 'Hizmet Sağlayıcı',
  Contractor: 'Yüklenici',
  Other: 'Diğer',
};

export default function SuppliersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<SupplierType | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: suppliersData, isLoading, refetch } = useSuppliers({
    search: searchText || undefined,
    status: statusFilter,
    supplierType: typeFilter,
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteSupplier = useDeleteSupplier();
  const activateSupplier = useActivateSupplier();
  const deactivateSupplier = useDeactivateSupplier();
  const blockSupplier = useBlockSupplier();

  const suppliers = suppliersData?.items || [];
  const totalCount = suppliersData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    const all = suppliers;
    return {
      total: totalCount,
      active: all.filter(s => s.status === 'Active').length,
      inactive: all.filter(s => s.status === 'Inactive').length,
      blocked: all.filter(s => s.status === 'Blocked').length,
    };
  }, [suppliers, totalCount]);

  const handleDelete = (record: SupplierListDto) => {
    confirm({
      title: 'Tedarikçiyi Sil',
      content: `"${record.name}" tedarikçisini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteSupplier.mutate(record.id),
    });
  };

  const handleStatusChange = (record: SupplierListDto, newStatus: 'activate' | 'deactivate' | 'block') => {
    if (newStatus === 'activate') {
      activateSupplier.mutate(record.id);
    } else if (newStatus === 'deactivate') {
      deactivateSupplier.mutate(record.id);
    } else if (newStatus === 'block') {
      Modal.confirm({
        title: 'Tedarikçiyi Blokla',
        content: 'Bu tedarikçiyi bloklamak istediğinizden emin misiniz?',
        okText: 'Blokla',
        okType: 'danger',
        cancelText: 'İptal',
        onOk: () => blockSupplier.mutate({ id: record.id, reason: 'Manual block' }),
      });
    }
  };

  const columns: ColumnsType<SupplierListDto> = [
    {
      title: 'Tedarikçi',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-xs text-gray-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'supplierType',
      key: 'supplierType',
      width: 130,
      render: (type: SupplierType) => (
        <Tag>{typeLabels[type] || type}</Tag>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          {record.contactPerson && (
            <div className="text-sm text-gray-700">{record.contactPerson}</div>
          )}
          {record.email && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MailOutlined />
              <span className="truncate max-w-[150px]">{record.email}</span>
            </div>
          )}
          {record.phone && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <PhoneOutlined />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city) => city || '-',
    },
    {
      title: 'Açık Sipariş',
      dataIndex: 'openOrderCount',
      key: 'openOrderCount',
      width: 110,
      align: 'center',
      render: (count) => (
        <span className={count > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Bakiye',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      width: 130,
      align: 'right',
      render: (balance) => (
        <span className={balance > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
          {(balance || 0).toLocaleString('tr-TR')} ₺
        </span>
      ),
    },
    {
      title: 'Puan',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      align: 'center',
      render: (rating) => (
        <span className="font-medium text-yellow-600">
          {rating?.toFixed(1) || '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: SupplierStatus) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/purchase/suppliers/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/purchase/suppliers/${record.id}/edit`),
              },
              { type: 'divider' },
              record.status !== 'Active' && {
                key: 'activate',
                icon: <CheckCircleOutlined />,
                label: 'Aktifleştir',
                onClick: () => handleStatusChange(record, 'activate'),
              },
              record.status === 'Active' && {
                key: 'deactivate',
                icon: <StopOutlined />,
                label: 'Devre Dışı Bırak',
                onClick: () => handleStatusChange(record, 'deactivate'),
              },
              record.status !== 'Blocked' && {
                key: 'block',
                icon: <StopOutlined />,
                label: 'Blokla',
                danger: true,
                onClick: () => handleStatusChange(record, 'block'),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ].filter(Boolean),
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="!mb-1 flex items-center gap-2">
            <ShopOutlined className="text-purple-500" />
            Tedarikçiler
          </Title>
          <Text type="secondary">Tedarikçi firmalarınızı yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/suppliers/new')}
        >
          Yeni Tedarikçi
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Toplam"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Aktif"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Pasif"
              value={stats.inactive}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Bloklu"
              value={stats.blocked}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Tedarikçi ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'Active', label: 'Aktif' },
              { value: 'Inactive', label: 'Pasif' },
              { value: 'Blocked', label: 'Bloklu' },
              { value: 'PendingApproval', label: 'Onay Bekliyor' },
              { value: 'OnHold', label: 'Beklemede' },
            ]}
          />

          <Select
            placeholder="Tip"
            allowClear
            style={{ width: 150 }}
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'Manufacturer', label: 'Üretici' },
              { value: 'Distributor', label: 'Distribütör' },
              { value: 'Wholesaler', label: 'Toptancı' },
              { value: 'Retailer', label: 'Perakendeci' },
              { value: 'ServiceProvider', label: 'Hizmet Sağlayıcı' },
              { value: 'Contractor', label: 'Yüklenici' },
              { value: 'Other', label: 'Diğer' },
            ]}
          />

          <div className="flex-1" />

          <Space>
            <Tooltip title="Yenile">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
            <Tooltip title="Dışa Aktar">
              <Button icon={<ExportOutlined />} />
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} tedarikçi`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/suppliers/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
