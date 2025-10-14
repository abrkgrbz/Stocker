import React from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { TwoFactorLogin } from '../components/TwoFactor/TwoFactorLogin';

const TwoFactorVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { verify2FA, clearTempToken, user } = useAuthStore();

  const handleVerify = async (code: string): Promise<boolean> => {
    try {
      const success = await verify2FA(code);
      if (success) {
        message.success('Doğrulama başarılı!');
        setTimeout(() => navigate('/dashboard'), 500);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleCancel = () => {
    clearTempToken();
    navigate('/login');
  };

  const handleUseBackupCode = () => {
    message.info('Yedek kod özelliği yakında eklenecek');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <TwoFactorLogin
        visible={true}
        onVerify={handleVerify}
        onCancel={handleCancel}
        onUseBackupCode={handleUseBackupCode}
        userEmail={user?.email}
      />
    </div>
  );
};

export default TwoFactorVerifyPage;
