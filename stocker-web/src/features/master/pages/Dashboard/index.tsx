import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Table, Tag, Progress, List, Avatar } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  AppstoreOutlined, 
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

export const MasterDashboard: React.FC = () => {
  // Mock data for charts
  const lineData = [
    { date: '2024-01', value: 30, type: 'Yeni Firmalar' },
    { date: '2024-02', value: 40, type: 'Yeni Firmalar' },
    { date: '2024-03', value: 35, type: 'Yeni Firmalar' },
    { date: '2024-04', value: 50, type: 'Yeni Firmalar' },
    { date: '2024-05', value: 49, type: 'Yeni Firmalar' },
    { date: '2024-06', value: 60, type: 'Yeni Firmalar' },
    { date: '2024-01', value: 70, type: 'Aktif Kullanıcı' },
    { date: '2024-02', value: 80, type: 'Aktif Kullanıcı' },
    { date: '2024-03', value: 90, type: 'Aktif Kullanıcı' },
    { date: '2024-04', value: 100, type: 'Aktif Kullanıcı' },
    { date: '2024-05', value: 110, type: 'Aktif Kullanıcı' },
    { date: '2024-06', value: 120, type: 'Aktif Kullanıcı' },
  ];

  const columnData = [
    { module: 'CRM', count: 450 },
    { module: 'Satış', count: 380 },
    { module: 'Stok', count: 320 },
    { module: 'Finans', count: 280 },
    { module: 'Raporlar', count: 200 },
  ];

  const lineConfig = {
    data: lineData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const columnConfig = {
    data: columnData,
    xField: 'module',
    yField: 'count',
    label: {
      position: 'middle',
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

  const recentTenants = [
    { id: 1, name: 'ABC Şirketi', plan: 'Premium', status: 'active', date: '2024-01-15' },
    { id: 2, name: 'XYZ Ltd.', plan: 'Basic', status: 'active', date: '2024-01-14' },
    { id: 3, name: 'Demo Firma', plan: 'Trial', status: 'trial', date: '2024-01-13' },
  ];

  const systemStatus = [
    { name: 'API Server', status: 'running', uptime: '99.9%' },
    { name: 'Database', status: 'running', uptime: '99.8%' },
    { name: 'Redis Cache', status: 'running', uptime: '100%' },
    { name: 'Queue Worker', status: 'warning', uptime: '95%' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Master Dashboard</Title>
      <Text type="secondary">Sistem geneli istatistikler ve performans metrikleri</Text>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Firma"
              value={1128}
              prefix={<TeamOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Kullanıcı"
              value={8846}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Modül"
              value={45}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aylık Gelir"
              value={93438}
              prefix={<DollarOutlined />}
              suffix="₺"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Büyüme Trendi">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Popüler Modüller">
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Son Kayıtlar">
            <Table
              dataSource={recentTenants}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Firma',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Plan',
                  dataIndex: 'plan',
                  key: 'plan',
                  render: (plan: string) => (
                    <Tag color={plan === 'Premium' ? 'gold' : plan === 'Basic' ? 'blue' : 'green'}>
                      {plan}
                    </Tag>
                  ),
                },
                {
                  title: 'Durum',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'active' ? 'success' : 'warning'}>
                      {status === 'active' ? 'Aktif' : 'Deneme'}
                    </Tag>
                  ),
                },
                {
                  title: 'Tarih',
                  dataIndex: 'date',
                  key: 'date',
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Sistem Durumu">
            <List
              dataSource={systemStatus}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={item.status === 'running' ? <CheckCircleOutlined /> : <WarningOutlined />}
                        style={{
                          backgroundColor: item.status === 'running' ? '#52c41a' : '#faad14',
                        }}
                      />
                    }
                    title={item.name}
                    description={
                      <Space>
                        <Tag color={item.status === 'running' ? 'success' : 'warning'}>
                          {item.status === 'running' ? 'Çalışıyor' : 'Uyarı'}
                        </Tag>
                        <Text type="secondary">Uptime: {item.uptime}</Text>
                      </Space>
                    }
                  />
                  <Progress
                    percent={parseFloat(item.uptime)}
                    size="small"
                    status={item.status === 'running' ? 'success' : 'exception'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MasterDashboard;