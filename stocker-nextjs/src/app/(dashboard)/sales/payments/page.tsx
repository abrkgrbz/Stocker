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
  Drawer,
  Form,
  InputNumber,
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
  DollarOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {
  usePayments,
  useDeletePayment,
  useConfirmPayment,
  useCompletePayment,
  useRejectPayment,
  useCreatePayment,
} from '@/lib/api/hooks/usePayments';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { Customer } from '@/lib/api/services/crm.service';
import type { PaymentListItem, PaymentStatus, PaymentMethod, GetPaymentsParams, CreatePaymentCommand } from '@/lib/api/services/payment.service';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<PaymentStatus, { color: string; label: string; icon: React.ReactNode }> = {
  Pending: { color: 'orange', label: 'Bekliyor', icon: <DollarOutlined /> },
  Confirmed: { color: 'blue', label: 'Onaylandı', icon: <CheckCircleOutlined /> },
  Completed: { color: 'green', label: 'Tamamlandı', icon: <CheckCircleOutlined /> },
  Rejected: { color: 'red', label: 'Reddedildi', icon: <CloseCircleOutlined /> },
  Refunded: { color: 'purple', label: 'İade Edildi', icon: <RollbackOutlined /> },
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
  const [form] = Form.useForm();

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
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // API hooks
  const { data, isLoading, refetch } = usePayments(filters);
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50
  });
  const deletePayment = useDeletePayment();
  const confirmPayment = useConfirmPayment();
  const completePayment = useCompletePayment();
  const rejectPayment = useRejectPayment();
  const createPayment = useCreatePayment();

  const payments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Get customers list for select options
  const customerOptions = customersData?.items?.map((customer: Customer) => ({
    value: customer.id.toString(),
    label: customer.companyName || `${customer.contactPerson}`,
    customer: customer,
  })) || [];

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

  const openCreateDrawer = () => {
    form.resetFields();
    form.setFieldsValue({
      paymentDate: dayjs(),
      currency: 'TRY',
      method: 'BankTransfer',
    });
    setCreateDrawerOpen(true);
  };

  const handleCreatePayment = async (values: any) => {
    try {
      // Find selected customer from options
      const selectedCustomer = customerOptions.find(
        (opt: { value: string; customer: Customer }) => opt.value === values.customerId
      )?.customer;

      const paymentData: CreatePaymentCommand = {
        paymentDate: values.paymentDate.toISOString(),
        customerId: selectedCustomer?.id?.toString() || undefined,
        customerName: selectedCustomer?.companyName || selectedCustomer?.contactPerson || values.customerName,
        method: values.method,
        currency: values.currency || 'TRY',
        amount: values.amount,
        reference: values.reference,
        description: values.description,
        bankAccountName: values.bankAccountName,
        transactionId: values.transactionId,
      };
      await createPayment.mutateAsync(paymentData);
      message.success('Ödeme oluşturuldu');
      setCreateDrawerOpen(false);
      form.resetFields();
    } catch {
      message.error('Ödeme oluşturulamadı');
    }
  };

  const getActionItems = (record: PaymentListItem) => {
    const items: any[] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/payments/${record.id}`),
      },
    ];

    if (record.status === 'Pending') {
      items.push(
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Düzenle',
          onClick: () => router.push(`/sales/payments/${record.id}/edit`),
        },
        {
          key: 'confirm',
          icon: <CheckCircleOutlined />,
          label: 'Onayla',
          onClick: () => handleConfirm(record.id),
        },
        {
          key: 'reject',
          icon: <CloseCircleOutlined />,
          label: 'Reddet',
          danger: true,
          onClick: () => handleRejectClick(record.id),
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

    if (record.status === 'Confirmed') {
      items.push({
        key: 'complete',
        icon: <CheckCircleOutlined />,
        label: 'Tamamla',
        onClick: () => handleComplete(record.id),
      });
    }

    if (record.status === 'Rejected') {
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
          <DollarOutlined className="text-3xl text-green-500" />
          <Title level={2} className="!mb-0">
            Ödemeler
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
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

      {/* Create Payment Drawer */}
      <Drawer
        title="Yeni Ödeme Oluştur"
        width={600}
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setCreateDrawerOpen(false)}>İptal</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createPayment.isPending}>
              Oluştur
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePayment}
          initialValues={{
            paymentDate: dayjs(),
            currency: 'TRY',
            method: 'BankTransfer',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Müşteri"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  showSearch
                  placeholder="Müşteri seçiniz"
                  loading={customersLoading}
                  filterOption={false}
                  onSearch={(value) => setCustomerSearch(value)}
                  options={customerOptions}
                  notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="Ödeme Tarihi"
                rules={[{ required: true, message: 'Ödeme tarihi zorunludur' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="method"
                label="Ödeme Yöntemi"
                rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
              >
                <Select>
                  <Select.Option value="Cash">Nakit</Select.Option>
                  <Select.Option value="BankTransfer">Havale/EFT</Select.Option>
                  <Select.Option value="CreditCard">Kredi Kartı</Select.Option>
                  <Select.Option value="DebitCard">Banka Kartı</Select.Option>
                  <Select.Option value="Check">Çek</Select.Option>
                  <Select.Option value="DirectDebit">Otomatik Ödeme</Select.Option>
                  <Select.Option value="Other">Diğer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="Para Birimi">
                <Select>
                  <Select.Option value="TRY">TRY - Türk Lirası</Select.Option>
                  <Select.Option value="USD">USD - Amerikan Doları</Select.Option>
                  <Select.Option value="EUR">EUR - Euro</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Tutar"
                rules={[{ required: true, message: 'Tutar zorunludur' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="Ödeme tutarı"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="reference" label="Referans">
                <Input placeholder="Ödeme referansı" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bankAccountName" label="Banka Hesabı">
                <Input placeholder="Banka hesap adı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="transactionId" label="İşlem No">
                <Input placeholder="Banka işlem numarası" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Açıklama">
                <Input.TextArea rows={3} placeholder="Ödeme açıklaması" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}
