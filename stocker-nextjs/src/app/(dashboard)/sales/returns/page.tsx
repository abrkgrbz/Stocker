'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  DatePicker,
  Dropdown,
  Modal,
  message,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InboxOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  useSalesReturns,
  useApproveSalesReturn,
  useRejectSalesReturn,
  useReceiveSalesReturn,
  useCancelSalesReturn,
  useDeleteSalesReturn,
} from '@/lib/api/hooks/useSales';
import type {
  SalesReturnListItem,
  SalesReturnStatus,
  SalesReturnReason,
  GetSalesReturnsParams,
} from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<SalesReturnStatus, string> = {
  Draft: 'default',
  Submitted: 'processing',
  Approved: 'cyan',
  Rejected: 'error',
  Received: 'blue',
  Processing: 'geekblue',
  Completed: 'success',
  Cancelled: 'default',
};

const statusLabels: Record<SalesReturnStatus, string> = {
  Draft: 'Taslak',
  Submitted: 'Gönderildi',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Received: 'Teslim Alındı',
  Processing: 'İşleniyor',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const reasonLabels: Record<SalesReturnReason, string> = {
  Defective: 'Arızalı',
  WrongItem: 'Yanlış Ürün',
  NotAsDescribed: 'Tanımlandığı Gibi Değil',
  DamagedInTransit: 'Taşıma Hasarı',
  ChangedMind: 'Vazgeçme',
  Other: 'Diğer',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

const reasonOptions = Object.entries(reasonLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function SalesReturnsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetSalesReturnsParams>({
    page: 1,
    pageSize: 10,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<SalesReturnListItem | null>(null);

  const { data, isLoading, refetch } = useSalesReturns(filters);
  const approveMutation = useApproveSalesReturn();
  const rejectMutation = useRejectSalesReturn();
  const receiveMutation = useReceiveSalesReturn();
  const cancelMutation = useCancelSalesReturn();
  const deleteMutation = useDeleteSalesReturn();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('İade onaylandı');
    } catch {
      message.error('İade onaylanamadı');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await receiveMutation.mutateAsync(id);
      message.success('Ürünler teslim alındı');
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleRejectClick = (returnItem: SalesReturnListItem) => {
    setSelectedReturn(returnItem);
    setActionType('reject');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleCancelClick = (returnItem: SalesReturnListItem) => {
    setSelectedReturn(returnItem);
    setActionType('cancel');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedReturn || !actionReason.trim()) {
      message.error('Sebep girilmelidir');
      return;
    }
    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedReturn.id, reason: actionReason });
        message.success('İade reddedildi');
      } else if (actionType === 'cancel') {
        await cancelMutation.mutateAsync({ id: selectedReturn.id, reason: actionReason });
        message.success('İade iptal edildi');
      }
      setActionModalOpen(false);
      setSelectedReturn(null);
    } catch {
      message.error('İşlem gerçekleştirilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'İadeyi Sil',
      content: 'Bu iadeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('İade silindi');
        } catch {
          message.error('İade silinemedi');
        }
      },
    });
  };

  const returns = data?.items ?? [];

  const getActionMenu = (record: SalesReturnListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/returns/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/returns/${record.id}/edit`),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status === 'Submitted') {
      items.push(
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record),
        }
      );
    }

    if (record.status === 'Approved') {
      items.push({
        key: 'receive',
        icon: <InboxOutlined />,
        label: 'Teslim Al',
        onClick: () => handleReceive(record.id),
      });
    }

    if (!['Cancelled', 'Completed', 'Rejected'].includes(record.status)) {
      items.push({
        key: 'cancel',
        icon: <CloseOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancelClick(record),
      });
    }

    return items;
  };

  const columns: ColumnsType<SalesReturnListItem> = [
    {
      title: 'İade No',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/returns/${record.id}`)}>{text}</a>
      ),
      sorter: true,
    },
    {
      title: 'Sipariş',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/orders/${record.orderId}`)}>{text}</a>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Sebep',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: SalesReturnReason) => reasonLabels[reason],
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, record) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency || 'TRY' }).format(amount),
      sorter: true,
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesReturnStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange = (pagination: any, tableFilters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      status: tableFilters.status?.[0],
      sortBy: sorter.field,
      sortDescending: sorter.order === 'descend',
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Satış İadeleri</Title>
          <Text type="secondary">Müşteri iadelerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/sales/returns/new')}
          >
            Yeni İade
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Ara..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchTerm: e.target.value, page: 1 }))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              options={statusOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Sebep"
              allowClear
              style={{ width: '100%' }}
              options={reasonOptions}
              onChange={(value) => setFilters((prev) => ({ ...prev, reason: value, page: 1 }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: dates?.[0]?.toISOString(),
                  toDate: dates?.[1]?.toISOString(),
                  page: 1,
                }))
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={returns}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} iade`,
          }}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'İadeyi Reddet' : 'İadeyi İptal Et'}
        open={actionModalOpen}
        onOk={handleActionConfirm}
        onCancel={() => setActionModalOpen(false)}
        okText={actionType === 'reject' ? 'Reddet' : 'İptal Et'}
        okType="danger"
        cancelText="Vazgeç"
        confirmLoading={rejectMutation.isPending || cancelMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>
            <strong>{selectedReturn?.returnNumber}</strong> numaralı iadeyi {actionType === 'reject' ? 'reddetmek' : 'iptal etmek'} üzeresiniz.
          </Text>
        </div>
        <Input.TextArea
          placeholder="Sebebi giriniz..."
          rows={4}
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
