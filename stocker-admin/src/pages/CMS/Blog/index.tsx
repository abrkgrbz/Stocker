import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Typography, Modal, message, Dropdown, Avatar, Select, Row, Col, Statistic } from 'antd';
import {
  ReadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface BlogPost {
  key: string;
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: { name: string; avatar: string };
  status: 'published' | 'draft' | 'scheduled';
  publishDate: string;
  views: number;
  readTime: string;
}

const CMSBlog: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const posts: BlogPost[] = [
    {
      key: '1', id: 1, title: 'Stok Yönetiminde Yapay Zeka: 2024 Trendleri', excerpt: 'Yapay zeka teknolojilerinin stok yönetimini nasıl dönüştürdüğünü inceliyoruz.',
      category: 'Teknoloji', author: { name: 'Ahmet Yılmaz', avatar: '👨‍💼' }, status: 'published', publishDate: '10 Ara 2024', views: 1520, readTime: '8 dk'
    },
    {
      key: '2', id: 2, title: 'E-ticarette Envanter Optimizasyonu', excerpt: 'Online satış yapan işletmeler için envanter yönetimi stratejileri.',
      category: 'E-ticaret', author: { name: 'Elif Kaya', avatar: '👩‍💻' }, status: 'published', publishDate: '5 Ara 2024', views: 980, readTime: '6 dk'
    },
    {
      key: '3', id: 3, title: 'Depo Verimliliğini Artırmanın 10 Yolu', excerpt: 'Depo operasyonlarınızı optimize etmek için pratik öneriler.',
      category: 'Operasyon', author: { name: 'Mehmet Demir', avatar: '👨‍💻' }, status: 'published', publishDate: '28 Kas 2024', views: 756, readTime: '5 dk'
    },
    {
      key: '4', id: 4, title: 'Barkod Sistemleri: Kapsamlı Rehber', excerpt: 'Farklı barkod türleri ve işletmeniz için en uygun sistemi seçme.',
      category: 'Teknoloji', author: { name: 'Zeynep Aksoy', avatar: '👩‍🎨' }, status: 'draft', publishDate: '-', views: 0, readTime: '7 dk'
    },
    {
      key: '5', id: 5, title: 'Stok Sayımı: En İyi Uygulamalar', excerpt: 'Döngüsel sayım ve stok doğruluğunu artırma stratejileri.',
      category: 'Operasyon', author: { name: 'Ahmet Yılmaz', avatar: '👨‍💼' }, status: 'scheduled', publishDate: '15 Ara 2024', views: 0, readTime: '6 dk'
    },
    {
      key: '6', id: 6, title: 'Tedarik Zinciri Dijitalleşmesi', excerpt: 'Modern tedarik zinciri yönetimi araçları ve dijital dönüşüm.',
      category: 'Strateji', author: { name: 'Elif Kaya', avatar: '👩‍💻' }, status: 'published', publishDate: '10 Kas 2024', views: 1234, readTime: '9 dk'
    },
  ];

  const categories = ['Tümü', 'Teknoloji', 'E-ticaret', 'Operasyon', 'Strateji'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
  };

  const handleDelete = (post: BlogPost) => {
    Modal.confirm({
      title: 'Yazıyı Sil',
      content: `"${post.title}" yazısını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => message.success('Yazı silindi'),
    });
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      published: { color: 'green', text: 'Yayında' },
      draft: { color: 'orange', text: 'Taslak' },
      scheduled: { color: 'blue', text: 'Zamanlanmış' },
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const columns = [
    {
      title: 'Yazı',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: BlogPost) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.excerpt}</Text>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag>{category}</Tag>,
    },
    {
      title: 'Yazar',
      dataIndex: 'author',
      key: 'author',
      render: (author: { name: string; avatar: string }) => (
        <Space>
          <span>{author.avatar}</span>
          <span>{author.name}</span>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Yayın Tarihi',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: BlogPost, b: BlogPost) => a.views - b.views,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_: any, record: BlogPost) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/cms/blog/${record.id}`)} />
          <Button type="text" icon={<EyeOutlined />} onClick={() => window.open(`/blog/${record.id}`, '_blank')} />
          <Dropdown
            menu={{
              items: [
                { key: 'duplicate', label: 'Kopyala' },
                { key: 'status', label: record.status === 'published' ? 'Yayından Kaldır' : 'Yayınla' },
                { type: 'divider' },
                { key: 'delete', label: 'Sil', danger: true, onClick: () => handleDelete(record) },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Blog Yazıları</Title>
          <Text type="secondary">Blog içeriklerini yönetin</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cms/blog/new')}>
          Yeni Yazı
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Toplam Yazı" value={stats.total} prefix={<ReadOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Yayında" value={stats.published} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Taslak" value={stats.draft} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Toplam Görüntüleme" value={stats.totalViews} prefix={<RiseOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Yazı ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="all">Tüm Kategoriler</Option>
            {categories.slice(1).map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          dataSource={filteredPosts}
          columns={columns}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} yazı`,
          }}
        />
      </Card>
    </div>
  );
};

export default CMSBlog;
