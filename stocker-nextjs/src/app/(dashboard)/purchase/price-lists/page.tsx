'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  Modal,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';
import {
  usePriceLists,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListListDto, PriceListStatus } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;

const statusConfig: Record<PriceListStatus, { color: string; text: string }> = {
  Draft: { color: 'default', text: 'Taslak' },
  PendingApproval: { color: 'orange', text: 'Onay Bekliyor' },
  Approved: { color: 'blue', text: 'Onaylandı' },
  Active: { color: 'green', text: 'Aktif' },
  Inactive: { color: 'gray', text: 'Pasif' },
  Expired: { color: 'red', text: 'Süresi Doldu' },
  Superseded: { color: 'purple', text: 'Yenilendi' },
  Rejected: { color: 'volcano', text: 'Reddedildi' },
};

export default function PriceListsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PriceListStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePriceLists({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeletePriceList();
  const activateMutation = useActivatePriceList();
  const deactivateMutation = useDeactivatePriceList();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Fiyat Listesi Silinecek',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu fiyat listesini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    if (isActive) {
      deactivateMutation.mutate(id);
    } else {
      activateMutation.mutate(id);
    }
  };

  const columns: ColumnsType<PriceListListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/purchase/price-lists/${record.id}`)}
          className="p-0 font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Liste Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180,
      render: (text) => text ? (
        <Space>
          <ShopOutlined className="text-gray-400" />
          {text}
        </Space>
      ) : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PriceListStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 120,
      align: 'center',
      render: (count) => <Tag color="blue">{count} ürün</Tag>,
    },
    {
      title: 'Geçerlilik',
      key: 'validity',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.effectiveFrom ? new Date(record.effectiveFrom).toLocaleDateString('tr-TR') : '-'}</div>
          <div className="text-gray-400">
            {record.effectiveTo ? new Date(record.effectiveTo).toLocaleDateString('tr-TR') : 'Süresiz'}
          </div>
        </div>
      ),
    },
    {
      title: 'Aktif',
      key: 'active',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'Active'}
          onChange={() => handleToggleStatus(record.id, record.status === 'Active')}
          loading={activateMutation.isPending || deactivateMutation.isPending}
          disabled={record.status === 'Expired'}
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeOutlined />,
                onClick: () => router.push(`/purchase/price-lists/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => router.push(`/purchase/price-lists/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const stats = {
    total: data?.totalCount || 0,
    active: data?.items?.filter(i => i.status === 'Active').length || 0,
    inactive: data?.items?.filter(i => i.status === 'Inactive').length || 0,
    expired: data?.items?.filter(i => i.status === 'Expired').length || 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="mb-1">Fiyat Listeleri</Title>
          <Text type="secondary">Tedarikçi fiyat listelerini yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/price-lists/new')}
        >
          Yeni Fiyat Listesi
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Toplam Liste"
              value={stats.total}
              prefix={<DollarOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Aktif"
              value={stats.active}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Pasif"
              value={stats.inactive}
              prefix={<CloseCircleOutlined className="text-gray-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Süresi Dolmuş"
              value={stats.expired}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm mb-6">
        <Space wrap size="middle">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Durum"
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={data?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.totalCount || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
}
