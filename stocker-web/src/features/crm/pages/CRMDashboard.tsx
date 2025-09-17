import React from 'react';
import { Row, Col, Card, Statistic, Progress, List, Tag, Space, Avatar, Typography, Table, Timeline, Badge } from 'antd';
import { 
  TeamOutlined, 
  RiseOutlined, 
  DollarOutlined, 
  TrophyOutlined,
  PhoneOutlined,
  CalendarOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { Line, Column, Pie } from '@ant-design/charts';

const { Title, Text } = Typography;

export const CRMDashboard: React.FC = () => {
  // Sample data for charts
  const lineData = [
    { month: 'Ocak', value: 3200000, type: 'Gelir' },
    { month: 'Şubat', value: 3500000, type: 'Gelir' },
    { month: 'Mart', value: 4100000, type: 'Gelir' },
    { month: 'Nisan', value: 3800000, type: 'Gelir' },
    { month: 'Mayıs', value: 4500000, type: 'Gelir' },
    { month: 'Haziran', value: 5200000, type: 'Gelir' },
    { month: 'Ocak', value: 2800000, type: 'Hedef' },
    { month: 'Şubat', value: 3200000, type: 'Hedef' },
    { month: 'Mart', value: 4000000, type: 'Hedef' },
    { month: 'Nisan', value: 4200000, type: 'Hedef' },
    { month: 'Mayıs', value: 4800000, type: 'Hedef' },
    { month: 'Haziran', value: 5000000, type: 'Hedef' },
  ];

  const columnData = [
    { stage: 'Lead', count: 150, value: 1500000 },
    { stage: 'Qualified', count: 120, value: 3600000 },
    { stage: 'Proposal', count: 80, value: 4800000 },
    { stage: 'Negotiation', count: 45, value: 3150000 },
    { stage: 'Won', count: 30, value: 2400000 },
  ];

  const pieData = [
    { type: 'Technology', value: 35 },
    { type: 'Finance', value: 25 },
    { type: 'Healthcare', value: 20 },
    { type: 'Manufacturing', value: 15 },
    { type: 'Other', value: 5 },
  ];

  const recentWins = [
    { customer: 'ABC Teknoloji', amount: 450000, product: 'Enterprise Package', date: '2 gün önce' },
    { customer: 'XYZ Holding', amount: 320000, product: 'Premium CRM', date: '5 gün önce' },
    { customer: 'Demo A.Ş.', amount: 180000, product: 'Standard Package', date: '1 hafta önce' },
  ];

  const upcomingActivities = [
    { type: 'meeting', title: 'Satış toplantısı - ABC Teknoloji', time: '14:00', status: 'today' },
    { type: 'call', title: 'Demo araması - Yeni müşteri', time: '16:30', status: 'today' },
    { type: 'email', title: 'Teklif takibi - XYZ Ltd.', time: 'Yarın 10:00', status: 'tomorrow' },
    { type: 'meeting', title: 'Sözleşme görüşmesi', time: 'Yarın 15:00', status: 'tomorrow' },
  ];

  const topPerformers = [
    { name: 'Ahmet Yılmaz', avatar: 'AY', deals: 12, revenue: 2450000, achievement: 124 },
    { name: 'Ayşe Demir', avatar: 'AD', deals: 10, revenue: 1890000, achievement: 98 },
    { name: 'Mehmet Kaya', avatar: 'MK', deals: 8, revenue: 1560000, achievement: 87 },
  ];

  const lineConfig = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 2000,
      },
    },
  };

  const columnConfig = {
    data: columnData,
    xField: 'stage',
    yField: 'count',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer' as const,
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div>
      <PageHeader
        title="CRM Dashboard"
        subtitle="Satış ve müşteri ilişkileri genel görünümü"
      />

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={1234}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={75} strokeColor="#1890ff" showInfo={false} />
            <Text type="secondary">Son 30 günde +45 yeni müşteri</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Fırsatlar"
              value={89}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={82} strokeColor="#52c41a" showInfo={false} />
            <Text type="secondary">₺12.5M toplam değer</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bu Ay Gelir"
              value={5200000}
              prefix={<DollarOutlined />}
              formatter={(value) => `₺${(Number(value) / 1000000).toFixed(1)}M`}
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress percent={104} strokeColor="#722ed1" showInfo={false} />
            <Text type="secondary">Hedef: ₺5.0M (%104)</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dönüşüm Oranı"
              value={68}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Progress percent={68} strokeColor="#fa8c16" showInfo={false} />
            <Text type="secondary">Sektör ortalaması: %45</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Gelir Trendi" extra={<Tag color="blue">Son 6 Ay</Tag>}>
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Satış Hunisi" extra={<Tag color="green">Bu Ay</Tag>}>
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Lists and Activities */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card 
            title="Son Kazanılanlar" 
            extra={<a href="#">Tümü</a>}
            styles={{ body: { padding: '12px' } }}
          >
            <List
              dataSource={recentWins}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} />}
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong>{item.customer}</Text>
                        <Text style={{ fontSize: 12, color: '#52c41a' }}>
                          ₺{item.amount.toLocaleString('tr-TR')}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: 12 }}>{item.product}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.date}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Yaklaşan Aktiviteler" 
            extra={<a href="#">Takvim</a>}
            styles={{ body: { padding: '12px' } }}
          >
            <Timeline>
              {upcomingActivities.map((activity, index) => (
                <Timeline.Item 
                  key={index}
                  color={activity.status === 'today' ? 'blue' : 'gray'}
                  dot={
                    activity.type === 'meeting' ? <CalendarOutlined /> :
                    activity.type === 'call' ? <PhoneOutlined /> :
                    <MailOutlined />
                  }
                >
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 13 }}>{activity.title}</Text>
                    <Text type={activity.status === 'today' ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="En İyi Satış Temsilcileri" 
            extra={<Tag color="gold">Bu Ay</Tag>}
            styles={{ body: { padding: '12px' } }}
          >
            <List
              dataSource={topPerformers}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge count={index + 1} offset={[-5, 5]}>
                        <Avatar style={{ backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32' }}>
                          {item.avatar}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color={item.achievement >= 100 ? 'success' : 'warning'}>
                          %{item.achievement}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: 12 }}>{item.deals} anlaşma</Text>
                        <Text style={{ fontSize: 12, color: '#52c41a' }}>
                          ₺{(item.revenue / 1000000).toFixed(1)}M
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Industry Distribution */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Sektör Dağılımı">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Lead Kaynakları ve Performans">
            <Row gutter={16}>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Website"
                    value={234}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={45} size="small" />
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Referans"
                    value={156}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={30} size="small" strokeColor="#52c41a" />
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Sosyal Medya"
                    value={98}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={19} size="small" strokeColor="#722ed1" />
                </Card>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Email"
                    value={76}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={15} size="small" strokeColor="#fa8c16" />
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Etkinlik"
                    value={45}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={9} size="small" strokeColor="#13c2c2" />
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" size="small">
                  <Statistic
                    title="Diğer"
                    value={23}
                    suffix="lead"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <Progress percent={5} size="small" strokeColor="#595959" />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};