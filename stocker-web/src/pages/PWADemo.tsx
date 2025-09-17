import React from 'react';
import { Card, Button, Space, Badge, Typography, Divider, Alert, Switch, Row, Col } from 'antd';
import {
  DownloadOutlined,
  BellOutlined,
  WifiOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

const { Title, Text, Paragraph } = Typography;

export default function PWADemo() {
  const {
    isInstalled,
    isInstallable,
    isOffline,
    isUpdateAvailable,
    installPWA,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    share,
  } = usePWA();

  const handleShare = async () => {
    const shared = await share({
      title: 'Stocker App',
      text: 'Modern envanter yönetim sistemi',
      url: window.location.origin,
    });
    
    if (shared) {}
  };

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Bildirimi', {
        body: 'Bu bir test bildirimidir!',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
        actions: [
          { action: 'view', title: 'Görüntüle' },
          { action: 'dismiss', title: 'Kapat' },
        ],
      });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>PWA Özellikleri Demo</Title>
      <Paragraph>
        Progressive Web App özelliklerini test edin ve kullanın.
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* Kurulum Durumu */}
        <Col xs={24} md={12}>
          <Card title="Uygulama Kurulumu" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={isInstalled ? 'Uygulama Kurulu' : 'Uygulama Kurulu Değil'}
                type={isInstalled ? 'success' : 'info'}
                icon={isInstalled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                showIcon
              />
              
              {isInstallable && !isInstalled && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={installPWA}
                  block
                >
                  Uygulamayı Kur
                </Button>
              )}
              
              {!isInstallable && !isInstalled && (
                <Alert
                  message="Kurulum Bilgisi"
                  description="Uygulama kurulumu için Chrome/Edge tarayıcıda HTTPS üzerinden erişin."
                  type="info"
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* Bağlantı Durumu */}
        <Col xs={24} md={12}>
          <Card title="Bağlantı Durumu" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Badge
                status={isOffline ? 'error' : 'success'}
                text={
                  <Space>
                    <WifiOutlined />
                    {isOffline ? 'Çevrimdışı' : 'Çevrimiçi'}
                  </Space>
                }
              />
              
              {isOffline && (
                <Alert
                  message="Çevrimdışı Mod"
                  description="Önbelleğe alınmış verilerle çalışıyorsunuz."
                  type="warning"
                />
              )}
              
              {isUpdateAvailable && (
                <Alert
                  message="Güncelleme Mevcut"
                  description="Yeni sürüm hazır. Sayfayı yenileyin."
                  type="info"
                  action={
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => window.location.reload()}
                    >
                      Yenile
                    </Button>
                  }
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* Bildirimler */}
        <Col xs={24} md={12}>
          <Card title="Push Bildirimleri" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<BellOutlined />}
                onClick={requestNotificationPermission}
                block
              >
                Bildirim İzni Ver
              </Button>
              
              <Button
                type="primary"
                icon={<BellOutlined />}
                onClick={subscribeToPush}
                block
              >
                Push Bildirimlere Abone Ol
              </Button>
              
              <Button
                danger
                onClick={unsubscribeFromPush}
                block
              >
                Abonelikten Çık
              </Button>
              
              <Divider />
              
              <Button
                onClick={handleTestNotification}
                block
              >
                Test Bildirimi Gönder
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Paylaşım */}
        <Col xs={24} md={12}>
          <Card title="Web Share API" bordered>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                Uygulamayı sosyal medyada veya diğer uygulamalarda paylaşın.
              </Paragraph>
              
              <Button
                type="primary"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                block
              >
                Uygulamayı Paylaş
              </Button>
              
              <Alert
                message="Not"
                description="Share API mobil cihazlarda ve bazı modern tarayıcılarda çalışır."
                type="info"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Kullanım Örneği */}
      <Card title="Kodda Kullanım Örneği" bordered>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto' 
        }}>
          <code>{`import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const {
    isInstalled,
    isInstallable,
    isOffline,
    installPWA,
    subscribeToPush,
    share,
  } = usePWA();

  // Uygulama kurulumu
  if (isInstallable && !isInstalled) {
    <Button onClick={installPWA}>
      Uygulamayı Kur
    </Button>
  }

  // Çevrimdışı durumu
  if (isOffline) {
    <Alert message="Çevrimdışı moddasınız" />
  }

  // Push bildirimleri
  const enableNotifications = async () => {
    await subscribeToPush();
  };

  // Paylaşım
  const shareApp = async () => {
    await share({
      title: 'Başlık',
      text: 'Açıklama',
      url: 'https://example.com'
    });
  };
}`}</code>
        </pre>
      </Card>
    </div>
  );
}