'use client';

/**
 * App Home - Module Selection Page
 * Standalone page without sidebar/header
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Typography, Badge, Tooltip, Avatar, Dropdown } from 'antd';
import {
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';

const { Title, Text } = Typography;

interface ModuleCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  path: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export default function AppHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { tenant } = useTenant();

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Don't render until auth check completes
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  const modules: ModuleCard[] = [
    {
      id: 'crm',
      title: 'CRM',
      icon: <TeamOutlined />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
      path: '/crm',
      description: 'Müşteri ilişkileri yönetimi',
      badge: 'Aktif',
    },
    {
      id: 'dashboards',
      title: 'Dashboards',
      icon: <DashboardOutlined />,
      color: '#c026d3',
      gradient: 'linear-gradient(135deg, #c026d3 0%, #0891b2 100%)',
      path: '/dashboard',
      description: 'Analiz ve raporlar',
    },
    {
      id: 'apps',
      title: 'Uygulamalar',
      icon: <AppstoreOutlined />,
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)',
      path: '/modules',
      description: 'Modül yönetimi',
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      icon: <SettingOutlined />,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
      path: '/settings',
      description: 'Sistem ayarları',
    },
    {
      id: 'messaging',
      title: 'Mesajlaşma',
      icon: <MessageOutlined />,
      color: '#c026d3',
      gradient: 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)',
      path: '/messaging',
      description: 'İletişim ve mesajlaşma',
      badge: 'Yakında',
      disabled: true,
    },
    {
      id: 'calendar',
      title: 'Takvim',
      icon: <CalendarOutlined />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      path: '/calendar',
      description: 'Etkinlik ve toplantılar',
      badge: 'Yakında',
      disabled: true,
    },
    {
      id: 'contacts',
      title: 'Kontaklar',
      icon: <UserOutlined />,
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
      path: '/contacts',
      description: 'Kişiler ve iletişim',
      badge: 'Yakında',
      disabled: true,
    },
    {
      id: 'inventory',
      title: 'Stok',
      icon: <RocketOutlined />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      path: '/inventory',
      description: 'Envanter yönetimi',
      badge: 'Yakında',
      disabled: true,
    },
  ];

  const handleModuleClick = (module: ModuleCard) => {
    if (module.disabled) return;
    router.push(module.path);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
    },
  ];

  const handleUserMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      router.push('/profile');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #28002D 0%, #1A315A 100%)',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Main Content Wrapper */}
      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Activation Notification Bar - Elegant Design */}
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto 24px',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ThunderboltOutlined style={{ fontSize: 18, color: '#fca5a5' }} />
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: 500 }}>
                Aktivasyon e-postası gönderildi • Veri tabanı geçerlilik süresi:{' '}
                <strong style={{ color: '#fca5a5' }}>3 saat</strong>
              </Text>
            </div>
            <a
              href="#"
              style={{
                color: '#fca5a5',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid #fca5a5',
              }}
            >
              E-posta ulaşmadı mı?
            </a>
          </div>
        </div>

        {/* Header with User Menu */}
      <div
        style={{
          maxWidth: 1200,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {tenant?.name || 'Stocker'}
          </Text>
        </div>

        <Dropdown
          menu={{ items: userMenuItems, onClick: ({ key }) => handleUserMenuClick(key) }}
          placement="bottomRight"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 24,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span style={{ color: 'white', fontWeight: 500 }}>
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </Dropdown>
      </div>

      {/* Welcome Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 800 }}>
        <Title
          level={1}
          style={{
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 16,
            textShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          Hoş Geldiniz! 👋
        </Title>
        <Text
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 18,
            display: 'block',
          }}
        >
          İşletmenizi yönetmek için bir modül seçin
        </Text>
      </div>

      {/* Module Grid - 4x2 Balanced Layout */}
      <div style={{ maxWidth: 900, width: '100%' }}>
        <Row gutter={[32, 32]} justify="center">
          {modules.map((module) => (
            <Col xs={12} sm={12} md={6} lg={6} key={module.id}>
              <div
                onClick={() => handleModuleClick(module)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: module.disabled ? 'not-allowed' : 'pointer',
                  opacity: module.disabled ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  padding: '16px',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!module.disabled) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!module.disabled) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {/* Single Badge - No Confusion */}
                {module.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: module.disabled
                        ? 'rgba(250, 173, 20, 0.9)'
                        : 'rgba(16, 185, 129, 0.9)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {module.badge}
                  </div>
                )}

                {/* Icon */}
                {React.cloneElement(module.icon as React.ReactElement, {
                  style: {
                    fontSize: 56,
                    color: module.disabled ? 'rgba(255,255,255,0.5)' : 'white',
                    marginBottom: 8,
                  },
                })}

                {/* Description */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: module.disabled ? 'rgba(255,255,255,0.5)' : 'white',
                  }}
                >
                  {module.description}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
      </div>

      {/* Footer Info */}
      <div style={{ width: '100%', textAlign: 'center', padding: '24px 0' }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          Stocker - Modern İşletme Yönetim Sistemi
        </Text>
      </div>
    </div>
  );
}
