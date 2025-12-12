import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Button, List, Avatar, Spin } from 'antd';
import {
  FileTextOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  RiseOutlined,
  GlobalOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePages, useBlogPosts, useFAQItems } from '../../../hooks/useCMS';
import { PageDto, BlogPostListDto } from '../../../services/api/cmsService';

const { Title, Text } = Typography;

const CMSDashboard: React.FC = () => {
  const navigate = useNavigate();

  // API hooks
  const { data: pages = [], isLoading: pagesLoading } = usePages();
  const { data: blogPosts = [], isLoading: blogLoading } = useBlogPosts();
  const { data: faqItems = [], isLoading: faqLoading } = useFAQItems();

  const isLoading = pagesLoading || blogLoading || faqLoading;

  // Calculate stats from API data
  const stats = [
    {
      title: 'Toplam Sayfa',
      value: pages.length,
      icon: <FileTextOutlined />,
      color: '#667eea',
      published: pages.filter(p => p.status === 'Published').length,
    },
    {
      title: 'Blog Yazısı',
      value: blogPosts.length,
      icon: <ReadOutlined />,
      color: '#f093fb',
      published: blogPosts.filter(p => p.status === 'Published').length,
    },
    {
      title: 'SSS',
      value: faqItems.length,
      icon: <QuestionCircleOutlined />,
      color: '#52c41a',
      published: faqItems.filter(f => f.isActive).length,
    },
    {
      title: 'Toplam Görüntüleme',
      value: blogPosts.reduce((sum, p) => sum + p.viewCount, 0),
      icon: <EyeOutlined />,
      color: '#1890ff',
      published: 0,
    },
  ];

  // Get recent pages (sorted by updatedAt or createdAt)
  const recentPages = [...pages]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Get recent blog posts
  const recentBlogPosts = [...blogPosts]
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || '').getTime() || 0;
      const dateB = new Date(b.publishedAt || '').getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'green';
      case 'Draft':
        return 'orange';
      case 'Archived':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Published':
        return 'Yayında';
      case 'Draft':
        return 'Taslak';
      case 'Archived':
        return 'Arşiv';
      default:
        return status;
    }
  };

  const pageColumns = [
    {
      title: 'Sayfa',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: PageDto) => (
        <Space>
          <FileTextOutlined />
          <span>{text}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.slug}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Son Güncelleme',
      key: 'updatedAt',
      render: (_: any, record: PageDto) => formatDate(record.updatedAt || record.createdAt),
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_: any, record: PageDto) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate('/cms/pages')} />
          <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(record.slug, '_blank')} />
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

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
                  stat.published > 0 ? (
                    <Text type="success" style={{ fontSize: 14 }}>
                      <RiseOutlined /> {stat.published} yayında
                    </Text>
                  ) : null
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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cms/pages')}>
                Yeni Sayfa
              </Button>
            }
          >
            <Table
              dataSource={recentPages}
              columns={pageColumns}
              pagination={false}
              size="small"
              rowKey="id"
              locale={{ emptyText: 'Henüz sayfa eklenmemiş' }}
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
              locale={{ emptyText: 'Henüz blog yazısı eklenmemiş' }}
              renderItem={(item: BlogPostListDto) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<EditOutlined />} key="edit" onClick={() => navigate('/cms/blog')} />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<ReadOutlined />} style={{ backgroundColor: '#f093fb' }} />}
                    title={item.title}
                    description={
                      <Space>
                        {item.categoryName && <Tag>{item.categoryName}</Tag>}
                        <Text type="secondary">{formatDate(item.publishedAt)}</Text>
                        <Text type="secondary"><EyeOutlined /> {item.viewCount}</Text>
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
              <Button block icon={<PlusOutlined />} onClick={() => navigate('/cms/blog')}>
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
