'use client';

/**
 * App Home - Module Selection Page
 * Standalone page without sidebar/header
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Typography, Badge, Tooltip, Avatar, Dropdown, Spin } from 'antd';
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
  ShoppingCartOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import SetupWizardModal from '@/components/setup/SetupWizardModal';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';

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
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  // Setup modal state
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Create a Set of active module codes for fast lookup
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check if setup is required on mount
  useEffect(() => {
    const checkSetupRequired = () => {
      // Get requiresSetup from localStorage (set during login)
      const requiresSetup = localStorage.getItem('requiresSetup');
      console.log('🔍 Checking setup required...');
      console.log('📦 localStorage requiresSetup:', requiresSetup);
      console.log('✅ Should open modal:', requiresSetup === 'true');

      if (requiresSetup === 'true') {
        console.log('🎉 Opening setup modal!');
        setSetupModalOpen(true);
      } else {
        console.log('❌ Setup not required or flag not set');
      }
    };

    // Only check after auth is loaded and user is authenticated
    if (!isLoading && isAuthenticated) {
      console.log('✅ Auth loaded and authenticated, checking setup...');
      checkSetupRequired();
    } else {
      console.log('⏳ Waiting for auth... isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    }
  }, [isLoading, isAuthenticated]);

  const handleSetupComplete = () => {
    // Remove requiresSetup flag from localStorage
    localStorage.removeItem('requiresSetup');
    setSetupModalOpen(false);

    // Reload the page to refresh with new data
    window.location.reload();
  };

  // Don't render until auth check completes
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  // Show loading while fetching modules
  if (modulesLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #28002D 0%, #1A315A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Define module configurations
  const moduleConfigs = [
    {
      id: 'crm',
      title: 'CRM',
      icon: <TeamOutlined />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
      path: '/crm',
      description: 'Müşteri ilişkileri yönetimi',
      moduleCode: 'crm', // Used to check subscription
    },
    {
      id: 'sales',
      title: 'Satış',
      icon: <ShoppingCartOutlined />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      path: '/sales',
      description: 'Sipariş, fatura ve ödeme',
      moduleCode: 'sales',
    },
    {
      id: 'inventory',
      title: 'Stok',
      icon: <InboxOutlined />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      path: '/inventory',
      description: 'Envanter yönetimi',
      moduleCode: 'inventory',
    },
    {
      id: 'dashboards',
      title: 'Dashboards',
      icon: <DashboardOutlined />,
      color: '#c026d3',
      gradient: 'linear-gradient(135deg, #c026d3 0%, #0891b2 100%)',
      path: '/dashboard',
      description: 'Analiz ve raporlar',
      alwaysEnabled: true, // Always available
    },
    {
      id: 'apps',
      title: 'Uygulamalar',
      icon: <AppstoreOutlined />,
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)',
      path: '/modules',
      description: 'Modül yönetimi',
      alwaysEnabled: true,
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      icon: <SettingOutlined />,
      color: '#6b7280',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
      path: '/settings',
      description: 'Sistem ayarları',
      alwaysEnabled: true,
    },
    {
      id: 'messaging',
      title: 'Mesajlaşma',
      icon: <MessageOutlined />,
      color: '#c026d3',
      gradient: 'linear-gradient(135deg, #c026d3 0%, #e879f9 100%)',
      path: '/messaging',
      description: 'İletişim ve mesajlaşma',
      comingSoon: true, // Feature not implemented yet
    },
    {
      id: 'calendar',
      title: 'Takvim',
      icon: <CalendarOutlined />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      path: '/calendar',
      description: 'Etkinlik ve toplantılar',
      comingSoon: true,
    },
  ];

  // Build modules list with dynamic enabled status
  const modules: ModuleCard[] = useMemo(() => {
    return moduleConfigs.map(config => {
      // Always-enabled modules (dashboard, settings, apps)
      if (config.alwaysEnabled) {
        return {
          id: config.id,
          title: config.title,
          icon: config.icon,
          color: config.color,
          gradient: config.gradient,
          path: config.path,
          description: config.description,
          disabled: false,
        };
      }

      // Coming soon features (not implemented yet)
      if (config.comingSoon) {
        return {
          id: config.id,
          title: config.title,
          icon: config.icon,
          color: config.color,
          gradient: config.gradient,
          path: config.path,
          description: config.description,
          badge: 'Yakında',
          disabled: true,
        };
      }

      // Subscription-based modules - check if tenant has access
      const hasAccess = config.moduleCode && activeModuleCodes.has(config.moduleCode.toLowerCase());
      return {
        id: config.id,
        title: config.title,
        icon: config.icon,
        color: config.color,
        gradient: config.gradient,
        path: config.path,
        description: config.description,
        badge: hasAccess ? 'Aktif' : 'Abonelik Gerekli',
        disabled: !hasAccess,
      };
    });
  }, [activeModuleCodes]);

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
                {React.cloneElement(module.icon as any, {
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
          {/* @ts-ignore */}
          Stocker - Modern İşletme Yönetim Sistemi
        </Text>
      </div>

      {/* Setup Modal */}
      <SetupWizardModal open={setupModalOpen} onComplete={handleSetupComplete} />
    </div>
  );
}
