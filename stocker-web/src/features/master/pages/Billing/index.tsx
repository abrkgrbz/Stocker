import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Input,
  Dropdown,
  Modal,
  Form,
  InputNumber,
  Tabs,
  Progress,
  Timeline,
  Badge,
  Alert,
  Descriptions,
  List,
  Avatar,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloudDownloadOutlined,
  ReloadOutlined,
  BankOutlined,
  PayCircleOutlined,
  HistoryOutlined,
  RiseOutlined,
  FallOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Line, Bar, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'draft';
  dueDate: string;
  issueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  items: InvoiceItem[];
  currency: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  usage: {
    users: { current: number; limit: number };
    storage: { current: number; limit: number };
    api: { current: number; limit: number };
  };
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  transactionId: string;
  tenantName: string;
}

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null as any,
    search: '',
  });

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      tenantId: 't1',
      tenantName: 'ABC Şirketi',
      amount: 2500,
      tax: 450,
      total: 2950,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      paymentDate: '2024-01-10',
      paymentMethod: 'Kredi Kartı',
      currency: 'TRY',
      items: [
        { id: '1', description: 'Premium Plan - Aylık', quantity: 1, unitPrice: 2000, total: 2000 },
        { id: '2', description: 'Ek Kullanıcı (5)', quantity: 5, unitPrice: 100, total: 500 },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      tenantId: 't2',
      tenantName: 'XYZ Teknoloji',
      amount: 5000,
      tax: 900,
      total: 5900,
      status: 'pending',
      dueDate: '2024-01-20',
      issueDate: '2024-01-05',
      currency: 'TRY',
      items: [
        { id: '3', description: 'Enterprise Plan - Aylık', quantity: 1, unitPrice: 5000, total: 5000 },
      ],
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      tenantId: 't3',
      tenantName: 'Demo Firma',
      amount: 1500,
      tax: 270,
      total: 1770,
      status: 'overdue',
      dueDate: '2024-01-10',
      issueDate: '2023-12-25',
      currency: 'TRY',
      items: [
        { id: '4', description: 'Standard Plan - Aylık', quantity: 1, unitPrice: 1500, total: 1500 },
      ],
    },
  ];

  const subscriptions: Subscription[] = [
    {
      id: '1',
      tenantId: 't1',
      tenantName: 'ABC Şirketi',
      plan: 'Premium',
      status: 'active',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      nextBillingDate: '2024-02-01',
      amount: 2000,
      billingCycle: 'monthly',
      features: ['Sınırsız kullanıcı', '100GB depolama', 'Özel destek', 'API erişimi'],
      usage: {
        users: { current: 25, limit: -1 },
        storage: { current: 45, limit: 100 },
        api: { current: 15000, limit: 50000 },
      },
    },
    {
      id: '2',
      tenantId: 't2',
      tenantName: 'XYZ Teknoloji',
      plan: 'Enterprise',
      status: 'active',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      nextBillingDate: '2024-02-01',
      amount: 5000,
      billingCycle: 'monthly',
      features: ['Sınırsız kullanıcı', 'Sınırsız depolama', '7/24 destek', 'Özel API limiti'],
      usage: {
        users: { current: 150, limit: -1 },
        storage: { current: 500, limit: -1 },
        api: { current: 125000, limit: -1 },
      },
    },
  ];

  const payments: Payment[] = [
    {
      id: '1',
      invoiceId: '1',
      amount: 2950,
      method: 'Kredi Kartı',
      status: 'success',
      date: '2024-01-10',
      transactionId: 'TRX-2024-001',
      tenantName: 'ABC Şirketi',
    },
    {
      id: '2',
      invoiceId: '2',
      amount: 5900,
      method: 'Banka Transferi',
      status: 'pending',
      date: '2024-01-15',
      transactionId: 'TRX-2024-002',
      tenantName: 'XYZ Teknoloji',
    },
  ];

  // Statistics
  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
    
    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      activeSubscriptions,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    };
  }, [invoices, subscriptions]);

  // Invoice columns
  const invoiceColumns: ColumnsType<Invoice> = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewInvoice(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {text[0]}
          </Avatar>
          {text}
        </Space>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'total',
      key: 'total',
      render: (value, record) => (
        <Text strong>
          {value.toLocaleString('tr-TR')} {record.currency}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          paid: { color: 'success', text: 'Ödendi', icon: <CheckCircleOutlined /> },
          pending: { color: 'processing', text: 'Bekliyor', icon: <ClockCircleOutlined /> },
          overdue: { color: 'error', text: 'Gecikmiş', icon: <ExclamationCircleOutlined /> },
          cancelled: { color: 'default', text: 'İptal', icon: <DeleteOutlined /> },
          draft: { color: 'default', text: 'Taslak', icon: <EditOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Ödendi', value: 'paid' },
        { text: 'Bekliyor', value: 'pending' },
        { text: 'Gecikmiş', value: 'overdue' },
      ],
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Görüntüle">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewInvoice(record)} />
          </Tooltip>
          <Tooltip title="İndir">
            <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownloadInvoice(record)} />
          </Tooltip>
          <Tooltip title="E-posta Gönder">
            <Button icon={<MailOutlined />} size="small" onClick={() => handleSendInvoice(record)} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: 'Düzenle', icon: <EditOutlined /> },
                { key: 'duplicate', label: 'Kopyala', icon: <FileTextOutlined /> },
                { key: 'cancel', label: 'İptal Et', icon: <DeleteOutlined />, danger: true },
              ],
            }}
          >
            <Button size="small">Daha Fazla</Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Subscription columns
  const subscriptionColumns: ColumnsType<Subscription> = [
    {
      title: 'Müşteri',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#52c41a' }}>
            {text[0]}
          </Avatar>
          {text}
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => (
        <Tag color="blue">{plan}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'success', text: 'Aktif' },
          cancelled: { color: 'error', text: 'İptal' },
          expired: { color: 'warning', text: 'Süresi Dolmuş' },
          trial: { color: 'processing', text: 'Deneme' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Fatura Dönemi',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      render: (cycle) => (cycle === 'monthly' ? 'Aylık' : 'Yıllık'),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `${value.toLocaleString('tr-TR')} TRY`,
    },
    {
      title: 'Sonraki Fatura',
      dataIndex: 'nextBillingDate',
      key: 'nextBillingDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Kullanım',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Kullanıcı: {record.usage.users.current}/{record.usage.users.limit === -1 ? '∞' : record.usage.users.limit}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Depolama: {record.usage.storage.current}GB/{record.usage.storage.limit === -1 ? '∞' : record.usage.storage.limit + 'GB'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small">Yönet</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'upgrade', label: 'Yükselt', icon: <RiseOutlined /> },
                { key: 'downgrade', label: 'Düşür', icon: <FallOutlined /> },
                { key: 'cancel', label: 'İptal Et', icon: <DeleteOutlined />, danger: true },
              ],
            }}
          >
            <Button size="small">Daha Fazla</Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Payment columns
  const paymentColumns: ColumnsType<Payment> = [
    {
      title: 'İşlem No',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Müşteri',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => `${value.toLocaleString('tr-TR')} TRY`,
    },
    {
      title: 'Ödeme Yöntemi',
      dataIndex: 'method',
      key: 'method',
      render: (method) => (
        <Tag icon={method === 'Kredi Kartı' ? <CreditCardOutlined /> : <BankOutlined />}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          success: { color: 'success', text: 'Başarılı' },
          pending: { color: 'processing', text: 'Bekliyor' },
          failed: { color: 'error', text: 'Başarısız' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  // Handlers
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceModalVisible(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    message.success(`${invoice.invoiceNumber} indirildi`);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    message.success(`${invoice.invoiceNumber} e-posta ile gönderildi`);
  };

  const handleCreateInvoice = () => {
    // Create invoice logic
    message.success('Yeni fatura oluşturuldu');
  };

  const handleBulkAction = (action: string) => {
    message.info(`${selectedRows.length} fatura için ${action} işlemi yapılıyor`);
  };

  // Revenue chart data
  const revenueData = [
    { month: 'Ocak', value: 45000 },
    { month: 'Şubat', value: 52000 },
    { month: 'Mart', value: 48000 },
    { month: 'Nisan', value: 61000 },
    { month: 'Mayıs', value: 55000 },
    { month: 'Haziran', value: 67000 },
  ];

  const revenueConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    point: { size: 3 },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Gelir',
        value: `${datum.value.toLocaleString('tr-TR')} TRY`,
      }),
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={2}>
            <DollarOutlined /> Faturalama ve Ödemeler
          </Title>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={stats.totalRevenue}
              suffix="TRY"
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
            <Progress percent={75} strokeColor="#52c41a" showInfo={false} />
            <Text type="secondary">Son 30 gün</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen Ödemeler"
              value={stats.pendingAmount}
              suffix="TRY"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
            <Progress percent={30} strokeColor="#1890ff" showInfo={false} />
            <Text type="secondary">{invoices.filter(inv => inv.status === 'pending').length} fatura</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gecikmiş Ödemeler"
              value={stats.overdueAmount}
              suffix="TRY"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
            <Progress percent={15} strokeColor="#ff4d4f" showInfo={false} />
            <Text type="secondary">{invoices.filter(inv => inv.status === 'overdue').length} fatura</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Abonelikler"
              value={stats.activeSubscriptions}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ShoppingCartOutlined />}
            />
            <Progress percent={85} strokeColor="#722ed1" showInfo={false} />
            <Text type="secondary">Toplam {subscriptions.length} abonelik</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><FileTextOutlined /> Faturalar</span>} key="invoices">
            {/* Filters and Actions */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={16}>
                <Space wrap>
                  <Select
                    style={{ width: 150 }}
                    value={filters.status}
                    onChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <Option value="all">Tüm Durumlar</Option>
                    <Option value="paid">Ödendi</Option>
                    <Option value="pending">Bekliyor</Option>
                    <Option value="overdue">Gecikmiş</Option>
                  </Select>
                  <RangePicker placeholder={['Başlangıç', 'Bitiş']} />
                  <Input.Search
                    placeholder="Fatura ara..."
                    style={{ width: 250 }}
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </Space>
              </Col>
              <Col xs={24} lg={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button icon={<ReloadOutlined />}>Yenile</Button>
                  <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateInvoice}>
                    Yeni Fatura
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <Alert
                message={`${selectedRows.length} fatura seçildi`}
                type="info"
                showIcon
                action={
                  <Space>
                    <Button size="small" onClick={() => handleBulkAction('email')}>
                      E-posta Gönder
                    </Button>
                    <Button size="small" onClick={() => handleBulkAction('download')}>
                      İndir
                    </Button>
                    <Button size="small" danger onClick={() => handleBulkAction('delete')}>
                      Sil
                    </Button>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Invoices Table */}
            <Table
              columns={invoiceColumns}
              dataSource={invoices}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedRows,
                onChange: (keys) => setSelectedRows(keys as string[]),
              }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} fatura`,
              }}
            />
          </TabPane>

          <TabPane tab={<span><ShoppingCartOutlined /> Abonelikler</span>} key="subscriptions">
            {/* Subscription Actions */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <Button icon={<ReloadOutlined />}>Yenile</Button>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Yeni Abonelik
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* Subscriptions Table */}
            <Table
              columns={subscriptionColumns}
              dataSource={subscriptions}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} abonelik`,
              }}
            />
          </TabPane>

          <TabPane tab={<span><CreditCardOutlined /> Ödemeler</span>} key="payments">
            {/* Payment History */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Alert
                  message="Ödeme İşlemleri"
                  description="Son 30 gündeki tüm ödeme işlemleri listelenmektedir."
                  type="info"
                  showIcon
                />
              </Col>
            </Row>

            <Table
              columns={paymentColumns}
              dataSource={payments}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} ödeme`,
              }}
            />
          </TabPane>

          <TabPane tab={<span><HistoryOutlined /> Gelir Analizi</span>} key="revenue">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Aylık Gelir Trendi" bordered={false}>
                  <Line {...revenueConfig} height={300} />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        title={`Fatura Detayı - ${selectedInvoice?.invoiceNumber}`}
        open={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        width={800}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            Yazdır
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            PDF İndir
          </Button>,
          <Button key="email" icon={<MailOutlined />}>
            E-posta Gönder
          </Button>,
          <Button key="close" onClick={() => setInvoiceModalVisible(false)}>
            Kapat
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Fatura No">{selectedInvoice.invoiceNumber}</Descriptions.Item>
              <Descriptions.Item label="Müşteri">{selectedInvoice.tenantName}</Descriptions.Item>
              <Descriptions.Item label="Düzenleme Tarihi">
                {dayjs(selectedInvoice.issueDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Vade Tarihi">
                {dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={selectedInvoice.status === 'paid' ? 'success' : 'processing'}>
                  {selectedInvoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Yöntemi">
                {selectedInvoice.paymentMethod || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Table
              columns={[
                { title: 'Açıklama', dataIndex: 'description', key: 'description' },
                { title: 'Miktar', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', render: (value) => `${value} TRY` },
                { title: 'Toplam', dataIndex: 'total', key: 'total', render: (value) => `${value} TRY` },
              ]}
              dataSource={selectedInvoice.items}
              rowKey="id"
              pagination={false}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Ara Toplam</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text>{selectedInvoice.amount} TRY</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>KDV (%18)</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text>{selectedInvoice.tax} TRY</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Genel Toplam</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {selectedInvoice.total} TRY
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />

            {selectedInvoice.status === 'paid' && (
              <>
                <Divider />
                <Alert
                  message="Ödeme Bilgisi"
                  description={`Bu fatura ${dayjs(selectedInvoice.paymentDate).format('DD/MM/YYYY')} tarihinde ${selectedInvoice.paymentMethod} ile ödenmiştir.`}
                  type="success"
                  showIcon
                />
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;