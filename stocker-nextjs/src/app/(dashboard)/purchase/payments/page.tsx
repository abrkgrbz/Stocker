'use client';

import React, { useState } from 'react';
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
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  SyncOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useSupplierPayments,
  useDeleteSupplierPayment,
  useApproveSupplierPayment,
  useRejectSupplierPayment,
  useProcessSupplierPayment,
  useReconcileSupplierPayment,
} from '@/lib/api/hooks/usePurchase';
import type { SupplierPaymentListDto, SupplierPaymentStatus, PaymentMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const statusColors: Record<SupplierPaymentStatus, string> = {
  Draft: 'default',
  PendingApproval: 'blue',
  Approved: 'cyan',
  Rejected: 'red',
  Processed: 'geekblue',
  Completed: 'green',
  Cancelled: 'default',
  Failed: 'error',
};

const statusLabels: Record<SupplierPaymentStatus, string> = {
  Draft: 'Taslak',
  PendingApproval: 'Onay Bekliyor',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Processed: 'İşlendi',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
  Failed: 'Başarısız',
};

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  Cash: <DollarOutlined />,
  BankTransfer: <BankOutlined />,
  CreditCard: <CreditCardOutlined />,
  Check: <WalletOutlined />,
  DirectDebit: <SyncOutlined />,
  Other: <WalletOutlined />,
};

export default function SupplierPaymentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierPaymentStatus | undefined>();
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | undefined>();
  const [reconciledFilter, setReconciledFilter] = useState<boolean | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  const { data: paymentsData, isLoading, refetch } = useSupplierPayments({
    search: searchText || undefined,
    status: statusFilter,
    method: methodFilter,
    isReconciled: reconciledFilter,
    startDate: dateRange?.[0]?.toISOString(),
    endDate: dateRange?.[1]?.toISOString(),
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const deletePayment = useDeleteSupplierPayment();
  const approvePayment = useApproveSupplierPayment();
  const rejectPayment = useRejectSupplierPayment();
  const processPayment = useProcessSupplierPayment();
  const reconcilePayment = useReconcileSupplierPayment();

  const payments = paymentsData?.items || [];
  const totalCount = paymentsData?.totalCount || 0;

  const handleDelete = (record: SupplierPaymentListDto) => {
    confirm({
      title: 'Ödeme Belgesini Sil',
      content: `"${record.paymentNumber}" ödeme belgesini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deletePayment.mutate(record.id),
    });
  };

  const handleReject = (record: SupplierPaymentListDto) => {
    confirm({
      title: 'Ödemeyi Reddet',
      content: `"${record.paymentNumber}" ödemesini reddetmek istediğinizden emin misiniz?`,
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => rejectPayment.mutate({ id: record.id, reason: 'Manuel reddetme' }),
    });
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnsType<SupplierPaymentListDto> = [
    {
      title: 'Ödeme No',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      fixed: 'left',
      width: 150,
      render: (num, record) => (
        <div>
          <div className="font-medium text-blue-600">{num}</div>
          <div className="text-xs text-gray-500">
            {dayjs(record.paymentDate).format('DD.MM.YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: SupplierPaymentStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      render: (method: PaymentMethod) => (
        <span className="flex items-center gap-2">
          {methodIcons[method]}
          <span>{methodLabels[method]}</span>
        </span>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount, record) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
    },
    {
      title: 'Fatura No',
      dataIndex: 'purchaseInvoiceNumber',
      key: 'purchaseInvoiceNumber',
      width: 130,
      render: (num) => num || '-',
    },
    {
      title: 'Mutabakat',
      dataIndex: 'isReconciled',
      key: 'isReconciled',
      width: 100,
      align: 'center',
      render: (isReconciled: boolean) => (
        <Tag color={isReconciled ? 'green' : 'orange'}>
          {isReconciled ? 'Yapıldı' : 'Bekliyor'}
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
                onClick: () => router.push(`/purchase/payments/${record.id}`),
              },
              record.status === 'Draft' && {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/purchase/payments/${record.id}/edit`),
              },
              { type: 'divider' },
              record.status === 'PendingApproval' && {
                key: 'approve',
                icon: <CheckCircleOutlined />,
                label: 'Onayla',
                onClick: () => approvePayment.mutate(record.id),
              },
              record.status === 'PendingApproval' && {
                key: 'reject',
                icon: <CloseCircleOutlined />,
                label: 'Reddet',
                danger: true,
                onClick: () => handleReject(record),
              },
              record.status === 'Approved' && {
                key: 'process',
                icon: <PlayCircleOutlined />,
                label: 'İşle',
                onClick: () => processPayment.mutate(record.id),
              },
              record.status === 'Completed' && !record.isReconciled && {
                key: 'reconcile',
                icon: <SyncOutlined />,
                label: 'Mutabakat Yap',
                onClick: () => reconcilePayment.mutate(record.id),
              },
              { type: 'divider' },
              record.status === 'Draft' && {
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
            <WalletOutlined className="text-green-500" />
            Tedarikçi Ödemeleri
          </Title>
          <Text type="secondary">Tedarikçilere yapılan ödemeleri yönetin</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => router.push('/purchase/payments/new')}
        >
          Yeni Ödeme
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4" size="small">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Belge ara..."
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
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            placeholder="Ödeme Yöntemi"
            allowClear
            style={{ width: 150 }}
            value={methodFilter}
            onChange={setMethodFilter}
            options={Object.entries(methodLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            placeholder="Mutabakat"
            allowClear
            style={{ width: 130 }}
            value={reconciledFilter}
            onChange={setReconciledFilter}
            options={[
              { value: true, label: 'Yapıldı' },
              { value: false, label: 'Bekliyor' },
            ]}
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
          dataSource={payments}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} ödeme`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/purchase/payments/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50',
          })}
        />
      </Card>
    </div>
  );
}
