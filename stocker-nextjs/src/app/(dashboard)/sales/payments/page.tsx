'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Typography,
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Select,
  DatePicker,
  Row,
  Col,
  Dropdown,
  Modal,
  message,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  usePayments,
  useDeletePayment,
  useConfirmPayment,
  useCompletePayment,
  useRejectPayment,
} from '@/lib/api/hooks/usePayments';
import type { PaymentListItem, PaymentStatus, PaymentMethod, GetPaymentsParams } from '@/lib/api/services/payment.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<PaymentStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'orange', label: 'Bekliyor', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  Confirmed: { color: 'blue', label: 'Onaylandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Completed: { color: 'green', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <XCircleIcon className="w-4 h-4" /> },
  Refunded: { color: 'purple', label: 'İade Edildi', icon: <ArrowUturnLeftIcon className="w-4 h-4" /> },
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  DebitCard: 'Banka Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Pending', label: 'Bekliyor' },
  { value: 'Confirmed', label: 'Onaylandı' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Refunded', label: 'İade Edildi' },
];

const methodOptions = [
  { value: '', label: 'Tüm Yöntemler' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'DebitCard', label: 'Banka Kartı' },
  { value: 'Check', label: 'Çek' },
  { value: 'DirectDebit', label: 'Otomatik Ödeme' },
  { value: 'Other', label: 'Diğer' },
];

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState<GetPaymentsParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    method: searchParams.get('method') || '',
    sortBy: 'PaymentDate',
    sortDescending: true,
  });

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // API hooks
  const { data, isLoading, refetch } = usePayments(filters);
  const deletePayment = useDeletePayment();
  const confirmPayment = useConfirmPayment();
  const completePayment = useCompletePayment();
  const rejectPayment = useRejectPayment();

  const payments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const handleMethodChange = (value: string) => {
    setFilters((prev) => ({ ...prev, method: value, page: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setFilters((prev) => ({
        ...prev,
        fromDate: dates[0]?.toISOString(),
        toDate: dates[1]?.toISOString(),
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
      }));
    }
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'PaymentDate',
      sortDescending: sorter.order === 'descend',
    }));
  };

  const handleConfirm = async (id: string) => {
    try {
      await confirmPayment.mutateAsync(id);
      message.success('Ödeme onaylandı');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Onaylama başarısız');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completePayment.mutateAsync(id);
      message.success('Ödeme tamamlandı');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Tamamlama başarısız');
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedPaymentId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedPaymentId || !rejectReason.trim()) {
      message.error('Lütfen red sebebi girin');
      return;
    }

    try {
      await rejectPayment.mutateAsync({ id: selectedPaymentId, reason: rejectReason });
      message.success('Ödeme reddedildi');
      setRejectModalOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Red işlemi başarısız');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Ödemeyi Sil',
      content: 'Bu ödemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deletePayment.mutateAsync(id);
          message.success('Ödeme silindi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Silme işlemi başarısız');
        }
      },
    });
  };

  const getActionItems = (record: PaymentListItem) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/payments/${record.id}`),
      },
    ];

    if (record.status === 'Pending') {
      items.push(
        {
          key: 'edit',
          icon: <PencilIcon className="w-4 h-4" />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/payments/${record.id}/edit`),
        },
        {
          key: 'confirm',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          label: 'Onayla',
          onClick: () => handleConfirm(record.id),
        },
        {
          key: 'reject',
          icon: <XCircleIcon className="w-4 h-4" />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record.id),
        },
        {
          type: 'divider',
        },
        {
          key: 'delete',
          icon: <TrashIcon className="w-4 h-4" />,
          label: 'Sil',
          danger: true,
          onClick: () => handleDelete(record.id),
        }
      );
    }

    if (record.status === 'Confirmed') {
      items.push({
        key: 'complete',
        icon: <CheckCircleIcon className="w-4 h-4" />,
        label: 'Tamamla',
        onClick: () => handleComplete(record.id),
      });
    }

    if (record.status === 'Rejected') {
      items.push({
        key: 'delete',
        icon: <TrashIcon className="w-4 h-4" />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<PaymentListItem> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      sorter: true,
      render: (text, record) => (
        <Link href={`/sales/payments/${record.id}`} className="font-medium text-blue-600 hover:text-blue-800">
          {text}
        </Link>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: true,
    },
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => text || '-',
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      render: (method: PaymentMethod) => (
        <Tag>{methodLabels[method]}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: PaymentStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      align: 'right',
      render: (amount, record) => (
        <span className="font-semibold text-green-600">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Referans',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => text || '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      align: 'center',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionItems(record) }}
          trigger={['click']}
        >
          <Button icon={<EllipsisHorizontalIcon className="w-4 h-4" />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
          <Title level={2} className="!mb-0">
            Ödemeler
          </Title>
        </div>
        <Space>
          <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/sales/payments/new')}>
            Yeni Ödeme
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input
              placeholder="Ödeme ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Durum seçin"
              options={statusOptions}
              value={filters.status}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              placeholder="Yöntem seçin"
              options={methodOptions}
              value={filters.method}
              onChange={handleMethodChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} ödeme`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Ödemeyi Reddet"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="Reddet"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true, loading: rejectPayment.isPending }}
      >
        <div className="mb-4">
          <Text>Bu ödemeyi reddetmek istediğinizden emin misiniz?</Text>
        </div>
        <Input.TextArea
          placeholder="Red sebebini girin..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
