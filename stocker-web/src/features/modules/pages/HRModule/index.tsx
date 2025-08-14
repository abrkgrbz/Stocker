import { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress, Space, Button, Tabs, Table, Avatar, Badge, Typography, Calendar, Timeline } from 'antd';
import { 
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  GiftOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  IdcardOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { Column, Gauge } from '@ant-design/charts';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const HRModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'Personel Yönetimi',
      description: 'Çalışan bilgilerini ve organizasyon yapısını yönetin',
      status: 'active'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'İzin Takibi',
      description: 'İzin talepleri ve onay süreçlerini yönetin',
      status: 'active'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: 'Performans Değerlendirme',
      description: 'Çalışan performansını takip edin ve değerlendirin',
      status: 'active'
    },
    {
      icon: <GiftOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      title: 'Yan Haklar',
      description: 'Maaş, prim ve yan hakları yönetin',
      status: 'coming-soon'
    }
  ];

  const statistics = [
    {
      title: 'Toplam Çalışan',
      value: 248,
      prefix: <TeamOutlined />,
      color: '#1890ff',
      trend: '+5',
      trendUp: true
    },
    {
      title: 'Aktif İzinler',
      value: 12,
      prefix: <CalendarOutlined />,
      color: '#52c41a',
      trend: '-2',
      trendUp: false
    },
    {
      title: 'Ortalama Performans',
      value: 8.2,
      suffix: '/10',
      color: '#722ed1',
      trend: '+0.3',
      trendUp: true
    },
    {
      title: 'İşe Alım',
      value: 15,
      prefix: <UserOutlined />,
      color: '#fa8c16',
      trend: '+3',
      trendUp: true
    }
  ];

  const employeeColumns = [
    {
      title: 'Çalışan',
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
            <Text type="secondary" style={{ fontSize: 12 }}>{record.position}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'İşe Başlama',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: 'Kıdem',
      dataIndex: 'seniority',
      key: 'seniority',
      render: (years: number) => `${years} yıl`
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          'active': { color: 'success', text: 'Aktif' },
          'leave': { color: 'warning', text: 'İzinde' },
          'remote': { color: 'processing', text: 'Uzaktan' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Badge status={config.color as any} text={config.text} />;
      }
    }
  ];

  const employeeData = [
    {
      key: '1',
      name: 'Ahmet Yılmaz',
      position: 'Yazılım Geliştirici',
      department: 'Teknoloji',
      startDate: '2020-03-15',
      seniority: 4,
      status: 'active',
      color: '#1890ff'
    },
    {
      key: '2',
      name: 'Ayşe Demir',
      position: 'İK Uzmanı',
      department: 'İnsan Kaynakları',
      startDate: '2019-06-01',
      seniority: 5,
      status: 'active',
      color: '#52c41a'
    },
    {
      key: '3',
      name: 'Mehmet Kaya',
      position: 'Satış Müdürü',
      department: 'Satış',
      startDate: '2018-01-10',
      seniority: 6,
      status: 'leave',
      color: '#722ed1'
    },
    {
      key: '4',
      name: 'Zeynep Öz',
      position: 'Muhasebe Uzmanı',
      department: 'Finans',
      startDate: '2021-09-01',
      seniority: 3,
      status: 'remote',
      color: '#fa8c16'
    }
  ];

  const leaveRequests = [
    {
      id: 1,
      employee: 'Can Yılmaz',
      type: 'Yıllık İzin',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      days: 5,
      status: 'pending'
    },
    {
      id: 2,
      employee: 'Elif Demir',
      type: 'Hastalık İzni',
      startDate: '2024-01-12',
      endDate: '2024-01-13',
      days: 2,
      status: 'approved'
    },
    {
      id: 3,
      employee: 'Ali Kaya',
      type: 'Doğum İzni',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      days: 14,
      status: 'pending'
    }
  ];

  const departmentData = [
    { department: 'Teknoloji', count: 65 },
    { department: 'Satış', count: 48 },
    { department: 'Finans', count: 35 },
    { department: 'İK', count: 28 },
    { department: 'Operasyon', count: 42 },
    { department: 'Pazarlama', count: 30 }
  ];

  const upcomingEvents = [
    {
      date: '15 Ocak',
      title: 'Performans Değerlendirme',
      type: 'meeting',
      participants: 12
    },
    {
      date: '18 Ocak',
      title: 'İşe Alım Mülakatları',
      type: 'interview',
      participants: 5
    },
    {
      date: '22 Ocak',
      title: 'Eğitim Programı',
      type: 'training',
      participants: 25
    },
    {
      date: '25 Ocak',
      title: 'Takım Etkinliği',
      type: 'event',
      participants: 45
    }
  ];

  const birthdays = [
    { name: 'Ahmet Yılmaz', date: '16 Ocak', department: 'Teknoloji' },
    { name: 'Ayşe Demir', date: '20 Ocak', department: 'İK' },
    { name: 'Mehmet Kaya', date: '23 Ocak', department: 'Satış' }
  ];

  const columnConfig = {
    data: departmentData,
    xField: 'department',
    yField: 'count',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      count: {
        alias: 'Çalışan Sayısı',
      },
    },
  };

  const gaugeConfig = {
    percent: 0.82,
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
        formatter: () => 'Memnuniyet',
      },
      content: {
        style: {
          fontSize: '24px',
          lineHeight: '44px',
          color: '#4B535E',
        },
        formatter: () => '82%',
      },
    },
  };

  return (
    <div className="hr-module-page">
      <PageHeader
        title="İnsan Kaynakları Modülü"
        subtitle="Çalışan yönetimi ve İK süreçlerini yönetin"
        actions={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            Yeni Çalışan
          </Button>,
          <Button key="leave" icon={<CalendarOutlined />}>
            İzin Talebi
          </Button>,
          <Button key="report" icon={<FileTextOutlined />}>
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
            <Col xs={24} lg={12}>
              <Card title="Departman Dağılımı" className="chart-card">
                <Column {...columnConfig} height={250} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Çalışan Memnuniyeti" className="chart-card">
                <Row gutter={16}>
                  <Col span={12}>
                    <Gauge {...gaugeConfig} height={200} />
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '20px 0' }}>
                      <div className="satisfaction-item">
                        <Text>İş-Yaşam Dengesi</Text>
                        <Progress percent={85} size="small" />
                      </div>
                      <div className="satisfaction-item">
                        <Text>Kariyer Gelişimi</Text>
                        <Progress percent={78} size="small" />
                      </div>
                      <div className="satisfaction-item">
                        <Text>Ücret Memnuniyeti</Text>
                        <Progress percent={72} size="small" />
                      </div>
                      <div className="satisfaction-item">
                        <Text>Çalışma Ortamı</Text>
                        <Progress percent={88} size="small" />
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={8}>
              <Card title="İzin Talepleri" className="leave-card">
                <List
                  dataSource={leaveRequests}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        item.status === 'pending' ? (
                          <Space>
                            <Button type="link" size="small">Onayla</Button>
                            <Button type="link" danger size="small">Reddet</Button>
                          </Space>
                        ) : (
                          <Tag color={item.status === 'approved' ? 'success' : 'error'}>
                            {item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                          </Tag>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        title={item.employee}
                        description={
                          <>
                            <Tag color="blue">{item.type}</Tag>
                            <Text type="secondary">
                              {item.startDate} - {item.endDate} ({item.days} gün)
                            </Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Yaklaşan Etkinlikler" className="events-card">
                <Timeline>
                  {upcomingEvents.map((event, index) => (
                    <Timeline.Item 
                      key={index}
                      color={event.type === 'meeting' ? 'blue' : event.type === 'interview' ? 'green' : 'orange'}
                    >
                      <Text strong>{event.date}</Text>
                      <br />
                      <Text>{event.title}</Text>
                      <br />
                      <Text type="secondary">{event.participants} katılımcı</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title="Doğum Günleri" 
                className="birthday-card"
                extra={<HeartOutlined style={{ color: '#ff4d4f' }} />}
              >
                <List
                  dataSource={birthdays}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<GiftOutlined style={{ fontSize: 20, color: '#fa8c16' }} />}
                        title={item.name}
                        description={
                          <>
                            <Text>{item.date}</Text>
                            <br />
                            <Text type="secondary">{item.department}</Text>
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

        <TabPane tab="Çalışanlar" key="employees">
          <Card className="employee-card">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<SearchOutlined />}>Ara</Button>
                <Button icon={<FilterOutlined />}>Filtrele</Button>
                <Button type="primary" icon={<PlusOutlined />}>Yeni Çalışan</Button>
              </Space>
            </div>
            <Table 
              columns={employeeColumns} 
              dataSource={employeeData}
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
                    'Personel bilgi yönetimi',
                    'İzin ve devamsızlık takibi',
                    'Performans değerlendirme',
                    'İşe alım süreci yönetimi',
                    'Eğitim planlama'
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
                    'Bordro entegrasyonu',
                    'Organizasyon şeması',
                    'Çalışan self-servis portalı',
                    'İK analizleri ve raporlar',
                    'Döküman yönetimi'
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