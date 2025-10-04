import React from 'react';
import { Typography } from 'antd';
import './style.css';

const { Text } = Typography;

export const CustomerLogos: React.FC = () => {
  const customers = [
    { name: 'ABC Teknoloji', logo: '🏢' },
    { name: 'XYZ Holding', logo: '🏭' },
    { name: 'Mega Market', logo: '🛒' },
    { name: 'Global Lojistik', logo: '🚚' },
    { name: 'Smart Solutions', logo: '💡' },
    { name: 'Digital Agency', logo: '🎨' },
    { name: 'Retail Plus', logo: '🏪' },
    { name: 'Tech Corp', logo: '⚡' }
  ];

  return (
    <div className="customer-logos-section">
      <div className="section-container">
        <Text type="secondary" style={{ fontSize: 14, textAlign: 'center', display: 'block', marginBottom: 24 }}>
          <strong style={{ color: '#667eea' }}>500+</strong> işletme Stocker ile büyüyor
        </Text>
        <div className="logos-marquee">
          <div className="logos-track">
            {[...customers, ...customers].map((customer, index) => (
              <div key={index} className="logo-item">
                <span className="logo-emoji">{customer.logo}</span>
                <Text strong style={{ fontSize: 13, color: '#666' }}>{customer.name}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
