import React, { useState } from 'react';
import { 
  Steps, 
  Card, 
  Button, 
  Typography, 
  Space, 
  Radio, 
  Slider, 
  Tag,
  Row,
  Col,
  Divider,
  Result,
  List,
  Badge
} from 'antd';
import { 
  TeamOutlined, 
  ShoppingOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface WizardData {
  businessSize: 'small' | 'medium' | 'large' | null;
  userCount: number;
  modules: string[];
  industry: string | null;
}

interface RecommendedPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  savings?: number;
  badge?: string;
}

export const PricingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    businessSize: null,
    userCount: 5,
    modules: [],
    industry: null
  });
  const [recommendedPlan, setRecommendedPlan] = useState<RecommendedPlan | null>(null);

  const steps = [
    {
      title: 'İşletme Büyüklüğü',
      icon: <TeamOutlined />
    },
    {
      title: 'Kullanıcı Sayısı',
      icon: <TeamOutlined />
    },
    {
      title: 'Modül Seçimi',
      icon: <ShoppingOutlined />
    },
    {
      title: 'Önerilen Plan',
      icon: <CrownOutlined />
    }
  ];

  const businessSizes = [
    {
      value: 'small',
      label: 'Küçük İşletme',
      description: '1-10 çalışan',
      icon: '🏢'
    },
    {
      value: 'medium',
      label: 'Orta Ölçekli',
      description: '11-50 çalışan',
      icon: '🏭'
    },
    {
      value: 'large',
      label: 'Büyük İşletme',
      description: '50+ çalışan',
      icon: '🏗️'
    }
  ];

  const availableModules = [
    { 
      id: 'crm', 
      name: 'CRM', 
      description: 'Müşteri İlişkileri',
      price: 299,
      icon: <TeamOutlined />
    },
    { 
      id: 'inventory', 
      name: 'Envanter', 
      description: 'Stok Yönetimi',
      price: 249,
      icon: <ShoppingOutlined />
    },
    { 
      id: 'sales', 
      name: 'Satış', 
      description: 'Satış Yönetimi',
      price: 349,
      icon: <RocketOutlined />
    },
    { 
      id: 'finance', 
      name: 'Finans', 
      description: 'Finansal Yönetim',
      price: 399,
      icon: <TeamOutlined />
    },
    { 
      id: 'hr', 
      name: 'İK', 
      description: 'İnsan Kaynakları',
      price: 199,
      icon: <TeamOutlined />
    },
    { 
      id: 'production', 
      name: 'Üretim', 
      description: 'Üretim Yönetimi',
      price: 449,
      icon: <TeamOutlined />
    }
  ];

  const calculateRecommendedPlan = () => {
    const basePrice = wizardData.businessSize === 'small' ? 499 : 
                     wizardData.businessSize === 'medium' ? 999 : 1999;
    
    const modulePrice = wizardData.modules.reduce((total, moduleId) => {
      const module = availableModules.find(m => m.id === moduleId);
      return total + (module?.price || 0);
    }, 0);

    const userPrice = Math.max(0, (wizardData.userCount - 5) * 50);
    
    const totalPrice = basePrice + modulePrice + userPrice;
    const discountedPrice = Math.round(totalPrice * 0.85); // %15 indirim

    const features = [
      `${wizardData.userCount} kullanıcı`,
      `${wizardData.modules.length} modül`,
      '7/24 destek',
      'Ücretsiz kurulum',
      'Aylık güncelleme',
      'Veri yedekleme',
      'API erişimi',
      'Özel raporlama'
    ];

    setRecommendedPlan({
      name: wizardData.businessSize === 'small' ? 'Başlangıç Plus' :
            wizardData.businessSize === 'medium' ? 'Profesyonel' : 'Kurumsal',
      price: discountedPrice,
      currency: '₺',
      period: 'ay',
      features,
      savings: totalPrice - discountedPrice,
      badge: 'Size Özel'
    });

    setCurrent(3);
  };

  const next = () => {
    if (current === 2) {
      calculateRecommendedPlan();
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const isStepValid = () => {
    switch (current) {
      case 0:
        return wizardData.businessSize !== null;
      case 1:
        return wizardData.userCount > 0;
      case 2:
        return wizardData.modules.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div className="wizard-step">
            <Title level={3}>İşletmenizin büyüklüğü nedir?</Title>
            <Paragraph className="step-description">
              Size en uygun planı önerebilmemiz için işletme büyüklüğünüzü seçin
            </Paragraph>
            
            <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
              {businessSizes.map((size) => (
                <Col xs={24} sm={8} key={size.value}>
                  <Card
                    hoverable
                    className={`size-card ${wizardData.businessSize === size.value ? 'selected' : ''}`}
                    onClick={() => setWizardData({...wizardData, businessSize: size.value as any})}
                  >
                    <div className="size-icon">{size.icon}</div>
                    <Title level={4}>{size.label}</Title>
                    <Text type="secondary">{size.description}</Text>
                    {wizardData.businessSize === size.value && (
                      <CheckCircleOutlined className="check-icon" />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 1:
        return (
          <div className="wizard-step">
            <Title level={3}>Kaç kullanıcınız olacak?</Title>
            <Paragraph className="step-description">
              Sistemi aktif olarak kullanacak kişi sayısını belirtin
            </Paragraph>
            
            <div className="user-count-selector">
              <div className="user-count-display">
                <TeamOutlined style={{ fontSize: 48, color: '#667eea' }} />
                <Title level={1} style={{ margin: '16px 0', color: '#667eea' }}>
                  {wizardData.userCount}
                </Title>
                <Text>Kullanıcı</Text>
              </div>
              
              <Slider
                min={1}
                max={100}
                value={wizardData.userCount}
                onChange={(value) => setWizardData({...wizardData, userCount: value})}
                marks={{
                  1: '1',
                  25: '25',
                  50: '50',
                  75: '75',
                  100: '100+'
                }}
                style={{ maxWidth: 500, margin: '40px auto' }}
              />
              
              <Space size="large" style={{ marginTop: 24 }}>
                <Tag color="blue">İlk 5 kullanıcı ücretsiz</Tag>
                <Tag color="green">Her ek kullanıcı: 50₺/ay</Tag>
              </Space>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="wizard-step">
            <Title level={3}>Hangi modüllere ihtiyacınız var?</Title>
            <Paragraph className="step-description">
              İşletmenizde kullanmak istediğiniz modülleri seçin (birden fazla seçebilirsiniz)
            </Paragraph>
            
            <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
              {availableModules.map((module) => (
                <Col xs={12} sm={8} md={6} lg={4} key={module.id}>
                  <Card
                    hoverable
                    size="small"
                    className={`module-select-card ${wizardData.modules.includes(module.id) ? 'selected' : ''}`}
                    onClick={() => {
                      const modules = wizardData.modules.includes(module.id)
                        ? wizardData.modules.filter(m => m !== module.id)
                        : [...wizardData.modules, module.id];
                      setWizardData({...wizardData, modules});
                    }}
                  >
                    <div className="module-icon">{module.icon}</div>
                    <Title level={5} style={{ marginBottom: 4 }}>{module.name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{module.description}</Text>
                    <div className="module-price">
                      <Text strong>+{module.price}₺</Text>
                    </div>
                    {wizardData.modules.includes(module.id) && (
                      <CheckCircleOutlined className="module-check-icon" />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
            
            {wizardData.modules.length > 0 && (
              <div className="selected-modules-summary">
                <Divider />
                <Space>
                  <Text>Seçilen modüller:</Text>
                  {wizardData.modules.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId);
                    return module ? (
                      <Tag key={moduleId} color="blue">{module.name}</Tag>
                    ) : null;
                  })}
                </Space>
              </div>
            )}
          </div>
        );

      case 3:
        return recommendedPlan ? (
          <div className="wizard-step result-step">
            <Result
              status="success"
              title="Size Özel Planınız Hazır!"
              subTitle="İhtiyaçlarınıza göre en uygun planı hazırladık"
              extra={[
                <Button 
                  type="primary" 
                  key="start"
                  size="large"
                  onClick={() => navigate('/register')}
                  icon={<RocketOutlined />}
                >
                  Hemen Başla
                </Button>,
                <Button 
                  key="compare"
                  size="large"
                  onClick={() => setCurrent(0)}
                >
                  Yeniden Hesapla
                </Button>
              ]}
            />
            
            <Row justify="center" style={{ marginTop: 40 }}>
              <Col xs={24} sm={20} md={16} lg={12}>
                <Badge.Ribbon text={recommendedPlan.badge} color="#52c41a">
                  <Card className="recommended-plan-card">
                    <div className="plan-header">
                      <Title level={2}>{recommendedPlan.name}</Title>
                      <div className="plan-price">
                        <Text className="price-amount">
                          {recommendedPlan.currency}{recommendedPlan.price}
                        </Text>
                        <Text className="price-period">/{recommendedPlan.period}</Text>
                      </div>
                      {recommendedPlan.savings && (
                        <Tag color="green" style={{ marginTop: 8 }}>
                          {recommendedPlan.savings}₺ tasarruf
                        </Tag>
                      )}
                    </div>
                    
                    <Divider />
                    
                    <List
                      dataSource={recommendedPlan.features}
                      renderItem={item => (
                        <List.Item style={{ border: 'none', padding: '8px 0' }}>
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text>{item}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                    
                    <Divider />
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">
                        * 14 gün ücretsiz deneme
                      </Text>
                      <Text type="secondary">
                        * Kredi kartı gerektirmez
                      </Text>
                      <Text type="secondary">
                        * İstediğiniz zaman iptal edebilirsiniz
                      </Text>
                    </Space>
                  </Card>
                </Badge.Ribbon>
              </Col>
            </Row>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="pricing-wizard">
      <Card className="wizard-container">
        <Steps 
          current={current} 
          items={steps}
          className="wizard-steps"
        />
        
        <div className="wizard-content">
          {renderStepContent()}
        </div>
        
        <div className="wizard-actions">
          {current > 0 && current < 3 && (
            <Button onClick={prev} icon={<ArrowLeftOutlined />}>
              Geri
            </Button>
          )}
          {current < 3 && (
            <Button 
              type="primary" 
              onClick={next}
              disabled={!isStepValid()}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              {current === 2 ? 'Planı Göster' : 'İleri'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};