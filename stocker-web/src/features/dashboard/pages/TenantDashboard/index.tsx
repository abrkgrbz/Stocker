import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Timeline,
  Tag,
  Space,
  Avatar,
  Button,
  Typography,
  Badge,
  List,
  Divider,
  Select,
  Segmented
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  RiseOutlined,
  BellOutlined,
  EyeOutlined,
  PlusOutlined,
  TrophyOutlined,
  RocketOutlined,
  PieChartOutlined,
  BarChartOutlined,
  DownloadOutlined,
  ContactsOutlined,
  BankOutlined,
  CalculatorOutlined,
  IdcardOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TruckOutlined,
  ToolOutlined,
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Line, Pie, Area } from '@ant-design/plots';
import './style.css';

const { Title, Text, Paragraph } = Typography;

export const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('overview');

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const revenueData = [
    { month: 'Ocak', value: 85000, type: 'Gelir' },
    { month: 'Şubat', value: 92000, type: 'Gelir' },
    { month: 'Mart', value: 108000, type: 'Gelir' },
    { month: 'Nisan', value: 125000, type: 'Gelir' },
    { month: 'Mayıs', value: 142000, type: 'Gelir' },
    { month: 'Haziran', value: 155000, type: 'Gelir' },
    { month: 'Ocak', value: 45000, type: 'Gider' },
    { month: 'Şubat', value: 48000, type: 'Gider' },
    { month: 'Mart', value: 52000, type: 'Gider' },
    { month: 'Nisan', value: 58000, type: 'Gider' },
    { month: 'Mayıs', value: 62000, type: 'Gider' },
    { month: 'Haziran', value: 65000, type: 'Gider' },
  ];

  const categoryData = [
    { type: 'Elektronik', value: 35 },
    { type: 'Giyim', value: 25 },
    { type: 'Gıda', value: 20 },
    { type: 'Kozmetik', value: 12 },
    { type: 'Diğer', value: 8 },
  ];

  const customerGrowthData = [
    { date: '2024-01', customers: 1200 },
    { date: '2024-02', customers: 1450 },
    { date: '2024-03', customers: 1680 },
    { date: '2024-04', customers: 1920 },
    { date: '2024-05', customers: 2150 },
    { date: '2024-06', customers: 2380 },
  ];

  const topProducts = [
    { 
      id: 1, 
      name: 'iPhone 15 Pro', 
      sales: 342, 
      revenue: 450000, 
      trend: 'up',
      image: 'https://via.placeholder.com/40' 
    },
    { 
      id: 2, 
      name: 'Samsung Galaxy S24', 
      sales: 285, 
      revenue: 320000, 
      trend: 'up',
      image: 'https://via.placeholder.com/40' 
    },
    { 
      id: 3, 
      name: 'MacBook Pro M3', 
      sales: 156, 
      revenue: 780000, 
      trend: 'down',
      image: 'https://via.placeholder.com/40' 
    },
    { 
      id: 4, 
      name: 'iPad Air', 
      sales: 198, 
      revenue: 180000, 
      trend: 'up',
      image: 'https://via.placeholder.com/40' 
    },
  ];

  const recentActivities = [
    {
      time: '10:30',
      type: 'success',
      title: 'Yeni sipariş alındı',
      description: '#SP2024-1567 - ₺3,450',
      icon: <ShoppingCartOutlined />
    },
    {
      time: '11:15',
      type: 'info',
      title: 'Yeni müşteri kaydı',
      description: 'Ahmet Yılmaz katıldı',
      icon: <UserOutlined />
    },
    {
      time: '12:00',
      type: 'warning',
      title: 'Stok uyarısı',
      description: 'iPhone 15 Pro stokta 5 adet kaldı',
      icon: <WarningOutlined />
    },
    {
      time: '14:30',
      type: 'success',
      title: 'Ödeme alındı',
      description: 'Fatura #INV-2024-089 ödendi',
      icon: <DollarOutlined />
    },
  ];

  const lineConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    legend: {
      position: 'top-right' as const,
    },
    color: ['#667eea', '#f59e0b'],
  };

  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1000,
      },
    },
  };

  const areaConfig = {
    data: customerGrowthData,
    xField: 'date',
    yField: 'customers',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#667eea 1:#764ba2',
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  return (
    <div className="tenant-dashboard">
      <Card className="welcome-banner gradient-bg">
        <Row align="middle">
          <Col flex="1">
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Hoş Geldiniz! 👋
              </Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '8px 0' }}>
                İşletmeniz bugün harika gidiyor. Satışlarınız geçen aya göre %24 arttı!
              </Paragraph>
              <Space>
                <Button type="primary" ghost icon={<PlusOutlined />}>
                  Yeni Sipariş
                </Button>
                <Button ghost style={{ color: 'white', borderColor: 'white' }} icon={<FileTextOutlined />}>
                  Raporları Görüntüle
                </Button>
              </Space>
            </Space>
          </Col>
          <Col>
            <div className="dashboard-illustration">
              <RocketOutlined style={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-primary" loading={loading}>
            <Statistic
              title="Toplam Gelir"
              value={155000}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#667eea' }}
            />
            <div className="stat-footer">
              <span className="stat-trend positive">
                <ArrowUpOutlined /> %24
              </span>
              <span className="stat-period">Geçen aya göre</span>
            </div>
            <Progress 
              percent={75} 
              strokeColor={{ from: '#667eea', to: '#764ba2' }}
              showInfo={false}
              strokeWidth={4}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-success" loading={loading}>
            <Statistic
              title="Toplam Sipariş"
              value={342}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="stat-footer">
              <span className="stat-trend positive">
                <ArrowUpOutlined /> %18
              </span>
              <span className="stat-period">Geçen aya göre</span>
            </div>
            <Progress 
              percent={82} 
              strokeColor="#10b981"
              showInfo={false}
              strokeWidth={4}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-warning" loading={loading}>
            <Statistic
              title="Aktif Müşteriler"
              value={2380}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="stat-footer">
              <span className="stat-trend positive">
                <ArrowUpOutlined /> %32
              </span>
              <span className="stat-period">Geçen aya göre</span>
            </div>
            <Progress 
              percent={65} 
              strokeColor="#f59e0b"
              showInfo={false}
              strokeWidth={4}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card stat-card-danger" loading={loading}>
            <Statistic
              title="Bekleyen Faturalar"
              value={28500}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#ef4444' }}
            />
            <div className="stat-footer">
              <span className="stat-trend negative">
                <ArrowDownOutlined /> %12
              </span>
              <span className="stat-period">Geçen aya göre</span>
            </div>
            <Progress 
              percent={35} 
              strokeColor="#ef4444"
              showInfo={false}
              strokeWidth={4}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <RiseOutlined />
                <span>Gelir & Gider Analizi</span>
              </Space>
            }
            extra={
              <Select defaultValue="6months" style={{ width: 120 }}>
                <Select.Option value="7days">Son 7 Gün</Select.Option>
                <Select.Option value="30days">Son 30 Gün</Select.Option>
                <Select.Option value="6months">Son 6 Ay</Select.Option>
                <Select.Option value="1year">Son 1 Yıl</Select.Option>
              </Select>
            }
            loading={loading}
          >
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <PieChartOutlined />
                <span>Kategori Dağılımı</span>
              </Space>
            }
            loading={loading}
          >
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#fbbf24' }} />
                <span>En Çok Satan Ürünler</span>
              </Space>
            }
            extra={<Button type="link">Tümünü Gör</Button>}
            loading={loading}
          >
            <List
              itemLayout="horizontal"
              dataSource={topProducts}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Space>
                      {item.trend === 'up' ? (
                        <Tag color="success" icon={<ArrowUpOutlined />}>Artış</Tag>
                      ) : (
                        <Tag color="error" icon={<ArrowDownOutlined />}>Düşüş</Tag>
                      )}
                    </Space>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#fbbf24' : '#667eea' }}>
                        <Avatar src={item.image} size={48} />
                      </Badge>
                    }
                    title={item.name}
                    description={
                      <Space>
                        <Text type="secondary">{item.sales} satış</Text>
                        <Divider type="vertical" />
                        <Text strong>₺{item.revenue.toLocaleString('tr-TR')}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Son Aktiviteler</span>
              </Space>
            }
            extra={
              <Badge count={4} offset={[-10, 0]}>
                <BellOutlined style={{ fontSize: 18 }} />
              </Badge>
            }
            loading={loading}
          >
            <Timeline mode="left">
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={activity.type}
                  dot={activity.icon}
                >
                  <div className="timeline-content">
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Text strong>{activity.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{activity.time}</Text>
                      </Space>
                      <Text type="secondary">{activity.description}</Text>
                    </Space>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Müşteri Büyümesi</span>
                <Tag color="success">+32%</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<DownloadOutlined />}>İndir</Button>
                <Button type="primary" icon={<EyeOutlined />}>Detaylı Rapor</Button>
              </Space>
            }
            loading={loading}
          >
            <Area {...areaConfig} height={250} />
          </Card>
        </Col>
      </Row>

      {/* Modül Kartları */}
      <Card title="İşletme Modülleri" style={{ marginBottom: 16 }}>
        <Segmented
          value={selectedModule}
          onChange={setSelectedModule}
          options={[
            { value: 'overview', label: 'Genel Bakış' },
            { value: 'crm', label: 'CRM' },
            { value: 'erp', label: 'ERP' },
            { value: 'accounting', label: 'Muhasebe' },
            { value: 'hr', label: 'İK' },
            { value: 'inventory', label: 'Stok' },
          ]}
          block
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #1890ff',
                background: 'linear-gradient(135deg, #1890ff15 0%, #1890ff05 100%)' 
              }}
              onClick={() => navigate('/app/tenant/crm')}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ContactsOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                  <Tag color="blue">CRM</Tag>
                </div>
                <Title level={4}>Müşteri İlişkileri</Title>
                <Text type="secondary">Müşteri, firma ve satış yönetimi</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Müşteriler" 
                      value={2380} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Fırsatlar" 
                      value={45} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
                <Button type="primary" block icon={<ArrowRightOutlined />}>
                  CRM'e Git
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #52c41a',
                background: 'linear-gradient(135deg, #52c41a15 0%, #52c41a05 100%)' 
              }}
              onClick={() => navigate('/app/tenant/erp')}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <BankOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                  <Tag color="green">ERP</Tag>
                </div>
                <Title level={4}>Kurumsal Planlama</Title>
                <Text type="secondary">Üretim, proje ve kaynak yönetimi</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Projeler" 
                      value={12} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Görevler" 
                      value={156} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
                <Button type="primary" block icon={<ArrowRightOutlined />}>
                  ERP'ye Git
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #fa8c16',
                background: 'linear-gradient(135deg, #fa8c1615 0%, #fa8c1605 100%)' 
              }}
              onClick={() => navigate('/app/tenant/accounting')}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CalculatorOutlined style={{ fontSize: 40, color: '#fa8c16' }} />
                  <Tag color="orange">Muhasebe</Tag>
                </div>
                <Title level={4}>Finansal Yönetim</Title>
                <Text type="secondary">Fatura, tahsilat ve muhasebe</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Faturalar" 
                      value={342} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Tahsilat" 
                      value="89%" 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
                <Button type="primary" block icon={<ArrowRightOutlined />}>
                  Muhasebe'ye Git
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #722ed1',
                background: 'linear-gradient(135deg, #722ed115 0%, #722ed105 100%)' 
              }}
              onClick={() => navigate('/app/tenant/hr')}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <IdcardOutlined style={{ fontSize: 40, color: '#722ed1' }} />
                  <Tag color="purple">İK</Tag>
                </div>
                <Title level={4}>İnsan Kaynakları</Title>
                <Text type="secondary">Personel ve özlük yönetimi</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Personel" 
                      value={48} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Bu Ay İzin" 
                      value={5} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
                <Button type="primary" block icon={<ArrowRightOutlined />}>
                  İK'ya Git
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #eb2f96',
                background: 'linear-gradient(135deg, #eb2f9615 0%, #eb2f9605 100%)' 
              }}
              onClick={() => navigate('/app/tenant/inventory')}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <ContainerOutlined style={{ fontSize: 40, color: '#eb2f96' }} />
                  <Tag color="magenta">Stok</Tag>
                </div>
                <Title level={4}>Stok Yönetimi</Title>
                <Text type="secondary">Envanter ve depo yönetimi</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Ürünler" 
                      value={1853} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Depolar" 
                      value={3} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                </Row>
                <Button type="primary" block icon={<ArrowRightOutlined />}>
                  Stok'a Git
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card 
              hoverable
              className="module-card"
              style={{ 
                borderLeft: '4px solid #13c2c2',
                background: 'linear-gradient(135deg, #13c2c215 0%, #13c2c205 100%)' 
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppstoreOutlined style={{ fontSize: 40, color: '#13c2c2' }} />
                  <Tag color="cyan">Diğer</Tag>
                </div>
                <Title level={4}>Ek Modüller</Title>
                <Text type="secondary">E-ticaret, lojistik ve daha fazlası</Text>
                <Divider style={{ margin: '12px 0' }} />
                <Space wrap>
                  <Button size="small" icon={<ShopOutlined />}>E-Ticaret</Button>
                  <Button size="small" icon={<TruckOutlined />}>Lojistik</Button>
                  <Button size="small" icon={<ToolOutlined />}>Üretim</Button>
                </Space>
                <Button type="default" block icon={<SettingOutlined />} style={{ marginTop: 12 }}>
                  Tüm Modüller
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Hızlı İşlemler */}
      <Card title="Hızlı İşlemler" className="quick-actions-card">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/invoices/new')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <FileTextOutlined style={{ fontSize: 32, color: '#667eea' }} />
                <Text>Yeni Fatura</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/inventory/products/new')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ShoppingCartOutlined style={{ fontSize: 32, color: '#10b981' }} />
                <Text>Ürün Ekle</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/crm/customers/new')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <UserOutlined style={{ fontSize: 32, color: '#f59e0b' }} />
                <Text>Müşteri Ekle</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/hr/employees/new')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <IdcardOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                <Text>Personel Ekle</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/accounting/expenses/new')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <DollarOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                <Text>Gider Ekle</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card 
              hoverable 
              className="action-card"
              onClick={() => navigate('/app/tenant/reports')}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <BarChartOutlined style={{ fontSize: 32, color: '#ef4444' }} />
                <Text>Raporlar</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};