import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Timeline,
  Descriptions,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  message,
  Alert,
  Tabs,
  List,
  Badge,
  Tooltip,
  Progress,
  Divider,
  Radio,
  Checkbox,
  Upload,
  Avatar,
  Empty,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  DollarOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PrinterOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BankOutlined,
  SafetyOutlined,
  HistoryOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paidAt?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'success' | 'failed' | 'pending';
  reference?: string;
  invoiceId?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  price: number;
  billing: 'monthly' | 'yearly';
  autoRenew: boolean;
  features: string[];
}

const TenantBilling: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      date: '2024-12-01',
      dueDate: '2024-12-15',
      amount: 8474.58,
      tax: 1525.42,
      total: 10000,
      status: 'paid',
      paymentMethod: 'Kredi Kartı',
      paidAt: '2024-12-05',
      items: [
        { description: 'Enterprise Plan - Aralık 2024', quantity: 1, unitPrice: 8474.58, total: 8474.58 },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      date: '2024-11-01',
      dueDate: '2024-11-15',
      amount: 8474.58,
      tax: 1525.42,
      total: 10000,
      status: 'paid',
      paymentMethod: 'Banka Havalesi',
      paidAt: '2024-11-10',
      items: [
        { description: 'Enterprise Plan - Kasım 2024', quantity: 1, unitPrice: 8474.58, total: 8474.58 },
      ],
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      date: '2024-10-01',
      dueDate: '2024-10-15',
      amount: 8474.58,
      tax: 1525.42,
      total: 10000,
      status: 'overdue',
      items: [
        { description: 'Enterprise Plan - Ekim 2024', quantity: 1, unitPrice: 8474.58, total: 8474.58 },
      ],
    },
  ];

  const mockPayments: Payment[] = [
    {
      id: '1',
      date: '2024-12-05',
      amount: 10000,
      method: 'Kredi Kartı (*1234)',
      status: 'success',
      reference: 'TXN-ABC123',
      invoiceId: '1',
    },
    {
      id: '2',
      date: '2024-11-10',
      amount: 10000,
      method: 'Banka Havalesi',
      status: 'success',
      reference: 'REF-XYZ789',
      invoiceId: '2',
    },
    {
      id: '3',
      date: '2024-10-05',
      amount: 500,
      method: 'Kredi Kartı (*1234)',
      status: 'failed',
      reference: 'TXN-ERR001',
    },
  ];

  const subscription: Subscription = {
    id: '1',
    plan: 'Enterprise',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    price: 9999,
    billing: 'yearly',
    autoRenew: true,
    features: [
      'Sınırsız kullanıcı',
      '1000 GB depolama',
      'API erişimi',
      'Öncelikli destek',
      'Özel entegrasyonlar',
      'SLA garantisi',
    ],
  };

  const statusColors = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    cancelled: 'default',
  };

  const paymentStatusColors = {
    success: 'success',
    failed: 'error',
    pending: 'processing',
  };

  const invoiceColumns: ProColumns<Invoice>[] = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record) => (
        <Button
          type="link"
          onClick={() => setSelectedInvoice(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Tutar',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => (
        <Text strong>₺{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={statusColors[status as keyof typeof statusColors]}
          text={
            status === 'paid' ? 'Ödendi' :
            status === 'pending' ? 'Bekliyor' :
            status === 'overdue' ? 'Gecikmiş' : 'İptal'
          }
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Görüntüle">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => setSelectedInvoice(record)}
            />
          </Tooltip>
          <Tooltip title="İndir">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
          <Tooltip title="Yazdır">
            <Button type="text" icon={<PrinterOutlined />} />
          </Tooltip>
          {record.status === 'pending' || record.status === 'overdue' ? (
            <Tooltip title="Ödeme Yap">
              <Button
                type="text"
                icon={<CreditCardOutlined />}
                onClick={() => setIsPaymentModalVisible(true)}
              />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>₺{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: 'Yöntem',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Space>
          {method.includes('Kredi') ? <CreditCardOutlined /> : <BankOutlined />}
          {method}
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={paymentStatusColors[status as keyof typeof paymentStatusColors]}
          text={
            status === 'success' ? 'Başarılı' :
            status === 'failed' ? 'Başarısız' : 'Bekliyor'
          }
        />
      ),
    },
    {
      title: 'Referans',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => <Text code>{text}</Text>,
    },
  ];

  const handlePayment = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await Swal.fire({
        icon: 'success',
        title: 'Ödeme Başarılı',
        text: 'Ödemeniz başarıyla işleme alındı.',
        timer: 2000,
        showConfirmButton: false,
      });
      
      setIsPaymentModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Ödeme işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = () => {
    Modal.info({
      title: 'Plan Değişikliği',
      content: (
        <div>
          <p>Plan değişikliği için sistem yöneticisi ile iletişime geçin.</p>
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <Button icon={<MailOutlined />} block>
              Destek Ekibi ile İletişim
            </Button>
            <Button icon={<CalendarOutlined />} block>
              Toplantı Planlayın
            </Button>
          </Space>
        </div>
      ),
    });
  };

  const InvoiceModal = () => (
    <Modal
      title={`Fatura: ${selectedInvoice?.invoiceNumber}`}
      open={!!selectedInvoice}
      onCancel={() => setSelectedInvoice(null)}
      width={800}
      footer={[
        <Button key="download" icon={<DownloadOutlined />}>
          PDF İndir
        </Button>,
        <Button key="print" icon={<PrinterOutlined />}>
          Yazdır
        </Button>,
        <Button key="close" onClick={() => setSelectedInvoice(null)}>
          Kapat
        </Button>,
      ]}
    >
      {selectedInvoice && (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Descriptions title="Fatura Bilgileri" size="small" column={1}>
                <Descriptions.Item label="Fatura No">
                  {selectedInvoice.invoiceNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Tarih">
                  {dayjs(selectedInvoice.date).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Vade Tarihi">
                  {dayjs(selectedInvoice.dueDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  <Badge
                    status={statusColors[selectedInvoice.status as keyof typeof statusColors]}
                    text={
                      selectedInvoice.status === 'paid' ? 'Ödendi' :
                      selectedInvoice.status === 'pending' ? 'Bekliyor' :
                      selectedInvoice.status === 'overdue' ? 'Gecikmiş' : 'İptal'
                    }
                  />
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions title="Ödeme Bilgileri" size="small" column={1}>
                {selectedInvoice.paymentMethod && (
                  <Descriptions.Item label="Ödeme Yöntemi">
                    {selectedInvoice.paymentMethod}
                  </Descriptions.Item>
                )}
                {selectedInvoice.paidAt && (
                  <Descriptions.Item label="Ödeme Tarihi">
                    {dayjs(selectedInvoice.paidAt).format('DD.MM.YYYY')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          <Table
            dataSource={selectedInvoice.items}
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Açıklama',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Miktar',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
              },
              {
                title: 'Birim Fiyat',
                dataIndex: 'unitPrice',
                key: 'unitPrice',
                align: 'right',
                render: (price: number) => `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
              },
              {
                title: 'Toplam',
                dataIndex: 'total',
                key: 'total',
                align: 'right',
                render: (total: number) => `₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
              },
            ]}
          />

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space direction="vertical" size="small">
              <div>
                <Text>Alt Toplam: ₺{selectedInvoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
              </div>
              <div>
                <Text>KDV (%18): ₺{selectedInvoice.tax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
              </div>
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  Genel Toplam: ₺{selectedInvoice.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Text>
              </div>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );

  const PaymentModal = () => (
    <Modal
      title="Ödeme Yap"
      open={isPaymentModalVisible}
      onCancel={() => setIsPaymentModalVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePayment}
      >
        <Alert
          message="Güvenli Ödeme"
          description="Ödeme bilgileriniz SSL ile şifrelenmiştir."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="paymentMethod"
          label="Ödeme Yöntemi"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="credit_card">
                <Space>
                  <CreditCardOutlined />
                  Kredi Kartı
                </Space>
              </Radio>
              <Radio value="bank_transfer">
                <Space>
                  <BankOutlined />
                  Banka Havalesi
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Ödeme Tutarı"
          rules={[{ required: true }]}
          initialValue={10000}
        >
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
            min={0}
            step={0.01}
            size="large"
          />
        </Form.Item>

        <Form.Item name="save_card" valuePropName="checked">
          <Checkbox>Kartı gelecekte kullanmak üzere kaydet</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <PageContainer
      header={{
        title: 'Faturalama',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Faturalama' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay"
              value={10000}
              precision={2}
              prefix="₺"
              suffix={
                <Tag color="success" style={{ marginLeft: 8 }}>
                  Ödendi
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Ödenen"
              value={120000}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  <RiseOutlined /> +15%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bekleyen Ödeme"
              value={10000}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sonraki Fatura"
              value="15 gün"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Genel Bakış" key="overview">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Card title="Mevcut Abonelik" extra={
                <Button type="primary" onClick={handleChangePlan}>
                  Plan Değiştir
                </Button>
              }>
                <Descriptions column={2}>
                  <Descriptions.Item label="Plan">
                    <Space>
                      <Tag color="purple" style={{ fontSize: 16, padding: '4px 12px' }}>
                        {subscription.plan}
                      </Tag>
                      <Badge status="success" text="Aktif" />
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ücret">
                    <Text strong style={{ fontSize: 18 }}>
                      ₺{subscription.price.toLocaleString('tr-TR')}
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        /{subscription.billing === 'monthly' ? 'ay' : 'yıl'}
                      </Text>
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Başlangıç">
                    {dayjs(subscription.startDate).format('DD.MM.YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bitiş">
                    {dayjs(subscription.endDate).format('DD.MM.YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Otomatik Yenileme">
                    <Switch checked={subscription.autoRenew} disabled />
                  </Descriptions.Item>
                  <Descriptions.Item label="Sonraki Fatura">
                    <Text type="warning">
                      <CalendarOutlined /> 15 Ocak 2025
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Title level={5}>Plan Özellikleri</Title>
                <List
                  size="small"
                  dataSource={subscription.features}
                  renderItem={(feature) => (
                    <List.Item>
                      <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        {feature}
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Ödeme Yöntemi">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small" style={{ border: '1px solid #1890ff' }}>
                    <Space>
                      <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <div>
                        <Text strong>Visa •••• 1234</Text>
                        <br />
                        <Text type="secondary">Son Kullanma: 12/26</Text>
                      </div>
                    </Space>
                  </Card>
                  <Button icon={<PlusOutlined />} block>
                    Yeni Kart Ekle
                  </Button>
                </Space>
              </Card>

              <Card title="Fatura Adresi" style={{ marginTop: 16 }}>
                <Space direction="vertical" size="small">
                  <Text strong>ABC Corporation Ltd.</Text>
                  <Text>Levent, Büyükdere Cad. No:123</Text>
                  <Text>34394 İstanbul</Text>
                  <Text>Türkiye</Text>
                  <Text>Vergi No: 1234567890</Text>
                </Space>
                <Button icon={<EditOutlined />} type="link" style={{ padding: 0, marginTop: 8 }}>
                  Düzenle
                </Button>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Faturalar" key="invoices">
          <Card>
            <ProTable<Invoice>
              columns={invoiceColumns}
              dataSource={mockInvoices}
              rowKey="id"
              search={false}
              pagination={{
                pageSize: 10,
              }}
              toolBarRender={() => [
                <Button
                  key="export"
                  icon={<DownloadOutlined />}
                >
                  Tümünü İndir
                </Button>,
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                >
                  Yenile
                </Button>,
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="Ödemeler" key="payments">
          <Card>
            <Table
              dataSource={mockPayments}
              columns={paymentColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Kullanım Geçmişi" key="usage">
          <Card title="Aylık Kullanım Trendi">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Aralık 2024</Text>
                      <br />
                      <Text>450 kullanıcı • 85 GB depolama</Text>
                      <br />
                      <Progress percent={85} size="small" />
                      <Text type="secondary">₺10,000 - Ödendi</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Kasım 2024</Text>
                      <br />
                      <Text>430 kullanıcı • 82 GB depolama</Text>
                      <br />
                      <Progress percent={82} size="small" />
                      <Text type="secondary">₺10,000 - Ödendi</Text>
                    </div>
                  ),
                },
                {
                  color: 'red',
                  children: (
                    <div>
                      <Text strong>Ekim 2024</Text>
                      <br />
                      <Text>420 kullanıcı • 78 GB depolama</Text>
                      <br />
                      <Progress percent={78} size="small" />
                      <Text type="danger">₺10,000 - Gecikmiş</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Eylül 2024</Text>
                      <br />
                      <Text>400 kullanıcı • 75 GB depolama</Text>
                      <br />
                      <Progress percent={75} size="small" />
                      <Text type="secondary">₺10,000 - Ödendi</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </TabPane>

        <TabPane tab="İndirimler & Kuponlar" key="discounts">
          <Card title="Aktif İndirimler">
            <Empty
              description="Şu anda aktif bir indiriminiz bulunmuyor"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              style={{ width: '100%', marginTop: 16 }}
            >
              Kupon Kodu Kullan
            </Button>
          </Card>

          <Card title="Kullanılabilir İndirimler" style={{ marginTop: 16 }}>
            <List
              dataSource={[
                {
                  title: 'Yıllık Plan İndirimi',
                  description: 'Yıllık plana geçiş yaparak %20 tasarruf edin',
                  discount: '20%',
                  color: 'green',
                },
                {
                  title: 'Referans Bonusu',
                  description: 'Yeni müşteri getirin, bir sonraki faturanızdan %10 indirim kazanın',
                  discount: '10%',
                  color: 'blue',
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link">Kullan</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: item.color }}>
                        {item.discount}
                      </Avatar>
                    }
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Modals */}
      <InvoiceModal />
      <PaymentModal />
    </PageContainer>
  );
};

export default TenantBilling;