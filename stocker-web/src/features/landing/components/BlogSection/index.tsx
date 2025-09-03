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
    excerpt: 'İşletmenizi dijitalleştirirken karşılaşabileceğiniz zorluklar ve çözüm önerileri. Başarılı bir ERP geçişi için ipuçları.',
    author: 'Ahmet Yılmaz',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
    date: '15 Aralık 2024',
    readTime: '5 dk',
    category: 'Dijital Dönüşüm',
    categoryColor: 'purple',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
    trending: true,
    icon: <RocketOutlined />
  },
  {
    id: 2,
    title: 'Bulut Tabanlı ERP\'nin Avantajları',
    excerpt: 'Neden bulut tabanlı ERP çözümleri tercih edilmeli? Maliyet, güvenlik ve esneklik açısından karşılaştırmalı analiz.',
    author: 'Elif Demir',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2',
    date: '12 Aralık 2024',
    readTime: '7 dk',
    category: 'Teknoloji',
    categoryColor: 'blue',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop',
    trending: false,
    icon: <CloudOutlined />
  },
  {
    id: 3,
    title: '2025 ERP Trendleri ve Öngörüler',
    excerpt: 'Yapay zeka, IoT ve blockchain teknolojilerinin ERP sistemlerine entegrasyonu. Geleceğin iş yönetimi nasıl şekillenecek?',
    author: 'Mehmet Kaya',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin3',
    date: '10 Aralık 2024',
    readTime: '10 dk',
    category: 'Trendler',
    categoryColor: 'green',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=500&h=300&fit=crop',
    trending: true,
    icon: <BulbOutlined />
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

        <Row gutter={[32, 32]}>
          {blogPosts.map((post, index) => (
            <Col xs={24} md={8} key={post.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="blog-card-wrapper"
              >
                <Card
                  hoverable
                  className="blog-card"
                  cover={
                    <div className="blog-cover">
                      <img alt={post.title} src={post.image} />
                      {post.trending && (
                        <div className="trending-badge">
                          <FireOutlined /> Trend
                        </div>
                      )}
                      <div className="category-badge">
                        <Tag color={post.categoryColor}>
                          {post.category}
                        </Tag>
                      </div>
                    </div>
                  }
                  actions={[
                    <div className="read-more-link">
                      Devamını Oku <ArrowRightOutlined />
                    </div>
                  ]}
                >
                  <div className="blog-meta">
                    <Space>
                      <Avatar src={post.authorAvatar} size={24} />
                      <Text type="secondary">{post.author}</Text>
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
                  
                  <Title level={4} className="blog-title">
                    {post.title}
                  </Title>
                  
                  <Paragraph className="blog-excerpt">
                    {post.excerpt}
                  </Paragraph>
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