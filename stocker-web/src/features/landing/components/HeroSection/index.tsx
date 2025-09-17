import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RocketOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface HeroSectionProps {
  scrolled?: boolean;
  navigate?: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ scrolled, navigate: navProp }) => {
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
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
              lineHeight: 1.2
            }}
          >
            Tüm İşletme Süreçleriniz<br />Tek Platformda
          </Title>
          
          <Paragraph 
            style={{ 
              fontSize: '1.35rem', 
              color: 'rgba(255,255,255,0.95)',
              maxWidth: 600,
              margin: '0 auto 40px',
              fontWeight: 300
            }}
          >
            Stocker ERP ile işletmenizi dijitalleştirin, verimliliğinizi %40 artırın.
          </Paragraph>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/register')}
              style={{
                height: 56,
                paddingLeft: 40,
                paddingRight: 40,
                fontSize: 18,
                background: 'white',
                color: '#667eea',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
              }}
            >
              14 Gün Ücretsiz Dene
            </Button>
            
            <Button
              size="large"
              icon={<PlayCircleOutlined />}
              ghost
              style={{
                height: 56,
                paddingLeft: 40,
                paddingRight: 40,
                fontSize: 18,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.8)',
                borderWidth: 2,
                fontWeight: 500
              }}
            >
              Canlı Demo
            </Button>
          </div>

          <div style={{ 
            marginTop: 32,
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ Kredi kartı gerekmez</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ 5 dakikada kurulum</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ 7/24 destek</span>
          </div>
        </div>
      </div>
    </section>
  );
};