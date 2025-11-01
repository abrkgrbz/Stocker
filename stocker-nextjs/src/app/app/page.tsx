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
      id: 'messaging',
      title: 'Mesajlaşma',
      icon: <MessageOutlined />,
      color: '#c026d3',
      gradient: 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)',
      path: '/messaging',
      description: 'İletişim ve mesajlaşma',
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
      disabled: true,
    },
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
      }}
    >
      {/* Activation Notification Bar */}
      <div
        style={{
          width: '100%',
          background: 'rgba(231, 76, 60, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 24px',
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThunderboltOutlined style={{ fontSize: 20, color: 'white' }} />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>
              ⚡ Aktivasyon e-postası gönderildi! Veri tabanınızın geçerliliği süresi:{' '}
              <strong>3 hours</strong>
            </Text>
          </div>
          <a
            href="#"
            style={{
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline',
              whiteSpace: 'nowrap',
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

      {/* Module Grid */}
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <Row gutter={[24, 24]}>
          {modules.map((module) => (
            <Col xs={12} sm={8} md={6} lg={4} key={module.id}>
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
                {/* Badge */}
                {module.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: module.color,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    {module.badge}
                  </div>
                )}

                {/* Disabled tag */}
                {module.disabled && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#ffa940',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  >
                    Yakında
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

      {/* Footer Info */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
          <RocketOutlined style={{ marginRight: 8 }} />
          Stocker - Modern İşletme Yönetim Sistemi
        </Text>
      </div>
    </div>
  );
}
