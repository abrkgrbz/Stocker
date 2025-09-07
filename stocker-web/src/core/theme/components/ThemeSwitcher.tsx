import React, { useState } from 'react';
import { Button, Dropdown, Switch, Space, Tooltip } from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  DesktopOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useThemeMode } from '../hooks/useThemeMode';
import './ThemeSwitcher.css';

interface ThemeSwitcherProps {
  showLabel?: boolean;
  variant?: 'button' | 'switch' | 'dropdown';
  size?: 'small' | 'middle' | 'large';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showLabel = false,
  variant = 'button',
  size = 'middle',
}) => {
  const { theme, isDark, isSystemTheme, toggleTheme, setTheme, setSystemTheme } = useThemeMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    {
      key: 'light',
      label: 'Açık Tema',
      icon: <SunOutlined />,
      onClick: () => {
        setSystemTheme(false);
        setTheme('light');
      },
    },
    {
      key: 'dark',
      label: 'Koyu Tema',
      icon: <MoonOutlined />,
      onClick: () => {
        setSystemTheme(false);
        setTheme('dark');
      },
    },
    {
      key: 'system',
      label: 'Sistem Teması',
      icon: <DesktopOutlined />,
      onClick: () => setSystemTheme(true),
    },
  ];

  const currentIcon = isSystemTheme ? (
    <DesktopOutlined />
  ) : isDark ? (
    <MoonOutlined />
  ) : (
    <SunOutlined />
  );

  const currentLabel = isSystemTheme
    ? 'Sistem'
    : isDark
    ? 'Koyu'
    : 'Açık';

  // Button variant
  if (variant === 'button') {
    return (
      <Tooltip title={`${currentLabel} Tema`}>
        <Button
          type="text"
          icon={currentIcon}
          onClick={toggleTheme}
          size={size}
          className="theme-switcher-button"
        >
          {showLabel && currentLabel}
        </Button>
      </Tooltip>
    );
  }

  // Switch variant
  if (variant === 'switch') {
    return (
      <Space className="theme-switcher-switch">
        <SunOutlined className={!isDark ? 'active' : ''} />
        <Switch
          checked={isDark}
          onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          size={size === 'small' ? 'small' : 'default'}
        />
        <MoonOutlined className={isDark ? 'active' : ''} />
        {showLabel && <span className="theme-label">{currentLabel}</span>}
      </Space>
    );
  }

  // Dropdown variant
  return (
    <Dropdown
      menu={{
        items: menuItems.map(item => ({
          key: item.key,
          label: (
            <Space>
              {item.icon}
              <span>{item.label}</span>
              {((item.key === 'system' && isSystemTheme) ||
                (item.key === theme && !isSystemTheme)) && (
                <CheckOutlined style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />
              )}
            </Space>
          ),
          onClick: item.onClick,
        })),
        selectedKeys: isSystemTheme ? ['system'] : [theme],
      }}
      trigger={['click']}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
    >
      <Button
        type="text"
        icon={currentIcon}
        size={size}
        className="theme-switcher-dropdown"
      >
        {showLabel && (
          <>
            <span>{currentLabel}</span>
            <span className="theme-switcher-arrow">▼</span>
          </>
        )}
      </Button>
    </Dropdown>
  );
};