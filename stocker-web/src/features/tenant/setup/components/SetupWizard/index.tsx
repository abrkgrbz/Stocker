import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Progress,
  Space,
  Typography,
  Alert,
  Spin,
  Result,
  Badge,
  Row,
  Col,
  Divider,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  SettingOutlined,
  TeamOutlined,
  ShopOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import './styles.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface SetupWizardProps {
  tenantId: string;
  onComplete?: () => void;
}

interface WizardStep {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  required: boolean;
  category: 'basic' | 'organization' | 'modules' | 'advanced' | 'review';
}

const SetupWizard: React.FC<SetupWizardProps> = ({ tenantId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [wizardData, setWizardData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [needsHelp, setNeedsHelp] = useState(false);

  const wizardSteps: WizardStep[] = [
    {
      key: 'company',
      title: 'Şirket Bilgileri',
      description: 'Temel şirket bilgilerini tamamlayın',
      icon: <ShopOutlined />,
      component: null, // Will be implemented
      required: true,
      category: 'basic'
    },
    {
      key: 'organization',
      title: 'Organizasyon Yapısı',
      description: 'Departman ve şubeleri oluşturun',
      icon: <TeamOutlined />,
      component: null,
      required: false,
      category: 'organization'
    },
    {
      key: 'users',
      title: 'Kullanıcılar',
      description: 'Kullanıcıları davet edin ve roller atayın',
      icon: <TeamOutlined />,
      component: null,
      required: true,
      category: 'organization'
    },
    {
      key: 'modules',
      title: 'Modül Seçimi',
      description: 'İhtiyacınız olan modülleri seçin',
      icon: <AppstoreOutlined />,
      component: null,
      required: true,
      category: 'modules'
    },
    {
      key: 'finance',
      title: 'Mali Ayarlar',
      description: 'Hesap planı ve vergi ayarları',
      icon: <DatabaseOutlined />,
      component: null,
      required: true,
      category: 'modules'
    },
    {
      key: 'security',
      title: 'Güvenlik',
      description: 'Güvenlik politikalarını yapılandırın',
      icon: <SafetyOutlined />,
      component: null,
      required: true,
      category: 'advanced'
    },
    {
      key: 'integrations',
      title: 'Entegrasyonlar',
      description: 'Dış sistemlerle bağlantı kurun',
      icon: <CloudUploadOutlined />,
      component: null,
      required: false,
      category: 'advanced'
    },
    {
      key: 'review',
      title: 'Gözden Geçir',
      description: 'Ayarları kontrol edin ve onaylayın',
      icon: <CheckCircleOutlined />,
      component: null,
      required: true,
      category: 'review'
    }
  ];

  useEffect(() => {
    fetchWizardData();
  }, [tenantId]);

  const fetchWizardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/public/tenant-registration/wizard/${tenantId}`);
      if (response.data?.success) {
        setWizardData(response.data.data);
        setCurrentStep(response.data.data.currentStep - 1);
      }
    } catch (error) {
      // Error handling removed for production
      message.error('Kurulum bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put(`/api/public/tenant-registration/wizard/${wizardData.id}/step`, {
        action: 'complete',
        stepData: {} // Current step data
      });
      
      if (response.data?.success) {
        setWizardData(response.data.data);
        if (currentStep < wizardSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          message.success('Kurulum tamamlandı!');
          onComplete?.();
        }
      }
    } catch (error) {
      // Error handling removed for production
      message.error('İşlem sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    const currentStepData = wizardSteps[currentStep];
    if (!currentStepData.required) {
      try {
        setSaving(true);
        await apiClient.put(`/api/public/tenant-registration/wizard/${wizardData.id}/step`, {
          action: 'skip',
          reason: 'User skipped optional step'
        });
        
        if (currentStep < wizardSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
        message.info('Adım atlandı');
      } catch (error) {
        // Error handling removed for production
        message.error('İşlem sırasında hata oluştu');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRequestHelp = async () => {
    setNeedsHelp(true);
    try {
      await apiClient.put(`/api/public/tenant-registration/wizard/${wizardData.id}/step`, {
        action: 'requestHelp',
        notes: `Help requested for step: ${wizardSteps[currentStep].title}`
      });
      message.success('Yardım talebiniz alındı. En kısa sürede size dönüş yapılacak.');
    } catch (error) {
      // Error handling removed for production
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (!wizardData) return 'wait';
    
    if (stepIndex < wizardData.completedSteps) return 'finish';
    if (stepIndex === currentStep) return 'process';
    if (stepIndex > currentStep) return 'wait';
    return 'wait';
  };

  const getProgressColor = () => {
    const progress = wizardData?.progressPercentage || 0;
    if (progress < 30) return '#ff4d4f';
    if (progress < 60) return '#faad14';
    if (progress < 90) return '#52c41a';
    return '#1890ff';
  };

  if (loading) {
    return (
      <Card className="setup-wizard-loading">
        <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
        <Title level={4} style={{ marginTop: 24 }}>Kurulum hazırlanıyor...</Title>
      </Card>
    );
  }

  if (!wizardData) {
    return (
      <Result
        status="404"
        title="Kurulum Bulunamadı"
        subTitle="Bu tenant için kurulum sihirbazı bulunamadı."
        extra={<Button type="primary" onClick={fetchWizardData}>Tekrar Dene</Button>}
      />
    );
  }

  const currentStepData = wizardSteps[currentStep];

  return (
    <div className="setup-wizard-container">
      <Card className="wizard-header-card">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                <RocketOutlined /> Kurulum Sihirbazı
              </Title>
              <Text type="secondary">
                Sistemi kullanmaya başlamak için gerekli adımları tamamlayın
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge status={wizardData.status === 'InProgress' ? 'processing' : 'success'} />
              <Text>{wizardData.status === 'Completed' ? 'Tamamlandı' : 'Devam Ediyor'}</Text>
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Progress
              percent={wizardData.progressPercentage}
              strokeColor={getProgressColor()}
              format={(percent) => (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  %{Math.round(percent || 0)}
                </span>
              )}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary">
                {wizardData.completedSteps} / {wizardData.totalSteps} adım tamamlandı
              </Text>
              {wizardData.estimatedCompletionTime && (
                <>
                  <Divider type="vertical" />
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Tahmini süre: {wizardData.estimatedCompletionTime}
                  </Text>
                </>
              )}
            </Space>
          </Col>
          <Col xs={24} lg={6} style={{ textAlign: 'right' }}>
            {needsHelp && (
              <Alert
                message="Yardım Talep Edildi"
                type="info"
                showIcon
                closable
                onClose={() => setNeedsHelp(false)}
              />
            )}
            <Button
              icon={<QuestionCircleOutlined />}
              onClick={handleRequestHelp}
              disabled={needsHelp}
            >
              Yardım İste
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="wizard-content-card">
        <Steps current={currentStep} className="wizard-steps">
          {wizardSteps.map((step, index) => (
            <Step
              key={step.key}
              title={step.title}
              description={step.description}
              icon={step.icon}
              status={getStepStatus(index)}
            />
          ))}
        </Steps>

        <div className="wizard-step-content">
          <Card className="step-detail-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div className="step-header">
                <Space>
                  <div className="step-icon">{currentStepData.icon}</div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {currentStepData.title}
                    </Title>
                    <Text type="secondary">{currentStepData.description}</Text>
                  </div>
                </Space>
                {currentStepData.required && (
                  <Badge color="red" text="Zorunlu" />
                )}
              </div>

              <Divider />

              {/* Step component will be rendered here */}
              <div className="step-component-container">
                {currentStepData.component || (
                  <Alert
                    message="Bu adım henüz hazır değil"
                    description="İlgili bileşen yakında eklenecek"
                    type="info"
                    showIcon
                  />
                )}
              </div>
            </Space>
          </Card>
        </div>

        <div className="wizard-actions">
          <Button
            size="large"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            icon={<ArrowLeftOutlined />}
          >
            Önceki
          </Button>

          <Space>
            {!currentStepData.required && currentStep < wizardSteps.length - 1 && (
              <Button
                size="large"
                onClick={handleSkip}
                disabled={saving}
              >
                Atla
              </Button>
            )}
            
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              loading={saving}
              icon={currentStep === wizardSteps.length - 1 ? <CheckOutlined /> : <ArrowRightOutlined />}
            >
              {currentStep === wizardSteps.length - 1 ? 'Kurulumu Tamamla' : 'İleri'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default SetupWizard;