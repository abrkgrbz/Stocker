import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Tooltip,
  Typography,
  Timeline,
  Descriptions,
  Alert,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  EyeOutlined,
  FileTextOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface Payment {
  id: string;
  transactionId: string;
  tenant: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe';
  invoiceNumber?: string;
  description: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

const MasterPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    method: 'all',
    dateRange: null as any,
  });

  // Mock data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: '1',
        transactionId: 'TRX-2024-001',
        tenant: 'TechCorp Solutions',
        tenantId: 'tenant-1',
        amount: 2950,
        currency: 'TRY',
        status: 'completed',
        method: 'credit_card',
        invoiceNumber: 'INV-2024-001',
        description: 'Enterprise Package - Monthly Payment',
        createdAt: '2024-02-10T10:30:00',
        completedAt: '2024-02-10T10:31:00',
        metadata: {
          cardLast4: '4242',
          cardBrand: 'Visa',
        },
      },
      {
        id: '2',
        transactionId: 'TRX-2024-002',
        tenant: 'Global Retail Inc',
        tenantId: 'tenant-2',
        amount: 1770,
        currency: 'TRY',
        status: 'pending',
        method: 'bank_transfer',
        invoiceNumber: 'INV-2024-002',
        description: 'Professional Package - Monthly Payment',
        createdAt: '2024-02-11T14:20:00',
        metadata: {
          bankName: 'Garanti Bank',
          accountNumber: '****1234',
        },
      },
      {
        id: '3',
        transactionId: 'TRX-2024-003',
        tenant: 'StartUp Hub',
        tenantId: 'tenant-3',
        amount: 590,
        currency: 'TRY',
        status: 'failed',
        method: 'credit_card',
        invoiceNumber: 'INV-2024-003',
        description: 'Starter Package - Monthly Payment',
        createdAt: '2024-02-09T09:15:00',
        failureReason: 'Insufficient funds',
        metadata: {
          cardLast4: '5555',
          cardBrand: 'Mastercard',
        },
      },
      {
        id: '4',
        transactionId: 'TRX-2024-004',
        tenant: 'Digital Agency',
        tenantId: 'tenant-4',
        amount: 1200,
        currency: 'TRY',
        status: 'refunded',
        method: 'paypal',
        description: 'Professional Package - Refund',
        createdAt: '2024-02-08T11:00:00',
        completedAt: '2024-02-08T11:01:00',
        refundedAt: '2024-02-09T10:00:00',
        metadata: {
          paypalEmail: 'billing@digitalagency.com',
        },
      },
    ];
    setPayments(mockPayments);
  }, []);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailModalVisible(true);
  };

  const handleRefund = (payment: Payment) => {
    Modal.confirm({
      title: 'İade İşlemi',
      content: `${payment.transactionId} numaralı ödemeyi iade etmek istediğinize emin misiniz?`,
      onOk: () => {
        message.success('İade işlemi başlatıldı');
      },
    });
  };

  const handleRetryPayment = (payment: Payment) => {
    message.info('Ödeme yeniden deneniyor...');
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardOutlined />;
      case 'bank_transfer':
        return <BankOutlined />;
      case 'paypal':
        return <DollarOutlined />;
      case 'stripe':
        return <CreditCardOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'İşlem No',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Firma',
      dataIndex: 'tenant',
      key: 'tenant',
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (value, record) => (
        <Text strong>
          {record.currency === 'TRY' ? '₺' : record.currency}
          {value.toLocaleString('tr-TR')}
        </Text>
      ),
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      render: (method) => {
        const methodNames = {
          credit_card: 'Kredi Kartı',
          bank_transfer: 'Banka Transferi',
          paypal: 'PayPal',
          stripe: 'Stripe',
        };
        return (
          <Space>
            {getPaymentMethodIcon(method)}
            <span>{methodNames[method]}</span>
          </Space>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Tamamlandı', icon: <CheckCircleOutlined /> },
          pending: { color: 'warning', text: 'Bekliyor', icon: <ClockCircleOutlined /> },
          failed: { color: 'error', text: 'Başarısız', icon: <CloseCircleOutlined /> },
          refunded: { color: 'default', text: 'İade Edildi', icon: <SyncOutlined /> },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'completed' && (
            <Tooltip title="İade Et">
              <Button
                type="text"
                icon={<SyncOutlined />}
                onClick={() => handleRefund(record)}
              />
            </Tooltip>
          )}
          {record.status === 'failed' && (
            <Tooltip title="Tekrar Dene">
              <Button
                type="text"
                icon={<SyncOutlined />}
                onClick={() => handleRetryPayment(record)}
              />
            </Tooltip>
          )}
          {record.invoiceNumber && (
            <Tooltip title="Faturayı Görüntüle">
              <Button
                type="text"
                icon={<FileTextOutlined />}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="master-payments-page">
      <Row gutter={[24, 24]}>
        {/* Statistics Cards */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Ödeme"
                  value={stats.total}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Başarılı"
                  value={stats.completed}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Başarısız"
                  value={stats.failed}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Gelir"
                  value={stats.totalAmount}
                  prefix="₺"
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  suffix={
                    <span style={{ fontSize: 14, color: '#3f8600' }}>
                      <ArrowUpOutlined />
                    </span>
                  }
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Recent Activity Alert */}
        {stats.failed > 0 && (
          <Col span={24}>
            <Alert
              message="Dikkat!"
              description={`${stats.failed} adet başarısız ödeme işlemi bulunmaktadır. Lütfen kontrol ediniz.`}
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              closable
            />
          </Col>
        )}

        {/* Main Content */}
        <Col span={24}>
          <Card
            title="Ödemeler"
            extra={
              <Space>
                <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
                <Button type="primary" icon={<SyncOutlined />}>
                  Yenile
                </Button>
              </Space>
            }
          >
            {/* Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={8}>
                <Input
                  placeholder="İşlem no veya firma adı ile ara..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Durum"
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <Select.Option value="all">Tümü</Select.Option>
                  <Select.Option value="completed">Tamamlandı</Select.Option>
                  <Select.Option value="pending">Bekliyor</Select.Option>
                  <Select.Option value="failed">Başarısız</Select.Option>
                  <Select.Option value="refunded">İade Edildi</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Yöntem"
                  value={filters.method}
                  onChange={(value) => setFilters({ ...filters, method: value })}
                >
                  <Select.Option value="all">Tümü</Select.Option>
                  <Select.Option value="credit_card">Kredi Kartı</Select.Option>
                  <Select.Option value="bank_transfer">Banka Transferi</Select.Option>
                  <Select.Option value="paypal">PayPal</Select.Option>
                  <Select.Option value="stripe">Stripe</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Başlangıç', 'Bitiş']}
                  showTime
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                />
              </Col>
            </Row>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={payments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} ödeme`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Detail Modal */}
      <Modal
        title={`Ödeme Detayı - ${selectedPayment?.transactionId}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
        ]}
      >
        {selectedPayment && (
          <div>
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="İşlem No">
                {selectedPayment.transactionId}
              </Descriptions.Item>
              <Descriptions.Item label="Firma">
                {selectedPayment.tenant}
              </Descriptions.Item>
              <Descriptions.Item label="Tutar">
                ₺{selectedPayment.amount.toLocaleString('tr-TR')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                {selectedPayment.status === 'completed' && (
                  <Badge status="success" text="Tamamlandı" />
                )}
                {selectedPayment.status === 'pending' && (
                  <Badge status="processing" text="Bekliyor" />
                )}
                {selectedPayment.status === 'failed' && (
                  <Badge status="error" text="Başarısız" />
                )}
                {selectedPayment.status === 'refunded' && (
                  <Badge status="default" text="İade Edildi" />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Yöntemi">
                <Space>
                  {getPaymentMethodIcon(selectedPayment.method)}
                  <span>
                    {selectedPayment.method === 'credit_card' && 'Kredi Kartı'}
                    {selectedPayment.method === 'bank_transfer' && 'Banka Transferi'}
                    {selectedPayment.method === 'paypal' && 'PayPal'}
                    {selectedPayment.method === 'stripe' && 'Stripe'}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Fatura No">
                {selectedPayment.invoiceNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama" span={2}>
                {selectedPayment.description}
              </Descriptions.Item>
              {selectedPayment.failureReason && (
                <Descriptions.Item label="Hata Nedeni" span={2}>
                  <Text type="danger">{selectedPayment.failureReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>İşlem Geçmişi</Title>
            <Timeline>
              <Timeline.Item color="green">
                İşlem başlatıldı - {dayjs(selectedPayment.createdAt).format('DD.MM.YYYY HH:mm')}
              </Timeline.Item>
              {selectedPayment.completedAt && (
                <Timeline.Item color="green">
                  Ödeme tamamlandı - {dayjs(selectedPayment.completedAt).format('DD.MM.YYYY HH:mm')}
                </Timeline.Item>
              )}
              {selectedPayment.status === 'failed' && (
                <Timeline.Item color="red">
                  Ödeme başarısız - {selectedPayment.failureReason}
                </Timeline.Item>
              )}
              {selectedPayment.refundedAt && (
                <Timeline.Item color="gray">
                  İade edildi - {dayjs(selectedPayment.refundedAt).format('DD.MM.YYYY HH:mm')}
                </Timeline.Item>
              )}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MasterPaymentsPage;