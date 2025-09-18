import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Badge, Tooltip, Space, Avatar, Button, Tag, Spin, Empty, message } from 'antd';
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
  BellOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/app/store/auth.store';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: React.ReactNode | string;
  color: string;
  gradient?: string;
  route: string;
  badge?: string;
  isPremium?: boolean;
  isActive: boolean;
  features?: string[];
  order?: number;
}

// Icon mapping for module codes
const getModuleIcon = (iconName: string): React.ReactNode => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'ShoppingCartOutlined': <ShoppingCartOutlined />,
    'TeamOutlined': <TeamOutlined />,
    'ShopOutlined': <ShopOutlined />,
    'DollarOutlined': <DollarOutlined />,
    'BarChartOutlined': <BarChartOutlined />,
    'FileTextOutlined': <FileTextOutlined />,
    'SettingOutlined': <SettingOutlined />,
    'AppstoreOutlined': <AppstoreOutlined />,
    'UsergroupAddOutlined': <UsergroupAddOutlined />,
    'SafetyCertificateOutlined': <SafetyCertificateOutlined />,
    'DashboardOutlined': <DashboardOutlined />
  };
  return iconMap[iconName] || <AppstoreOutlined />;
};

// Default gradients for modules
const getModuleGradient = (color: string): string => {
  const gradientMap: { [key: string]: string } = {
    '#667eea': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '#f093fb': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    '#4facfe': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    '#43e97b': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    '#fa709a': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    '#30cfd0': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    '#a8edea': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    '#ffecd2': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    '#ff6b6b': 'linear-gradient(135deg, #ff6b6b 0%, #4e4e4e 100%)'
  };
  return gradientMap[color] || `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
};

export const ModuleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, userModules, isCompanyOwner, fetchUserModules } = useAuthStore();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    loadUserModules();
  }, []);

  const loadUserModules = async () => {
    try {
      setLoading(true);
      
      // If modules not already loaded, fetch them
      if (!userModules || userModules.length === 0) {
        await fetchUserModules();
      }
      
      // For development, use fallback modules if API fails
      if (!userModules || userModules.length === 0) {
        const fallbackModules: Module[] = [
          {
            id: '1',
            code: 'sales',
            name: 'Satış Yönetimi',
            description: 'Satış süreçlerini yönet, faturalar oluştur ve müşteri siparişlerini takip et',
            icon: 'ShoppingCartOutlined',
            color: '#667eea',
            route: '/sales',
            isActive: true,
            features: ['Fatura Yönetimi', 'Sipariş Takibi', 'Müşteri Yönetimi']
          },
          {
            id: '2',
            code: 'crm',
            name: 'CRM',
            description: 'Müşteri ilişkilerini güçlendir, satış fırsatlarını takip et',
            icon: 'TeamOutlined',
            color: '#f093fb',
            route: '/crm',
            isActive: true,
            features: ['Müşteri Takibi', 'Fırsat Yönetimi', 'Aktivite Takibi']
          },
          {
            id: '3',
            code: 'inventory',
            name: 'Stok Yönetimi',
            description: 'Stok seviyelerini kontrol et, ürün hareketlerini takip et',
            icon: 'ShopOutlined',
            color: '#4facfe',
            route: '/inventory',
            isActive: true,
            features: ['Stok Takibi', 'Depo Yönetimi', 'Transfer İşlemleri']
          },
          {
            id: '4',
            code: 'finance',
            name: 'Finans',
            description: 'Gelir-gider takibi, finansal raporlar ve bütçe yönetimi',
            icon: 'DollarOutlined',
            color: '#43e97b',
            route: '/finance',
            isPremium: true,
            isActive: true,
            features: ['Gelir-Gider', 'Finansal Raporlar', 'Bütçe Planlama']
          },
          {
            id: '5',
            code: 'settings',
            name: 'Ayarlar',
            description: 'Sistem ayarları ve kullanıcı yönetimi',
            icon: 'SettingOutlined',
            color: '#a8edea',
            route: '/settings',
            isActive: true,
            features: ['Kullanıcı Yönetimi', 'Rol Yönetimi', 'Sistem Ayarları']
          }
        ];
        
        // Add admin panel if user is company owner
        if (isCompanyOwner) {
          fallbackModules.push({
            id: 'admin',
            code: 'admin',
            name: 'Yönetim Paneli',
            description: 'Kullanıcıları yönet, roller ata ve sistem ayarlarını yapılandır',
            icon: 'SafetyCertificateOutlined',
            color: '#ff6b6b',
            route: '/admin',
            badge: 'Admin',
            isActive: true,
            features: ['Kullanıcı Yönetimi', 'Rol Atama', 'Modül Yönetimi', 'Sistem Ayarları']
          });
        }
        
        setModules(fallbackModules);
      } else {
        // Use actual user modules from API
        const processedModules: Module[] = userModules.map(m => ({
          ...m,
          icon: m.icon || 'AppstoreOutlined',
          gradient: getModuleGradient(m.color)
        }));
        
        // Add admin panel if user is company owner
        if (isCompanyOwner) {
          processedModules.push({
            id: 'admin',
            code: 'admin',
            name: 'Yönetim Paneli',
            description: 'Kullanıcıları yönet, roller ata ve sistem ayarlarını yapılandır',
            icon: 'SafetyCertificateOutlined',
            color: '#ff6b6b',
            gradient: getModuleGradient('#ff6b6b'),
            route: '/admin',
            badge: 'Admin',
            isActive: true,
            features: ['Kullanıcı Yönetimi', 'Rol Atama', 'Modül Yönetimi', 'Sistem Ayarları']
          });
        }
        
        // Sort modules by order if available
        processedModules.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        setModules(processedModules);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
      message.error('Modüller yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="module-selection-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Modüller yükleniyor..." size="large" />
      </div>
    );
  }

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
        {modules.length === 0 ? (
          <Empty
            description="Kullanılabilir modül bulunamadı"
            style={{ marginTop: 100 }}
          />
        ) : (
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
                      style={{ background: module.gradient || getModuleGradient(module.color) }}
                    >
                      <div className="module-icon-inner">
                        {typeof module.icon === 'string' ? getModuleIcon(module.icon) : module.icon}
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
        )}
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