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
  SendOutlined,
  CopyOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  useQuotations,
  useApproveQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
  useCancelQuotation,
  useConvertQuotationToOrder,
  useDeleteQuotation,
} from '@/lib/api/hooks/useSales';
import type { QuotationListItem, QuotationStatus, GetQuotationsParams } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColors: Record<QuotationStatus, string> = {
  Draft: 'default',
  PendingApproval: 'processing',
  Approved: 'cyan',
  Sent: 'blue',
  Accepted: 'success',
  Rejected: 'error',
  Expired: 'warning',
  Cancelled: 'default',
  ConvertedToOrder: 'geekblue',
};

const statusLabels: Record<QuotationStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Sent: 'Gönderildi',
  Accepted: 'Kabul Edildi',
  Rejected: 'Reddedildi',
  Expired: 'Süresi Doldu',
  Cancelled: 'İptal',
  ConvertedToOrder: 'Siparişe Dönüştürüldü',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

export default function QuotationsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetQuotationsParams>({
    page: 1,
    pageSize: 10,
  });
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'cancel' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);

  const { data, isLoading, refetch } = useQuotations(filters);
  const approveMutation = useApproveQuotation();
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const cancelMutation = useCancelQuotation();
  const convertMutation = useConvertQuotationToOrder();
  const deleteMutation = useDeleteQuotation();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('Teklif onaylandı');
    } catch {
      message.error('Teklif onaylanamadı');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendMutation.mutateAsync(id);
      message.success('Teklif gönderildi');
    } catch {
      message.error('Teklif gönderilemedi');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptMutation.mutateAsync(id);
      message.success('Teklif kabul edildi');
    } catch {
      message.error('Teklif kabul edilemedi');
    }
  };

  const handleRejectClick = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setActionType('reject');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleCancelClick = (quotation: QuotationListItem) => {
    setSelectedQuotation(quotation);
    setActionType('cancel');
    setActionReason('');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedQuotation || !actionReason.trim()) {
      message.error('Sebep girilmelidir');
      return;
    }
    try {
      if (actionType === 'reject') {
        await rejectMutation.mutateAsync({ id: selectedQuotation.id, reason: actionReason });
        message.success('Teklif reddedildi');
      } else if (actionType === 'cancel') {
        await cancelMutation.mutateAsync({ id: selectedQuotation.id, reason: actionReason });
        message.success('Teklif iptal edildi');
      }
      setActionModalOpen(false);
      setSelectedQuotation(null);
    } catch {
      message.error(actionType === 'reject' ? 'Teklif reddedilemedi' : 'Teklif iptal edilemedi');
    }
  };

  const handleConvertToOrder = async (id: string) => {
    Modal.confirm({
      title: 'Siparişe Dönüştür',
      content: 'Bu teklifi siparişe dönüştürmek istediğinizden emin misiniz?',
      okText: 'Dönüştür',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await convertMutation.mutateAsync(id);
          message.success('Teklif siparişe dönüştürüldü');
        } catch {
          message.error('Teklif siparişe dönüştürülemedi');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Teklifi Sil',
      content: 'Bu teklifi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('Teklif silindi');
        } catch {
          message.error('Teklif silinemedi');
        }
      },
    });
  };

  const quotations = data?.items ?? [];

  const getActionMenu = (record: QuotationListItem): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/quotations/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/quotations/${record.id}/edit`),
        },
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: 'Onayla',
          onClick: () => handleApprove(record.id),
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

    if (record.status === 'Approved') {
      items.push({
        key: 'send',
        icon: <SendOutlined />,
        label: 'Gönder',
        onClick: () => handleSend(record.id),
      });
    }

    if (record.status === 'Sent') {
      items.push(
        {
          key: 'accept',
          icon: <CheckOutlined />,
          label: 'Kabul Et',
          onClick: () => handleAccept(record.id),
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

    if (record.status === 'Accepted') {
      items.push({
        key: 'convert',
        icon: <ShoppingCartOutlined />,
        label: 'Siparişe Dönüştür',
        onClick: () => handleConvertToOrder(record.id),
      });
    }

    items.push({
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Kopyala',
      onClick: () => router.push(`/sales/quotations/new?copyFrom=${record.id}`),
    });

    if (!['Cancelled', 'ConvertedToOrder', 'Rejected'].includes(record.status)) {
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

  const columns: ColumnsType<QuotationListItem> = [
    {
      title: 'Teklif No',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
      render: (text: string, record) => (
        <a onClick={() => router.push(`/sales/quotations/${record.id}`)}>{text}</a>
      ),
      sorter: true,
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'quotationDate',
      key: 'quotationDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
      sorter: true,
    },
    {
      title: 'Geçerlilik',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date: string | null) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Kalem',
      dataIndex: 'itemCount',
      key: 'itemCount',
      align: 'center',
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount: number, record) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount),
      sorter: true,
      align: 'right',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: QuotationStatus) => (
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
          <Title level={2} style={{ margin: 0 }}>Satış Teklifleri</Title>
          <Text type="secondary">Müşterilere sunulan teklifleri yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/sales/quotations/new')}
          >
            Yeni Teklif
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
          dataSource={quotations}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} teklif`,
          }}
        />
      </Card>

      {/* Action Modal */}
      <Modal
        title={actionType === 'reject' ? 'Teklifi Reddet' : 'Teklifi İptal Et'}
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
            <strong>{selectedQuotation?.quotationNumber}</strong> numaralı teklifi {actionType === 'reject' ? 'reddetmek' : 'iptal etmek'} üzeresiniz.
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
