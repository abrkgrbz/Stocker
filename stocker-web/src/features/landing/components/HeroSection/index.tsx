import React from 'react';
import { Button, Typography } from 'antd';
import { RocketOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface HeroSectionProps {
  scrolled: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ scrolled }) => {
  const navigate = useNavigate();

  return (
    <section 
      className="hero-section" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 0'
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Title 
            level={1} 
            style={{ 
              fontSize: '3.5rem', 
              fontWeight: 700,
              color: 'white',
              marginBottom: 24
            }}
          >
            İşletmeniz için Akıllı ERP Çözümü
          </Title>
          
          <Paragraph 
            style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 700,
              margin: '0 auto 40px'
            }}
          >
            Stocker ile tüm iş süreçlerinizi tek bir platformdan yönetin. 
            CRM'den muhasebeye, stok yönetiminden insan kaynaklarına kadar 
            ihtiyacınız olan tüm modüller bir arada.
          </Paragraph>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/register')}
              style={{
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                fontSize: 16,
                background: 'white',
                color: '#667eea',
                border: 'none'
              }}
            >
              Ücretsiz Deneyin
            </Button>
            
            <Button
              size="large"
              icon={<PlayCircleOutlined />}
              ghost
              style={{
                height: 48,
                paddingLeft: 32,
                paddingRight: 32,
                fontSize: 16,
                color: 'white',
                borderColor: 'white'
              }}
            >
              Demo İzle
            </Button>
          </div>

          <Paragraph 
            style={{ 
              marginTop: 24,
              color: 'rgba(255,255,255,0.8)'
            }}
          >
            14 gün ücretsiz deneme • Kredi kartı gerektirmez • Anında aktivasyon
          </Paragraph>
        </div>
      </div>
    </section>
  );
};