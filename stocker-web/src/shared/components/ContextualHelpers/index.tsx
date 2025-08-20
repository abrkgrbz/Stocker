import React, { useState, useEffect } from 'react';
import { Button, Tooltip, FloatButton, message, Modal } from 'antd';
import {
  QuestionCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  LockOutlined,
  UserAddOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useVisitorTracking } from '@/shared/hooks/useVisitorTracking';
import './style.css';

interface ContextualHelpersProps {
  showChatSupport?: boolean;
  showForgotPassword?: boolean;
  showCreateAccount?: boolean;
  showDemoAccess?: boolean;
  context?: 'login' | 'landing' | 'register' | 'general';
}

export const ContextualHelpers: React.FC<ContextualHelpersProps> = ({
  showChatSupport = true,
  showForgotPassword = false,
  showCreateAccount = false,
  showDemoAccess = false,
  context = 'general',
}) => {
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  const location = useLocation();
  const { trackInterest } = useVisitorTracking();

  const handleChatSupport = () => {
    setChatModalVisible(true);
    trackInterest(`chat-support-${context}`);
  };

  const handlePhoneSupport = () => {
    window.open('tel:08501234567', '_self');
    trackInterest(`phone-support-${context}`);
  };

  const handleWhatsAppSupport = () => {
    window.open('https://wa.me/905555555555?text=Merhaba, Stocker hakkında bilgi almak istiyorum.', '_blank');
    trackInterest(`whatsapp-support-${context}`);
  };

  const handleDemoAccess = () => {
    setDemoModalVisible(true);
    trackInterest(`demo-access-${context}`);
  };

  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
    trackInterest(`forgot-password-${context}`);
  };

  const handleCreateAccount = () => {
    window.location.href = '/register';
    trackInterest(`create-account-${context}`);
  };

  // Auto-show chat support based on user behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      if (context === 'landing' && !localStorage.getItem('chat-prompt-shown')) {
        message.info({
          content: '💬 Sorularınız mı var? Canlı destek hattımızdan yardım alabilirsiniz!',
          duration: 5,
          icon: <MessageOutlined />,
          onClick: handleChatSupport,
          style: { cursor: 'pointer' },
        });
        localStorage.setItem('chat-prompt-shown', 'true');
      }
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, [context]);

  const renderFloatingHelpers = () => (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<QuestionCircleOutlined />}
      tooltip="Yardım"
      className="contextual-float-group"
    >
      {showChatSupport && (
        <FloatButton
          icon={<MessageOutlined />}
          tooltip="Canlı Destek"
          onClick={handleChatSupport}
          className="chat-float-btn"
        />
      )}
      
      <FloatButton
        icon={<PhoneOutlined />}
        tooltip="Telefon Desteği"
        onClick={handlePhoneSupport}
        className="phone-float-btn"
      />
      
      <FloatButton
        icon={<MessageOutlined />}
        tooltip="WhatsApp"
        onClick={handleWhatsAppSupport}
        className="whatsapp-float-btn"
      />
      
      {showDemoAccess && (
        <FloatButton
          icon={<PlayCircleOutlined />}
          tooltip="Demo İzle"
          onClick={handleDemoAccess}
          className="demo-float-btn"
        />
      )}
    </FloatButton.Group>
  );

  const renderInlineHelpers = () => (
    <div className={`contextual-helpers contextual-helpers--${context}`}>
      {showForgotPassword && (
        <Tooltip title="Şifrenizi mi unuttunuz? Hemen sıfırlayın!">
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={handleForgotPassword}
            className="helper-link forgot-password-link"
          >
            Şifremi Unuttum
          </Button>
        </Tooltip>
      )}
      
      {showCreateAccount && (
        <Tooltip title="Hesabınız yok mu? Hemen ücretsiz kayıt olun!">
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={handleCreateAccount}
            className="helper-link create-account-link"
          >
            Hesabım Yok mu?
          </Button>
        </Tooltip>
      )}
      
      {showDemoAccess && (
        <Tooltip title="Önce demo izleyerek platformu keşfedin">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={handleDemoAccess}
            className="helper-link demo-access-link"
          >
            Önce İzle
          </Button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <>
      {/* Inline Helpers */}
      {(showForgotPassword || showCreateAccount || showDemoAccess) && renderInlineHelpers()}
      
      {/* Floating Helpers */}
      {renderFloatingHelpers()}

      {/* Chat Support Modal */}
      <Modal
        title="Canlı Destek"
        open={chatModalVisible}
        onCancel={() => setChatModalVisible(false)}
        footer={null}
        width={400}
        className="chat-support-modal"
      >
        <div className="chat-support-content">
          <div className="support-options">
            <div className="support-option" onClick={handleWhatsAppSupport}>
              <div className="support-icon">📱</div>
              <div className="support-details">
                <h4>WhatsApp Destek</h4>
                <p>En hızlı destek için</p>
              </div>
              <div className="support-badge">Önerilen</div>
            </div>
            
            <div className="support-option" onClick={handlePhoneSupport}>
              <div className="support-icon">📞</div>
              <div className="support-details">
                <h4>Telefon Desteği</h4>
                <p>0850 123 45 67</p>
              </div>
              <div className="support-time">09:00 - 18:00</div>
            </div>
            
            <div className="support-option" onClick={() => window.open('mailto:destek@stocker.com.tr', '_blank')}>
              <div className="support-icon">✉️</div>
              <div className="support-details">
                <h4>E-posta Desteği</h4>
                <p>destek@stocker.com.tr</p>
              </div>
              <div className="support-time">24 saat</div>
            </div>
          </div>
          
          <div className="support-note">
            <QuestionCircleOutlined style={{ color: '#667eea', marginRight: 8 }} />
            <span>Teknik ekibimiz size 2 dakika içinde yanıt verecektir.</span>
          </div>
        </div>
      </Modal>

      {/* Demo Access Modal */}
      <Modal
        title="Platform Demosu"
        open={demoModalVisible}
        onCancel={() => setDemoModalVisible(false)}
        footer={null}
        width={500}
        className="demo-access-modal"
      >
        <div className="demo-access-content">
          <div className="demo-video-placeholder">
            <PlayCircleOutlined style={{ fontSize: 64, color: '#667eea' }} />
            <h3>Platform Demo Videosu</h3>
            <p>Stocker'ın tüm özelliklerini 5 dakikada keşfedin</p>
          </div>
          
          <div className="demo-actions">
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                // Simulate video play
                message.success('Demo video oynatılıyor...');
                trackInterest('demo-video-play');
              }}
              className="demo-play-btn"
            >
              Demo'yu İzle
            </Button>
            
            <Button
              size="large"
              ghost
              onClick={() => {
                window.location.href = '/register';
                trackInterest('demo-to-register');
              }}
            >
              Hemen Dene
            </Button>
          </div>
          
          <div className="demo-benefits">
            <h4>Demo'da neler göreceksiniz:</h4>
            <ul>
              <li>✅ Müşteri yönetimi nasıl çalışır</li>
              <li>✅ Stok takibi ve raporlama</li>
              <li>✅ Faturalama işlemleri</li>
              <li>✅ Modüller arası entegrasyon</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};