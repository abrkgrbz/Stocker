import React from 'react';
import { Row, Col, Card, Typography, Tag, Avatar, Space } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  TagOutlined,
  FireOutlined,
  RocketOutlined,
  BulbOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const blogPosts = [
  {
    id: 1,
    title: 'ERP Sistemine Geçişte Dikkat Edilmesi Gerekenler',
    excerpt: 'İşletmenizi dijitalleştirirken karşılaşabileceğiniz zorluklar ve çözüm önerileri.',
    author: 'Ahmet Yılmaz',
    authorRole: 'ERP Uzmanı',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
    date: '15 Aralık 2024',
    readTime: '5 dk',
    category: 'Dijital Dönüşüm',
    categoryColor: 'purple',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    trending: true,
    featured: true,
    icon: <RocketOutlined />,
    tags: ['ERP', 'Dijitalleşme', 'İpuçları']
  },
  {
    id: 2,
    title: 'Bulut Tabanlı ERP\'nin 7 Kritik Avantajı',
    excerpt: 'Neden bulut tabanlı ERP çözümleri tercih edilmeli? Maliyet ve güvenlik analizi.',
    author: 'Elif Demir',
    authorRole: 'Bulut Mimarı',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2',
    date: '12 Aralık 2024',
    readTime: '7 dk',
    category: 'Teknoloji',
    categoryColor: 'blue',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    trending: false,
    featured: false,
    icon: <CloudOutlined />,
    tags: ['Cloud', 'SaaS', 'Güvenlik']
  },
  {
    id: 3,
    title: '2025 ERP Trendleri: AI ve Ötesi',
    excerpt: 'Yapay zeka, IoT ve blockchain teknolojilerinin ERP sistemlerine entegrasyonu.',
    author: 'Mehmet Kaya',
    authorRole: 'Teknoloji Direktörü',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin3',
    date: '10 Aralık 2024',
    readTime: '10 dk',
    category: 'Trendler',
    categoryColor: 'green',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop',
    trending: true,
    featured: false,
    icon: <BulbOutlined />,
    tags: ['AI', 'IoT', 'Blockchain', 'Gelecek']
  }
];

export const BlogSection: React.FC = () => {
  return (
    <section className="blog-section" id="blog">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <Tag color="purple" className="section-tag">
            <TagOutlined /> Blog & Haberler
          </Tag>
          <Title level={2}>Son Yazılar ve Güncellemeler</Title>
          <Paragraph>
            ERP dünyasından haberler, başarı hikayeleri ve uzman görüşleri
          </Paragraph>
        </motion.div>

        {/* Featured Post */}
        {blogPosts.filter(p => p.featured)[0] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="featured-post"
            style={{ marginBottom: 60 }}
          >
            <Card
              hoverable
              className="featured-card"
              style={{ background: blogPosts[0].gradient }}
            >
              <Row gutter={[32, 32]} align="middle">
                <Col xs={24} lg={12}>
                  <div className="featured-content">
                    {blogPosts[0].trending && (
                      <Tag color="red" style={{ marginBottom: 16 }}>
                        <FireOutlined /> Öne Çıkan
                      </Tag>
                    )}
                    <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
                      {blogPosts[0].title}
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 24 }}>
                      {blogPosts[0].excerpt}
                    </Paragraph>
                    <div className="featured-meta" style={{ marginBottom: 24 }}>
                      <Space size="large">
                        <Space>
                          <Avatar src={blogPosts[0].authorAvatar} size={32} />
                          <div>
                            <Text style={{ color: 'white', display: 'block' }}>{blogPosts[0].author}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{blogPosts[0].authorRole}</Text>
                          </div>
                        </Space>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <CalendarOutlined /> {blogPosts[0].date}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                          <ClockCircleOutlined /> {blogPosts[0].readTime}
                        </Text>
                      </Space>
                    </div>
                    <button className="featured-cta">
                      Yazıyı Oku <ArrowRightOutlined />
                    </button>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="featured-image">
                    <img src={blogPosts[0].image} alt={blogPosts[0].title} style={{ width: '100%', borderRadius: 16 }} />
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        )}

        {/* Other Posts */}
        <Row gutter={[32, 32]}>
          {blogPosts.filter(p => !p.featured).map((post, index) => (
            <Col xs={24} md={12} lg={12} key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="blog-card-wrapper"
              >
                <Card
                  hoverable
                  className="blog-card-modern"
                >
                  <Row gutter={[20, 20]}>
                    <Col xs={24} sm={10}>
                      <div className="blog-thumbnail">
                        <img alt={post.title} src={post.image} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
                        {post.trending && (
                          <div className="trending-overlay">
                            <FireOutlined /> Hot
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} sm={14}>
                      <div className="blog-content">
                        <Tag color={post.categoryColor} style={{ marginBottom: 12 }}>
                          {post.category}
                        </Tag>
                        <Title level={4} className="blog-title-modern">
                          {post.title}
                        </Title>
                        <Paragraph className="blog-excerpt-modern">
                          {post.excerpt}
                        </Paragraph>
                        <div className="blog-footer">
                          <Space>
                            <Avatar src={post.authorAvatar} size={24} />
                            <Text type="secondary" style={{ fontSize: 13 }}>{post.author}</Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>•</Text>
                            <Text type="secondary" style={{ fontSize: 13 }}>{post.date}</Text>
                          </Space>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="blog-footer"
        >
          <button className="view-all-btn">
            Tüm Yazıları Görüntüle
            <ArrowRightOutlined />
          </button>
        </motion.div>
      </div>
    </section>
  );
};