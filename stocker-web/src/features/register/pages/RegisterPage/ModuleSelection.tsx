import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Checkbox, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Divider,
  Badge,
  Tooltip,
  message
} from 'antd';
import {
  UserOutlined,
  InboxOutlined,
  CalculatorOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  ProjectOutlined,
  CarOutlined,
  ShopOutlined,
  FileTextOutlined,
  ApiOutlined,
  BankOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  PlusCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { modules, basePackages, calculateTotalPrice, getRequiredModules, getModulesByCategory } from '../../data/modules';

const { Title, Text, Paragraph } = Typography;

interface ModuleSelectionProps {
  onComplete: (selectedModules: string[], basePackage: string, totalPrice: number) => void;
  initialModules?: string[];
  initialPackage?: string;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'UserOutlined': <UserOutlined />,
  'InboxOutlined': <InboxOutlined />,
  'CalculatorOutlined': <CalculatorOutlined />,
  'TeamOutlined': <TeamOutlined />,
  'ShoppingCartOutlined': <ShoppingCartOutlined />,
  'ToolOutlined': <ToolOutlined />,
  'ProjectOutlined': <ProjectOutlined />,
  'CarOutlined': <CarOutlined />,
  'ShopOutlined': <ShopOutlined />,
  'FileTextOutlined': <FileTextOutlined />,
  'ApiOutlined': <ApiOutlined />,
  'BankOutlined': <BankOutlined />,
  'BarChartOutlined': <BarChartOutlined />
};

export const ModuleSelection: React.FC<ModuleSelectionProps> = ({ 
  onComplete, 
  initialModules = [], 
  initialPackage = 'starter' 
}) => {
  const [selectedModules, setSelectedModules] = useState<string[]>([...getRequiredModules(), ...initialModules]);
  const [selectedPackage, setSelectedPackage] = useState<string>(initialPackage);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const price = calculateTotalPrice(selectedModules, selectedPackage);
    setTotalPrice(price);
  }, [selectedModules, selectedPackage]);

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.required && !checked) {
      message.warning('Bu modül zorunludur ve kaldırılamaz');
      return;
    }

    if (checked) {
      setSelectedModules([...selectedModules, moduleId]);
    } else {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleContinue = () => {
    if (selectedModules.length === 0) {
      message.error('En az bir modül seçmelisiniz');
      return;
    }
    onComplete(selectedModules, selectedPackage, totalPrice);
  };

  const renderModuleCard = (module: typeof modules[0]) => {
    const isSelected = selectedModules.includes(module.id);
    const icon = module.icon ? iconMap[module.icon] : <AppstoreOutlined />;

    return (
      <Card
        key={module.id}
        className={`module-card ${isSelected ? 'selected' : ''} ${module.required ? 'required' : ''}`}
        hoverable={!module.required}
        style={{
          borderColor: isSelected ? '#667eea' : undefined,
          borderWidth: isSelected ? 2 : 1
        }}
      >
        <div style={{ position: 'relative' }}>
          {module.popular && (
            <Badge.Ribbon text="Popüler" color="red" />
          )}
          {module.required && (
            <Tag color="blue" style={{ position: 'absolute', top: 0, right: 0 }}>
              Zorunlu
            </Tag>
          )}
          
          <Checkbox
            checked={isSelected}
            disabled={module.required}
            onChange={(e) => handleModuleToggle(module.id, e.target.checked)}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 32, color: isSelected ? '#667eea' : '#999', marginBottom: 16 }}>
              {icon}
            </div>
            <Title level={5} style={{ marginBottom: 8 }}>{module.name}</Title>
            <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
              {module.description}
            </Paragraph>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 24, color: '#667eea' }}>
                ₺{module.price}
              </Text>
              <Text type="secondary">/ay</Text>
            </div>

            <div style={{ textAlign: 'left' }}>
              {module.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  <Text style={{ fontSize: 12 }}>{feature}</Text>
                </div>
              ))}
              {module.features.length > 3 && (
                <Tooltip title={
                  <div>
                    {module.features.slice(3).map((feature, idx) => (
                      <div key={idx}>{feature}</div>
                    ))}
                  </div>
                }>
                  <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }}>
                    +{module.features.length - 3} özellik daha...
                  </Text>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="module-selection">
      {/* Base Package Selection */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3}>
          <CrownOutlined /> Temel Paket Seçimi
        </Title>
        <Paragraph type="secondary">
          İşletmenizin büyüklüğüne uygun paketi seçin
        </Paragraph>
        
        <Row gutter={[24, 24]}>
          {basePackages.map(pkg => (
            <Col xs={24} md={8} key={pkg.id}>
              <Badge.Ribbon 
                text="Popüler" 
                color="red"
                style={{ display: pkg.popular ? 'block' : 'none' }}
              >
                <Card
                  hoverable
                  className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
                  onClick={() => handlePackageSelect(pkg.id)}
                  style={{
                    borderColor: selectedPackage === pkg.id ? '#667eea' : undefined,
                    borderWidth: selectedPackage === pkg.id ? 2 : 1
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4}>{pkg.name}</Title>
                    <Text type="secondary">{pkg.description}</Text>
                    
                    <div style={{ margin: '20px 0' }}>
                      <Text strong style={{ fontSize: 28, color: '#667eea' }}>
                        ₺{pkg.basePrice}
                      </Text>
                      <Text type="secondary">/ay</Text>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      {pkg.features.map((feature, idx) => (
                        <div key={idx} style={{ marginBottom: 8 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          <Text>{feature}</Text>
                        </div>
                      ))}
                    </div>

                    <Button
                      type={selectedPackage === pkg.id ? 'primary' : 'default'}
                      block
                      style={{ marginTop: 16 }}
                    >
                      {selectedPackage === pkg.id ? 'Seçildi' : 'Seç'}
                    </Button>
                  </div>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </div>

      <Divider />

      {/* Core Modules */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3}>
          <AppstoreOutlined /> Temel Modüller
        </Title>
        <Paragraph type="secondary">
          İşletmenizin temel ihtiyaçlarını karşılayan modüller
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          {getModulesByCategory('core').map(module => (
            <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
              {renderModuleCard(module)}
            </Col>
          ))}
        </Row>
      </div>

      {/* Addon Modules */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3}>
          <PlusCircleOutlined /> Eklenti Modüller
        </Title>
        <Paragraph type="secondary">
          İşletmenizi bir üst seviyeye taşıyacak özellikler
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          {getModulesByCategory('addon').map(module => (
            <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
              {renderModuleCard(module)}
            </Col>
          ))}
        </Row>
      </div>

      {/* Integration Modules */}
      <div style={{ marginBottom: 48 }}>
        <Title level={3}>
          <ApiOutlined /> Entegrasyon Modülleri
        </Title>
        <Paragraph type="secondary">
          Diğer sistemlerle entegrasyon özellikleri
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          {getModulesByCategory('integration').map(module => (
            <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
              {renderModuleCard(module)}
            </Col>
          ))}
        </Row>
      </div>

      {/* Price Summary */}
      <Card
        style={{
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          zIndex: 10
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <div>
                <Text type="secondary">Temel Paket:</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {basePackages.find(p => p.id === selectedPackage)?.name}
                </Text>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <Text type="secondary">Seçilen Modüller:</Text>
                <br />
                <Text strong style={{ fontSize: 18 }}>
                  {selectedModules.length} modül
                </Text>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <Text type="secondary">Toplam Fiyat:</Text>
                <br />
                <Text strong style={{ fontSize: 24, color: '#667eea' }}>
                  ₺{totalPrice}/ay
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              onClick={handleContinue}
              disabled={selectedModules.length === 0}
            >
              Devam Et
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

