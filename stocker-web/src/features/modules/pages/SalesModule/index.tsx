import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Avatar, Badge, Typography, Timeline } from 'antd';
import { 
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  TrophyOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  LineChartOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { Line, Column, Pie } from '@ant-design/charts';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const SalesModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Sipariş Yönetimi',
      description: 'Siparişleri oluşturun, takip edin ve yönetin',
      status: 'active'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Teklif Hazırlama',
      description: 'Profesyonel teklifler hazırlayın ve gönderin',
      status: 'active'
    },
    {
      icon: <PercentageOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'İndirim Yönetimi',
      description: 'Kampanya ve indirimlerinizi yönetin',
      status: 'active'
    },
    {
      icon: <LineChartOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'Satış Tahminleme',
      description: 'AI destekli satış tahmin ve analizleri',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Aylık Satış',
      value: 485000,
      prefix: '₺',
      color: '#1890ff',
      trend: '+18%',
      trendUp: true
    },
    {
      title: 'Sipariş Sayısı',
      value: 234,
      prefix: <ShoppingCartOutlined />,
      color: '#52c41a',
      trend: '+12',
      trendUp: true
    },
    {
      title: 'Ortalama Sepet',
      value: 2074,
      prefix: '₺',
      color: '#722ed1',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Dönüşüm Oranı',
      value: 3.8,
      suffix: '%',
      color: '#fa8c16',
      trend: '+0.5%',
      trendUp: true
    }
  ];

  const salesData = [
    { month: 'Ocak', value: 380000 },
    { month: 'Şubat', value: 420000 },
    { month: 'Mart', value: 455000 },
    { month: 'Nisan', value: 410000 },
    { month: 'Mayıs', value: 485000 },
    { month: 'Haziran', value: 520000 }
  ];

  const productSales = [
    { product: 'Laptop', sales: 145000, percentage: 30 },
    { product: 'Telefon', sales: 120000, percentage: 25 },
    { product: 'Tablet', sales: 95000, percentage: 20 },
    { product: 'Aksesuar', sales: 75000, percentage: 15 },
    { product: 'Diğer', sales: 50000, percentage: 10 }
  ];

  const orderColumns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string) => <Text strong>#{text}</Text>
    },
    {
      title: 'Müşteri',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: record.color }}>
            {text.charAt(0)}
          </Avatar>
          <div>
            <Text>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.company}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Ürünler',
      dataIndex: 'products',
      key: 'products',
      render: (products: number) => `${products} ürün`
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>₺{amount.toLocaleString('tr-TR')}</Text>
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'pending': { color: 'warning', text: 'Bekliyor' },
          'processing': { color: 'processing', text: 'İşleniyor' },
          'shipped': { color: 'cyan', text: 'Kargoda' },
          'delivered': { color: 'success', text: 'Teslim Edildi' },
          'cancelled': { color: 'error', text: 'İptal' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const orderData = [
    {
      key: '1',
      orderNo: 'ORD-2024-001',
      customer: 'Ahmet Yılmaz',
      company: 'ABC Şirketi',
      products: 5,
      amount: 12500,
      date: '2024-01-10',
      status: 'delivered',
      color: '#1890ff'
    },
    {
      key: '2',
      orderNo: 'ORD-2024-002',
      customer: 'Ayşe Demir',
      company: 'XYZ Ltd.',
      products: 3,
      amount: 8750,
      date: '2024-01-11',
      status: 'shipped',
      color: '#52c41a'
    },
    {
      key: '3',
      orderNo: 'ORD-2024-003',
      customer: 'Mehmet Kaya',
      company: 'Tek Teknoloji',
      products: 8,
      amount: 24300,
      date: '2024-01-12',
      status: 'processing',
      color: '#722ed1'
    }
  ];

  const topSellers = [
    {
      rank: 1,
      name: 'Zeynep Öztürk',
      sales: 125000,
      deals: 45,
      avatar: 'Z',
      color: '#ffd700'
    },
    {
      rank: 2,
      name: 'Can Yılmaz',
      sales: 98000,
      deals: 38,
      avatar: 'C',
      color: '#c0c0c0'
    },
    {
      rank: 3,
      name: 'Elif Demir',
      sales: 87500,
      deals: 32,
      avatar: 'E',
      color: '#cd7f32'
    }
  ];

  const salesActivities = [
    {
      time: '09:00',
      title: 'Yeni sipariş alındı',
      description: 'ABC Şirketi - ₺15,000',
      color: 'green'
    },
    {
      time: '10:30',
      title: 'Teklif gönderildi',
      description: 'XYZ Ltd. - 3 ürün',
      color: 'blue'
    },
    {
      time: '14:00',
      title: 'Müşteri görüşmesi',
      description: 'Demo A.Ş. - Yeni proje',
      color: 'orange'
    },
    {
      time: '16:45',
      title: 'Sipariş onaylandı',
      description: 'Tek Teknoloji - ₺8,500',
      color: 'green'
    }
  ];

  const lineConfig = {
    data: salesData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const columnConfig = {
    data: productSales,
    xField: 'product',
    yField: 'sales',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      sales: {
        alias: 'Satış',
      },
    },
  };

  return (
    <div className="sales-module-page">
      <PageHeader
        title="Satış Modülü"
        subtitle="Satış süreçlerini yönetin ve performansı takip edin"
        actions={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni Sipariş
          </Button>,
          <Button key="quote" icon={<FileTextOutlined />}>
            Teklif Oluştur
          </Button>,
          <Button key="report" icon={<LineChartOutlined />}>
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
                    <Text type="secondary">Geçen aya göre</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Aylık Satış Trendi" className="chart-card">
                <Line {...lineConfig} height={250} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Ürün Bazlı Satışlar" className="chart-card">
                <Column {...columnConfig} height={250} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <Card title="En İyi Satıcılar" className="top-sellers-card">
                <List
                  dataSource={topSellers}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Badge count={item.rank} style={{ backgroundColor: item.color }}>
                            <Avatar style={{ backgroundColor: '#1890ff' }}>
                              {item.avatar}
                            </Avatar>
                          </Badge>
                        }
                        title={item.name}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>₺{item.sales.toLocaleString('tr-TR')}</Text>
                            <Text type="secondary">{item.deals} anlaşma</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Günlük Aktiviteler" className="activities-card">
                <Timeline>
                  {salesActivities.map((activity, index) => (
                    <Timeline.Item key={index} color={activity.color}>
                      <Text type="secondary">{activity.time}</Text>
                      <br />
                      <Text strong>{activity.title}</Text>
                      <br />
                      <Text>{activity.description}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Satış Hedefleri" className="targets-card">
                <div className="target-item">
                  <Text>Aylık Hedef</Text>
                  <Progress 
                    percent={78} 
                    strokeColor="#52c41a"
                    format={percent => `₺485K / ₺620K`}
                  />
                </div>
                <div className="target-item">
                  <Text>Çeyreklik Hedef</Text>
                  <Progress 
                    percent={65} 
                    strokeColor="#1890ff"
                    format={percent => `₺1.4M / ₺2.2M`}
                  />
                </div>
                <div className="target-item">
                  <Text>Yıllık Hedef</Text>
                  <Progress 
                    percent={45} 
                    strokeColor="#722ed1"
                    format={percent => `₺4.5M / ₺10M`}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Siparişler" key="orders">
          <Card className="orders-card">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<SearchOutlined />}>Ara</Button>
                <Button icon={<FilterOutlined />}>Filtrele</Button>
                <Button type="primary" icon={<PlusOutlined />}>Yeni Sipariş</Button>
              </Space>
            </div>
            <Table 
              columns={orderColumns} 
              dataSource={orderData}
              pagination={{ pageSize: 10 }}
            />
          </Card>
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
                    'Sipariş oluşturma ve takibi',
                    'Teklif hazırlama ve gönderme',
                    'Fatura entegrasyonu',
                    'Satış ekibi yönetimi',
                    'Komisyon hesaplama'
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
                    'Satış analizleri ve raporlar',
                    'Hedef takibi',
                    'Kampanya yönetimi',
                    'Müşteri bazlı fiyatlama',
                    'Stok entegrasyonu'
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