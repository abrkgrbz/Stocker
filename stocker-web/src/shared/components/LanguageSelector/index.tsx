import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import { GlobalOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { languages, SupportedLanguage, changeLanguage, getCurrentLanguage } from '@/i18n/config';
import type { MenuProps } from 'antd';

interface LanguageSelectorProps {
  type?: 'button' | 'text' | 'icon';
  size?: 'small' | 'middle' | 'large';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  type = 'button',
  size = 'middle' 
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };

  const items: MenuProps['items'] = Object.entries(languages).map(([code, config]) => ({
    key: code,
    label: (
      <Space>
        <span>{config.flag}</span>
        <span>{config.name}</span>
        {currentLanguage === code && <CheckOutlined style={{ color: '#52c41a' }} />}
      </Space>
    ),
    onClick: () => handleLanguageChange(code as SupportedLanguage),
  }));

  const currentConfig = languages[currentLanguage];

  if (type === 'icon') {
    return (
      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <Button 
          type="text" 
          icon={<GlobalOutlined />} 
          size={size}
        />
      </Dropdown>
    );
  }

  if (type === 'text') {
    return (
      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <Button type="text" size={size}>
          <Space>
            <span>{currentConfig.flag}</span>
            <span>{currentConfig.name}</span>
          </Space>
        </Button>
      </Dropdown>
    );
  }

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button size={size}>
        <Space>
          <GlobalOutlined />
          <span>{currentConfig.flag}</span>
          <span>{currentConfig.name}</span>
        </Space>
      </Button>
    </Dropdown>
  );
};