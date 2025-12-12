import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Button, Progress, List, Avatar } from 'antd';
import {
  FileTextOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  RiseOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CMSDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Toplam Sayfa',
      value: 12,
      icon: <FileTextOutlined />,
      color: '#667eea',
      change: '+2',
      changeType: 'increase',
    },
    {
      title: 'Blog Yazısı',
      value: 24,
      icon: <ReadOutlined />,
      color: '#f093fb',
      change: '+5',
      changeType: 'increase',
    },
    {
      title: 'SSS',
      value: 18,
      icon: <QuestionCircleOutlined />,
      color: '#52c41a',
      change: '+3',
      changeType: 'increase',
    },
    {
      title: 'Aylık Görüntüleme',
      value: 45620,
      icon: <EyeOutlined />,
      color: '#1890ff',
      change: '+12%',
      changeType: 'increase',
    },
  ];

  const recentPages = [
    { key: '1', name: 'Hakkımızda', path: '/about', status: 'published', updatedAt: '2 saat önce', views: 1234 },
    { key: '2', name: 'İletişim', path: '/contact', status: 'published', updatedAt: '5 saat önce', views: 856 },
    { key: '3', name: 'SSS', path: '/faq', status: 'published', updatedAt: '1 gün önce', views: 2341 },
    { key: '4', name: 'Kariyer', path: '/careers', status: 'draft', updatedAt: '2 gün önce', views: 432 },
    { key: '5', name: 'Demo', path: '/demo', status: 'published', updatedAt: '3 gün önce', views: 3456 },
  ];

  const recentBlogPosts = [
    { id: 1, title: 'Stok Yönetiminde AI Trendleri', category: 'Teknoloji', date: '10 Ara 2024', views: 1520 },
    { id: 2, title: 'E-ticarette Envanter Optimizasyonu', category: 'E-ticaret', date: '5 Ara 2024', views: 980 },
    { id: 3, title: 'Depo Verimliliği Artırma', category: 'Operasyon', date: '28 Kas 2024', views: 756 },
  ];

  const pageColumns = [
    {
      title: 'Sayfa',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.path}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'Yayında' : 'Taslak'}
        </Tag>
      ),
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/cms/pages${record.path}`)} />
          <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(record.path, '_blank')} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>CMS Dashboard</Title>
        <Text type="secondary">Landing page içeriklerini yönetin</Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={
                  <Space>
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    {stat.title}
                  </Space>
                }
                value={stat.value}
                suffix={
                  <Text type="success" style={{ fontSize: 14 }}>
                    <RiseOutlined /> {stat.change}
                  </Text>
                }
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Pages */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                Son Güncellenen Sayfalar
              </Space>
            }
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cms/pages/new')}>
                Yeni Sayfa
              </Button>
            }
          >
            <Table
              dataSource={recentPages}
              columns={pageColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Blog Posts */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ReadOutlined />
                Son Blog Yazıları
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/cms/blog')}>
                Tümünü Gör
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentBlogPosts}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<EditOutlined />} key="edit" onClick={() => navigate(`/cms/blog/${item.id}`)} />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ReadOutlined />} style={{ backgroundColor: '#f093fb' }} />}
                    title={item.title}
                    description={
                      <Space>
                        <Tag>{item.category}</Tag>
                        <Text type="secondary">{item.date}</Text>
                        <Text type="secondary"><EyeOutlined /> {item.views}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Quick Actions */}
          <Card title="Hızlı İşlemler" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<PlusOutlined />} onClick={() => navigate('/cms/blog/new')}>
                Yeni Blog Yazısı
              </Button>
              <Button block icon={<QuestionCircleOutlined />} onClick={() => navigate('/cms/faq')}>
                SSS Düzenle
              </Button>
              <Button block icon={<GlobalOutlined />} onClick={() => window.open('/', '_blank')}>
                Siteyi Görüntüle
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CMSDashboard;
