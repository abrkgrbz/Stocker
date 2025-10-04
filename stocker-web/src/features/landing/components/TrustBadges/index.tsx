import React from 'react';
import { Row, Col, Typography, Space, Rate } from 'antd';
import { StarFilled, CheckCircleFilled, TrophyFilled } from '@ant-design/icons';
import './style.css';

const { Text } = Typography;

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: <StarFilled />,
      rating: 4.8,
      total: 5,
      reviews: '250+ Değerlendirme',
      platform: 'Capterra',
      color: '#ff6b35'
    },
    {
      icon: <StarFilled />,
      rating: 4.9,
      total: 5,
      reviews: '180+ Değerlendirme',
      platform: 'Google',
      color: '#4285f4'
    },
    {
      icon: <TrophyFilled />,
      metric: '98%',
      label: 'Müşteri Memnuniyeti',
      platform: 'ISO 9001',
      color: '#52c41a'
    },
    {
      icon: <CheckCircleFilled />,
      metric: '5000+',
      label: 'Aktif Kullanıcı',
      platform: 'Türkiye',
      color: '#667eea'
    }
  ];

  return (
    <div className="trust-badges-container">
      <Row gutter={[24, 24]} justify="center" align="middle">
        {badges.map((badge, index) => (
          <Col key={index} xs={12} sm={12} md={6}>
            <div className="trust-badge" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="badge-icon" style={{ color: badge.color }}>
                {badge.icon}
              </div>
              <div className="badge-content">
                {badge.rating ? (
                  <>
                    <div className="badge-rating">
                      <Rate
                        disabled
                        value={badge.rating}
                        style={{ fontSize: 16, color: badge.color }}
                      />
                      <Text strong style={{ marginLeft: 8, fontSize: 16 }}>
                        {badge.rating}/{badge.total}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {badge.reviews}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text strong style={{ fontSize: 20, color: badge.color }}>
                      {badge.metric}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {badge.label}
                    </Text>
                  </>
                )}
                <Text style={{ fontSize: 11, color: '#999', marginTop: 4, display: 'block' }}>
                  {badge.platform}
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};
