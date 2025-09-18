import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, List, Avatar, Progress, Tag } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { Column, Area } from '@ant-design/plots';

const { Title, Text } = Typography;

export const TenantDashboard: React.FC = () => {
  // Mock data for charts
  const areaData = [
    { date: '1 Oca', value: 3200 },
    { date: '2 Oca', value: 3500 },
    { date: '3 Oca', value: 3300 },
    { date: '4 Oca', value: 4200 },
    { date: '5 Oca', value: 4800 },
    { date: '6 Oca', value: 4500 },
    { date: '7 Oca', value: 5200 },
  ];

  const columnData = [
    { day: 'Pzt', sales: 38 },
    { day: 'Sal', sales: 52 },
    { day: 'Çar', sales: 61 },
    { day: 'Per', sales: 45 },
    { day: 'Cum', sales: 78 },
    { day: 'Cmt', sales: 88 },
    { day: 'Paz', sales: 56 },
  ];

  const areaConfig = {
    data: areaData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    areaStyle: {
      fillOpacity: 0.6,
      fill: 'l(270) 0:#ffffff 0.5:#667eea 1:#764ba2',
    },
    color: '#667eea',
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1500,
      },
    },
  };

  const columnConfig = {
    data: columnData,
    xField: 'day',
    yField: 'sales',
    color: '#667eea',
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top',
      style: {
        fill: '#667eea',
      },
    },
  };

  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'Ali Yılmaz',
      amount: '₺1,250',
      status: 'completed',
      time: '10 dakika önce',
    },
    {
      id: '#ORD-002',
      customer: 'Ayşe Demir',
      amount: '₺2,340',
      status: 'processing',
      time: '25 dakika önce',
    },
    {
      id: '#ORD-003',
      customer: 'Mehmet Kaya',
      amount: '₺890',
      status: 'pending',
      time: '1 saat önce',
    },
    {
      id: '#ORD-004',
      customer: 'Fatma Şahin',
      amount: '₺3,200',
      status: 'completed',
      time: '2 saat önce',
    },
  ];

  const topSellingProducts = [
    { name: 'Ürün A', sold: 125, stock: 45, trend: 'up' },
    { name: 'Ürün B', sold: 98, stock: 12, trend: 'up' },
    { name: 'Ürün C', sold: 76, stock: 78, trend: 'down' },
    { name: 'Ürün D', sold: 54, stock: 0, trend: 'up' },
  ];

  const getStatusTag = (status: string) => {
    const statusConfig = {
      completed: { color: 'success', text: 'Tamamlandı', icon: <CheckCircleOutlined /> },
      processing: { color: 'processing', text: 'İşleniyor', icon: <SyncOutlined spin /> },
      pending: { color: 'warning', text: 'Beklemede', icon: <ClockCircleOutlined /> },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">İşletmenizin genel durumunu buradan takip edebilirsiniz</Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Günlük Satış"
              value={12340}
              prefix="₺"
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span style={{ fontSize: 14 }}>
                  <RiseOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Sipariş"
              value={48}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Müşteri"
              value={126}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Stok Durumu"
              value={89}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={89} strokeColor="#faad14" showInfo={false} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Haftalık Gelir Trendi" extra={<Text type="secondary">Son 7 gün</Text>}>
            <Area {...areaConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Günlük Satış Dağılımı" extra={<Text type="secondary">Bu hafta</Text>}>
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Son Siparişler" 
            extra={<a href="/orders">Tümünü Gör</a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentOrders}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<ShoppingCartOutlined />} style={{ backgroundColor: '#f0f2f5' }} />
                    }
                    title={
                      <Space>
                        <Text strong>{item.id}</Text>
                        {getStatusTag(item.status)}
                      </Space>
                    }
                    description={
                      <Space size="small">
                        <UserOutlined />
                        <Text>{item.customer}</Text>
                        <Text type="secondary">•</Text>
                        <ClockCircleOutlined />
                        <Text type="secondary">{item.time}</Text>
                      </Space>
                    }
                  />
                  <Text strong style={{ fontSize: 16 }}>{item.amount}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="En Çok Satan Ürünler" 
            extra={<a href="/products">Tüm Ürünler</a>}
          >
            <List
              itemLayout="horizontal"
              dataSource={topSellingProducts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<ShopOutlined />} style={{ backgroundColor: '#667eea' }} />
                    }
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        {item.trend === 'up' ? (
                          <RiseOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <FallOutlined style={{ color: '#ff4d4f' }} />
                        )}
                      </Space>
                    }
                    description={
                      <Space size="middle">
                        <span>
                          <FileTextOutlined /> Satılan: <Text strong>{item.sold}</Text>
                        </span>
                        <span>
                          <ShopOutlined /> Stok: 
                          <Text 
                            strong 
                            type={item.stock === 0 ? 'danger' : item.stock < 20 ? 'warning' : undefined}
                            style={{ marginLeft: 4 }}
                          >
                            {item.stock === 0 ? 'Tükendi' : item.stock}
                          </Text>
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hızlı İşlemler">
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: 20 }}
                >
                  <ShoppingCartOutlined style={{ fontSize: 32, color: '#667eea' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text>Yeni Sipariş</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: 20 }}
                >
                  <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text>Müşteri Ekle</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: 20 }}
                >
                  <ShopOutlined style={{ fontSize: 32, color: '#faad14' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text>Stok Girişi</Text>
                  </div>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  hoverable 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: 20 }}
                >
                  <FileTextOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text>Fatura Oluştur</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TenantDashboard;