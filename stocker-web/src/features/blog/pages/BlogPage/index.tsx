import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Tag, Space, Input, Select, Avatar, Pagination } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagOutlined,
  SearchOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  MessageOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './style.css';
import './blog-fixes.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  comments: number;
  featured?: boolean;
}

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Dijital Dönüşümde ERP\'nin Rolü',
      excerpt: 'Modern işletmelerde dijital dönüşüm sürecinde ERP sistemlerinin önemi ve Stocker\'ın sunduğu avantajlar.',
      content: '',
      author: 'Dr. Ahmet Yılmaz',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=667eea&color=fff',
      date: '2024-01-20',
      readTime: '8 dk',
      category: 'Dijital Dönüşüm',
      tags: ['ERP', 'Dijitalleşme', 'İş Süreçleri'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      views: 2340,
      likes: 156,
      comments: 23,
      featured: true
    },
    {
      id: 2,
      title: 'KOBİ\'ler İçin Stok Yönetimi İpuçları',
      excerpt: 'Küçük ve orta ölçekli işletmeler için etkili stok yönetimi stratejileri ve best practice\'ler.',
      content: '',
      author: 'Mehmet Demir',
      authorAvatar: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=764ba2&color=fff',
      date: '2024-01-18',
      readTime: '6 dk',
      category: 'Stok Yönetimi',
      tags: ['Stok', 'KOBİ', 'Verimlilik'],
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop',
      views: 1890,
      likes: 98,
      comments: 15
    },
    {
      id: 3,
      title: 'E-Ticaret Entegrasyonları ile Satışları Artırın',
      excerpt: 'Trendyol, Hepsiburada ve diğer platformlarla entegrasyon sayesinde satış kanallarınızı genişletin.',
      content: '',
      author: 'Zeynep Kara',
      authorAvatar: 'https://ui-avatars.com/api/?name=Zeynep+Kara&background=52c41a&color=fff',
      date: '2024-01-15',
      readTime: '10 dk',
      category: 'E-Ticaret',
      tags: ['E-Ticaret', 'Entegrasyon', 'Satış'],
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop',
      views: 3210,
      likes: 187,
      comments: 31,
      featured: true
    },
    {
      id: 4,
      title: 'Muhasebe Otomasyonunda Yeni Dönem',
      excerpt: 'e-Fatura, e-Arşiv ve e-İrsaliye süreçlerinin otomasyonu ile muhasebe işlemlerini hızlandırın.',
      content: '',
      author: 'CPA Fatma Şahin',
      authorAvatar: 'https://ui-avatars.com/api/?name=Fatma+Sahin&background=1890ff&color=fff',
      date: '2024-01-12',
      readTime: '12 dk',
      category: 'Muhasebe',
      tags: ['Muhasebe', 'e-Fatura', 'Otomasyon'],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
      views: 2670,
      likes: 145,
      comments: 28
    },
    {
      id: 5,
      title: 'CRM ile Müşteri Memnuniyetini Artırma',
      excerpt: 'Müşteri ilişkileri yönetiminde başarılı olmak için CRM modülünün etkin kullanımı.',
      content: '',
      author: 'Ayşe Yıldırım',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ayse+Yildirim&background=722ed1&color=fff',
      date: '2024-01-10',
      readTime: '7 dk',
      category: 'CRM',
      tags: ['CRM', 'Müşteri', 'Satış'],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      views: 1560,
      likes: 89,
      comments: 12
    },
    {
      id: 6,
      title: '2024 İş Trendleri ve Teknoloji',
      excerpt: 'Yeni yılda işletmeleri bekleyen teknolojik trendler ve Stocker ile nasıl hazırlanabilirsiniz.',
      content: '',
      author: 'Tech Team',
      authorAvatar: 'https://ui-avatars.com/api/?name=Tech+Team&background=faad14&color=fff',
      date: '2024-01-08',
      readTime: '15 dk',
      category: 'Teknoloji',
      tags: ['Trend', 'Teknoloji', '2024'],
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=400&fit=crop',
      views: 4120,
      likes: 234,
      comments: 45
    },
    {
      id: 7,
      title: 'İnsan Kaynakları Dijitalleşmesi',
      excerpt: 'HR süreçlerinin dijitalleşmesi ve personel yönetiminde verimliliği artırma yöntemleri.',
      content: '',
      author: 'HR Uzmanları',
      authorAvatar: 'https://ui-avatars.com/api/?name=HR+Uzmanlari&background=13c2c2&color=fff',
      date: '2024-01-05',
      readTime: '9 dk',
      category: 'İnsan Kaynakları',
      tags: ['HR', 'Dijitalleşme', 'Personel'],
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop',
      views: 1230,
      likes: 67,
      comments: 8
    },
    {
      id: 8,
      title: 'Veri Güvenliği ve KVKK Uyumluluğu',
      excerpt: 'İşletmenizde veri güvenliğini sağlama ve KVKK uyumluluğu için yapılması gerekenler.',
      content: '',
      author: 'Güvenlik Ekibi',
      authorAvatar: 'https://ui-avatars.com/api/?name=Guvenlik+Ekibi&background=f5222d&color=fff',
      date: '2024-01-03',
      readTime: '11 dk',
      category: 'Güvenlik',
      tags: ['Güvenlik', 'KVKK', 'Veri'],
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
      views: 2890,
      likes: 178,
      comments: 34
    }
  ];

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler', count: blogPosts.length },
    { value: 'digital', label: 'Dijital Dönüşüm', count: 12 },
    { value: 'stock', label: 'Stok Yönetimi', count: 8 },
    { value: 'ecommerce', label: 'E-Ticaret', count: 15 },
    { value: 'accounting', label: 'Muhasebe', count: 10 },
    { value: 'crm', label: 'CRM', count: 6 },
    { value: 'hr', label: 'İnsan Kaynakları', count: 5 },
    { value: 'technology', label: 'Teknoloji', count: 18 },
    { value: 'security', label: 'Güvenlik', count: 4 }
  ];

  const popularTags = [
    'ERP', 'Dijitalleşme', 'Stok Yönetimi', 'E-Ticaret', 
    'CRM', 'Muhasebe', 'İnsan Kaynakları', 'Entegrasyon', 
    'Otomasyon', 'Verimlilik', 'KOBİ', 'Büyüme'
  ];

  const featuredPosts = blogPosts.filter(post => post.featured);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <Layout className="blog-layout">
      <Header className="blog-header">
        <div className="header-container">
          <div className="header-content">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              type="text"
              style={{ marginRight: 16 }}
            >
              Ana Sayfa
            </Button>
            <div className="logo-section" onClick={() => navigate('/')}>
              <RocketOutlined className="logo-icon" />
              <span className="logo-text">Stocker Blog</span>
            </div>
          </div>
          <div className="header-actions">
            <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              Ücretsiz Dene
            </Button>
          </div>
        </div>
      </Header>

      <Content className="blog-content">
        <div className="hero-section">
          <Title level={1}>Stocker Blog</Title>
          <Paragraph>
            İşletmenizi büyütmek için ihtiyacınız olan bilgiler, ipuçları ve güncel haberler
          </Paragraph>
          <Search
            placeholder="Blog yazılarında ara..."
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 500, margin: '0 auto' }}
          />
        </div>

        {featuredPosts.length > 0 && (
          <div className="featured-section">
            <Title level={2}>Öne Çıkan Yazılar</Title>
            <Row gutter={[24, 24]}>
              {featuredPosts.map(post => (
                <Col xs={24} md={12} key={post.id}>
                  <Card
                    hoverable
                    cover={
                      <div className="featured-image">
                        <img alt={post.title} src={post.image} />
                        <Tag color="red" className="featured-badge">ÖNE ÇIKAN</Tag>
                      </div>
                    }
                    className="featured-card"
                  >
                    <Tag color="purple">{post.category}</Tag>
                    <Title level={3}>{post.title}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>{post.excerpt}</Paragraph>
                    <div className="post-meta">
                      <Space>
                        <Avatar size="small" src={post.authorAvatar}>
                          {post.author[0]}
                        </Avatar>
                        <Text>{post.author}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">
                          <CalendarOutlined /> {post.date}
                        </Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {post.readTime}
                        </Text>
                      </Space>
                    </div>
                    <div className="post-stats">
                      <Space>
                        <span><EyeOutlined /> {post.views}</span>
                        <span><HeartOutlined /> {post.likes}</span>
                        <span><MessageOutlined /> {post.comments}</span>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <Layout className="main-content">
          <Content className="posts-section">
            <div className="section-header">
              <Title level={2}>Son Yazılar</Title>
              <Select
                defaultValue="all"
                style={{ width: 200 }}
                onChange={setSelectedCategory}
                size="large"
              >
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </Option>
                ))}
              </Select>
            </div>

            <Row gutter={[24, 24]}>
              {currentPosts.map(post => (
                <Col xs={24} sm={12} lg={8} key={post.id}>
                  <Card
                    hoverable
                    cover={<img alt={post.title} src={post.image} />}
                    className="post-card"
                  >
                    <Tag color="blue">{post.category}</Tag>
                    <Title level={4}>{post.title}</Title>
                    <Paragraph ellipsis={{ rows: 3 }}>{post.excerpt}</Paragraph>
                    <div className="post-meta">
                      <Text type="secondary">
                        <UserOutlined /> {post.author}
                      </Text>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {post.readTime}
                      </Text>
                    </div>
                    <Button type="primary" block style={{ marginTop: 16 }}>
                      Devamını Oku
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={blogPosts.length}
                pageSize={postsPerPage}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          </Content>

          <Sider width={320} className="blog-sidebar">
            <Card className="sidebar-card">
              <Title level={4}>Popüler Etiketler</Title>
              <div className="tags-cloud">
                {popularTags.map(tag => (
                  <Tag key={tag} className="tag-item">
                    <TagOutlined /> {tag}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card className="sidebar-card newsletter-card">
              <Title level={4}>Bültenimize Abone Olun</Title>
              <Paragraph>
                En yeni yazılar ve güncellemelerden haberdar olun
              </Paragraph>
              <Input placeholder="E-posta adresiniz" size="large" />
              <Button type="primary" block size="large" style={{ marginTop: 12 }}>
                Abone Ol
              </Button>
            </Card>

            <Card className="sidebar-card">
              <Title level={4}>Kategoriler</Title>
              <div className="categories-list">
                {categories.slice(1).map(category => (
                  <div key={category.value} className="category-item">
                    <Text>{category.label}</Text>
                    <Tag>{category.count}</Tag>
                  </div>
                ))}
              </div>
            </Card>
          </Sider>
        </Layout>

        <div className="cta-section">
          <Card>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={16}>
                <Title level={3}>Stocker'ı Ücretsiz Deneyin</Title>
                <Paragraph>
                  14 gün ücretsiz deneme sürümü ile işletmenizi dijitalleştirmeye başlayın
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button size="large" onClick={() => navigate('/contact')}>
                    İletişime Geç
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<RocketOutlined />}
                    onClick={() => navigate('/register')}
                  >
                    Ücretsiz Dene
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};