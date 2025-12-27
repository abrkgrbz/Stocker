'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  usePurchaseRequests,
  useDeletePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCancelPurchaseRequest,
  useConvertRequestToOrder,
} from '@/lib/api/hooks/usePurchase';
import type { PurchaseRequestListDto, PurchaseRequestStatus, PurchaseRequestPriority } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<PurchaseRequestStatus, string> = {
  Draft: 'default',
  Pending: 'orange',
  Approved: 'green',
  Rejected: 'red',
  Converted: 'blue',
  Cancelled: 'default',
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  Draft: 'Taslak',
  Pending: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Converted: 'Siparişe Dönüştürüldü',
  Cancelled: 'İptal',
};

const priorityColors: Record<PurchaseRequestPriority, string> = {
  Low: 'default',
  Normal: 'blue',
  High: 'orange',
  Urgent: 'red',
};

const priorityLabels: Record<PurchaseRequestPriority, string> = {
  Low: 'Düşük',
  Normal: 'Normal',
  High: 'Yüksek',
  Urgent: 'Acil',
};

export default function PurchaseRequestsPage() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseRequestStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<PurchaseRequestPriority | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: requestsData, isLoading, refetch } = usePurchaseRequests({
    searchTerm: searchText || undefined,
    status: statusFilter,
    priority: priorityFilter,
    fromDate: dateRange?.[0]?.toISOString(),
    toDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deleteRequest = useDeletePurchaseRequest();
  const submitRequest = useSubmitPurchaseRequest();
  const approveRequest = useApprovePurchaseRequest();
  const rejectRequest = useRejectPurchaseRequest();
  const cancelRequest = useCancelPurchaseRequest();
  const convertToOrder = useConvertRequestToOrder();

  const requests = requestsData?.items || [];
  const totalCount = requestsData?.totalCount || 0;

  // Statistics
  const stats = useMemo(() => {
    return {
      total: totalCount,
      pending: requests.filter(r => r.status === 'Pending').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      totalAmount: requests.reduce((sum, r) => sum + (r.estimatedTotalAmount || 0), 0),
    };
  }, [requests, totalCount]);

  const handleDelete = (record: PurchaseRequestListDto) => {
    confirm({
      title: 'Talebi Sil',
      icon: <ExclamationCircleIcon className="w-4 h-4" />,
      content: `"${record.requestNumber}" talebini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteRequest.mutate(record.id),
    });
  };

  const handleSubmit = (record: PurchaseRequestListDto) => {
    submitRequest.mutate(record.id);
  };

  const handleApprove = (record: PurchaseRequestListDto) => {
    approveRequest.mutate({ id: record.id });
  };

  const handleReject = (record: PurchaseRequestListDto) => {
    Modal.confirm({
      title: 'Talebi Reddet',
      icon: <XCircleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />,
      content: 'Bu talebi reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => rejectRequest.mutate({ id: record.id, reason: 'Manuel red' }),
    });
  };

  const handleCancel = (record: PurchaseRequestListDto) => {
    Modal.confirm({
      title: 'Talebi İptal Et',
      icon: <XCircleIcon className="w-4 h-4" style={{ color: '#ff4d4f' }} />,
      content: 'Bu talebi iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: () => cancelRequest.mutate({ id: record.id, reason: 'Manuel iptal' }),
    });
  };

  const handleConvertToOrder = (record: PurchaseRequestListDto) => {
    Modal.confirm({
      title: 'Siparişe Dönüştür',
      icon: <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
      content: 'Bu talebi satın alma siparişine dönüştürmek istiyor musunuz?',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      onOk: () => convertToOrder.mutate({ id: record.id, supplierId: '' }),
    });
  };

  const getActionMenu = (record: PurchaseRequestListDto) => {
    const items = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/purchase/requests/${record.id}`),
      },
      record.status === 'Draft' && {
        key: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        label: 'Düzenle',
        onClick: () => router.push(`/purchase/requests/${record.id}/edit`),
      },
      { type: 'divider' },
      record.status === 'Draft' && {
        key: 'submit',
        icon: <PaperAirplaneIcon className="w-4 h-4" />,
        label: 'Onaya Gönder',
        onClick: () => handleSubmit(record),
      },
      record.status === 'Pending' && {
        key: 'approve',
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: 'Onayla',
        onClick: () => handleApprove(record),
      },
      record.status === 'Pending' && {
        key: 'reject',
        icon: <XCircleIcon className="w-4 h-4" />,
        label: 'Reddet',
        danger: true,
        onClick: () => handleReject(record),
      },
      record.status === 'Approved' && {
        key: 'convert',
        icon: <ShoppingCartOutlined />,
        label: 'Siparişe Dönüştür',
        onClick: () => handleConvertToOrder(record),
      },
      { type: 'divider' },
      !['Cancelled', 'Converted'].includes(record.status) && {
        key: 'cancel',
        icon: <XCircleIcon className="w-4 h-4" />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record),
      },
      record.status === 'Draft' && {
        key: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record),
      },
    ].filter(Boolean) as MenuProps['items'];

    return { items };
  };

  const columns: ColumnsType<PurchaseRequestListDto> = [
    {
      title: 'Talep No',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      fixed: 'left',
      width: 150,
      render: (requestNumber, record) => (
        <div>
          <div className="font-medium text-blue-600">{requestNumber}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.requestDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Talep Eden',
      dataIndex: 'requestedByName',
      key: 'requestedByName',
      width: 150,
      render: (name, record) => (
        <div>
          <div className="font-medium text-gray-900">{name || '-'}</div>
          {record.departmentName && (
            <div className="text-xs text-gray-500">{record.departmentName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PurchaseRequestStatus) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: PurchaseRequestPriority) => (
        <Tag color={priorityColors[priority]}>
          {priorityLabels[priority] || priority}
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
      title: 'Tahmini Tutar',
      dataIndex: 'estimatedTotalAmount',
      key: 'estimatedTotalAmount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <div>
          <div className="font-medium">
            {(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency || '₺'}
          </div>
        </div>
      ),
    },
    {
      title: 'Gerekli Tarih',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
    },
    {
      title: '',
      key: 'actions',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} onClick={(e) => e.stopPropagation()} />
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
            <DocumentTextIcon className="w-4 h-4" className="text-purple-500" />
            Satın Alma Talepleri
          </Title>
          <Text type="secondary">Departmanlardan gelen satın alma taleplerini yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          size="large"
          onClick={() => router.push('/purchase/requests/new')}
        >
          Yeni Talep
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Toplam Talep"
              value={stats.total}
              valueStyle={{ color: '#8b5cf6' }}
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
              title="Onaylanan"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="Tahmini Tutar"
              value={stats.totalAmount}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Talep ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4" className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          <Select
            placeholder="Öncelik"
            allowClear
            style={{ width: 130 }}
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={Object.entries(priorityLabels).map(([value, label]) => ({
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
            <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} />
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
          dataSource={requests}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} talep`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/requests/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
