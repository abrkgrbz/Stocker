import React from 'react';
import { Button, Space, Typography, Badge } from 'antd';
import { 
  RocketOutlined, 
  UserOutlined, 
  DashboardOutlined, 
  PlayCircleOutlined,
  ArrowRightOutlined,
  StarOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useVisitorTracking } from '@/shared/hooks/useVisitorTracking';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import './style.css';

interface DynamicCTAProps {
  size?: 'small' | 'large';
  variant?: 'header' | 'hero' | 'footer';
}

export const DynamicCTA: React.FC<DynamicCTAProps> = ({ 
  size = 'large', 
  variant = 'hero' 
}) => {
  const navigate = useNavigate();
  const { currentVisitType, trackInterest } = useVisitorTracking();
  const { isAuthenticated, user } = useSecureAuthStore();

  const handleCTAClick = (action: string, route: string) => {
    trackInterest(action);
    navigate(route);
  };

  // For authenticated users
  if (isAuthenticated && user) {
    const userRole = user.roles?.[0];
    let dashboardRoute = '/app/default';
    
    if (userRole === 'SystemAdmin') dashboardRoute = '/master';
    else if (userRole === 'TenantAdmin' || userRole === 'Admin') dashboardRoute = '/admin';

    return (
      <div className={`dynamic-cta dynamic-cta--${variant} dynamic-cta--${size}`}>
        <Space size="large" wrap className="cta-buttons">
          <Button 
            type="primary" 
            size={size}
            icon={<DashboardOutlined />}
            onClick={() => handleCTAClick('dashboard-access', dashboardRoute)}
            className="cta-primary dashboard-cta"
          >
            Panele Dön
          </Button>
          <Button 
            size={size}
            ghost={variant === 'hero'}
            icon={<StarOutlined />}
            onClick={() => handleCTAClick('explore-features', '/#features')}
            className="cta-secondary"
          >
            Yeni Özellikleri Keşfet
          </Button>
        </Space>
        {variant === 'hero' && (
          <div className="welcome-back-message">
            <Typography.Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              Tekrar hoş geldin, {user.firstName || 'Kullanıcı'}! 👋
            </Typography.Text>
          </div>
        )}
      </div>
    );
  }

  // For different visitor types
  switch (currentVisitType) {
    case 'first-time':
      return (
        <div className={`dynamic-cta dynamic-cta--${variant} dynamic-cta--${size}`}>
          <Space size="large" wrap className="cta-buttons">
            <Badge.Ribbon text="14 Gün Ücretsiz" color="gold">
              <Button 
                type="primary" 
                size={size}
                icon={<RocketOutlined />}
                onClick={() => handleCTAClick('free-trial', '/register')}
                className="cta-primary free-trial-cta"
              >
                Ücretsiz Deneyin
              </Button>
            </Badge.Ribbon>
            <Button 
              size={size}
              ghost={variant === 'hero'}
              icon={<PlayCircleOutlined />}
              onClick={() => handleCTAClick('watch-demo', '/#demo')}
              className="cta-secondary demo-cta"
            >
              Önce İzle
            </Button>
          </Space>
          {variant === 'hero' && (
            <div className="first-time-benefits">
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ✨ Kurulum ücreti yok • ⚡ Anında başlayın • 🔒 Güvenli
              </Typography.Text>
            </div>
          )}
        </div>
      );

    case 'returning':
      return (
        <div className={`dynamic-cta dynamic-cta--${variant} dynamic-cta--${size}`}>
          <Space size="large" wrap className="cta-buttons">
            <Button 
              type="primary" 
              size={size}
              icon={<UserOutlined />}
              onClick={() => handleCTAClick('login-returning', '/login')}
              className="cta-primary login-cta"
            >
              Giriş Yap
            </Button>
            <Button 
              size={size}
              ghost={variant === 'hero'}
              icon={<ArrowRightOutlined />}
              onClick={() => handleCTAClick('continue-trial', '/register')}
              className="cta-secondary trial-cta"
            >
              Deneme Sürümü Başlat
            </Button>
          </Space>
          {variant === 'hero' && (
            <div className="returning-message">
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Tekrar hoş geldiniz! Kaldığınız yerden devam edin 🚀
              </Typography.Text>
            </div>
          )}
        </div>
      );

    case 'active-user':
      return (
        <div className={`dynamic-cta dynamic-cta--${variant} dynamic-cta--${size}`}>
          <Space size="large" wrap className="cta-buttons">
            <Button 
              type="primary" 
              size={size}
              icon={<DashboardOutlined />}
              onClick={() => handleCTAClick('access-dashboard', '/login')}
              className="cta-primary dashboard-cta"
            >
              Panelime Giriş
            </Button>
            <Button 
              size={size}
              ghost={variant === 'hero'}
              icon={<StarOutlined />}
              onClick={() => handleCTAClick('whats-new', '/#features')}
              className="cta-secondary"
            >
              Yenilikler
            </Button>
          </Space>
          {variant === 'hero' && (
            <div className="active-user-message">
              <Typography.Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                Hoş geldin! Son güncellemelerimizi keşfet ⭐
              </Typography.Text>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className={`dynamic-cta dynamic-cta--${variant} dynamic-cta--${size}`}>
          <Space size="large" wrap className="cta-buttons">
            <Button 
              type="primary" 
              size={size}
              icon={<RocketOutlined />}
              onClick={() => handleCTAClick('get-started', '/register')}
              className="cta-primary"
            >
              Başlayın
            </Button>
            <Button 
              size={size}
              ghost={variant === 'hero'}
              icon={<UserOutlined />}
              onClick={() => handleCTAClick('login', '/login')}
              className="cta-secondary"
            >
              Giriş Yap
            </Button>
          </Space>
        </div>
      );
  }
};