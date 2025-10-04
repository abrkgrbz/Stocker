import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RocketOutlined, PlayCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

interface AnimatedHeroProps {
  onDemoClick?: () => void;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ onDemoClick }) => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = 'Tüm İşletme Süreçleriniz Tek Platformda';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <section 
      className="hero-section" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div 
          style={{ textAlign: 'center', color: 'white' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title 
            level={1} 
            style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
              lineHeight: 1.2,
              minHeight: '100px'
            }}
          >
            {typedText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          </Title>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
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

            <motion.div
              style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                  }}
                >
                  14 Gün Ücretsiz Dene
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="large"
                  icon={<CalendarOutlined />}
                  onClick={onDemoClick}
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
                  Demo Rezervasyonu
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              </motion.div>
            </motion.div>

            <motion.div 
              style={{ 
                marginTop: 32,
                display: 'flex',
                gap: 24,
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 0.8 }}
            >
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ Kredi kartı gerekmez</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ 5 dakikada kurulum</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>✓ 7/24 destek</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};