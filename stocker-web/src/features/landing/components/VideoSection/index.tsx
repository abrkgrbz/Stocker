import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Modal, Tag, Space } from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  StarFilled,
  CustomerServiceOutlined,
  RocketOutlined,
  ToolOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Paragraph, Text } = Typography;

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  category: string;
  thumbnail: string;
  embedUrl: string;
  isNew?: boolean;
  rating?: number;
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Stocker ERP Genel Tanıtım',
    description: 'Platform hakkında kapsamlı bilgi ve temel özelliklerin tanıtımı',
    duration: '8:45',
    views: '2.3K',
    category: 'Tanıtım',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isNew: true,
    rating: 4.8
  },
  {
    id: '2',
    title: 'CRM Modülü Kullanımı',
    description: 'Müşteri ilişkileri yönetimi modülünün detaylı anlatımı',
    duration: '12:30',
    views: '1.8K',
    category: 'Eğitim',
    thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9
  },
  {
    id: '3',
    title: 'Stok Yönetimi Başlangıç',
    description: 'Stok modülünde ilk adımlar ve temel işlemler',
    duration: '10:15',
    views: '3.1K',
    category: 'Eğitim',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.7
  },
  {
    id: '4',
    title: 'Finans Modülü ve Raporlama',
    description: 'Mali işlemler ve detaylı raporlama özellikleri',
    duration: '15:20',
    views: '1.5K',
    category: 'Eğitim',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.6
  },
  {
    id: '5',
    title: 'Müşteri Başarı Hikayeleri',
    description: 'Stocker kullanan işletmelerin deneyimleri',
    duration: '6:50',
    views: '4.2K',
    category: 'Başarı Hikayeleri',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isNew: true,
    rating: 5.0
  },
  {
    id: '6',
    title: 'E-Ticaret Entegrasyonu',
    description: 'Trendyol, Hepsiburada ve diğer platformlarla entegrasyon',
    duration: '9:30',
    views: '2.7K',
    category: 'Entegrasyon',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8
  }
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Tanıtım': <RocketOutlined />,
  'Eğitim': <CustomerServiceOutlined />,
  'Başarı Hikayeleri': <StarFilled />,
  'Entegrasyon': <ToolOutlined />
};

const categoryColors: Record<string, string> = {
  'Tanıtım': 'purple',
  'Eğitim': 'blue',
  'Başarı Hikayeleri': 'gold',
  'Entegrasyon': 'green'
};

export const VideoSection: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalVisible(true);
  };

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  return (
    <section className="video-section" id="videos">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="purple" className="section-tag">
            <PlayCircleOutlined /> Video Galeri
          </Tag>
          <Title level={2}>Eğitim Videoları ve Tanıtımlar</Title>
          <Paragraph>
            Stocker ERP'yi daha yakından tanıyın, eğitim videolarımızı izleyin
          </Paragraph>
        </motion.div>

        <div className="category-filters">
          {categories.map(category => (
            <Button
              key={category}
              type={activeCategory === category ? 'primary' : 'default'}
              onClick={() => setActiveCategory(category)}
              className="category-filter-btn"
              icon={category !== 'all' ? categoryIcons[category] : <BarChartOutlined />}
            >
              {category === 'all' ? 'Tümü' : category}
            </Button>
          ))}
        </div>

        <Row gutter={[32, 32]}>
          {filteredVideos.map((video, index) => (
            <Col xs={24} sm={12} lg={8} key={video.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  hoverable
                  className="video-card"
                  cover={
                    <div className="video-thumbnail" onClick={() => handleVideoClick(video)}>
                      <img alt={video.title} src={video.thumbnail} />
                      <div className="video-overlay">
                        <PlayCircleOutlined className="play-icon" />
                        <span className="video-duration">{video.duration}</span>
                      </div>
                      {video.isNew && (
                        <Tag color="red" className="new-badge">YENİ</Tag>
                      )}
                    </div>
                  }
                >
                  <div className="video-category">
                    <Tag color={categoryColors[video.category]} icon={categoryIcons[video.category]}>
                      {video.category}
                    </Tag>
                  </div>

                  <Title level={4} className="video-title">
                    {video.title}
                  </Title>

                  <Paragraph className="video-description">
                    {video.description}
                  </Paragraph>

                  <div className="video-stats">
                    <Space>
                      <span className="stat-item">
                        <EyeOutlined /> {video.views}
                      </span>
                      <span className="stat-item">
                        <ClockCircleOutlined /> {video.duration}
                      </span>
                      {video.rating && (
                        <span className="stat-item">
                          <StarFilled style={{ color: '#faad14' }} /> {video.rating}
                        </span>
                      )}
                    </Space>
                  </div>

                  <Button 
                    type="primary" 
                    block 
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleVideoClick(video)}
                    className="watch-button"
                  >
                    İzle
                  </Button>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="video-footer"
        >
          <Card className="video-cta-card">
            <Row align="middle" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Title level={3} style={{ marginBottom: 8 }}>
                  Daha fazla eğitim içeriği mi arıyorsunuz?
                </Title>
                <Paragraph style={{ marginBottom: 0, fontSize: 16 }}>
                  YouTube kanalımızda 100+ eğitim videosu ve webinar kaydı bulunmaktadır
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<PlayCircleOutlined />}
                  className="youtube-button"
                >
                  YouTube Kanalımız
                </Button>
              </Col>
            </Row>
          </Card>
        </motion.div>

        <Modal
          title={selectedVideo?.title}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={900}
          centered
          className="video-modal"
        >
          {selectedVideo && (
            <div className="video-player-wrapper">
              <div className="video-player">
                <iframe
                  src={selectedVideo.embedUrl}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="video-info">
                <Tag color={categoryColors[selectedVideo.category]}>
                  {selectedVideo.category}
                </Tag>
                <Paragraph style={{ marginTop: 16 }}>
                  {selectedVideo.description}
                </Paragraph>
                <div className="video-modal-stats">
                  <Space>
                    <span><EyeOutlined /> {selectedVideo.views} görüntülenme</span>
                    <span><ClockCircleOutlined /> {selectedVideo.duration}</span>
                    {selectedVideo.rating && (
                      <span><StarFilled style={{ color: '#faad14' }} /> {selectedVideo.rating}/5</span>
                    )}
                  </Space>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};