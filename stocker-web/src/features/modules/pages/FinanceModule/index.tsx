import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Typography, Timeline, Alert } from 'antd';
import { 
  DollarOutlined,
  BankOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  RiseOutlined,
  FallOutlined,
  WalletOutlined,
  PieChartOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { Pie, Area, Column } from '@ant-design/charts';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const FinanceModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Fatura Yönetimi',
      description: 'Faturalarınızı oluşturun, gönderin ve takip edin',
      status: 'active'
    },
    {
      icon: <CreditCardOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Ödeme Takibi',
      description: 'Alacak ve borçlarınızı kolayca yönetin',
      status: 'active'
    },
    {
      icon: <CalculatorOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Muhasebe Entegrasyonu',
      description: 'Muhasebe süreçlerinizi otomatikleştirin',
      status: 'active'
    },
    {
      icon: <PieChartOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'Finansal Analiz',
      description: 'Detaylı finansal raporlar ve analizler',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Toplam Gelir',
      value: 2850000,
      prefix: '₺',
      color: '#52c41a',
      trend: '+22%',
      trendUp: true
    },
    {
      title: 'Toplam Gider',
      value: 1920000,
      prefix: '₺',
      color: '#ff4d4f',
      trend: '+8%',
      trendUp: false
    },
    {
      title: 'Net Kar',
      value: 930000,
      prefix: '₺',
      color: '#1890ff',
      trend: '+45%',
      trendUp: true
    },
    {
      title: 'Tahsilat Oranı',
      value: 87,
      suffix: '%',
      color: '#722ed1',
      trend: '+3%',
      trendUp: true
    }
  ];

  const cashFlowData = [
    { month: 'Ocak', gelir: 450000, gider: 320000 },
    { month: 'Şubat', gelir: 480000, gider: 310000 },
    { month: 'Mart', gelir: 520000, gider: 350000 },
    { month: 'Nisan', gelir: 490000, gider: 330000 },
    { month: 'Mayıs', gelir: 550000, gider: 340000 },
    { month: 'Haziran', gelir: 580000, gider: 360000 }
  ];

  const expenseDistribution = [
    { type: 'Personel', value: 35, color: '#1890ff' },
    { type: 'Operasyon', value: 25, color: '#52c41a' },
    { type: 'Pazarlama', value: 20, color: '#722ed1' },
    { type: 'Kira', value: 12, color: '#fa8c16' },
    { type: 'Diğer', value: 8, color: '#13c2c2' }
  ];

  const invoiceColumns = [
    {
      title: 'Fatura No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Müşteri',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>₺{amount.toLocaleString('tr-TR')}</Text>
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'dueDate',
      key: 'dueDate'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'paid': { color: 'success', text: 'Ödendi' },
          'pending': { color: 'processing', text: 'Bekliyor' },
          'overdue': { color: 'error', text: 'Gecikmiş' },
          'partial': { color: 'warning', text: 'Kısmi Ödeme' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'İşlem',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">Görüntüle</Button>
          <Button type="link" size="small">Hatırlat</Button>
        </Space>
      )
    }
  ];

  const invoiceData = [
    {
      key: '1',
      invoiceNo: 'INV-2024-001',
      customer: 'ABC Şirketi',
      amount: 45000,
      dueDate: '2024-01-15',
      status: 'paid'
    },
    {
      key: '2',
      invoiceNo: 'INV-2024-002',
      customer: 'XYZ Ltd.',
      amount: 32000,
      dueDate: '2024-01-20',
      status: 'pending'
    },
    {
      key: '3',
      invoiceNo: 'INV-2024-003',
      customer: 'Demo A.Ş.',
      amount: 28500,
      dueDate: '2024-01-05',
      status: 'overdue'
    },
    {
      key: '4',
      invoiceNo: 'INV-2024-004',
      customer: 'Test Ltd.',
      amount: 15000,
      dueDate: '2024-01-25',
      status: 'partial'
    }
  ];

  const transactions = [
    {
      id: 1,
      type: 'income',
      description: 'Satış geliri - ABC Şirketi',
      amount: 45000,
      date: '2024-01-10',
      category: 'Satış'
    },
    {
      id: 2,
      type: 'expense',
      description: 'Personel maaşları',
      amount: 120000,
      date: '2024-01-05',
      category: 'Personel'
    },
    {
      id: 3,
      type: 'income',
      description: 'Hizmet geliri',
      amount: 25000,
      date: '2024-01-08',
      category: 'Hizmet'
    },
    {
      id: 4,
      type: 'expense',
      description: 'Ofis kirası',
      amount: 15000,
      date: '2024-01-01',
      category: 'Kira'
    }
  ];

  const paymentAlerts = [
    {
      id: 1,
      title: 'Gecikmiş Fatura',
      description: 'Demo A.Ş. - ₺28,500 (5 gün gecikmiş)',
      type: 'error'
    },
    {
      id: 2,
      title: 'Yaklaşan Vade',
      description: 'XYZ Ltd. - ₺32,000 (3 gün kaldı)',
      type: 'warning'
    },
    {
      id: 3,
      title: 'Ödeme Alındı',
      description: 'ABC Şirketi - ₺45,000',
      type: 'success'
    }
  ];

  const areaConfig = {
    data: cashFlowData.flatMap(d => [
      { month: d.month, type: 'Gelir', value: d.gelir },
      { month: d.month, type: 'Gider', value: d.gider }
    ]),
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    areaStyle: {
      fillOpacity: 0.6,
    },
  };

  const pieConfig = {
    data: expenseDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  return (
    <div className="finance-module-page">
      <PageHeader
        title="Finans Modülü"
        subtitle="Finansal süreçleri yönetin ve nakit akışını takip edin"
        actions={[
          <Button key="invoice" type="primary" icon={<FileTextOutlined />}>
            Yeni Fatura
          </Button>,
          <Button key="payment" icon={<CreditCardOutlined />}>
            Ödeme Al
          </Button>,
          <Button key="report" icon={<BarChartOutlined />}>
            Rapor
          </Button>
        ]}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="module-tabs">
        <TabPane tab="Genel Bakış" key="overview">
          <Row gutter={[16, 16]}>
            {statistics.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="stat-card" hoverable>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                  />
                  <div className="stat-trend">
                    <Tag color={stat.trendUp ? 'green' : 'red'}>
                      {stat.trend}
                    </Tag>
                    <Text type="secondary">Son 30 gün</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="Nakit Akışı" className="chart-card">
                <Area {...areaConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Ödeme Uyarıları" className="alert-card">
                {paymentAlerts.map(alert => (
                  <Alert
                    key={alert.id}
                    message={alert.title}
                    description={alert.description}
                    type={alert.type as any}
                    showIcon
                    style={{ marginBottom: 12 }}
                  />
                ))}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Gider Dağılımı" className="chart-card">
                <Pie {...pieConfig} height={300} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Son İşlemler" className="transaction-card">
                <List
                  dataSource={transactions}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          item.type === 'income' 
                            ? <RiseOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                            : <FallOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                        }
                        title={
                          <Space>
                            <Text>{item.description}</Text>
                            <Tag>{item.category}</Tag>
                          </Space>
                        }
                        description={
                          <Space>
                            <Text strong style={{ color: item.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
                              {item.type === 'income' ? '+' : '-'}₺{item.amount.toLocaleString('tr-TR')}
                            </Text>
                            <Text type="secondary">{item.date}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Faturalar" key="invoices">
          <Card className="invoice-card">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<SearchOutlined />}>Ara</Button>
                <Button icon={<FilterOutlined />}>Filtrele</Button>
                <Button type="primary" icon={<PlusOutlined />}>Yeni Fatura</Button>
              </Space>
            </div>
            <Table 
              columns={invoiceColumns} 
              dataSource={invoiceData}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Bütçe Planlama" key="budget">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Aylık Bütçe Durumu">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card className="budget-item">
                      <Text type="secondary">Pazarlama</Text>
                      <Progress 
                        percent={75} 
                        strokeColor="#1890ff"
                        format={() => '₺75K / ₺100K'}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="budget-item">
                      <Text type="secondary">Operasyon</Text>
                      <Progress 
                        percent={60} 
                        strokeColor="#52c41a"
                        format={() => '₺120K / ₺200K'}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="budget-item">
                      <Text type="secondary">Personel</Text>
                      <Progress 
                        percent={90} 
                        strokeColor="#fa8c16"
                        format={() => '₺270K / ₺300K'}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Özellikler" key="features">
          <Row gutter={[16, 16]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="feature-card" 
                  hoverable
                  style={{ height: '100%' }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <Title level={5}>{feature.title}</Title>
                  <Paragraph type="secondary">{feature.description}</Paragraph>
                  {feature.status === 'coming-soon' ? (
                    <Tag color="orange">Yakında</Tag>
                  ) : (
                    <Tag color="green">Aktif</Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <Card title="Modül Yetenekleri" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <List
                  dataSource={[
                    'Fatura oluşturma ve takibi',
                    'Gelir/Gider yönetimi',
                    'Nakit akış analizi',
                    'Bütçe planlama',
                    'Vergi hesaplama'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Col>
              <Col span={12}>
                <List
                  dataSource={[
                    'Finansal raporlar',
                    'Tahsilat takibi',
                    'Banka entegrasyonu',
                    'Muhasebe entegrasyonu',
                    'Döviz kuru takibi'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};