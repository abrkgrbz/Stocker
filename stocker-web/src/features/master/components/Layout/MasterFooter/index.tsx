import React from 'react';
import { Layout, Space, Typography } from 'antd';
import {
  HeartOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import './styles.css';

const { Footer } = Layout;
const { Text, Link } = Typography;

export const MasterFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer className="master-footer">
      <div className="footer-content">
        <div className="footer-left">
          <Text className="footer-text">
            {currentYear} © Stoocker Pro - Tüm hakları saklıdır.
          </Text>
        </div>
        
        <div className="footer-center">
          <Space size="middle">
            <Link href="/master/docs" className="footer-link">
              Dokümantasyon
            </Link>
            <Link href="/master/support" className="footer-link">
              Destek
            </Link>
            <Link href="/master/changelog" className="footer-link">
              Değişiklikler
            </Link>
          </Space>
        </div>
        
        <div className="footer-right">
          <Space size="small">
            <Text className="footer-text">
              Made with <HeartOutlined className="heart-icon" /> by Stoocker Team
            </Text>
          </Space>
        </div>
      </div>
    </Footer>
  );
};