import React from 'react';
import { Select, Button, Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useI18n } from '@/hooks/useI18n';
import type { MenuProps } from 'antd';

interface LanguageSwitcherProps {
  mode?: 'select' | 'button' | 'dropdown';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  mode = 'select',
  showFlag = true,
  showName = true,
  className,
}) => {
  const { currentLanguage, languages, changeLanguage } = useI18n();

  const renderLanguageOption = (lang: typeof languages[keyof typeof languages]) => (
    <Space>
      {showFlag && <span>{lang.flag}</span>}
      {showName && <span>{lang.name}</span>}
    </Space>
  );

  if (mode === 'select') {
    return (
      <Select
        className={className}
        value={currentLanguage}
        onChange={changeLanguage}
        style={{ width: showName ? 140 : 80 }}
        suffixIcon={<GlobalOutlined />}
      >
        {Object.values(languages).map((lang) => (
          <Select.Option key={lang.code} value={lang.code}>
            {renderLanguageOption(lang)}
          </Select.Option>
        ))}
      </Select>
    );
  }

  if (mode === 'button') {
    const nextLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
    const nextLangConfig = languages[nextLanguage];

    return (
      <Button
        className={className}
        icon={<GlobalOutlined />}
        onClick={() => changeLanguage(nextLanguage)}
      >
        {renderLanguageOption(nextLangConfig)}
      </Button>
    );
  }

  if (mode === 'dropdown') {
    const items: MenuProps['items'] = Object.values(languages).map((lang) => ({
      key: lang.code,
      label: renderLanguageOption(lang),
      onClick: () => changeLanguage(lang.code as 'tr' | 'en'),
    }));

    return (
      <Dropdown menu={{ items, selectedKeys: [currentLanguage] }} placement="bottomRight">
        <Button className={className} icon={<GlobalOutlined />}>
          {renderLanguageOption(languages[currentLanguage])}
        </Button>
      </Dropdown>
    );
  }

  return null;
};

export default LanguageSwitcher;