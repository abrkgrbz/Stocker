import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  List,
  Avatar,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
  Steps
} from 'antd';
import {
  LoginOutlined,
  ShopOutlined,
  SearchOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  CrownOutlined,
  StarFilled,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  BankOutlined,
  HomeOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { redirectToTenantDomain } from '@/utils/tenant';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface TenantLoginModalProps {
  visible: boolean;
  onClose: () => void;
}

// Features for login information
const loginFeatures = [
  { 
    icon: <SafetyOutlined style={{ fontSize: 24, color: '#667eea' }} />,
    title: 'Güvenli Bağlantı', 
    description: '256-bit SSL şifreleme ile korunan veriler',
    color: '#667eea'
  },
  { 
    icon: <GlobalOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    title: 'Bulut Teknolojisi', 
    description: 'Her yerden güvenli erişim imkanı',
    color: '#52c41a'
  },
  { 
    icon: <RocketOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
    title: 'Hızlı Performans', 
    description: 'Optimize edilmiş altyapı ve hızlı yükleme',
    color: '#fa8c16'
  },
];

export const TenantLoginModal: React.FC<TenantLoginModalProps> = ({
  visible,
  onClose
}) => {
  const [tenantSlug, setTenantSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTenantLogin = async () => {
    if (!tenantSlug.trim()) {
      setError('Lütfen firma kısa adını girin');
      return;
    }

    // Validate tenant slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(tenantSlug)) {
      setError('Firma kısa adı sadece küçük harf, rakam ve tire içerebilir');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate tenant exists via API
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/public/tenants/check/${tenantSlug}`;
      
                  const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      // First, get the response as text to see what we're receiving
      const responseText = await response.text();
      
      if (!response.ok) {
        // Error handling removed for production
        throw new Error('Tenant not found');
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // Error handling removed for production
        // Error handling removed for production
        throw new Error('Invalid response format from server');
      }
      
      if (data.exists && data.isActive) {
        // Tenant exists and is active, redirect to subdomain
        setTimeout(() => {
          redirectToTenantDomain(tenantSlug);
        }, 500);
      } else if (data.exists && !data.isActive) {
        // Tenant exists but is not active
        setError(`"${tenantSlug}" firması şu anda aktif değil. Lütfen yöneticinizle iletişime geçin.`);
        setLoading(false);
      } else {
        // Tenant does not exist
        setError(`"${tenantSlug}" adında bir firma bulunamadı. Lütfen firma adını kontrol edin veya yöneticinizle iletişime geçin.`);
        setLoading(false);
      }
    } catch (err: any) {
      // Error handling removed for production
      // Check if it's a parsing error (HTML instead of JSON)
      if (err.message && err.message.includes('Unexpected token')) {
        setError('API bağlantı hatası. Sistem yöneticisi ile iletişime geçin. (HTML response received instead of JSON)');
      } else if (err.message === 'Tenant not found') {
        setError(`"${tenantSlug}" adında bir firma bulunamadı. Lütfen firma adını kontrol edin.`);
      } else {
        setError('Firma doğrulanamadı. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.');
      }
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="tenant-login-modal"
      closeIcon={<span style={{ fontSize: 20, color: '#8b95a7' }}>×</span>}
    >
      <div className="modal-content">
        {/* Header Section */}
        <div className="modal-header">
          <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <div className="header-icon">
              <BankOutlined />
            </div>
            <Title level={3} style={{ margin: 0 }}>
              Firma Girişi
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              İşletmenizin özel alanına güvenli giriş yapın
            </Text>
          </Space>
        </div>

        {/* Main Content */}
        <div style={{ padding: '0 24px 24px' }}>
          {/* Search Section */}
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14 }}>
                Firma Adresiniz
              </Text>
              <Tooltip title="Firmanıza özel giriş adresi. Örn: demo.stocker.app">
                <QuestionCircleOutlined 
                  style={{ 
                    color: '#8b95a7', 
                    cursor: 'help', 
                    fontSize: 14,
                    marginLeft: 8
                  }} 
                />
              </Tooltip>
            </div>

            <div className="input-container" style={{ 
              display: 'flex', 
              alignItems: 'center'
            }}>
              <Input
                size="large"
                placeholder="demo"
                value={tenantSlug}
                onChange={(e) => {
                  setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setError(null);
                }}
                onPressEnter={() => handleTenantLogin()}
                style={{ 
                  border: 'none',
                  background: 'white',
                  borderRadius: '6px 0 0 6px',
                  fontSize: 16,
                  fontWeight: 500
                }}
                prefix={
                  <ShopOutlined style={{ color: '#667eea', fontSize: 18 }} />
                }
              />
              <div className="domain-suffix">
                .stocker.app
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                loading={loading}
                onClick={handleTenantLogin}
                style={{
                  borderRadius: '0 6px 6px 0',
                  minWidth: 120,
                  height: 42
                }}
              >
                Devam
              </Button>
            </div>
            
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginTop: 12 }}
              />
            )}
          </div>

          {/* Features Section */}
          <div style={{ marginTop: 24 }}>
            <Divider style={{ margin: '16px 0' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Sistem Özellikleri</Text>
            </Divider>

            <Row gutter={12}>
              {loginFeatures.map((feature, index) => (
                <Col key={index} xs={24} sm={8}>
                  <Card
                    className="feature-card"
                    bordered={false}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space direction="vertical" size={12} style={{ width: '100%', textAlign: 'center' }}>
                      <div style={{ 
                        width: 60, 
                        height: 60, 
                        margin: '0 auto',
                        background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}05)`,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {feature.icon}
                      </div>
                      
                      <div>
                        <Text strong style={{ fontSize: 14 }}>
                          {feature.title}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {feature.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space split={<Divider type="vertical" />}>
              <span className="footer-icon success">
                <SafetyOutlined />
                <Text type="secondary">SSL Güvenli</Text>
              </span>
              <span className="footer-icon info">
                <ClockCircleOutlined />
                <Text type="secondary">7/24 Erişim</Text>
              </span>
            </Space>
            
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Firma kısa adınızı bilmiyorsanız{' '}
                <a href="mailto:destek@stocker.app">destek ekibiyle</a> iletişime geçin
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};