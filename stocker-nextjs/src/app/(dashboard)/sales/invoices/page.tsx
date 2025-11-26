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
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  FileTextOutlined,
  SendOutlined,
  DollarOutlined,
  MailOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  useInvoices,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
  useCancelInvoice,
} from '@/lib/api/hooks/useInvoices';
import type { InvoiceListItem, InvoiceStatus, GetInvoicesParams } from '@/lib/api/services/invoice.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<InvoiceStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: 'default', label: 'Taslak', icon: <FileTextOutlined /> },
  Issued: { color: 'blue', label: 'Kesildi', icon: <CheckCircleOutlined /> },
  Sent: { color: 'cyan', label: 'Gönderildi', icon: <SendOutlined /> },
  PartiallyPaid: { color: 'orange', label: 'Kısmi Ödendi', icon: <DollarOutlined /> },
  Paid: { color: 'green', label: 'Ödendi', icon: <CheckCircleOutlined /> },
  Overdue: { color: 'red', label: 'Vadesi Geçmiş', icon: <CloseCircleOutlined /> },
  Cancelled: { color: 'red', label: 'İptal Edildi', icon: <CloseCircleOutlined /> },
};

const statusOptions = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'Draft', label: 'Taslak' },
  { value: 'Issued', label: 'Kesildi' },
  { value: 'Sent', label: 'Gönderildi' },
  { value: 'PartiallyPaid', label: 'Kısmi Ödendi' },
  { value: 'Paid', label: 'Ödendi' },
  { value: 'Overdue', label: 'Vadesi Geçmiş' },
  { value: 'Cancelled', label: 'İptal Edildi' },
];

const typeOptions = [
  { value: '', label: 'Tüm Tipler' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Return', label: 'İade' },
  { value: 'Credit', label: 'Alacak' },
  { value: 'Debit', label: 'Borç' },
];

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState<GetInvoicesParams>({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    sortBy: 'InvoiceDate',
    sortDescending: true,
  });

  // API hooks
  const { data, isLoading, refetch } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();
  const issueInvoice = useIssueInvoice();
  const sendInvoice = useSendInvoice();
  const cancelInvoice = useCancelInvoice();

  const invoices = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value, page: 1 }));
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
      sortBy: sorter.field || 'InvoiceDate',
      sortDescending: sorter.order === 'descend',
    }));
  };

  const handleIssue = async (id: string) => {
    try {
      await issueInvoice.mutateAsync(id);
      message.success('Fatura kesildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Fatura kesme başarısız');
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendInvoice.mutateAsync(id);
      message.success('Fatura gönderildi');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Gönderim başarısız');
    }
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: 'Faturayı İptal Et',
      content: 'Bu faturayı iptal etmek istediğinizden emin misiniz?',
      okText: 'İptal Et',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await cancelInvoice.mutateAsync(id);
          message.success('Fatura iptal edildi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'İptal işlemi başarısız');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Faturayı Sil',
      content: 'Bu faturayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteInvoice.mutateAsync(id);
          message.success('Fatura silindi');
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Silme işlemi başarısız');
        }
      },
    });
  };

  const getActionItems = (record: InvoiceListItem) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/invoices/${record.id}`),
      },
    ];

    if (record.status === 'Draft') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/invoices/${record.id}/edit`),
        },
        {
          key: 'issue',
          icon: <CheckCircleOutlined />,
          label: 'Kes',
          onClick: () => handleIssue(record.id),
        },
        {
          type: 'divider',
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

    if (record.status === 'Issued') {
      items.push({
        key: 'send',
        icon: <MailOutlined />,
        label: 'Gönder',
        onClick: () => handleSend(record.id),
      });
    }

    if (record.status !== 'Cancelled' && record.status !== 'Paid' && record.status !== 'Draft') {
      items.push({
        key: 'cancel',
        icon: <CloseCircleOutlined />,
        label: 'İptal Et',
        danger: true,
        onClick: () => handleCancel(record.id),
      });
    }

    if (record.status === 'Cancelled') {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Sil',
        danger: true,
        onClick: () => handleDelete(record.id),
      });
    }

    return items;
  };

  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      sorter: true,
      render: (text, record) => (
        <Link href={`/sales/invoices/${record.id}`} className="font-medium text-blue-600 hover:text-blue-800">
          {text}
        </Link>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Vade',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: InvoiceStatus) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Toplam',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      sorter: true,
      align: 'right',
      render: (total, record) => (
        <span className="font-semibold">
          {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Ödenen',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right',
      render: (amount, record) => (
        <span className="text-green-600">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Kalan',
      dataIndex: 'balanceDue',
      key: 'balanceDue',
      align: 'right',
      render: (balance, record) => (
        <span className={balance > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
          {balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'E-Fatura',
      dataIndex: 'isEInvoice',
      key: 'isEInvoice',
      align: 'center',
      render: (isEInvoice) => (
        isEInvoice ? <Tag color="blue">E-Fatura</Tag> : <Tag>Normal</Tag>
      ),
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
          <Button icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <FileTextOutlined className="text-3xl text-green-500" />
          <Title level={2} className="!mb-0">
            Faturalar
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Link href="/sales/invoices/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Yeni Fatura
            </Button>
          </Link>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Input
              placeholder="Fatura ara..."
              prefix={<SearchOutlined />}
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
              placeholder="Tip seçin"
              options={typeOptions}
              value={filters.type}
              onChange={handleTypeChange}
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
          dataSource={invoices}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} fatura`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}
