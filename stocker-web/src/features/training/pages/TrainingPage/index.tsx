import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Tag, Space, Input, Select, Tabs } from 'antd';
import {
  PlayCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
  RocketOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './style.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Video {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  thumbnail: string;
  instructor: string;
  views: number;
  rating: number;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  readTime: string;
  category: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  author: string;
  date: string;
}

export const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [activeTab, setActiveTab] = useState('videos');

  const videos: Video[] = [
    {
      id: 1,
      title: "Stocker'a Başlarken",
      description: 'Platform hakkında genel bilgiler ve ilk adımlar',
      duration: '12:45',
      category: 'Genel',
      level: 'Başlangıç',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Ahmet Yılmaz',
      views: 1250,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Stok Yönetimi Modülü',
      description: 'Stok takibi, envanter yönetimi ve raporlama',
      duration: '25:30',
      category: 'Modüller',
      level: 'Orta',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Mehmet Demir',
      views: 890,
      rating: 4.7
    },
    {
      id: 3,
      title: 'CRM Modülü Detaylı Anlatım',
      description: 'Müşteri ilişkileri yönetimi ve satış süreçleri',
      duration: '32:15',
      category: 'Modüller',
      level: 'Orta',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Ayşe Kara',
      views: 1120,
      rating: 4.9
    },
    {
      id: 4,
      title: 'Muhasebe Entegrasyonları',
      description: 'e-Fatura, e-Arşiv ve muhasebe sistemleri entegrasyonu',
      duration: '18:20',
      category: 'Entegrasyonlar',
      level: 'İleri',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Fatma Şahin',
      views: 650,
      rating: 4.6
    },
    {
      id: 5,
      title: 'Raporlama ve Analizler',
      description: 'Özel raporlar oluşturma ve veri analizi',
      duration: '28:40',
      category: 'Raporlama',
      level: 'İleri',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Ali Veli',
      views: 780,
      rating: 4.8
    },
    {
      id: 6,
      title: 'İnsan Kaynakları Modülü',
      description: 'Personel yönetimi, bordro ve izin takibi',
      duration: '22:10',
      category: 'Modüller',
      level: 'Orta',
      thumbnail: '/api/placeholder/400/225',
      instructor: 'Zeynep Yıldız',
      views: 540,
      rating: 4.7
    }
  ];

  const tutorials: Tutorial[] = [
    {
      id: 1,
      title: 'Hızlı Başlangıç Rehberi',
      description: 'Stocker platformunu kullanmaya başlamak için ihtiyacınız olan temel bilgiler',
      readTime: '5 dk',
      category: 'Başlangıç',
      level: 'Başlangıç',
      author: 'Stocker Team',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Gelişmiş Stok Yönetimi Teknikleri',
      description: 'ABC analizi, minimum-maksimum stok seviyeleri ve otomatik sipariş sistemleri',
      readTime: '12 dk',
      category: 'İleri Düzey',
      level: 'İleri',
      author: 'Dr. Mehmet Özkan',
      date: '2024-01-12'
    },
    {
      id: 3,
      title: 'API Kullanımı ve Entegrasyonlar',
      description: 'REST API ile özel entegrasyonlar geliştirme',
      readTime: '15 dk',
      category: 'Geliştirici',
      level: 'İleri',
      author: 'Teknik Ekip',
      date: '2024-01-10'
    },
    {
      id: 4,
      title: 'Satış Süreci Optimizasyonu',
      description: 'CRM modülü ile satış süreçlerinizi optimize etme yöntemleri',
      readTime: '8 dk',
      category: 'Satış',
      level: 'Orta',
      author: 'Satış Uzmanları',
      date: '2024-01-08'
    }
  ];

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'general', label: 'Genel' },
    { value: 'modules', label: 'Modüller' },
    { value: 'integrations', label: 'Entegrasyonlar' },
    { value: 'reporting', label: 'Raporlama' },
    { value: 'developer', label: 'Geliştirici' }
  ];

  const levels = [
    { value: 'all', label: 'Tüm Seviyeler' },
    { value: 'beginner', label: 'Başlangıç' },
    { value: 'intermediate', label: 'Orta' },
    { value: 'advanced', label: 'İleri' }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Başlangıç': return 'green';
      case 'Orta': return 'blue';
      case 'İleri': return 'purple';
      default: return 'default';
    }
  };

  return (
    <Layout className="training-layout">
      <Header className="training-header">
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
              <span className="logo-text">Stocker Eğitim Merkezi</span>
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

      <Content className="training-content">
        <div className="hero-section">
          <Title level={1}>Eğitim ve Video Rehberleri</Title>
          <Paragraph>
            Stocker platformunu en verimli şekilde kullanmanız için hazırladığımız 
            kapsamlı eğitim içerikleri ve video rehberleri
          </Paragraph>
        </div>

        <div className="filter-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Eğitim ara..."
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                size="large"
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={setSelectedCategory}
                size="large"
              >
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                defaultValue="all"
                style={{ width: '100%' }}
                onChange={setSelectedLevel}
                size="large"
              >
                {levels.map(level => (
                  <Option key={level.value} value={level.value}>{level.label}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          className="content-tabs"
        >
          <Tabs.TabPane tab={<span><PlayCircleOutlined /> Video Eğitimler</span>} key="videos">
            <Row gutter={[24, 24]}>
              {videos.map(video => (
                <Col xs={24} sm={12} lg={8} key={video.id}>
                  <Card 
                    hoverable
                    cover={
                      <div className="video-thumbnail">
                        <img alt={video.title} src={video.thumbnail} />
                        <div className="duration-badge">{video.duration}</div>
                        <PlayCircleOutlined className="play-icon" />
                      </div>
                    }
                    className="video-card"
                  >
                    <Tag color={getLevelColor(video.level)}>{video.level}</Tag>
                    <Title level={4}>{video.title}</Title>
                    <Paragraph ellipsis={{ rows: 2 }}>{video.description}</Paragraph>
                    <div className="video-meta">
                      <Space>
                        <Text type="secondary">
                          <UserOutlined /> {video.instructor}
                        </Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{video.views} görüntülenme</Text>
                      </Space>
                      <div className="rating">
                        <StarOutlined style={{ color: '#faad14' }} />
                        <Text strong>{video.rating}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab={<span><BookOutlined /> Yazılı Rehberler</span>} key="tutorials">
            <Row gutter={[24, 24]}>
              {tutorials.map(tutorial => (
                <Col xs={24} sm={12} lg={8} key={tutorial.id}>
                  <Card hoverable className="tutorial-card">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Tag color={getLevelColor(tutorial.level)}>{tutorial.level}</Tag>
                        <Tag><ClockCircleOutlined /> {tutorial.readTime}</Tag>
                      </div>
                      <Title level={4}>{tutorial.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>{tutorial.description}</Paragraph>
                      <div className="tutorial-meta">
                        <Text type="secondary">
                          <UserOutlined /> {tutorial.author}
                        </Text>
                        <Text type="secondary">{tutorial.date}</Text>
                      </div>
                      <Button type="primary" block>Okumaya Başla</Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tabs.TabPane>
        </Tabs>

        <div className="cta-section">
          <Card>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={16}>
                <Title level={3}>Daha Fazla Eğitim İçeriğine Mi İhtiyacınız Var?</Title>
                <Paragraph>
                  Canlı eğitimlerimize katılın veya özel eğitim talebinde bulunun.
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button size="large">Canlı Eğitimler</Button>
                  <Button type="primary" size="large">İletişime Geç</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};