import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReloadOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Button, Space, Typography, Divider, Tag, Alert } from 'antd';

import { ModernWizard } from '@/features/register/pages/RegisterPage/ModernWizard';

const { Title, Text, Paragraph } = Typography;

export const RegisterWizardTest: React.FC = () => {
  const navigate = useNavigate();
  const [wizardKey, setWizardKey] = useState(0);
  const [completedData, setCompletedData] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const handleWizardComplete = (data: any) => {
        setCompletedData(data);
    setShowResult(true);
  };

  const resetWizard = () => {
    setWizardKey(prev => prev + 1);
    setCompletedData(null);
    setShowResult(false);
  };

  // Mock package for testing
  const mockPackage = {
    id: 'test-package-1',
    name: 'Test Paketi',
    description: 'Test için kullanılan paket',
    price: 999,
    currency: '₺',
    features: ['Özellik 1', 'Özellik 2', 'Özellik 3'],
    maxUsers: 10,
    maxStorage: 50,
    modules: ['CRM', 'Inventory']
  };

  // Mock SignalR validation (always returns success immediately)
  const mockSignalRValidation = {
    isConnected: false, // Disable connection to skip validations
    emailValidation: { isValid: true, message: 'Test mode - always valid' },
    passwordStrength: { 
      score: 5, 
      level: 'VeryStrong', 
      color: '#52c41a',
      suggestions: [],
      hasUpperCase: true,
      hasLowerCase: true,
      hasDigit: true,
      hasSpecialChar: true
    },
    domainCheck: { isAvailable: true, message: 'Test mode - always available' },
    phoneValidation: { isValid: true, message: 'Test mode - always valid' },
    companyNameCheck: { isValid: true, isUnique: true, message: 'Test mode - always valid' },
    identityValidation: { isValid: true, message: 'Test mode - always valid' },
    tenantCodeValidation: { isAvailable: true, message: 'Test mode - always available', code: '', suggestedCodes: [] },
    validateEmail: async () => Promise.resolve(),
    checkPasswordStrength: async () => Promise.resolve(),
    checkDomain: async () => Promise.resolve(),
    validatePhone: async () => Promise.resolve(),
    checkCompanyName: async () => Promise.resolve(),
    validateIdentity: async () => Promise.resolve(),
    validateTenantCode: async () => Promise.resolve(),
    error: null
  };

  return (
    <div className="register-wizard-test-container">
      <Card className="test-header-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/test')}
              >
                Test Sayfasına Dön
              </Button>
            </Space>
            <Title level={3} style={{ margin: 0 }}>Register Wizard Test</Title>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={resetWizard}
              >
                Wizard'ı Sıfırla
              </Button>
            </Space>
          </Space>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Space wrap>
            <Tag color="blue">Validasyon Kapalı</Tag>
            <Tag color="green">Test Modu</Tag>
            <Tag color="orange">Mock Data</Tag>
          </Space>

          <Alert
            message="Test Modu"
            description="Bu sayfa sadece wizard'ın görsel ve işlevsel testleri içindir. Validasyonlar devre dışı bırakılmıştır."
            type="info"
            showIcon
          />
        </Space>
      </Card>

      {!showResult ? (
        <div className="wizard-test-wrapper">
          <ModernWizard
            key={wizardKey}
            onComplete={handleWizardComplete}
            selectedPackage={mockPackage}
            signalRValidation={mockSignalRValidation}
          />
        </div>
      ) : (
        <Card className="result-card">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              <Title level={3} style={{ marginTop: 16 }}>Wizard Tamamlandı!</Title>
            </div>
            
            <Card type="inner" title="Toplanan Veriler">
              <pre className="data-preview">
                {JSON.stringify(completedData, null, 2)}
              </pre>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button type="primary" onClick={resetWizard}>
                Yeni Test Başlat
              </Button>
              <Button onClick={() => setShowResult(false)}>
                Wizard'a Geri Dön
              </Button>
            </Space>
          </Space>
        </Card>
      )}

      <Card className="test-info-card">
        <Title level={4}>Test Bilgileri</Title>
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Wizard Durumu:</Text>
            <Text> {showResult ? 'Tamamlandı' : 'Devam Ediyor'}</Text>
          </div>
          
          <div>
            <Text strong>Test Sayısı:</Text>
            <Text> {wizardKey + 1}</Text>
          </div>
          
          <div>
            <Text strong>Mock Paket:</Text>
            <Text> {mockPackage.name} - {mockPackage.currency}{mockPackage.price}/ay</Text>
          </div>
        </Space>

        <Divider />
        
        <Title level={5}>Test Edilecek Özellikler</Title>
        <ul className="test-checklist">
          <li>Step geçişleri</li>
          <li>Form validasyonları (kapalı)</li>
          <li>Paket seçimi görünümü</li>
          <li>Responsive tasarım</li>
          <li>İleri/Geri butonları</li>
          <li>Progress bar</li>
          <li>Form alanları</li>
          <li>Captcha entegrasyonu</li>
          <li>E-posta doğrulama</li>
        </ul>
      </Card>
    </div>
  );
};