import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Badge, Tooltip, Space, Avatar, Button, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  DollarOutlined,
  ShopOutlined,
  FileTextOutlined,
  SettingOutlined,
  AppstoreOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RightOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/app/store/auth.store';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  route: string;
  badge?: string;
  isPremium?: boolean;
  isActive: boolean;
  features?: string[];
  usageCount?: number;
}

const modules: Module[] = [
  {
    id: 'sales',
    name: 'Satış Yönetimi',
    description: 'Satış süreçlerini yönet, faturalar oluştur ve müşteri siparişlerini takip et',
    icon: <ShoppingCartOutlined />,
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    route: '/sales/dashboard',
    badge: 'Popüler',
    isActive: true,
    features: ['Fatura Yönetimi', 'Sipariş Takibi', 'Müşteri Yönetimi'],
    usageCount: 1250
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri ilişkilerini güçlendir, satış fırsatlarını takip et',
    icon: <TeamOutlined />,
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    route: '/crm/dashboard',
    isActive: true,
    features: ['Müşteri Takibi', 'Fırsat Yönetimi', 'Aktivite Takibi'],
    usageCount: 890
  },
  {
    id: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Stok seviyelerini kontrol et, ürün hareketlerini takip et',
    icon: <ShopOutlined />,
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    route: '/inventory/dashboard',
    isActive: true,
    features: ['Stok Takibi', 'Depo Yönetimi', 'Transfer İşlemleri'],
    usageCount: 2100
  },
  {
    id: 'finance',
    name: 'Finans',
    description: 'Gelir-gider takibi, finansal raporlar ve bütçe yönetimi',
    icon: <DollarOutlined />,
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    route: '/finance/dashboard',
    isPremium: true,
    isActive: true,
    features: ['Gelir-Gider', 'Finansal Raporlar', 'Bütçe Planlama'],
    usageCount: 650
  },
  {
    id: 'reports',
    name: 'Raporlar',
    description: 'Detaylı iş analizleri ve özelleştirilebilir raporlar',
    icon: <BarChartOutlined />,
    color: '#fa709a',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    route: '/reports/dashboard',
    isActive: true,
    features: ['Satış Raporları', 'Stok Analizleri', 'Performans Metrikleri'],
    usageCount: 1800
  },
  {
    id: 'documents',
    name: 'Dokümanlar',
    description: 'Şirket dokümanlarını yönet ve paylaş',
    icon: <FileTextOutlined />,
    color: '#30cfd0',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    route: '/documents/dashboard',
    isActive: false,
    features: ['Doküman Yönetimi', 'Paylaşım', 'Versiyon Kontrolü']
  },
  {
    id: 'settings',
    name: 'Ayarlar',
    description: 'Sistem ayarları ve kullanıcı yönetimi',
    icon: <SettingOutlined />,
    color: '#a8edea',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    route: '/settings',
    isActive: true,
    features: ['Kullanıcı Yönetimi', 'Rol Yönetimi', 'Sistem Ayarları']
  },
  {
    id: 'marketplace',
    name: 'Uygulama Mağazası',
    description: 'Yeni modüller ekle ve entegrasyonları yönet',
    icon: <AppstoreOutlined />,
    color: '#ffecd2',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    route: '/marketplace',
    badge: 'Yeni',
    isActive: true,
    features: ['Entegrasyonlar', 'Eklentiler', 'API Bağlantıları']
  }
];

export const ModuleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const handleModuleClick = (module: Module) => {
    if (!module.isActive) {
      return;
    }
    setSelectedModule(module.id);
    setTimeout(() => {
      navigate(module.route);
    }, 300);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="module-selection-container">
      {/* Background Effects */}
      <div className="module-bg-gradient" />
      <div className="module-bg-pattern" />
      
      {/* Header */}
      <div className="module-header">
        <div className="module-header-content">
          <div className="module-header-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Space size="large" align="center">
                <Avatar size={48} style={{ backgroundColor: '#667eea' }}>
                  <RocketOutlined />
                </Avatar>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1a202c' }}>
                    Hoş Geldiniz, {user?.name || 'Kullanıcı'}
                  </Title>
                  <Text type="secondary">Çalışmak istediğiniz modülü seçin</Text>
                </div>
              </Space>
            </motion.div>
          </div>
          
          <div className="module-header-right">
            <Space size="middle">
              <Tooltip title="Bildirimler">
                <Badge count={5} size="small">
                  <Button type="text" shape="circle" icon={<BellOutlined />} size="large" />
                </Badge>
              </Tooltip>
              
              <Tooltip title="Profil">
                <Button type="text" shape="circle" icon={<UserOutlined />} size="large" />
              </Tooltip>
              
              <Tooltip title="Çıkış Yap">
                <Button 
                  type="text" 
                  danger 
                  shape="circle" 
                  icon={<LogoutOutlined />} 
                  size="large"
                  onClick={logout}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="module-content">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="module-grid-wrapper"
        >
          <Row gutter={[24, 24]} className="module-grid">
            {modules.map((module) => (
              <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
                <motion.div variants={item}>
                  <Card
                    className={`module-card ${!module.isActive ? 'module-card-disabled' : ''} ${
                      selectedModule === module.id ? 'module-card-selected' : ''
                    }`}
                    hoverable={module.isActive}
                    onClick={() => handleModuleClick(module)}
                    onMouseEnter={() => setHoveredModule(module.id)}
                    onMouseLeave={() => setHoveredModule(null)}
                  >
                    {/* Module Badge */}
                    {module.badge && (
                      <div className="module-badge">
                        <Tag color="red">{module.badge}</Tag>
                      </div>
                    )}
                    
                    {/* Premium Badge */}
                    {module.isPremium && (
                      <div className="module-premium">
                        <Tooltip title="Premium Modül">
                          <CrownOutlined style={{ color: '#faad14', fontSize: 20 }} />
                        </Tooltip>
                      </div>
                    )}

                    {/* Module Icon */}
                    <div 
                      className="module-icon"
                      style={{ background: module.gradient }}
                    >
                      <div className="module-icon-inner">
                        {module.icon}
                      </div>
                    </div>

                    {/* Module Info */}
                    <div className="module-info">
                      <Title level={5} className="module-name">
                        {module.name}
                        {!module.isActive && (
                          <LockOutlined style={{ marginLeft: 8, fontSize: 14, color: '#bfbfbf' }} />
                        )}
                      </Title>
                      
                      <Paragraph className="module-description">
                        {module.description}
                      </Paragraph>

                      {/* Features */}
                      {module.features && hoveredModule === module.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="module-features"
                        >
                          {module.features.map((feature, index) => (
                            <div key={index} className="module-feature">
                              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>{feature}</Text>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {/* Usage Stats */}
                      {module.usageCount && module.isActive && (
                        <div className="module-stats">
                          <Space>
                            <StarOutlined style={{ color: '#faad14', fontSize: 12 }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {module.usageCount} kullanıcı
                            </Text>
                          </Space>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="module-action">
                        {module.isActive ? (
                          <Button 
                            type="text" 
                            icon={<RightOutlined />}
                            className="module-enter-btn"
                            style={{ color: module.color }}
                          >
                            Modüle Git
                          </Button>
                        ) : (
                          <Button 
                            type="text" 
                            disabled
                            icon={<LockOutlined />}
                          >
                            Aktif Değil
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="module-footer">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Space>
                <div className="stat-icon" style={{ background: '#f6ffed' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                </div>
                <div>
                  <Text type="secondary">Aktif Modüller</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {modules.filter(m => m.isActive).length}
                  </Title>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Space>
                <div className="stat-icon" style={{ background: '#fff7e6' }}>
                  <ClockCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />
                </div>
                <div>
                  <Text type="secondary">Son Giriş</Text>
                  <Title level={4} style={{ margin: 0 }}>Bugün</Title>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Space>
                <div className="stat-icon" style={{ background: '#f0f5ff' }}>
                  <TeamOutlined style={{ color: '#597ef7', fontSize: 24 }} />
                </div>
                <div>
                  <Text type="secondary">Kullanıcılar</Text>
                  <Title level={4} style={{ margin: 0 }}>12</Title>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};