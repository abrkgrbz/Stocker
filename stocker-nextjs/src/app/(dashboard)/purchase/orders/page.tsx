'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Button,
  Input,
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
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  PrinterOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useCancelPurchaseOrder,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseOrderListDto, PurchaseOrderStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<PurchaseOrderStatus, string> = {
  Draft: 'default',
  PendingApproval: 'orange',
  Confirmed: 'blue',
  Rejected: 'red',
  Sent: 'cyan',
  PartiallyReceived: 'geekblue',
  Received: 'purple',
  Completed: 'green',
  Cancelled: 'default',
  Closed: 'default',
};

const statusLabels: Record<PurchaseOrderStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Confirmed: 'Onaylandı',
  Rejected: 'Reddedildi',
  Sent: 'Gönderildi',
  PartiallyReceived: 'Kısmen Alındı',
  Received: 'Teslim Alındı',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
  Closed: 'Kapatıldı',
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierIdFromUrl = searchParams.get('supplierId');

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: ordersData, isLoading, refetch } = usePurchaseOrders({
    searchTerm: searchText || undefined,
    status: statusFilter,
    supplierId: supplierIdFromUrl || undefined,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteOrder = useDeletePurchaseOrder();
  const approveOrder = useApprovePurchaseOrder();
  const rejectOrder = useRejectPurchaseOrder();
  const sendOrder = useSendPurchaseOrder();
  const cancelOrder = useCancelPurchaseOrder();

  const orders = ordersData?.items || [];
  const totalCount = ordersData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pending: orders.filter(o => o.status === 'PendingApproval').length,
      sent: orders.filter(o => o.status === 'Sent' || o.status === 'Confirmed').length,
      totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };
  }, [orders, totalCount]);

  const handleDelete = (record: PurchaseOrderListDto) => {
    confirm({
      title: 'Siparişi Sil',
      content: `"${record.orderNumber}" siparişini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteOrder.mutate(record.id),
    });
  };

  const handleApprove = (record: PurchaseOrderListDto) => {
    approveOrder.mutate({ id: record.id });
  };

  const handleReject = (record: PurchaseOrderListDto) => {
    Modal.confirm({
      title: 'Siparişi Reddet',
      content: 'Bu siparişi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => rejectOrder.mutate({ id: record.id, reason: 'Manual rejection' }),
    });
  };

  const handleSend = (record: PurchaseOrderListDto) => {
    sendOrder.mutate(record.id);
  };

  const handleCancel = (record: PurchaseOrderListDto) => {
    Modal.confirm({
      title: 'Siparişi İptal Et',
      content: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelOrder.mutate({ id: record.id, reason: 'Manual cancellation' }),
    });
  };

  const getActionMenu = (record: PurchaseOrderListDto) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/purchase/orders/${record.id}`),
      },
      record.status === 'Draft' && {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Düzenle',
        onClick: () => router.push(`/purchase/orders/${record.id}/edit`),
      },
      { type: 'divider' },
      record.status === 'PendingApproval' && {
        key: 'approve',
        icon: <CheckCircleOutlined />,
        label: 'Onayla',
        onClick: () => handleApprove(record),
      },
      record.status === 'PendingApproval' && {
        key: 'reject',
        icon: <CloseCircleOutlined />,
        label: 'Reddet',
        danger: true,
        onClick: () => handleReject(record),
      },
      record.status === 'Confirmed' && {
        key: 'send',
        icon: <SendOutlined />,
        label: 'Tedarikçiye Gönder',
        onClick: () => handleSend(record),
      },
      {
        key: 'print',
        icon: <PrinterOutlined />,
        label: 'Yazdır',
      },
      { type: 'divider' },
      !['Cancelled', 'Completed', 'Closed'].includes(record.status) && {
        key: 'cancel',
        icon: <CloseCircleOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record),
      },
      record.status === 'Draft' && {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record),
      },
    ].filter(Boolean) as MenuProps['items'];

    return { items };
  };

  const columns: ColumnsType<PurchaseOrderListDto> = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      fixed: 'left',
      width: 150,
      render: (orderNumber, record) => (
        <div>
          <div className="font-medium text-blue-600">{orderNumber}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.orderDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
      render: (name) => (
        <div className="font-medium text-gray-900">{name}</div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PurchaseOrderStatus) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 80,
      align: 'center',
      render: (count) => count || 0,
    },
    {
      title: 'Toplam Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <div>
          <div className="font-medium">{(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}</div>
        </div>
      ),
    },
    {
      title: 'Beklenen Teslim',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 130,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
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
            <ShoppingCartOutlined className="text-green-500" />
            Satın Alma Siparişleri
          </Title>
          <Text type="secondary">Tedarikçilere verilen siparişleri yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/orders/new')}
        >
          Yeni Sipariş
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Toplam Sipariş"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Onay Bekleyen"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Gönderilen"
              value={stats.sent}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Toplam Tutar"
              value={stats.totalAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Sipariş ara..."
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
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          <RangePicker
            placeholder={['Başlangıç', 'Bitiş']}
            format="DD.MM.YYYY"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />

          <div className="flex-1" />

          <Tooltip title="Yenile">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
          </Tooltip>
          <Tooltip title="Dışa Aktar">
            <Button icon={<ExportOutlined />} />
          </Tooltip>
        </div>
      </Card>

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} sipariş`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/orders/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
