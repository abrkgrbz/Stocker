import React from 'react';
import { Layout, Button, Input, Space, Tooltip, Avatar, Dropdown } from 'antd';
import {
  MenuOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '../../NotificationBell';
import { ThemeSwitcher } from '@/core/theme';
import './styles.css';

const { Header } = Layout;

interface MasterHeaderProps {
  collapsed: boolean;
  onCollapse: () => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  fullscreen: boolean;
  onFullscreenToggle: () => void;
  onMobileMenuClick: () => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  collapsed,
  onCollapse,
  darkMode: propDarkMode,
  onDarkModeChange: propOnDarkModeChange,
  fullscreen,
  onFullscreenToggle,
  onMobileMenuClick,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchValue, setSearchValue] = React.useState('');

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profilim',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Hesap Ayarları',
    },
    {
      key: 'divider',
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'logout':
        logout();
        navigate('/login');
        break;
      case 'profile':
        navigate('/master/profile');
        break;
      case 'settings':
        navigate('/master/settings');
        break;
    }
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      console.log('Searching for:', value);
      // TODO: Implement global search functionality
    }
  };

  return (
    <Header className="master-header">
      <div className="master-header-left">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onCollapse}
          className="header-menu-trigger desktop-only"
        />
        
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuClick}
          className="header-menu-trigger mobile-only"
        />
        
        <Input
          prefix={<SearchOutlined />}
          placeholder="Ara..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          className="header-search"
          allowClear
        />
      </div>

      <div className="master-header-right">
        <Space size="middle">
          <LanguageSwitcher mode="dropdown" showName={false} />

          <ThemeSwitcher variant="dropdown" />

          <Tooltip title={fullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}>
            <Button
              type="text"
              icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={onFullscreenToggle}
              className="header-action-btn desktop-only"
            />
          </Tooltip>

          <NotificationBell />

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space className="header-user-menu">
              <Avatar
                size={32}
                src={user?.avatar}
                icon={!user?.avatar && <UserOutlined />}
                className="user-avatar"
              />
              <div className="user-info desktop-only">
                <span className="user-name">{user?.name || user?.userName || 'Admin'}</span>
                <span className="user-role">Sistem Yöneticisi</span>
              </div>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};