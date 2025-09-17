import React from 'react';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export const PageLoader: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      flexDirection: 'column'
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
        size="large"
      />
      <div style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Yükleniyor...</div>
    </div>
  );
};