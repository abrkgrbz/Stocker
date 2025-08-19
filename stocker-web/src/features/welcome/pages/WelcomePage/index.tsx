import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Steps,
  Button,
  Space,
  Row,
  Col,
  Progress,
  Avatar,
  Tag,
  Divider,
  Timeline,
  Alert,
  Badge,
  Statistic,
  Result,
  Tooltip,
  notification
} from 'antd';
import {
  CheckCircleOutlined,
  RocketOutlined,
  TeamOutlined,
  SettingOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  MailOutlined,
  DashboardOutlined,
  ShopOutlined,
  UserAddOutlined,
  FileTextOutlined,
  LineChartOutlined,
  BellOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  StarOutlined,
  TrophyOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import confetti from 'canvas-confetti';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface SetupStep {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'wait' | 'process' | 'finish' | 'error';
  action?: () => void;
}

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupProgress, setSetupProgress] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Show welcome notification
    notification.success({
      message: 'Hoşgeldiniz!',
      description: 'Stocker ailesine katıldığınız için teşekkür ederiz. Başarılı bir yolculuk dileriz!',
      placement: 'topRight',
      duration: 5,
      icon: <TrophyOutlined style={{ color: '#52c41a' }} />
    });

    return () => clearInterval(interval);
  }, []);

  const setupSteps: SetupStep[] = [
    {
      key: 'email',
      title: 'Email Doğrulama',
      description: 'Email adresinizi doğrulayın',
      icon: <MailOutlined />,
      status: emailVerified ? 'finish' : 'process',
      action: () => {
        notification.info({
          message: 'Doğrulama emaili gönderildi',
          description: 'Lütfen email kutunuzu kontrol edin'
        });
      }
    },
    {
      key: 'company',
      title: 'Şirket Bilgileri',
      description: 'Şirket profilinizi tamamlayın',
      icon: <ShopOutlined />,
      status: 'wait',
      action: () => navigate(`/app/${tenantId}/settings/company`)
    },
    {
      key: 'users',
      title: 'Kullanıcılar',
      description: 'Ekip üyelerinizi davet edin',
      icon: <UserAddOutlined />,
      status: 'wait',
      action: () => navigate(`/app/${tenantId}/users`)
    },
    {
      key: 'products',
      title: 'Ürünler',
      description: 'İlk ürünlerinizi ekleyin',
      icon: <DatabaseOutlined />,
      status: 'wait',
      action: () => navigate(`/app/${tenantId}/products`)
    },
    {
      key: 'settings',
      title: 'Ayarlar',
      description: 'Sistem ayarlarını yapılandırın',
      icon: <SettingOutlined />,
      status: 'wait',
      action: () => navigate(`/app/${tenantId}/settings`)
    }
  ];

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Ana kontrol panelinizi görüntüleyin',
      icon: <DashboardOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      color: '#e6f7ff',
      action: () => navigate(`/app/${tenantId}/dashboard`)
    },
    {
      title: 'CRM',
      description: 'Müşteri ilişkilerini yönetin',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      color: '#f6ffed',
      action: () => navigate(`/app/${tenantId}/crm`)
    },
    {
      title: 'Stok',
      description: 'Envanter takibi yapın',
      icon: <DatabaseOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      color: '#f9f0ff',
      action: () => navigate(`/app/${tenantId}/inventory`)
    },
    {
      title: 'Raporlar',
      description: 'İş analizlerinizi görüntüleyin',
      icon: <LineChartOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      color: '#fff7e6',
      action: () => navigate(`/app/${tenantId}/reports`)
    }
  ];

  const features = [
    {
      icon: <CrownOutlined />,
      title: 'Premium Özellikler',
      description: '30 gün ücretsiz deneme'
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Hızlı Başlangıç',
      description: 'Dakikalar içinde hazır'
    },
    {
      icon: <SafetyOutlined />,
      title: 'Güvenli Altyapı',
      description: '256-bit şifreleme'
    },
    {
      icon: <TeamOutlined />,
      title: '7/24 Destek',
      description: 'Her zaman yanınızdayız'
    }
  ];

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <div className="welcome-hero">
        <Card className="hero-card">
          <Row align="middle" gutter={32}>
            <Col xs={24} md={16}>
              <Space direction="vertical" size="large">
                <div>
                  <Title level={1} className="hero-title">
                    <RocketOutlined style={{ marginRight: 16, color: '#667eea' }} />
                    Hoşgeldiniz, {user?.fullName}!
                  </Title>
                  <Paragraph className="hero-description">
                    Stocker ile işletmenizi dijitale taşımanın ilk adımını attınız. 
                    Şimdi birkaç basit adımda sisteminizi hazır hale getirelim.
                  </Paragraph>
                </div>

                <Space wrap>
                  <Tag color="blue" icon={<CheckCircleOutlined />}>
                    Hesap Aktif
                  </Tag>
                  <Tag color="green" icon={<GiftOutlined />}>
                    30 Gün Ücretsiz Deneme
                  </Tag>
                  <Tag color="purple" icon={<StarOutlined />}>
                    Premium Paket
                  </Tag>
                </Space>

                <div className="hero-actions">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<DashboardOutlined />}
                    onClick={() => navigate(`/app/${tenantId}/dashboard`)}
                  >
                    Dashboard'a Git
                  </Button>
                  <Button 
                    size="large" 
                    icon={<FileTextOutlined />}
                    onClick={() => window.open('/docs', '_blank')}
                  >
                    Dokümantasyon
                  </Button>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <div className="progress-card">
                <Progress
                  type="circle"
                  percent={setupProgress}
                  width={180}
                  strokeColor={{
                    '0%': '#667eea',
                    '100%': '#764ba2'
                  }}
                  format={percent => (
                    <div className="progress-content">
                      <div className="progress-value">{percent}%</div>
                      <div className="progress-label">Tamamlandı</div>
                    </div>
                  )}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Setup Steps */}
      <Card title="Kurulum Adımları" className="setup-card">
        <Timeline mode="left">
          {setupSteps.map((step, index) => (
            <Timeline.Item
              key={step.key}
              color={step.status === 'finish' ? 'green' : step.status === 'process' ? 'blue' : 'gray'}
              dot={step.icon}
            >
              <Card 
                size="small" 
                className={`step-card ${step.status}`}
                hoverable={step.status !== 'finish'}
                onClick={step.action}
              >
                <Row align="middle" justify="space-between">
                  <Col span={20}>
                    <Space direction="vertical" size={0}>
                      <Text strong>{step.title}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {step.description}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    {step.status === 'finish' ? (
                      <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    ) : step.status === 'process' ? (
                      <Button type="primary" size="small">
                        Başla
                      </Button>
                    ) : (
                      <Badge status="default" />
                    )}
                  </Col>
                </Row>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Quick Actions */}
      <Card title="Hızlı Erişim" className="quick-actions-card">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                className="action-card"
                style={{ backgroundColor: action.color }}
                onClick={action.action}
              >
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  {action.icon}
                  <Text strong>{action.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                    {action.description}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Features */}
      <Card className="features-card">
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={64} style={{ backgroundColor: '#667eea' }}>
                  {feature.icon}
                </Avatar>
                <Text strong>{feature.title}</Text>
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  {feature.description}
                </Text>
              </Space>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Tips */}
      <Alert
        message="İpucu"
        description={
          <Space direction="vertical">
            <Text>
              🎯 İlk 7 gün içinde kurulumu tamamlayan kullanıcılarımız %40 daha verimli çalışıyor.
            </Text>
            <Text>
              📚 Eğitim videolarımızı izleyerek sistemi daha etkin kullanabilirsiniz.
            </Text>
            <Text>
              💬 Herhangi bir sorunuz olursa 7/24 destek ekibimiz yanınızda.
            </Text>
          </Space>
        }
        type="info"
        showIcon
        icon={<BellOutlined />}
        action={
          <Button size="small" type="primary">
            Destek Al
          </Button>
        }
      />
    </div>
  );
};

export default WelcomePage;