import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Table, Tag, List, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';

const { Title, Text } = Typography;

export const AdminDashboard: React.FC = () => {
  // Mock data for charts
  const lineData = [
    { month: 'Oca', value: 3000, type: 'Gelir' },
    { month: 'Şub', value: 4000, type: 'Gelir' },
    { month: 'Mar', value: 3500, type: 'Gelir' },
    { month: 'Nis', value: 5000, type: 'Gelir' },
    { month: 'May', value: 4900, type: 'Gelir' },
    { month: 'Haz', value: 6000, type: 'Gelir' },
    { month: 'Oca', value: 2000, type: 'Gider' },
    { month: 'Şub', value: 2200, type: 'Gider' },
    { month: 'Mar', value: 2100, type: 'Gider' },
    { month: 'Nis', value: 2500, type: 'Gider' },
    { month: 'May', value: 2400, type: 'Gider' },
    { month: 'Haz', value: 2800, type: 'Gider' },
  ];

  const pieData = [
    { type: 'Satış', value: 27 },
    { type: 'CRM', value: 25 },
    { type: 'Stok', value: 18 },
    { type: 'Finans', value: 15 },
    { type: 'Diğer', value: 15 },
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
        duration: 1000,
      },
    },
    color: ['#52c41a', '#ff4d4f'],
  };

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  const recentActivities = [
    {
      id: 1,
      action: 'Yeni kullanıcı eklendi',
      user: 'Ali Yılmaz',
      time: '10 dakika önce',
      icon: <UserOutlined />,
      color: '#52c41a',
    },
    {
      id: 2,
      action: 'Fatura oluşturuldu',
      user: 'Ayşe Demir',
      time: '30 dakika önce',
      icon: <FileTextOutlined />,
      color: '#1890ff',
    },
    {
      id: 3,
      action: 'Stok güncellendi',
      user: 'Mehmet Kaya',
      time: '1 saat önce',
      icon: <ShoppingCartOutlined />,
      color: '#faad14',
    },
    {
      id: 4,
      action: 'Sistem yedeği alındı',
      user: 'Sistem',
      time: '2 saat önce',
      icon: <CloudServerOutlined />,
      color: '#722ed1',
    },
  ];

  const topProducts = [
    { id: 1, name: 'Ürün A', sales: 450, revenue: '₺45,000' },
    { id: 2, name: 'Ürün B', sales: 380, revenue: '₺38,000' },
    { id: 3, name: 'Ürün C', sales: 320, revenue: '₺32,000' },
    { id: 4, name: 'Ürün D', sales: 280, revenue: '₺28,000' },
    { id: 5, name: 'Ürün E', sales: 250, revenue: '₺25,000' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Firma genel durumu ve istatistikler</Text>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={256}
              prefix={<TeamOutlined />}
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
              title="Aylık Satış"
              value={45230}
              prefix={<DollarOutlined />}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Ürün"
              value={89}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kullanıcı"
              value={12}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> 2%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Gelir-Gider Analizi">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Modül Kullanımı">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* Tables and Lists */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="En Çok Satan Ürünler">
            <Table
              dataSource={topProducts}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Ürün',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Satış',
                  dataIndex: 'sales',
                  key: 'sales',
                  align: 'center',
                },
                {
                  title: 'Gelir',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  align: 'right',
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Son Aktiviteler">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: item.color }}
                        icon={item.icon}
                      />
                    }
                    title={item.action}
                    description={
                      <Space>
                        <Text type="secondary">{item.user}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Sistem Durumu">
            <Row gutter={16}>
              <Col span={6}>
                <Space>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Text>Sunucu</Text>
                    <br />
                    <Text type="success">Çalışıyor</Text>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div>
                    <Text>Veritabanı</Text>
                    <br />
                    <Text type="success">Bağlı</Text>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div>
                    <Text>Son Yedekleme</Text>
                    <br />
                    <Text type="secondary">2 saat önce</Text>
                  </div>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  <div>
                    <Text>Disk Kullanımı</Text>
                    <br />
                    <Text type="warning">78%</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;