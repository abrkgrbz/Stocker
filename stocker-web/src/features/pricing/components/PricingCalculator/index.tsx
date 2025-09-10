import React, { useState, useMemo } from 'react';
import { Card, Slider, InputNumber, Select, Row, Col, Typography, Space, Tag, Divider, Alert, Button } from 'antd';
import { 
  UserOutlined, 
  DatabaseOutlined, 
  ApiOutlined, 
  ShoppingCartOutlined,
  CalculatorOutlined,
  SaveOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import './style.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface CalculatorProps {
  onPriceChange?: (price: number) => void;
}

export const PricingCalculator: React.FC<CalculatorProps> = ({ onPriceChange }) => {
  const [userCount, setUserCount] = useState(5);
  const [storageGB, setStorageGB] = useState(10);
  const [modules, setModules] = useState<string[]>(['crm', 'inventory']);
  const [supportLevel, setSupportLevel] = useState('basic');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const moduleOptions = [
    { value: 'crm', label: 'CRM', price: 50 },
    { value: 'inventory', label: 'Stok Yönetimi', price: 40 },
    { value: 'accounting', label: 'Muhasebe', price: 80 },
    { value: 'hr', label: 'İnsan Kaynakları', price: 60 },
    { value: 'ecommerce', label: 'E-Ticaret', price: 100 },
    { value: 'production', label: 'Üretim', price: 120 },
    { value: 'logistics', label: 'Lojistik', price: 90 },
    { value: 'bi', label: 'İş Zekası', price: 150 }
  ];

  const supportOptions = [
    { value: 'basic', label: 'Temel Destek', price: 0 },
    { value: 'standard', label: 'Standart Destek (8/5)', price: 100 },
    { value: 'premium', label: 'Premium Destek (7/24)', price: 250 },
    { value: 'enterprise', label: 'Kurumsal Destek', price: 500 }
  ];

  const calculatePrice = useMemo(() => {
    // Temel fiyat
    let basePrice = 100;
    
    // Kullanıcı başına fiyat
    let userPrice = 0;
    if (userCount <= 5) {
      userPrice = userCount * 30;
    } else if (userCount <= 20) {
      userPrice = 150 + (userCount - 5) * 25;
    } else if (userCount <= 50) {
      userPrice = 525 + (userCount - 20) * 20;
    } else {
      userPrice = 1125 + (userCount - 50) * 15;
    }
    
    // Depolama fiyatı (10GB ücretsiz)
    let storagePrice = 0;
    if (storageGB > 10) {
      storagePrice = (storageGB - 10) * 2;
    }
    
    // Modül fiyatları
    const modulePrice = modules.reduce((total, mod) => {
      const module = moduleOptions.find(m => m.value === mod);
      return total + (module?.price || 0);
    }, 0);
    
    // Destek fiyatı
    const support = supportOptions.find(s => s.value === supportLevel);
    const supportPrice = support?.price || 0;
    
    // Toplam aylık fiyat
    let totalMonthly = basePrice + userPrice + storagePrice + modulePrice + supportPrice;
    
    // Yıllık indirim (%20)
    if (billingPeriod === 'yearly') {
      totalMonthly = totalMonthly * 0.8;
    }
    
    return Math.round(totalMonthly);
  }, [userCount, storageGB, modules, supportLevel, billingPeriod]);

  const yearlyTotal = calculatePrice * 12;
  const monthlySavings = billingPeriod === 'yearly' ? Math.round(calculatePrice * 12 * 0.25) : 0;

  return (
    <Card className="pricing-calculator">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="calculator-header">
          <Title level={3}>
            <CalculatorOutlined /> Fiyat Hesaplayıcı
          </Title>
          <Text type="secondary">
            İhtiyaçlarınıza göre özel fiyatlandırma
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="calculator-section">
                <Text strong>
                  <UserOutlined /> Kullanıcı Sayısı: {userCount}
                </Text>
                <Slider
                  min={1}
                  max={100}
                  value={userCount}
                  onChange={setUserCount}
                  marks={{
                    1: '1',
                    25: '25',
                    50: '50',
                    75: '75',
                    100: '100'
                  }}
                />
                <InputNumber
                  min={1}
                  max={1000}
                  value={userCount}
                  onChange={(value) => setUserCount(value || 1)}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="calculator-section">
                <Text strong>
                  <DatabaseOutlined /> Depolama Alanı (GB): {storageGB}
                </Text>
                <Slider
                  min={10}
                  max={500}
                  step={10}
                  value={storageGB}
                  onChange={setStorageGB}
                  marks={{
                    10: '10GB',
                    100: '100GB',
                    250: '250GB',
                    500: '500GB'
                  }}
                />
                {storageGB > 10 && (
                  <Alert 
                    message={`+${storageGB - 10}GB ek depolama`}
                    type="info"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="calculator-section">
                <Text strong>
                  <ApiOutlined /> Modüller
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Modülleri seçin"
                  value={modules}
                  onChange={setModules}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {moduleOptions.map(module => (
                    <Option key={module.value} value={module.value}>
                      {module.label} (+₺{module.price}/ay)
                    </Option>
                  ))}
                </Select>
                <div style={{ marginTop: 8 }}>
                  {modules.map(mod => {
                    const module = moduleOptions.find(m => m.value === mod);
                    return module ? (
                      <Tag key={mod} color="blue" style={{ marginBottom: 4 }}>
                        {module.label}
                      </Tag>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="calculator-section">
                <Text strong>
                  <CustomerServiceOutlined /> Destek Seviyesi
                </Text>
                <Select
                  value={supportLevel}
                  onChange={setSupportLevel}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {supportOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label} {option.price > 0 && `(+₺${option.price}/ay)`}
                    </Option>
                  ))}
                </Select>
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        <div className="pricing-summary">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12}>
              <Space direction="vertical">
                <Text type="secondary">Ödeme Periyodu</Text>
                <Select
                  value={billingPeriod}
                  onChange={setBillingPeriod}
                  style={{ width: 200 }}
                >
                  <Option value="monthly">Aylık Ödeme</Option>
                  <Option value="yearly">
                    Yıllık Ödeme 
                    <Tag color="green" style={{ marginLeft: 8 }}>%20 İndirim</Tag>
                  </Option>
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Space direction="vertical" align="end">
                <div>
                  <Text type="secondary">Aylık Tutar</Text>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    ₺{calculatePrice.toLocaleString('tr-TR')}
                  </Title>
                </div>
                {billingPeriod === 'yearly' && (
                  <>
                    <Text type="success">
                      <SaveOutlined /> Yıllık tasarruf: ₺{monthlySavings.toLocaleString('tr-TR')}
                    </Text>
                    <Text strong>
                      Yıllık Toplam: ₺{yearlyTotal.toLocaleString('tr-TR')}
                    </Text>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <Alert
          message="Özel Fiyatlandırma"
          description="100'den fazla kullanıcı veya özel ihtiyaçlarınız için bizimle iletişime geçin."
          type="info"
          showIcon
          action={
            <Button type="primary" size="small">
              Teklif Al
            </Button>
          }
        />
      </Space>
    </Card>
  );
};