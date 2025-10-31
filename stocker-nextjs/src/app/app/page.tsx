'use client';

/**
 * App Home - Module Selection Page
 * Standalone page without sidebar/header
 */

import { useEffect } from 'react';
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
      icon: <MessageOutlined style={{ fontSize: 48 }} />,
      color: '#FF6B35',
      gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      path: '/messaging',
      description: 'İletişim ve mesajlaşma',
      disabled: true,
    },
    {
      id: 'calendar',
      title: 'Takvim',
      icon: <CalendarOutlined style={{ fontSize: 48 }} />,
      color: '#9B51E0',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/calendar',
      description: 'Etkinlik ve toplantılar',
      disabled: true,
    },
    {
      id: 'contacts',
      title: 'Kontaklar',
      icon: <UserOutlined style={{ fontSize: 48 }} />,
      color: '#2ECC71',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      path: '/contacts',
      description: 'Kişiler ve iletişim',
      disabled: true,
    },
    {
      id: 'crm',
      title: 'CRM',
      icon: <TeamOutlined style={{ fontSize: 48 }} />,
      color: '#3498DB',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/crm',
      description: 'Müşteri ilişkileri yönetimi',
      badge: 'Aktif',
    },
    {
      id: 'dashboards',
      title: 'Dashboards',
      icon: <DashboardOutlined style={{ fontSize: 48 }} />,
      color: '#E74C3C',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/dashboard',
      description: 'Analiz ve raporlar',
    },
    {
      id: 'apps',
      title: 'Uygulamalar',
      icon: <AppstoreOutlined style={{ fontSize: 48 }} />,
      color: '#9B59B6',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      path: '/modules',
      description: 'Modül yönetimi',
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      icon: <SettingOutlined style={{ fontSize: 48 }} />,
      color: '#34495E',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
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

      {/* Warning Banner */}
      <Card
        style={{
          maxWidth: 1200,
          width: '100%',
          marginBottom: 32,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
          border: '3px solid #E74C3C',
          boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3), 0 0 0 1px rgba(231, 76, 60, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
        bodyStyle={{ padding: '24px 32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(231, 76, 60, 0.4)',
              flexShrink: 0,
            }}
          >
            <ThunderboltOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <Text strong style={{ color: '#E74C3C', fontSize: 20, display: 'block', marginBottom: 8 }}>
              ⚡ Aktivasyon e-postası gönderildi!
            </Text>
            <Text style={{ color: '#2c3e50', fontSize: 15, display: 'block' }}>
              Veri tabanınızın geçerliliği süresi: <strong style={{ color: '#E74C3C' }}>3 hours</strong>.{' '}
              <a href="#" style={{ color: '#E74C3C', fontWeight: 600, textDecoration: 'underline' }}>
                E-posta tarafınıza ulaşmadı mı?
              </a>
            </Text>
          </div>
        </div>
      </Card>

      {/* Module Grid */}
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <Row gutter={[24, 24]}>
          {modules.map((module) => (
            <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
              <Tooltip
                title={module.disabled ? 'Yakında aktif olacak' : module.description}
                placement="top"
              >
                <Card
                  hoverable={!module.disabled}
                  onClick={() => handleModuleClick(module)}
                  style={{
                    borderRadius: 16,
                    border: 'none',
                    background: module.disabled ? '#f5f5f5' : 'white',
                    boxShadow: module.disabled
                      ? 'none'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease',
                    cursor: module.disabled ? 'not-allowed' : 'pointer',
                    opacity: module.disabled ? 0.5 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  bodyStyle={{
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!module.disabled) {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.16)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!module.disabled) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }
                  }}
                >
                  {/* Badge */}
                  {module.badge && (
                    <Badge.Ribbon
                      text={module.badge}
                      color={module.color}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {/* Icon with gradient background */}
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 20,
                      background: module.disabled ? '#d9d9d9' : module.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      color: 'white',
                      boxShadow: module.disabled
                        ? 'none'
                        : `0 8px 16px ${module.color}33`,
                    }}
                  >
                    {module.icon}
                  </div>

                  {/* Title */}
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 600,
                      color: module.disabled ? '#8c8c8c' : '#262626',
                    }}
                  >
                    {module.title}
                  </Title>

                  {/* Description */}
                  <Text
                    type="secondary"
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: module.disabled ? '#bfbfbf' : '#8c8c8c',
                    }}
                  >
                    {module.description}
                  </Text>

                  {/* Disabled overlay */}
                  {module.disabled && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: '#ffa940',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Yakında
                    </div>
                  )}
                </Card>
              </Tooltip>
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
