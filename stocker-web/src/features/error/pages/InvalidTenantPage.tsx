import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HomeOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';

import { getMainDomainUrl } from '@/utils/tenant';

interface InvalidTenantPageProps {
  tenantSlug?: string;
}

export const InvalidTenantPage: React.FC<InvalidTenantPageProps> = ({ tenantSlug }) => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    window.location.href = getMainDomainUrl();
  };

  const handleRegister = () => {
    window.location.href = `${getMainDomainUrl()}/register`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Result
        status="404"
        title="Firma Bulunamadı"
        subTitle={
          <>
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                background: '#fef2e5',
                color: '#d97706',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontWeight: 600
              }}>
                {tenantSlug || window.location.hostname.split('.')[0]}.stoocker.app
              </span>
              {' '}adresi için kayıtlı bir firma bulunamadı.
            </div>
            <div style={{ color: '#718096', fontSize: '14px' }}>
              Eğer bu sizin firmanızsa, lütfen sistem yöneticinizle iletişime geçin veya doğru adresi kullandığınızdan emin olun.
            </div>
          </>
        }
        extra={[
          <Button 
            type="primary" 
            key="home"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            size="large"
            style={{
              background: '#667eea',
              borderColor: '#667eea'
            }}
          >
            Ana Sayfa
          </Button>,
          <Button 
            key="register"
            icon={<UserAddOutlined />}
            onClick={handleRegister}
            size="large"
          >
            Yeni Firma Kayıt
          </Button>,
        ]}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
};

export default InvalidTenantPage;