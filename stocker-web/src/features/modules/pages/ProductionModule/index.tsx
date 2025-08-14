import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Typography, Timeline, Alert, Steps } from 'antd';
import { 
  ToolOutlined,
  ExperimentOutlined,
  ControlOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  FieldTimeOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { Line, Gauge, Column } from '@ant-design/charts';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

export const ProductionModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <ToolOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Üretim Planlama',
      description: 'Üretim süreçlerini planlayın ve yönetin',
      status: 'active'
    },
    {
      icon: <ControlOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Kalite Kontrol',
      description: 'Ürün kalitesini takip edin ve raporlayın',
      status: 'active'
    },
    {
      icon: <DashboardOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Makine Takibi',
      description: 'Makine durumları ve bakım planlaması',
      status: 'active'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'IoT Entegrasyonu',
      description: 'Sensör verileri ile gerçek zamanlı takip',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Günlük Üretim',
      value: 1250,
      suffix: 'adet',
      color: '#1890ff',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Verimlilik',
      value: 87,
      suffix: '%',
      color: '#52c41a',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Kalite Oranı',
      value: 98.5,
      suffix: '%',
      color: '#722ed1',
      trend: '+0.8%',
      trendUp: true
    },
    {
      title: 'Makine Durumu',
      value: 22,
      prefix: <Text type="secondary">18/</Text>,
      suffix: 'Aktif',
      color: '#fa8c16',
      trend: '82%',
      trendUp: true
    }
  ];

  const productionOrders = [
    {
      key: '1',
      orderNo: 'PRD-2024-001',
      product: 'Model A - Premium',
      quantity: 500,
      completed: 425,
      deadline: '2024-01-15',
      status: 'in-progress',
      priority: 'high'
    },
    {
      key: '2',
      orderNo: 'PRD-2024-002',
      product: 'Model B - Standard',
      quantity: 300,
      completed: 300,
      deadline: '2024-01-12',
      status: 'completed',
      priority: 'medium'
    },
    {
      key: '3',
      orderNo: 'PRD-2024-003',
      product: 'Model C - Basic',
      quantity: 800,
      completed: 120,
      deadline: '2024-01-20',
      status: 'in-progress',
      priority: 'low'
    },
    {
      key: '4',
      orderNo: 'PRD-2024-004',
      product: 'Model A - Special',
      quantity: 200,
      completed: 0,
      deadline: '2024-01-18',
      status: 'pending',
      priority: 'high'
    }
  ];

  const machineStatus = [
    {
      id: 'MCH-001',
      name: 'CNC Torna #1',
      status: 'running',
      efficiency: 92,
      runtime: '6h 45m',
      nextMaintenance: '5 gün'
    },
    {
      id: 'MCH-002',
      name: 'CNC Freze #1',
      status: 'running',
      efficiency: 88,
      runtime: '5h 30m',
      nextMaintenance: '12 gün'
    },
    {
      id: 'MCH-003',
      name: 'Lazer Kesim',
      status: 'maintenance',
      efficiency: 0,
      runtime: '-',
      nextMaintenance: 'Bakımda'
    },
    {
      id: 'MCH-004',
      name: 'Pres Makinesi',
      status: 'idle',
      efficiency: 0,
      runtime: '-',
      nextMaintenance: '8 gün'
    }
  ];

  const qualityMetrics = [
    { date: '06:00', defectRate: 1.2, target: 2 },
    { date: '08:00', defectRate: 0.8, target: 2 },
    { date: '10:00', defectRate: 1.5, target: 2 },
    { date: '12:00', defectRate: 0.9, target: 2 },
    { date: '14:00', defectRate: 1.1, target: 2 },
    { date: '16:00', defectRate: 0.7, target: 2 }
  ];

  const productionTimeline = [
    {
      time: '08:00',
      event: 'Üretim başladı',
      description: 'Model A üretimi başladı',
      status: 'success'
    },
    {
      time: '10:30',
      event: 'Kalite kontrolü',
      description: '50 adet ürün kontrol edildi',
      status: 'processing'
    },
    {
      time: '12:00',
      event: 'Makine bakımı',
      description: 'CNC Torna #2 bakıma alındı',
      status: 'warning'
    },
    {
      time: '14:45',
      event: 'Sipariş tamamlandı',
      description: 'PRD-2024-002 tamamlandı',
      status: 'success'
    }
  ];

  const orderColumns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Ürün',
      dataIndex: 'product',
      key: 'product'
    },
    {
      title: 'İlerleme',
      key: 'progress',
      render: (_: any, record: any) => {
        const percent = Math.round((record.completed / record.quantity) * 100);
        return (
          <Space direction="vertical" size={0} style={{ width: 150 }}>
            <Progress 
              percent={percent} 
              size="small"
              strokeColor={percent === 100 ? '#52c41a' : '#1890ff'}
            />
            <Text type="secondary">{record.completed}/{record.quantity} adet</Text>
          </Space>
        );
      }
    },
    {
      title: 'Teslim Tarihi',
      dataIndex: 'deadline',
      key: 'deadline'
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = { high: 'red', medium: 'orange', low: 'blue' };
        const labels = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
        return <Tag color={colors[priority as keyof typeof colors]}>{labels[priority as keyof typeof labels]}</Tag>;
      }
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'pending': { color: 'default', text: 'Bekliyor' },
          'in-progress': { color: 'processing', text: 'Üretimde' },
          'completed': { color: 'success', text: 'Tamamlandı' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  const efficiencyGaugeConfig = {
    percent: 0.87,
    range: {
      color: 'l(0) 0:#B8E1FF 1:#3D76DD',
    },
    startAngle: Math.PI,
    endAngle: 2 * Math.PI,
    indicator: null,
    statistic: {
      title: {
        offsetY: -36,
        style: {
          fontSize: '16px',
          color: '#4B535E',
        },
        formatter: () => 'OEE',
      },
      content: {
        style: {
          fontSize: '24px',
          lineHeight: '44px',
          color: '#4B535E',
        },
        formatter: () => '87%',
      },
    },
  };

  const lineConfig = {
    data: qualityMetrics.flatMap(d => [
      { time: d.date, value: d.defectRate, type: 'Hata Oranı' },
      { time: d.date, value: d.target, type: 'Hedef' }
    ]),
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  return (
    <div className="production-module-page">
      <PageHeader
        title="Üretim Modülü"
        subtitle="Üretim süreçlerini yönetin ve takip edin"
        actions={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni İş Emri
          </Button>,
          <Button key="machine" icon={<ToolOutlined />}>
            Makine Durumu
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
                    <Text type="secondary">Bugün</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <Card title="Üretim Verimliliği (OEE)" className="efficiency-card">
                <Gauge {...efficiencyGaugeConfig} height={200} />
                <Row gutter={16} style={{ marginTop: 20 }}>
                  <Col span={8}>
                    <div className="efficiency-metric">
                      <Text type="secondary">Kullanılabilirlik</Text>
                      <Title level={4}>92%</Title>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="efficiency-metric">
                      <Text type="secondary">Performans</Text>
                      <Title level={4}>88%</Title>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="efficiency-metric">
                      <Text type="secondary">Kalite</Text>
                      <Title level={4}>98%</Title>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card title="Kalite Metrikleri" className="quality-card">
                <Line {...lineConfig} height={280} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Makine Durumları" className="machine-card">
                <List
                  dataSource={machineStatus}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div className={`machine-status-indicator ${item.status}`}>
                            {item.status === 'running' && <SyncOutlined spin />}
                            {item.status === 'maintenance' && <ToolOutlined />}
                            {item.status === 'idle' && <ClockCircleOutlined />}
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{item.name}</Text>
                            <Tag color={
                              item.status === 'running' ? 'success' : 
                              item.status === 'maintenance' ? 'warning' : 
                              'default'
                            }>
                              {item.status === 'running' ? 'Çalışıyor' : 
                               item.status === 'maintenance' ? 'Bakımda' : 
                               'Beklemede'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space size="large">
                            <Text>Verim: {item.efficiency}%</Text>
                            <Text>Çalışma: {item.runtime}</Text>
                            <Text type="secondary">Bakım: {item.nextMaintenance}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Üretim Zaman Çizelgesi" className="timeline-card">
                <Timeline>
                  {productionTimeline.map((item, index) => (
                    <Timeline.Item 
                      key={index}
                      color={
                        item.status === 'success' ? 'green' : 
                        item.status === 'warning' ? 'orange' : 
                        'blue'
                      }
                    >
                      <Text type="secondary">{item.time}</Text>
                      <br />
                      <Text strong>{item.event}</Text>
                      <br />
                      <Text>{item.description}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="İş Emirleri" key="orders">
          <Card className="orders-card">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<SearchOutlined />}>Ara</Button>
                <Button icon={<FilterOutlined />}>Filtrele</Button>
                <Button type="primary" icon={<PlusOutlined />}>Yeni İş Emri</Button>
              </Space>
            </div>
            <Table 
              columns={orderColumns} 
              dataSource={productionOrders}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Üretim Süreci" key="process">
          <Card title="Üretim Aşamaları">
            <Steps current={2} style={{ marginBottom: 32 }}>
              <Step title="Planlama" description="İş emri oluşturuldu" />
              <Step title="Malzeme Hazırlık" description="Hammadde tedarik edildi" />
              <Step title="Üretim" description="Üretim devam ediyor" />
              <Step title="Kalite Kontrol" description="Bekliyor" />
              <Step title="Paketleme" description="Bekliyor" />
              <Step title="Sevkiyat" description="Bekliyor" />
            </Steps>

            <Row gutter={16}>
              <Col span={8}>
                <Card className="process-card">
                  <Statistic
                    title="Başlangıç Zamanı"
                    value="08:00"
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="process-card">
                  <Statistic
                    title="Tahmini Bitiş"
                    value="18:00"
                    prefix={<FieldTimeOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="process-card">
                  <Statistic
                    title="Üretilen Miktar"
                    value={425}
                    suffix="/ 500"
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
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
                    'Üretim planlama ve çizelgeleme',
                    'İş emri yönetimi',
                    'Makine ve ekipman takibi',
                    'Kalite kontrol süreçleri',
                    'Hammadde takibi'
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
                    'OEE hesaplama',
                    'Bakım planlaması',
                    'Üretim raporları',
                    'Gerçek zamanlı izleme',
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