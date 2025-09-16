import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Badge, 
  Statistic, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Divider, 
  Alert, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Progress, 
  Timeline, 
  Avatar, 
  List, 
  Tabs, 
  Descriptions, 
  Upload, 
  message, 
  notification 
} from 'antd';
import {
  ReconciliationOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SendOutlined,
  CopyOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  CreditCardOutlined,
  PayCircleOutlined,
  MoreOutlined,
  SearchOutlined,
  BellOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  UploadOutlined,
  CloudUploadOutlined,
  HistoryOutlined,
  MoneyCollectOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  NumberOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Column, Line, Pie, Area } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantAddress: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: 'USD' | 'EUR' | 'TRY';
  paymentMethod?: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  attachments?: string[];
  remindersSent: number;
  lastReminderDate?: string;
  discountAmount?: number;
  subscriptionId?: string;
  recurringPeriod?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  averagePaymentTime: number;
  collectionRate: number;
  monthlyGrowth: number;
}

const InvoicesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      tenantId: 'tenant_123',
      tenantName: 'ABC Corp',
      tenantEmail: 'billing@abccorp.com',
      tenantAddress: '123 Business St, New York, NY 10001',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'paid',
      amount: 299.00,
      taxAmount: 59.80,
      totalAmount: 358.80,
      currency: 'USD',
      paymentMethod: 'Credit Card',
      paidDate: '2024-01-18',
      items: [
        {
          id: '1',
          description: 'Enterprise Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 299.00,
          total: 299.00,
          taxRate: 20
        }
      ],
      notes: 'Thank you for your business!',
      remindersSent: 0,
      subscriptionId: 'sub_123'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      tenantId: 'tenant_456',
      tenantName: 'XYZ Solutions',
      tenantEmail: 'finance@xyzsolutions.com',
      tenantAddress: '456 Tech Ave, San Francisco, CA 94105',
      issueDate: '2024-01-20',
      dueDate: '2024-02-19',
      status: 'sent',
      amount: 99.00,
      taxAmount: 19.80,
      totalAmount: 118.80,
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'Standard Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 99.00,
          total: 99.00,
          taxRate: 20
        }
      ],
      remindersSent: 1,
      lastReminderDate: '2024-02-10',
      subscriptionId: 'sub_456'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      tenantId: 'tenant_789',
      tenantName: 'Tech Agency',
      tenantEmail: 'accounting@techagency.com',
      tenantAddress: '789 Innovation Blvd, Austin, TX 73301',
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      status: 'overdue',
      amount: 199.00,
      taxAmount: 39.80,
      totalAmount: 238.80,
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'Premium Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 199.00,
          total: 199.00,
          taxRate: 20
        }
      ],
      remindersSent: 3,
      lastReminderDate: '2024-01-30',
      subscriptionId: 'sub_789'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      tenantId: 'tenant_012',
      tenantName: 'StartupCo',
      tenantEmail: 'billing@startupco.com',
      tenantAddress: '012 Startup Way, Seattle, WA 98101',
      issueDate: '2024-01-25',
      dueDate: '2024-02-24',
      status: 'draft',
      amount: 29.00,
      taxAmount: 5.80,
      totalAmount: 34.80,
      currency: 'USD',
      items: [
        {
          id: '1',
          description: 'Basic Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 29.00,
          total: 29.00,
          taxRate: 20
        }
      ],
      remindersSent: 0,
      subscriptionId: 'sub_012'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-005',
      tenantId: 'tenant_345',
      tenantName: 'Digital Solutions',
      tenantEmail: 'finance@digitalsolutions.com',
      tenantAddress: '345 Digital St, Boston, MA 02101',
      issueDate: '2024-01-05',
      dueDate: '2024-01-20',
      status: 'refunded',
      amount: 299.00,
      taxAmount: 59.80,
      totalAmount: 358.80,
      currency: 'USD',
      paymentMethod: 'Bank Transfer',
      paidDate: '2024-01-08',
      items: [
        {
          id: '1',
          description: 'Enterprise Plan - Monthly Subscription',
          quantity: 1,
          unitPrice: 299.00,
          total: 299.00,
          taxRate: 20
        }
      ],
      remindersSent: 0,
      notes: 'Refunded due to service cancellation',
      subscriptionId: 'sub_345'
    }
  ]);

  const [stats] = useState<InvoiceStats>({
    totalInvoices: 156,
    paidInvoices: 128,
    overdueInvoices: 8,
    totalRevenue: 45620,
    outstandingAmount: 3240,
    averagePaymentTime: 12.5,
    collectionRate: 94.2,
    monthlyGrowth: 8.7
  });

  // Chart data
  const revenueData = [
    { month: 'Oca', value: 35800 },
    { month: 'Şub', value: 42100 },
    { month: 'Mar', value: 38900 },
    { month: 'Nis', value: 44200 },
    { month: 'May', value: 41500 },
    { month: 'Haz', value: 45620 }
  ];

  const statusData = [
    { type: 'Ödendi', value: 82.1, count: 128 },
    { type: 'Gönderildi', value: 12.2, count: 19 },
    { type: 'Vadesi Geçti', value: 5.1, count: 8 },
    { type: 'Taslak', value: 0.6, count: 1 }
  ];

  const paymentMethodData = [
    { method: 'Kredi Kartı', amount: 28450 },
    { method: 'Banka Havalesi', amount: 12680 },
    { method: 'PayPal', amount: 3890 },
    { method: 'Diğer', value: 600 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'sent': return 'blue';
      case 'overdue': return 'red';
      case 'draft': return 'orange';
      case 'cancelled': return 'default';
      case 'refunded': return 'purple';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Ödendi';
      case 'sent': return 'Gönderildi';
      case 'overdue': return 'Vadesi Geçti';
      case 'draft': return 'Taslak';
      case 'cancelled': return 'İptal Edildi';
      case 'refunded': return 'İade Edildi';
      default: return status;
    }
  };

  const handleSendInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: 'sent' as any }
        : inv
    ));
    message.success('Fatura gönderildi');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { 
            ...inv, 
            status: 'paid' as any, 
            paidDate: dayjs().format('YYYY-MM-DD'),
            paymentMethod: 'Manual Entry'
          }
        : inv
    ));
    message.success('Fatura ödenmiş olarak işaretlendi');
  };

  const handleSendReminder = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { 
            ...inv, 
            remindersSent: inv.remindersSent + 1,
            lastReminderDate: dayjs().format('YYYY-MM-DD')
          }
        : inv
    ));
    message.success('Hatırlatma gönderildi');
  };

  const handleCreate = () => {
    form.validateFields().then(values => {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: `INV-2024-${String(invoices.length + 6).padStart(3, '0')}`,
        ...values,
        status: 'draft',
        remindersSent: 0,
        items: values.items || []
      };
      setInvoices([newInvoice, ...invoices]);
      message.success('Yeni fatura oluşturuldu');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string) => (
        <Text code strong>{text}</Text>
      )
    },
    {
      title: 'Müşteri',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string, record: Invoice) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
            {text.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.tenantEmail}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Invoice) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={status === 'paid' ? 'success' :
                   status === 'sent' ? 'processing' :
                   status === 'overdue' ? 'error' :
                   status === 'draft' ? 'warning' :
                   status === 'refunded' ? 'default' : 'default'}
            text={getStatusText(status)}
          />
          {status === 'overdue' && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {dayjs().diff(dayjs(record.dueDate), 'days')} gün gecikme
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number, record: Invoice) => (
        <Space direction="vertical" size={0}>
          <Text strong>${amount.toFixed(2)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.currency}
          </Text>
        </Space>
      )
    },
    {
      title: 'Düzenleme Tarihi',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: Invoice) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD.MM.YYYY')}</Text>
          {record.status !== 'paid' && dayjs().isAfter(dayjs(date)) && (
            <Tag color="red" style={{ fontSize: 11 }}>
              Vadesi Geçti
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Ödeme Tarihi',
      dataIndex: 'paidDate',
      key: 'paidDate',
      render: (date?: string) => (
        date ? dayjs(date).format('DD.MM.YYYY') : '-'
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Invoice) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setDetailModalVisible(true);
            }}
          >
            Detay
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="send" 
                  icon={<SendOutlined />}
                  disabled={record.status === 'sent' || record.status === 'paid'}
                  onClick={() => handleSendInvoice(record.id)}
                >
                  Gönder
                </Menu.Item>
                <Menu.Item 
                  key="mark-paid" 
                  icon={<CheckCircleOutlined />}
                  disabled={record.status === 'paid'}
                  onClick={() => handleMarkAsPaid(record.id)}
                >
                  Ödenmiş İşaretle
                </Menu.Item>
                <Menu.Item 
                  key="reminder" 
                  icon={<BellOutlined />}
                  disabled={record.status === 'paid' || record.status === 'draft'}
                  onClick={() => handleSendReminder(record.id)}
                >
                  Hatırlatma Gönder
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="preview" icon={<EyeOutlined />}>
                  Önizle
                </Menu.Item>
                <Menu.Item key="download" icon={<DownloadOutlined />}>
                  PDF İndir
                </Menu.Item>
                <Menu.Item key="print" icon={<PrinterOutlined />}>
                  Yazdır
                </Menu.Item>
                <Menu.Item key="copy" icon={<CopyOutlined />}>
                  Kopyala
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="edit" icon={<EditOutlined />}>
                  Düzenle
                </Menu.Item>
                <Menu.Item key="cancel" icon={<CloseCircleOutlined />} danger>
                  İptal Et
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const lineConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    point: {
      size: 4,
      shape: 'circle',
    },
    line: {
      color: '#52c41a',
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: statusData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (text: any, item: any) => {
        return `${item._origin.type}: ${item._origin.count}`;
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const columnConfig = {
    data: paymentMethodData,
    xField: 'method',
    yField: 'amount',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <ReconciliationOutlined /> Fatura Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <RangePicker format="DD.MM.YYYY" />
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Yeni Fatura
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Fatura"
              value={stats.totalInvoices}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ödenen Faturalar"
              value={stats.paidInvoices}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Gelir"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="USD"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tahsilat Oranı"
              value={stats.collectionRate}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Vadesi Geçen"
              value={stats.overdueInvoices}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Bekleyen Tutar"
              value={stats.outstandingAmount}
              prefix={<ClockCircleOutlined />}
              precision={0}
              suffix="USD"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ort. Ödeme Süresi"
              value={stats.averagePaymentTime}
              precision={1}
              suffix=" gün"
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aylık Büyüme"
              value={stats.monthlyGrowth}
              precision={1}
              suffix="%"
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tüm Faturalar" key="all">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Durum" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="paid">Ödendi</Option>
                <Option value="sent">Gönderildi</Option>
                <Option value="overdue">Vadesi Geçti</Option>
                <Option value="draft">Taslak</Option>
                <Option value="cancelled">İptal Edildi</Option>
                <Option value="refunded">İade Edildi</Option>
              </Select>
              <Select placeholder="Para Birimi" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="TRY">TRY</Option>
              </Select>
              <Select placeholder="Ödeme Yöntemi" style={{ width: 150 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="credit-card">Kredi Kartı</Option>
                <Option value="bank-transfer">Banka Havalesi</Option>
                <Option value="paypal">PayPal</Option>
              </Select>
              <Input.Search 
                placeholder="Fatura ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={columns}
              dataSource={invoices}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} fatura`
              }}
              scroll={{ x: 1400 }}
            />
          </TabPane>

          <TabPane tab="Analitik" key="analytics">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Aylık Gelir Trendi" size="small" style={{ marginBottom: 16 }}>
                  <Line {...lineConfig} height={200} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Fatura Durumu Dağılımı" size="small" style={{ marginBottom: 16 }}>
                  <Pie {...pieConfig} height={200} />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Ödeme Yöntemleri" size="small">
                  <Column {...columnConfig} height={250} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Vadesi Geçenler" key="overdue">
            <Alert
              message="Vadesi Geçen Faturalar"
              description="Bu faturalar için acil takip yapılması gerekmektedir."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={invoices.filter(inv => inv.status === 'overdue')}
              renderItem={invoice => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<BellOutlined />}
                      onClick={() => handleSendReminder(invoice.id)}
                    >
                      Hatırlatma Gönder
                    </Button>,
                    <Button 
                      size="small"
                      icon={<PhoneOutlined />}
                    >
                      Ara
                    </Button>,
                    <Button 
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleMarkAsPaid(invoice.id)}
                    >
                      Ödenmiş İşaretle
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{invoice.tenantName}</Text>
                        <Text code>{invoice.invoiceNumber}</Text>
                        <Tag color="red">
                          {dayjs().diff(dayjs(invoice.dueDate), 'days')} gün gecikme
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>Tutar: ${invoice.totalAmount.toFixed(2)}</Text>
                        <Text type="secondary">
                          Vade Tarihi: {dayjs(invoice.dueDate).format('DD.MM.YYYY')}
                        </Text>
                        <Text type="secondary">
                          Gönderilen Hatırlatma: {invoice.remindersSent}
                        </Text>
                        {invoice.lastReminderDate && (
                          <Text type="secondary">
                            Son Hatırlatma: {dayjs(invoice.lastReminderDate).format('DD.MM.YYYY')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Ödemeler" key="payments">
            <Timeline>
              {invoices
                .filter(inv => inv.status === 'paid')
                .sort((a, b) => dayjs(b.paidDate).diff(dayjs(a.paidDate)))
                .slice(0, 10)
                .map(invoice => (
                  <Timeline.Item color="green" key={invoice.id}>
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Text strong>${invoice.totalAmount.toFixed(2)}</Text>
                        <Text>{invoice.tenantName}</Text>
                        <Text code>{invoice.invoiceNumber}</Text>
                      </Space>
                      <Text type="secondary">
                        Ödeme Tarihi: {dayjs(invoice.paidDate).format('DD.MM.YYYY HH:mm')}
                      </Text>
                      <Text type="secondary">
                        Ödeme Yöntemi: {invoice.paymentMethod}
                      </Text>
                    </Space>
                  </Timeline.Item>
                ))}
            </Timeline>
          </TabPane>

          <TabPane tab="Raporlar" key="reports">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Yaşlandırma Raporu" size="small" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>0-30 gün</Text>
                      <Text strong>$12,450</Text>
                    </div>
                    <Progress percent={65} strokeColor="#52c41a" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>31-60 gün</Text>
                      <Text strong>$3,240</Text>
                    </div>
                    <Progress percent={17} strokeColor="#faad14" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>61-90 gün</Text>
                      <Text strong>$1,890</Text>
                    </div>
                    <Progress percent={10} strokeColor="#ff7a45" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>90+ gün</Text>
                      <Text strong>$1,520</Text>
                    </div>
                    <Progress percent={8} strokeColor="#ff4d4f" />
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Müşteri Analizi" size="small" style={{ marginBottom: 16 }}>
                  <List
                    size="small"
                    dataSource={[
                      { name: 'ABC Corp', amount: 3588, invoices: 12 },
                      { name: 'XYZ Solutions', amount: 1188, invoices: 8 },
                      { name: 'Tech Agency', amount: 2189, invoices: 11 },
                      { name: 'StartupCo', amount: 348, invoices: 3 },
                      { name: 'Digital Solutions', amount: 3588, invoices: 12 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.name}
                          description={`${item.invoices} fatura`}
                        />
                        <Text strong>${item.amount.toLocaleString()}</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Dışa Aktarma Seçenekleri" size="small">
              <Space>
                <Button icon={<FilePdfOutlined />}>PDF Rapor</Button>
                <Button icon={<FileExcelOutlined />}>Excel Rapor</Button>
                <Button icon={<FileTextOutlined />}>CSV Dışa Aktar</Button>
                <Button icon={<PrinterOutlined />}>Yazdır</Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editMode ? 'Fatura Düzenle' : 'Yeni Fatura Oluştur'}
        visible={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenantName"
                label="Müşteri Adı"
                rules={[{ required: true, message: 'Müşteri adı gereklidir' }]}
              >
                <Input placeholder="ABC Corp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tenantEmail"
                label="E-posta"
                rules={[{ required: true, type: 'email', message: 'Geçerli e-posta gereklidir' }]}
              >
                <Input placeholder="billing@abccorp.com" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="tenantAddress"
            label="Adres"
          >
            <TextArea rows={2} placeholder="Müşteri adresi" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="issueDate"
                label="Düzenleme Tarihi"
                rules={[{ required: true, message: 'Düzenleme tarihi gereklidir' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label="Vade Tarihi"
                rules={[{ required: true, message: 'Vade tarihi gereklidir' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi seçiniz' }]}
              >
                <Select placeholder="Para birimi" defaultValue="USD">
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="TRY">TRY</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>Fatura Kalemleri</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Açıklama gereklidir' }]}
                      >
                        <Input placeholder="Hizmet açıklaması" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Miktar gereklidir' }]}
                      >
                        <InputNumber min={1} placeholder="Miktar" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Birim fiyat gereklidir' }]}
                      >
                        <InputNumber min={0} placeholder="Birim Fiyat" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'taxRate']}
                      >
                        <InputNumber min={0} max={100} placeholder="KDV %" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button type="link" onClick={() => remove(name)} danger>
                        Sil
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Kalem Ekle
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={3} placeholder="Fatura notları" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Fatura Detayları"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            PDF İndir
          </Button>,
          <Button key="print" icon={<PrinterOutlined />}>
            Yazdır
          </Button>,
          <Button key="email" icon={<MailOutlined />}>
            E-posta Gönder
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedInvoice && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Fatura No" span={2}>
                <Text code strong>{selectedInvoice.invoiceNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Müşteri">
                {selectedInvoice.tenantName}
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">
                {selectedInvoice.tenantEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Adres" span={2}>
                {selectedInvoice.tenantAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Düzenleme Tarihi">
                {dayjs(selectedInvoice.issueDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Vade Tarihi">
                {dayjs(selectedInvoice.dueDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={getStatusColor(selectedInvoice.status) as any}
                  text={getStatusText(selectedInvoice.status)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">
                {selectedInvoice.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Ara Toplam">
                ${selectedInvoice.amount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="KDV">
                ${selectedInvoice.taxAmount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Genel Toplam" span={2}>
                <Text strong style={{ fontSize: 16 }}>
                  ${selectedInvoice.totalAmount.toFixed(2)}
                </Text>
              </Descriptions.Item>
              {selectedInvoice.paidDate && (
                <Descriptions.Item label="Ödeme Tarihi">
                  {dayjs(selectedInvoice.paidDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
              )}
              {selectedInvoice.paymentMethod && (
                <Descriptions.Item label="Ödeme Yöntemi">
                  {selectedInvoice.paymentMethod}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Hatırlatma Sayısı">
                {selectedInvoice.remindersSent}
              </Descriptions.Item>
              {selectedInvoice.lastReminderDate && (
                <Descriptions.Item label="Son Hatırlatma">
                  {dayjs(selectedInvoice.lastReminderDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
              )}
              {selectedInvoice.notes && (
                <Descriptions.Item label="Notlar" span={2}>
                  {selectedInvoice.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Fatura Kalemleri</Title>
            <Table
              columns={[
                {
                  title: 'Açıklama',
                  dataIndex: 'description',
                  key: 'description'
                },
                {
                  title: 'Miktar',
                  dataIndex: 'quantity',
                  key: 'quantity'
                },
                {
                  title: 'Birim Fiyat',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price: number) => `$${price.toFixed(2)}`
                },
                {
                  title: 'KDV %',
                  dataIndex: 'taxRate',
                  key: 'taxRate',
                  render: (rate: number) => `%${rate}`
                },
                {
                  title: 'Toplam',
                  dataIndex: 'total',
                  key: 'total',
                  render: (total: number) => `$${total.toFixed(2)}`
                }
              ]}
              dataSource={selectedInvoice.items}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;