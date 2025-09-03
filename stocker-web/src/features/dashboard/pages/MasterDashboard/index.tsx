import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Progress, Typography, Tag, Table, Timeline, Alert, Space, Badge, Button } from 'antd';
import { useNotifications } from '@/features/master/contexts/NotificationContext';
import {
  TeamOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import './style.css';

const { Title, Text, Paragraph } = Typography;

export const MasterDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  
  const sendTestNotification = () => {
    addNotification({
      type: 'info',
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir. Sistem normal çalışıyor.',
      priority: 'medium',
      category: 'system'
    });
  };
  // System Health Data
  const systemHealth = {
    cpu: 45,
    memory: 68,
    disk: 72,
    network: 35,
  };

  // Revenue Chart Data
  const revenueData = [
    { month: 'Ocak', value: 125000, type: 'Gelir' },
    { month: 'Şubat', value: 145000, type: 'Gelir' },
    { month: 'Mart', value: 168000, type: 'Gelir' },
    { month: 'Nisan', value: 185000, type: 'Gelir' },
    { month: 'Mayıs', value: 210000, type: 'Gelir' },
    { month: 'Haziran', value: 235000, type: 'Gelir' },
  ];

  // Tenant Distribution Data
  const tenantDistribution = [
    { type: 'Başlangıç', value: 245, percent: 49 },
    { type: 'Profesyonel', value: 185, percent: 37 },
    { type: 'Kurumsal', value: 70, percent: 14 },
  ];

  // Recent Tenants
  const recentTenants = [
    { id: 1, name: 'TechnoSoft Ltd.', plan: 'Profesyonel', status: 'active', date: '2024-01-10' },
    { id: 2, name: 'KayalarGrup A.Ş.', plan: 'Kurumsal', status: 'active', date: '2024-01-09' },
    { id: 3, name: 'DemirTicaret', plan: 'Başlangıç', status: 'pending', date: '2024-01-09' },
    { id: 4, name: 'YıldızHolding', plan: 'Kurumsal', status: 'active', date: '2024-01-08' },
    { id: 5, name: 'AkınSoft', plan: 'Profesyonel', status: 'suspended', date: '2024-01-08' },
  ];

  // System Events
  const systemEvents = [
    { time: '10:30', event: 'Yeni tenant kaydı: TechnoSoft Ltd.', type: 'success' },
    { time: '10:15', event: 'Yedekleme başarıyla tamamlandı', type: 'info' },
    { time: '09:45', event: 'API rate limit aşıldı: Tenant #234', type: 'warning' },
    { time: '09:30', event: 'Sistem güncellmesi uygulandı v2.4.1', type: 'success' },
    { time: '09:00', event: 'Database maintenance tamamlandı', type: 'info' },
  ];

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan: string) => {
        const color = plan === 'Kurumsal' ? 'gold' : plan === 'Profesyonel' ? 'blue' : 'green';
        return <Tag color={color}>{plan}</Tag>;
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          active: { color: 'success', text: 'Aktif' },
          pending: { color: 'warning', text: 'Onay Bekliyor' },
          suspended: { color: 'error', text: 'Askıda' },
        };
        return <Tag color={config[status as keyof typeof config].color}>{config[status as keyof typeof config].text}</Tag>;
      },
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const revenueConfig = {
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
    yAxis: {
      label: {
        formatter: (v: string) => `₺${Number(v).toLocaleString('tr-TR')}`,
      },
    },
  };

  const tenantConfig = {
    data: tenantDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '500\nToplam',
      },
    },
  };

  return (
    <PageContainer
      title="Master Dashboard"
      subTitle="Sistem yönetimi ve izleme paneli"
      extra={[
        <Button key="test-notif" type="primary" onClick={sendTestNotification}>
          Test Bildirimi Gönder
        </Button>,
        <Tag key="env" color="blue" icon={<CloudServerOutlined />}>Production</Tag>,
        <Tag key="version" color="green">v2.4.1</Tag>,
      ]}
    >
      {/* Critical Alerts */}
      <Alert
        message="Sistem Durumu"
        description="Tüm sistemler normal çalışıyor. Son 24 saatte %99.9 uptime."
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        closable
        style={{ marginBottom: 24 }}
      />

      {/* Main Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Tenant"
              value={500}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={78} showInfo={false} strokeColor="#1890ff" />
            <Text type="secondary" style={{ fontSize: 12 }}>Bu ay 45 yeni tenant</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Abonelik"
              value={485}
              prefix={<CreditCardOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={97} showInfo={false} strokeColor="#52c41a" />
            <Text type="secondary" style={{ fontSize: 12 }}>15 trial kullanıcı</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Aylık Gelir"
              value={235000}
              prefix="₺"
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={85} showInfo={false} strokeColor="#faad14" />
            <Text type="secondary" style={{ fontSize: 12 }}>Hedef: ₺275,000</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Sistem Uptime"
              value={99.9}
              suffix="%"
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress percent={99.9} showInfo={false} strokeColor="#ff4d4f" />
            <Text type="secondary" style={{ fontSize: 12 }}>30 gün kesintisiz</Text>
          </Card>
        </Col>
      </Row>

      {/* System Health & Revenue */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Sistem Sağlığı" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>CPU Kullanımı</Text>
                  <Text strong>{systemHealth.cpu}%</Text>
                </div>
                <Progress percent={systemHealth.cpu} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Bellek Kullanımı</Text>
                  <Text strong>{systemHealth.memory}%</Text>
                </div>
                <Progress percent={systemHealth.memory} strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Disk Kullanımı</Text>
                  <Text strong>{systemHealth.disk}%</Text>
                </div>
                <Progress percent={systemHealth.disk} strokeColor="#faad14" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Network I/O</Text>
                  <Text strong>{systemHealth.network}%</Text>
                </div>
                <Progress percent={systemHealth.network} strokeColor="#722ed1" />
              </div>
            </Space>
            <div style={{ marginTop: 24, padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
              <Space>
                <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <Text strong>Database Status</Text>
                  <br />
                  <Text type="success">PostgreSQL Online</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Aylık Gelir Trendi" bordered={false}>
            <Line {...revenueConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Tenant Distribution & Recent Tenants */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Tenant Dağılımı" bordered={false}>
            <Pie {...tenantConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card 
            title="Son Tenant Kayıtları" 
            bordered={false}
            extra={<a href="#">Tümünü Gör</a>}
          >
            <Table 
              columns={columns} 
              dataSource={recentTenants} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* System Events & Quick Actions */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sistem Olayları" bordered={false} extra={<Badge status="processing" text="Canlı" />}>
            <Timeline>
              {systemEvents.map((event, index) => (
                <Timeline.Item 
                  key={index}
                  color={event.type === 'success' ? 'green' : event.type === 'warning' ? 'orange' : 'blue'}
                  dot={event.type === 'warning' ? <ExclamationCircleOutlined /> : undefined}
                >
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{event.time}</Text>
                    <Text>{event.event}</Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hızlı İstatistikler" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}>
                  <Statistic
                    title="Bugünkü Kayıt"
                    value={12}
                    prefix={<UserOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                  <Statistic
                    title="API Çağrısı"
                    value="1.2M"
                    prefix={<ApiOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
                  <Statistic
                    title="Destek Talebi"
                    value={23}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#fff1f0', borderColor: '#ffccc7' }}>
                  <Statistic
                    title="Kritik Hata"
                    value={0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ fontSize: 20, color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};