import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Card, Alert, Button, Spin, Typography, Space } from 'antd';
import { LoadingOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const HangfireDashboard: React.FC = () => {
  const { user, accessToken } = useAuthStore();  // Use accessToken instead of token
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hangfireUrl = `${import.meta.env.VITE_API_URL}/hangfire`;

  useEffect(() => {
    // Check if user has required role - only SistemYoneticisi
    const hasRequiredRole = 
      user?.roles?.includes('SistemYoneticisi') ||  // Check roles array from API
      user?.role === 'super_admin';  // Or check if mapped to super_admin

    if (!hasRequiredRole) {
      setError('Bu sayfaya erişim yetkiniz bulunmamaktadır. Sistem Yöneticisi rolüne sahip olmanız gerekmektedir.');
      setLoading(false);
      return;
    }

    // Set loading to false after check
    setLoading(false);
  }, [user]);

  const openHangfireInNewTab = () => {
    // Open Hangfire dashboard with token in query string
    const urlWithToken = `${hangfireUrl}?access_token=${encodeURIComponent(accessToken || '')}`;
    window.open(urlWithToken, '_blank');
  };

  const openHangfireInIframe = () => {
    // Reload iframe with fresh token
    const iframe = document.getElementById('hangfire-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `${hangfireUrl}?access_token=${encodeURIComponent(accessToken || '')}`;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} 
          tip="Yükleniyor..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Erişim Reddedildi"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Hangfire Dashboard</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
            Arka plan işlemleri ve zamanlanmış görevleri yönetin
          </Text>
        </div>
        <Button 
          type="primary"
          icon={<ExportOutlined />}
          onClick={openHangfireInNewTab}
        >
          Yeni Sekmede Aç
        </Button>
      </div>

      <Card
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Space direction="vertical" size={0}>
              <Text strong>Hangfire Dashboard Yükleniyor...</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Eğer dashboard yüklenmezse, yukarıdaki "Yeni Sekmede Aç" butonunu kullanın
              </Text>
            </Space>
            <Button 
              size="small"
              icon={<ReloadOutlined />}
              onClick={openHangfireInIframe}
            >
              Yenile
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        {/* Try to embed Hangfire dashboard in iframe with token */}
        <iframe
          id="hangfire-iframe"
          src={`${hangfireUrl}?access_token=${encodeURIComponent(accessToken || '')}`}
          style={{
            width: '100%',
            height: '800px',
            border: 'none'
          }}
          title="Hangfire Dashboard"
          onLoad={() => {
            console.log('Hangfire iframe loaded');
          }}
          onError={(e) => {
            console.error('Hangfire iframe error:', e);
          }}
        />
      </Card>
    </div>
  );
};

export default HangfireDashboard;