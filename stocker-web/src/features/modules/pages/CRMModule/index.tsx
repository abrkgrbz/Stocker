import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Avatar, Badge, Typography } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  TeamOutlined,
  RiseOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const CRMModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Müşteri Yönetimi',
      description: 'Müşteri bilgilerini detaylı olarak yönetin, segmentasyon yapın',
      status: 'active'
    },
    {
      icon: <PhoneOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'İletişim Takibi',
      description: 'Tüm müşteri iletişimlerini tek yerden takip edin',
      status: 'active'
    },
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Satış Fırsatları',
      description: 'Potansiyel satışları yönetin ve dönüşüm oranlarını artırın',
      status: 'active'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'Aktivite Planlaması',
      description: 'Müşteri ziyaretleri ve toplantılarını planlayın',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Toplam Müşteri',
      value: 1234,
      prefix: <TeamOutlined />,
      color: '#1890ff',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Aktif Fırsatlar',
      value: 45,
      prefix: <RiseOutlined />,
      color: '#52c41a',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Bu Ay Kazanılan',
      value: 89500,
      prefix: <DollarOutlined />,
      suffix: '₺',
      color: '#722ed1',
      trend: '+23%',
      trendUp: true
    },
    {
      title: 'Dönüşüm Oranı',
      value: 68,
      suffix: '%',
      color: '#fa8c16',
      trend: '-2%',
      trendUp: false
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'call',
      customer: 'ABC Şirketi',
      description: 'Ürün tanıtımı yapıldı',
      time: '2 saat önce',
      status: 'completed'
    },
    {
      id: 2,
      type: 'meeting',
      customer: 'XYZ Ltd.',
      description: 'Fiyat görüşmesi planlandı',
      time: '5 saat önce',
      status: 'scheduled'
    },
    {
      id: 3,
      type: 'email',
      customer: 'Tek Teknoloji',
      description: 'Teklif gönderildi',
      time: '1 gün önce',
      status: 'pending'
    },
    {
      id: 4,
      type: 'deal',
      customer: 'Demo A.Ş.',
      description: 'Anlaşma tamamlandı',
      time: '2 gün önce',
      status: 'won'
    }
  ];

  const customerColumns = [
    {
      title: 'Müşteri',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: record.color }}>
            {text.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.company}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment: string) => (
        <Tag color={segment === 'Premium' ? 'gold' : segment === 'Standart' ? 'blue' : 'default'}>
          {segment}
        </Tag>
      )
    },
    {
      title: 'Değer',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `₺${value.toLocaleString('tr-TR')}`
    },
    {
      title: 'Son İletişim',
      dataIndex: 'lastContact',
      key: 'lastContact'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'warning'} 
          text={status === 'active' ? 'Aktif' : status === 'inactive' ? 'Pasif' : 'Potansiyel'}
        />
      )
    }
  ];

  const customerData = [
    {
      key: '1',
      name: 'Ahmet Yılmaz',
      company: 'ABC Şirketi',
      segment: 'Premium',
      value: 150000,
      lastContact: '2 gün önce',
      status: 'active',
      color: '#1890ff'
    },
    {
      key: '2',
      name: 'Ayşe Demir',
      company: 'XYZ Ltd.',
      segment: 'Standart',
      value: 75000,
      lastContact: '1 hafta önce',
      status: 'active',
      color: '#52c41a'
    },
    {
      key: '3',
      name: 'Mehmet Kaya',
      company: 'Tek Teknoloji',
      segment: 'Başlangıç',
      value: 25000,
      lastContact: '3 gün önce',
      status: 'potential',
      color: '#722ed1'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'call': return <PhoneOutlined style={{ color: '#52c41a' }} />;
      case 'meeting': return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'email': return <MailOutlined style={{ color: '#722ed1' }} />;
      case 'deal': return <DollarOutlined style={{ color: '#fa8c16' }} />;
      default: return <ExclamationCircleOutlined />;
    }
  };

  const getActivityStatus = (status: string) => {
    switch(status) {
      case 'completed': return <Tag color="success">Tamamlandı</Tag>;
      case 'scheduled': return <Tag color="blue">Planlandı</Tag>;
      case 'pending': return <Tag color="warning">Bekliyor</Tag>;
      case 'won': return <Tag color="green">Kazanıldı</Tag>;
      default: return <Tag>Bilinmiyor</Tag>;
    }
  };

  return (
    <div className="crm-module-page">
      <PageHeader
        title="CRM Modülü"
        subtitle="Müşteri ilişkileri ve satış süreçlerini yönetin"
        actions={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni Müşteri
          </Button>,
          <Button key="search" icon={<SearchOutlined />}>
            Ara
          </Button>,
          <Button key="filter" icon={<FilterOutlined />}>
            Filtrele
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
              <Card 
                title="Satış Hunisi" 
                className="dashboard-card"
                extra={<Button type="link">Detaylar</Button>}
              >
                <div className="sales-funnel">
                  <div className="funnel-stage">
                    <div className="stage-bar" style={{ width: '100%', backgroundColor: '#e6f7ff' }}>
                      <Text strong>Potansiyel Müşteriler</Text>
                      <Text className="stage-count">250</Text>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="stage-bar" style={{ width: '80%', backgroundColor: '#bae7ff' }}>
                      <Text strong>Kalifiye Edilmiş</Text>
                      <Text className="stage-count">180</Text>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="stage-bar" style={{ width: '60%', backgroundColor: '#91d5ff' }}>
                      <Text strong>Teklif Verildi</Text>
                      <Text className="stage-count">120</Text>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="stage-bar" style={{ width: '40%', backgroundColor: '#69c0ff' }}>
                      <Text strong>Müzakere</Text>
                      <Text className="stage-count">75</Text>
                    </div>
                  </div>
                  <div className="funnel-stage">
                    <div className="stage-bar" style={{ width: '25%', backgroundColor: '#40a9ff' }}>
                      <Text strong>Kazanıldı</Text>
                      <Text className="stage-count">45</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title="Son Aktiviteler" 
                className="dashboard-card"
                extra={<Button type="link">Tümü</Button>}
              >
                <List
                  dataSource={recentActivities}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getActivityIcon(item.type)}
                        title={
                          <Space>
                            <Text strong>{item.customer}</Text>
                            {getActivityStatus(item.status)}
                          </Space>
                        }
                        description={
                          <>
                            <Text>{item.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Müşteriler" key="customers">
          <Card className="customer-card">
            <Table 
              columns={customerColumns} 
              dataSource={customerData}
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
                    'Müşteri profili yönetimi',
                    'İletişim geçmişi takibi',
                    'Satış fırsatı yönetimi',
                    'Teklif ve sözleşme yönetimi',
                    'Müşteri segmentasyonu'
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
                    'Satış hunisi analizi',
                    'Performans raporları',
                    'E-posta entegrasyonu',
                    'Takvim senkronizasyonu',
                    'Mobil uygulama desteği'
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