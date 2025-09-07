import React, { useState, useRef, useEffect } from 'react';
import { Layout, Button, Input, Space, Tooltip, Avatar, Dropdown, Badge, Divider, AutoComplete } from 'antd';
import {
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  SafetyOutlined,
  GlobalOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '../../NotificationBell';
import { ThemeSwitcher } from '@/core/theme';
import './styles.css';

const { Header } = Layout;
const { Search } = Input;

interface MasterHeaderProps {
  collapsed: boolean;
  onCollapse: () => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  fullscreen: boolean;
  onFullscreenToggle: () => void;
  onMobileMenuClick: () => void;
}

interface SearchOption {
  value: string;
  label: React.ReactNode;
  category: string;
  icon: React.ReactNode;
  path?: string;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  collapsed,
  onCollapse,
  darkMode,
  onDarkModeChange,
  fullscreen,
  onFullscreenToggle,
  onMobileMenuClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Global search options
  const globalSearchOptions: SearchOption[] = [
    {
      value: 'dashboard',
      label: 'Dashboard',
      category: 'Sayfalar',
      icon: <DashboardOutlined />,
      path: '/master/dashboard',
    },
    {
      value: 'users',
      label: 'Kullanıcılar',
      category: 'Sayfalar',
      icon: <TeamOutlined />,
      path: '/master/users',
    },
    {
      value: 'reports',
      label: 'Raporlar',
      category: 'Sayfalar',
      icon: <FileTextOutlined />,
      path: '/master/reports',
    },
    {
      value: 'settings',
      label: 'Ayarlar',
      category: 'Sistem',
      icon: <SettingOutlined />,
      path: '/master/settings',
    },
    {
      value: 'profile',
      label: 'Profil',
      category: 'Kullanıcı',
      icon: <UserOutlined />,
      path: '/master/profile',
    },
  ];

  // Filter search options based on input
  useEffect(() => {
    if (searchValue) {
      const filtered = globalSearchOptions.filter(option =>
        option.label.toString().toLowerCase().includes(searchValue.toLowerCase())
      );
      setSearchOptions(filtered);
    } else {
      setSearchOptions([]);
    }
  }, [searchValue]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div className="user-menu-header">
          <Avatar size={48} src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
          <div className="user-menu-info">
            <div className="user-menu-name">{user?.name || user?.userName || 'Admin'}</div>
            <div className="user-menu-email">{user?.email || 'admin@stocker.com'}</div>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
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
      key: 'security',
      icon: <SafetyOutlined />,
      label: 'Güvenlik',
    },
    {
      key: 'activity',
      icon: <ClockCircleOutlined />,
      label: 'Aktiviteler',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Yardım & Destek',
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'Hakkında',
    },
    {
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
      case 'security':
        navigate('/master/security');
        break;
      case 'activity':
        navigate('/master/activity');
        break;
      case 'help':
        navigate('/master/help');
        break;
      case 'about':
        navigate('/master/about');
        break;
    }
  };

  const handleSearch = (value: string) => {
    const option = globalSearchOptions.find(opt => opt.value === value);
    if (option?.path) {
      navigate(option.path);
      setSearchValue('');
      setShowSearch(false);
    }
  };

  const renderSearchOption = (option: SearchOption) => (
    <div className="search-option-item">
      <span className="search-option-icon">{option.icon}</span>
      <div className="search-option-content">
        <div className="search-option-label">{option.label}</div>
        <div className="search-option-category">{option.category}</div>
      </div>
    </div>
  );

  // Breadcrumb for current location
  const getBreadcrumb = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length > 1) {
      return paths[paths.length - 1].charAt(0).toUpperCase() + paths[paths.length - 1].slice(1);
    }
    return 'Dashboard';
  };

  return (
    <Header className="master-header">
      <div className="master-header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="header-menu-trigger desktop-only"
        />
        
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuClick}
          className="header-menu-trigger mobile-only"
        />

        <Divider type="vertical" className="header-divider desktop-only" />
        
        <div className="header-breadcrumb desktop-only">
          <span className="breadcrumb-text">{getBreadcrumb()}</span>
        </div>
        
        <div className="header-search-wrapper" ref={searchRef}>
          {showSearch ? (
            <AutoComplete
              className="header-search-autocomplete"
              value={searchValue}
              onChange={setSearchValue}
              onSelect={handleSearch}
              options={searchOptions.map(option => ({
                value: option.value,
                label: renderSearchOption(option),
              }))}
              placeholder="Hızlı arama... (Ctrl+K)"
              autoFocus
              allowClear
              onBlur={() => {
                setTimeout(() => {
                  if (!searchValue) setShowSearch(false);
                }, 200);
              }}
            >
              <Search className="header-search" />
            </AutoComplete>
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setShowSearch(true)}
              className="header-search-trigger"
            >
              <span className="desktop-only">Hızlı Ara</span>
              <kbd className="search-shortcut desktop-only">Ctrl+K</kbd>
            </Button>
          )}
        </div>
      </div>

      <div className="master-header-right">
        <Space size="small" className="header-actions">
          <Tooltip title="Yardım Merkezi">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="header-action-btn desktop-only"
              onClick={() => navigate('/master/help')}
            />
          </Tooltip>

          <LanguageSwitcher mode="dropdown" showName={false} />

          <ThemeSwitcher variant="button" />

          <Tooltip title={fullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}>
            <Button
              type="text"
              icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={onFullscreenToggle}
              className="header-action-btn desktop-only"
            />
          </Tooltip>

          <NotificationBell />

          <Divider type="vertical" className="header-divider" />

          <Dropdown
            menu={{ 
              items: userMenuItems, 
              onClick: handleUserMenuClick,
              className: 'user-dropdown-menu'
            }}
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="user-dropdown-overlay"
          >
            <Button type="text" className="header-user-button">
              <Space size={8}>
                <Badge dot status="success" offset={[-6, 6]}>
                  <Avatar
                    size={32}
                    src={user?.avatar}
                    icon={!user?.avatar && <UserOutlined />}
                    className="user-avatar"
                  />
                </Badge>
                <div className="user-info desktop-only">
                  <span className="user-name">{user?.name || user?.userName || 'Admin'}</span>
                  <span className="user-role">Yönetici</span>
                </div>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};