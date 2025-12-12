import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Space, Avatar, Button, Statistic, Badge, ConfigProvider, theme } from 'antd';
import {
  TeamOutlined,
  GlobalOutlined,
  RightOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  DashboardOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Title, Text, Paragraph } = Typography;

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const panels = [
    {
      key: 'tenant',
      title: 'Tenant Yönetimi',
      subtitle: 'Müşteri ve abonelik yönetimi',
      description: 'Tenant\'ları yönetin, abonelikleri takip edin, kullanıcı ve modül ayarlarını yapılandırın.',
      icon: <TeamOutlined style={{ fontSize: 48 }} />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/tenant-admin/dashboard',
      stats: [
        { label: 'Aktif Tenant', value: 156 },
        { label: 'Bu Ay Yeni', value: 12 },
      ],
      features: ['Tenant Listesi', 'Abonelik Yönetimi', 'Modül Aktivasyonu', 'Kullanıcı Yönetimi'],
    },
    {
      key: 'cms',
      title: 'Landing Page Yönetimi',
      subtitle: 'Web sitesi içerik yönetimi',
      description: 'Landing page içeriklerini, blog yazılarını, SSS ve diğer sayfa içeriklerini yönetin.',
      icon: <GlobalOutlined style={{ fontSize: 48 }} />,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/cms/dashboard',
      stats: [
        { label: 'Toplam Sayfa', value: 12 },
        { label: 'Blog Yazısı', value: 24 },
      ],
      features: ['Sayfa Düzenleme', 'Blog Yönetimi', 'SSS Yönetimi', 'SEO Ayarları'],
    },
  ];

  const quickActions = [
    { icon: <DatabaseOutlined />, label: 'Yeni Tenant', path: '/tenant-admin/tenants/new', color: '#52c41a' },
    { icon: <FileTextOutlined />, label: 'Blog Yazısı', path: '/cms/blog/new', color: '#1890ff' },
    { icon: <AppstoreOutlined />, label: 'Modüller', path: '/tenant-admin/modules', color: '#722ed1' },
    { icon: <SettingOutlined />, label: 'Ayarlar', path: '/settings', color: '#fa8c16' },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#667eea',
          borderRadius: 16,
        },
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '40px 24px',
        }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Space direction="vertical" size={16}>
              <img
                src="/logo.png"
                alt="Stocker"
                style={{ height: 60, objectFit: 'contain' }}
              />
              <Title level={2} style={{ color: '#fff', margin: 0 }}>
                Hoş Geldiniz, {user?.name || 'Admin'}
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: 16 }}>
                Yönetmek istediğiniz paneli seçin
              </Text>
            </Space>
          </div>

          {/* Main Panels */}
          <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 48 }}>
            {panels.map((panel) => (
              <Col key={panel.key} xs={24} lg={12}>
                <Card
                  hoverable
                  onClick={() => navigate(panel.path)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 24,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  styles={{
                    body: { padding: 0 }
                  }}
                  className="admin-panel-card"
                >
                  {/* Gradient Header */}
                  <div
                    style={{
                      background: panel.gradient,
                      padding: '32px 24px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Background Pattern */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    />

                    <Space align="start" size={24}>
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 20,
                          background: 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        {panel.icon}
                      </div>
                      <div>
                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                          {panel.title}
                        </Title>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>
                          {panel.subtitle}
                        </Text>
                      </div>
                    </Space>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 24 }}>
                    <Paragraph style={{ color: '#8c8c8c', marginBottom: 24 }}>
                      {panel.description}
                    </Paragraph>

                    {/* Stats */}
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      {panel.stats.map((stat, index) => (
                        <Col span={12} key={index}>
                          <div
                            style={{
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: 12,
                              padding: 16,
                              textAlign: 'center',
                            }}
                          >
                            <Statistic
                              value={stat.value}
                              valueStyle={{ color: panel.color, fontSize: 28, fontWeight: 700 }}
                            />
                            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{stat.label}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    {/* Features */}
                    <div style={{ marginBottom: 24 }}>
                      <Row gutter={[8, 8]}>
                        {panel.features.map((feature, index) => (
                          <Col key={index}>
                            <Badge
                              count={feature}
                              style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#667eea',
                                fontSize: 12,
                                fontWeight: 500,
                                padding: '4px 12px',
                                borderRadius: 20,
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>

                    {/* Action Button */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<RightOutlined />}
                      style={{
                        background: panel.gradient,
                        border: 'none',
                        height: 48,
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      Panele Git
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Quick Actions */}
          <div style={{ marginBottom: 48 }}>
            <Title level={4} style={{ color: '#fff', marginBottom: 24, textAlign: 'center' }}>
              Hızlı İşlemler
            </Title>
            <Row gutter={[16, 16]} justify="center">
              {quickActions.map((action, index) => (
                <Col key={index}>
                  <Button
                    size="large"
                    icon={action.icon}
                    onClick={() => navigate(action.path)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: action.color,
                      borderRadius: 12,
                      height: 48,
                      paddingLeft: 24,
                      paddingRight: 24,
                    }}
                  >
                    {action.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#595959' }}>
              Stocker Master Admin © 2024 - v2.0.0
            </Text>
          </div>
        </div>

        {/* Custom Styles */}
        <style>{`
          .admin-panel-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: rgba(102, 126, 234, 0.3) !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default AdminHome;
