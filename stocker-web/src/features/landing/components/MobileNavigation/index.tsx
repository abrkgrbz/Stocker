import React, { useState, useEffect } from 'react';
import { Drawer, Button, Space, Typography, Avatar, Badge } from 'antd';
import {
  MenuOutlined,
  CloseOutlined,
  HomeOutlined,
  AppstoreOutlined,
  DollarOutlined,
  StarOutlined,
  PhoneOutlined,
  UserOutlined,
  RocketOutlined,
  LoginOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useVisitorTracking } from '@/shared/hooks/useVisitorTracking';
import { useAuthStore } from '@/app/store/auth.store';
import './style.css';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const { currentVisitType, trackInterest } = useVisitorTracking();
  const { isAuthenticated, user } = useAuthStore();

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Ana Sayfa',
      action: () => {
        document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-home');
      },
    },
    {
      key: 'features',
      icon: <AppstoreOutlined />,
      label: 'Özellikler',
      action: () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-features');
      },
    },
    {
      key: 'modules',
      icon: <AppstoreOutlined />,
      label: 'Modüller',
      action: () => {
        document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-modules');
      },
    },
    {
      key: 'pricing',
      icon: <DollarOutlined />,
      label: 'Fiyatlandırma',
      action: () => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-pricing');
      },
    },
    {
      key: 'testimonials',
      icon: <StarOutlined />,
      label: 'Referanslar',
      action: () => {
        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-testimonials');
      },
    },
    {
      key: 'contact',
      icon: <PhoneOutlined />,
      label: 'İletişim',
      action: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        trackInterest('navigation-contact');
      },
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    item.action();
    setIsOpen(false);
    setActiveSection(item.key);
  };

  const renderUserSection = () => {
    if (isAuthenticated && user) {
      const userRole = user.roles?.[0];
      let dashboardRoute = '/app/default';
      
      if (userRole === 'SystemAdmin') dashboardRoute = '/master';
      else if (userRole === 'TenantAdmin' || userRole === 'Admin') dashboardRoute = '/admin';

      return (
        <div className="mobile-nav-user-section">
          <div className="user-info">
            <Avatar size={48} icon={<UserOutlined />} />
            <div className="user-details">
              <Typography.Text strong>{user.firstName || 'Kullanıcı'}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {user.email}
              </Typography.Text>
            </div>
          </div>
          <Button
            type="primary"
            block
            icon={<AppstoreOutlined />}
            onClick={() => {
              navigate(dashboardRoute);
              setIsOpen(false);
            }}
            className="user-dashboard-btn"
          >
            Panele Git
          </Button>
        </div>
      );
    }

    return (
      <div className="mobile-nav-cta-section">
        {currentVisitType === 'first-time' && (
          <div className="mobile-cta-message">
            <Typography.Text style={{ fontSize: 13, color: '#667eea' }}>
              ✨ 14 gün ücretsiz deneme!
            </Typography.Text>
          </div>
        )}
        
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {currentVisitType === 'returning' ? (
            <>
              <Button
                type="primary"
                block
                icon={<LoginOutlined />}
                onClick={() => {
                  navigate('/login');
                  setIsOpen(false);
                  trackInterest('mobile-nav-login');
                }}
                className="mobile-primary-cta"
              >
                Giriş Yap
              </Button>
              <Button
                block
                ghost
                icon={<RocketOutlined />}
                onClick={() => {
                  navigate('/register');
                  setIsOpen(false);
                  trackInterest('mobile-nav-trial');
                }}
              >
                Deneme Sürümü
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                block
                icon={<RocketOutlined />}
                onClick={() => {
                  navigate('/register');
                  setIsOpen(false);
                  trackInterest('mobile-nav-register');
                }}
                className="mobile-primary-cta"
              >
                {currentVisitType === 'active-user' ? 'Panelime Giriş' : 'Ücretsiz Dene'}
              </Button>
              <Button
                block
                ghost
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                  trackInterest('mobile-nav-demo');
                }}
              >
                Demo İzle
              </Button>
            </>
          )}
        </Space>
      </div>
    );
  };

  // Close drawer when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Menu Trigger */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setIsOpen(true)}
        className={`mobile-nav-trigger ${className}`}
        size="large"
      />

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div className="mobile-nav-header">
            <div className="mobile-nav-logo">
              <RocketOutlined className="logo-icon" />
              <span className="logo-text">Stocker</span>
            </div>
            {currentVisitType === 'returning' && (
              <Badge count="Yeni" size="small" color="#52c41a" />
            )}
          </div>
        }
        placement="right"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        width="100%"
        className="mobile-navigation-drawer"
        closeIcon={<CloseOutlined />}
        styles={{ 
          header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderBottom: 'none',
          },
          body: {
            padding: 0, 
            background: 'linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%)' 
          }
        }}
      >
        <div className="mobile-nav-content">
          {/* User Section */}
          {renderUserSection()}

          {/* Navigation Menu */}
          <div className="mobile-nav-menu">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className={`mobile-nav-item ${
                  activeSection === item.key ? 'active' : ''
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <div className="nav-item-icon">{item.icon}</div>
                <div className="nav-item-content">
                  <Typography.Text className="nav-item-label">
                    {item.label}
                  </Typography.Text>
                </div>
                <div className="nav-item-arrow">→</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mobile-nav-quick-actions">
            <Typography.Title level={5} style={{ margin: '16px 20px 12px' }}>
              Hızlı İşlemler
            </Typography.Title>
            
            <div className="quick-action-grid">
              <div
                className="quick-action-item"
                onClick={() => {
                  window.open('tel:08501234567', '_self');
                  trackInterest('mobile-nav-call');
                }}
              >
                <PhoneOutlined />
                <span>Ara</span>
              </div>
              <div
                className="quick-action-item"
                onClick={() => {
                  window.open('https://wa.me/905555555555', '_blank');
                  trackInterest('mobile-nav-whatsapp');
                }}
              >
                📱
                <span>WhatsApp</span>
              </div>
              <div
                className="quick-action-item"
                onClick={() => {
                  navigate('/register');
                  setIsOpen(false);
                  trackInterest('mobile-nav-support');
                }}
              >
                💬
                <span>Destek</span>
              </div>
              <div
                className="quick-action-item"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                  trackInterest('mobile-nav-contact');
                }}
              >
                ✉️
                <span>E-posta</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mobile-nav-footer">
            <Typography.Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
              © 2024 Stocker - Türkiye'nin #1 İşletme Platformu
            </Typography.Text>
          </div>
        </div>
      </Drawer>
    </>
  );
};