import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import '../styles/index.css';

// Advanced Icons
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const TenantsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L10 3L17 7V17H3V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 17V11H12V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 18V16C3 14.3431 4.34315 13 6 13H14C15.6569 13 17 14.3431 17 16V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PackagesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3L17 7V13L10 17L3 13V7L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 17V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 7L10 10L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 3V5M10 15V17M17 10H15M5 10H3M14.5 5.5L13 7M7 13L5.5 14.5M14.5 14.5L13 13M7 7L5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17H17M5 17V12M9 17V7M13 17V10M17 17V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const InvoicesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3H15C16 3 17 4 17 5V17L14 15L10 17L6 15L3 17V5C3 4 4 3 5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 7H13M7 10H13M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 13L10 10L17 3M17 3H13M17 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MonitoringIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 17H13M10 14V17M6 8L8 10L11 7L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3C8.34315 3 7 4.34315 7 6V8.5L5 12V14H15V12L13 8.5V6C13 4.34315 11.6569 3 10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14V15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ThemeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 3V10L14 14" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.2"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7V4C3 3.44772 3.44772 3 4 3H7M13 3H16C16.5523 3 17 3.44772 17 4V7M17 13V16C17 16.5523 16.5523 17 16 17H13M7 17H4C3.44772 17 3 16.5523 3 16V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H7M13 14L17 10M17 10L13 6M17 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3L7 6L4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.FC;
  children?: MenuItem[];
  badge?: string;
}

const MasterLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Yeni Tenant',
      message: 'ABC Corp. başarıyla oluşturuldu',
      time: '5 dakika önce',
      type: 'success',
      read: false,
    },
    {
      id: '2',
      title: 'Ödeme Alındı',
      message: '₺5,000 ödeme işlendi',
      time: '1 saat önce',
      type: 'info',
      read: false,
    },
    {
      id: '3',
      title: 'Sistem Uyarısı',
      message: 'Disk kullanımı %80\'i aştı',
      time: '2 saat önce',
      type: 'warning',
      read: true,
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: DashboardIcon,
      badge: 'Yeni' 
    },
    { 
      path: '/analytics', 
      label: 'Analitik', 
      icon: AnalyticsIcon 
    },
    { 
      path: '/tenants', 
      label: 'Tenants', 
      icon: TenantsIcon,
      badge: '487',
      children: [
        { path: '/tenants/list', label: 'Tenant Listesi', icon: TenantsIcon },
        { path: '/tenants/create', label: 'Yeni Tenant', icon: TenantsIcon },
        { path: '/tenants/domains', label: 'Domainler', icon: TenantsIcon },
      ]
    },
    { 
      path: '/users', 
      label: 'Kullanıcılar', 
      icon: UsersIcon,
      children: [
        { path: '/users/list', label: 'Kullanıcı Listesi', icon: UsersIcon },
        { path: '/users/roles', label: 'Roller', icon: UsersIcon },
        { path: '/users/permissions', label: 'İzinler', icon: UsersIcon },
      ]
    },
    { 
      path: '/packages', 
      label: 'Paketler', 
      icon: PackagesIcon 
    },
    { 
      path: '/invoices', 
      label: 'Faturalar', 
      icon: InvoicesIcon,
      badge: '12'
    },
    { 
      path: '/reports', 
      label: 'Raporlar', 
      icon: ReportsIcon 
    },
    { 
      path: '/monitoring', 
      label: 'İzleme', 
      icon: MonitoringIcon 
    },
    { 
      path: '/settings', 
      label: 'Ayarlar', 
      icon: SettingsIcon 
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return location.pathname === item.path;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    const colors = {
      info: '#009ef7',
      success: '#50cd89',
      warning: '#ffc700',
      error: '#f1416c',
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + segments.slice(0, index + 1).join('/'),
      isActive: index === segments.length - 1,
    }));
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'MA';
  };

  const searchResults = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      {/* Enhanced Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#009ef7"/>
            <path d="M10 22V14L16 10L22 14V22H10Z" fill="white"/>
            <path d="M14 22V18H18V22" stroke="#009ef7" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="sidebar-logo-text">
            <span style={{ fontWeight: 700, fontSize: '1.5rem' }}>Stocker</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Master Admin</span>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-section">
            {!sidebarCollapsed && <div className="menu-section-title">Ana Menü</div>}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isMenuActive(item);
              const isExpanded = expandedMenus.includes(item.path);
              
              return (
                <div key={item.path} className="menu-item">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.path)}
                        className={`menu-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="menu-icon">
                          <Icon />
                        </span>
                        <span className="menu-text">{item.label}</span>
                        {item.badge && !sidebarCollapsed && (
                          <span className="menu-badge">{item.badge}</span>
                        )}
                        {!sidebarCollapsed && (
                          <span className={`menu-arrow ${isExpanded ? 'expanded' : ''}`}>
                            <ChevronIcon />
                          </span>
                        )}
                      </button>
                      {!sidebarCollapsed && (
                        <div className={`menu-submenu ${isExpanded ? 'show' : ''}`}>
                          {item.children.map(child => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`menu-link submenu-link ${location.pathname === child.path ? 'active' : ''}`}
                              onClick={closeMobileSidebar}
                            >
                              <span className="menu-text">{child.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`menu-link ${isActive ? 'active' : ''}`}
                      onClick={closeMobileSidebar}
                    >
                      <span className="menu-icon">
                        <Icon />
                      </span>
                      <span className="menu-text">{item.label}</span>
                      {item.badge && !sidebarCollapsed && (
                        <span className="menu-badge">{item.badge}</span>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Info in Sidebar */}
          {!sidebarCollapsed && (
            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="avatar avatar-sm">
                  {getUserInitials()}
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user?.name || 'Master Admin'}</div>
                  <div className="sidebar-user-role">Süper Admin</div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Enhanced Header */}
        <header className="header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <MenuIcon />
            </button>
            
            <div className={`header-search ${searchFocused ? 'focused' : ''}`}>
              <span className="header-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="header-search-input"
                placeholder="Ara... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && searchFocused && (
                <div className="search-results">
                  {searchResults.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="search-result-item"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="search-no-results">Sonuç bulunamadı</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            {/* Theme Toggle */}
            <button 
              className="btn btn-icon btn-light"
              onClick={toggleTheme}
              title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
            >
              <ThemeIcon />
            </button>

            {/* Fullscreen Toggle */}
            <button 
              className="btn btn-icon btn-light hide-mobile"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              <FullscreenIcon />
            </button>

            {/* Notifications */}
            <div className="header-notifications" ref={notificationRef}>
              <button 
                className="btn btn-icon btn-light"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h6>Bildirimler ({unreadCount})</h6>
                    <button 
                      className="btn btn-sm btn-light"
                      onClick={markAllNotificationsAsRead}
                    >
                      Tümünü okundu işaretle
                    </button>
                  </div>
                  <div className="notifications-body">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div 
                          className="notification-icon"
                          style={{ backgroundColor: `${getNotificationIcon(notification.type)}20` }}
                        >
                          <div 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%',
                              backgroundColor: getNotificationIcon(notification.type)
                            }} 
                          />
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notifications-footer">
                    <Link to="/notifications" className="btn btn-sm btn-primary w-100">
                      Tüm Bildirimleri Gör
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="header-profile" ref={profileRef}>
              <button 
                className="profile-toggle"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar avatar-sm">
                  {getUserInitials()}
                </div>
                <div className="profile-info hide-mobile">
                  <div className="profile-name">{user?.name || 'Master Admin'}</div>
                  <div className="profile-role">Süper Admin</div>
                </div>
                <ChevronIcon />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="avatar">
                      {getUserInitials()}
                    </div>
                    <div>
                      <div className="fw-semibold">{user?.name || 'Master Admin'}</div>
                      <div className="text-muted text-sm">{user?.email || 'admin@stocker.app'}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item">
                    <UsersIcon />
                    <span className="ms-2">Profilim</span>
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <SettingsIcon />
                    <span className="ms-2">Ayarlar</span>
                  </Link>
                  <Link to="/activity" className="dropdown-item">
                    <MonitoringIcon />
                    <span className="ms-2">Aktiviteler</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <LogoutIcon />
                    <span className="ms-2">Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced Toolbar with Breadcrumbs and Actions */}
        <div className="toolbar">
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-item">Ana Sayfa</Link>
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                <span className="breadcrumb-separator">/</span>
                {crumb.isActive ? (
                  <span className="breadcrumb-item active">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="breadcrumb-item">{crumb.label}</Link>
                )}
              </React.Fragment>
            ))}
          </nav>
          
          <div className="toolbar-actions">
            <button className="btn btn-sm btn-light">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="ms-2 hide-mobile">Hızlı Ekle</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Enhanced Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div>
              &copy; 2024 <strong>Stocker Master Admin</strong>. Tüm hakları saklıdır. v2.0.0
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Dokümantasyon</a>
              <a href="#" className="footer-link">API</a>
              <a href="#" className="footer-link">Durum</a>
              <a href="#" className="footer-link">Destek</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .menu-badge {
          margin-left: auto;
          padding: 2px 6px;
          font-size: 11px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
        }

        .menu-submenu {
          background: rgba(0, 0, 0, 0.1);
          margin-top: 4px;
        }

        .submenu-link {
          padding-left: 3.5rem !important;
          font-size: 13px;
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .sidebar-user:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-user-info {
          flex: 1;
        }

        .sidebar-user-name {
          color: white;
          font-size: 13px;
          font-weight: 500;
        }

        .sidebar-user-role {
          color: var(--gray-400);
          font-size: 11px;
        }

        .header-search.focused {
          width: 400px;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          margin-top: 8px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          color: var(--gray-700);
          text-decoration: none;
          transition: background 0.2s;
        }

        .search-result-item:hover {
          background: var(--gray-100);
        }

        .search-no-results {
          padding: 20px;
          text-align: center;
          color: var(--gray-500);
        }

        .header-notifications {
          position: relative;
        }

        .notifications-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 380px;
          background: white;
          border-radius: 12px;
          box-shadow: var(--shadow-xl);
          margin-top: 8px;
          z-index: 1000;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--gray-200);
        }

        .notifications-header h6 {
          margin: 0;
          font-size: 14px;
        }

        .notifications-body {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: var(--gray-50);
        }

        .notification-item.unread {
          background: var(--primary-light);
        }

        .notification-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 2px;
        }

        .notification-message {
          font-size: 12px;
          color: var(--gray-600);
          margin-bottom: 4px;
        }

        .notification-time {
          font-size: 11px;
          color: var(--gray-500);
        }

        .notifications-footer {
          padding: 12px;
          border-top: 1px solid var(--gray-200);
        }

        .header-profile {
          position: relative;
        }

        .profile-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--gray-100);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .profile-toggle:hover {
          background: var(--gray-200);
        }

        .profile-info {
          text-align: left;
        }

        .profile-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--gray-900);
        }

        .profile-role {
          font-size: 11px;
          color: var(--gray-500);
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: var(--shadow-xl);
          margin-top: 8px;
          z-index: 1000;
        }

        .profile-dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .toolbar-actions {
          display: flex;
          gap: 8px;
        }

        .w-100 {
          width: 100%;
        }

        .text-danger {
          color: var(--danger) !important;
        }
      `}</style>
    </div>
  );
};

export default MasterLayout;