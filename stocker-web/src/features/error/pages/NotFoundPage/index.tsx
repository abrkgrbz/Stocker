import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './style.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <Result
          status="404"
          title="404"
          subTitle="Üzgünüz, aradığınız sayfa bulunamadı."
          extra={
            <Space>
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size="large"
              >
                Ana Sayfa
              </Button>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                size="large"
              >
                Geri Dön
              </Button>
            </Space>
          }
        />
        <div className="not-found-animation">
          <div className="floating-icon">🔍</div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;