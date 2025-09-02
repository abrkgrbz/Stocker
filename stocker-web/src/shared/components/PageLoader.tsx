import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const PageLoader: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
      }}>
        <Spin 
          indicator={
            <LoadingOutlined 
              style={{ 
                fontSize: 48,
                color: '#667eea',
              }} 
              spin 
            />
          }
        />
        <div style={{ 
          marginTop: 20, 
          color: '#595959',
          fontSize: 16,
          fontWeight: 500,
        }}>
          Sayfa yükleniyor...
        </div>
      </div>
    </div>
  );
};

export default PageLoader;