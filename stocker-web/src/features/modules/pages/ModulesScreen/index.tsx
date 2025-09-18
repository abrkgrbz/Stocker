import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Typography, Space, Avatar, Tag, Input, Empty, Tooltip } from 'antd';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CalculatorOutlined,
  UserOutlined,
  ToolOutlined,
  ProjectOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
  CrownOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import { availableModules, Module } from '@/types/modules';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// Icon mapping
const iconMap: { [key: string]: React.ReactNode } = {
  TeamOutlined: <TeamOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  InboxOutlined: <InboxOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  UserOutlined: <UserOutlined />,
  ToolOutlined: <ToolOutlined />,
  ProjectOutlined: <ProjectOutlined />,
  BarChartOutlined: <BarChartOutlined />
};

export const ModulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Simüle edilmiş kullanıcı modül erişimi
    // Gerçek uygulamada API'den gelecek
    const userModules = localStorage.getItem('user_modules');
    if (userModules) {
      const moduleIds = JSON.parse(userModules);
      const filtered = availableModules.map(module => ({
        ...module,
        isActive: moduleIds.includes(module.id) || module.isActive
      }));
      setModules(filtered);
    } else {
      // Demo için varsayılan modüller
      setModules(availableModules);
    }
  }, []);

  const handleModuleClick = (module: Module) => {
    if (module.isActive && !module.isComingSoon) {
      navigate(module.route);
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'Tümü', icon: <AppstoreOutlined /> },
    { key: 'core', label: 'Temel', icon: <RocketOutlined /> },
    { key: 'finance', label: 'Finans', icon: <CalculatorOutlined /> },
    { key: 'operations', label: 'Operasyon', icon: <ToolOutlined /> },
    { key: 'analytics', label: 'Analiz', icon: <BarChartOutlined /> },
    { key: 'hr', label: 'İK', icon: <UserOutlined /> }
  ];

  return (
    <div className="modules-screen">
      <div className="modules-header">
        <div className="modules-header-content">
          <Space align="center">
            <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
              <AppstoreOutlined style={{ fontSize: 24 }} />
            </Avatar>
            <div>
              <Title level={2} style={{ margin: 0 }}>Uygulama Modülleri</Title>
              <Text type="secondary">
                Hoş geldiniz, {user?.firstName} {user?.lastName}
              </Text>
            </div>
          </Space>

          <Space size="large">
            <Search
              placeholder="Modül ara..."
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>
        </div>

        <div className="modules-categories">
          <Space size="middle">
            {categories.map(cat => (
              <Tag
                key={cat.key}
                icon={cat.icon}
                color={selectedCategory === cat.key ? 'blue' : 'default'}
                onClick={() => setSelectedCategory(cat.key)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '6px 16px',
                  fontSize: '14px',
                  borderRadius: '8px'
                }}
              >
                {cat.label}
              </Tag>
            ))}
          </Space>
        </div>
      </div>

      <div className="modules-container">
        {filteredModules.length === 0 ? (
          <Empty 
            description="Modül bulunamadı"
            style={{ marginTop: 100 }}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredModules.map(module => (
              <Col key={module.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Badge.Ribbon
                      text={module.isComingSoon ? "Yakında" : module.isActive ? "Aktif" : "Kilitli"}
                      color={module.isComingSoon ? "orange" : module.isActive ? "green" : "gray"}
                    >
                      <Card
                        hoverable={module.isActive && !module.isComingSoon}
                        className={`module-card ${!module.isActive || module.isComingSoon ? 'disabled' : ''}`}
                        onClick={() => handleModuleClick(module)}
                        style={{
                          borderRadius: 12,
                          height: '100%',
                          background: module.isActive && !module.isComingSoon 
                            ? `linear-gradient(135deg, ${module.color}15 0%, ${module.color}05 100%)`
                            : '#f5f5f5'
                        }}
                      >
                        <div className="module-card-content">
                          <Avatar 
                            size={64} 
                            style={{ 
                              backgroundColor: module.isActive && !module.isComingSoon ? module.color : '#d9d9d9',
                              marginBottom: 16
                            }}
                          >
                            <span style={{ fontSize: 28 }}>
                              {iconMap[module.icon]}
                            </span>
                          </Avatar>

                          <Title level={4} style={{ marginBottom: 8 }}>
                            {module.name}
                          </Title>

                          <Paragraph 
                            type="secondary" 
                            style={{ 
                              marginBottom: 16,
                              minHeight: 44
                            }}
                          >
                            {module.description}
                          </Paragraph>

                          <div className="module-status">
                            {module.isComingSoon ? (
                              <Tag icon={<ClockCircleOutlined />} color="orange">
                                Yakında
                              </Tag>
                            ) : module.isActive ? (
                              <Tag icon={<CheckCircleOutlined />} color="success">
                                Kullanılabilir
                              </Tag>
                            ) : (
                              <Tooltip title="Bu modüle erişiminiz yok">
                                <Tag icon={<LockOutlined />} color="default">
                                  Kilitli
                                </Tag>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div className="modules-footer">
        <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Space align="center" size="large">
            <CrownOutlined style={{ fontSize: 32, color: '#fff' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                Daha fazla modüle ihtiyacınız mı?
              </Title>
              <Text style={{ color: '#fff', opacity: 0.9 }}>
                Premium paketlere göz atın ve işletmenizi bir üst seviyeye taşıyın.
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ModulesScreen;