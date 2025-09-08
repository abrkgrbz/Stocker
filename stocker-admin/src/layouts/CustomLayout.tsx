import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import '../styles/index.css';

// Icons as SVG components
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

const CustomLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/tenants', label: 'Tenants', icon: TenantsIcon },
    { path: '/users', label: 'Kullanıcılar', icon: UsersIcon },
    { path: '/packages', label: 'Paketler', icon: PackagesIcon },
    { path: '/settings', label: 'Ayarlar', icon: SettingsIcon },
  ];

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return 'A';
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#009ef7"/>
            <path d="M10 22V14L16 10L22 14V22H10Z" fill="white"/>
            <path d="M14 22V18H18V22" stroke="#009ef7" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="sidebar-logo-text">Stocker</span>
        </div>
        
        <nav className="sidebar-menu">
          <div className="menu-section">
            {!sidebarCollapsed && <div className="menu-section-title">Ana Menü</div>}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div key={item.path} className="menu-item">
                  <Link
                    to={item.path}
                    className={`menu-link ${isActive ? 'active' : ''}`}
                    onClick={closeMobileSidebar}
                  >
                    <span className="menu-icon">
                      <Icon />
                    </span>
                    <span className="menu-text">{item.label}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <MenuIcon />
            </button>
            
            <div className="header-search hide-mobile">
              <span className="header-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="header-search-input"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right">
            <button className="btn btn-icon btn-light">
              <div className="header-notifications">
                <BellIcon />
                <span className="notification-badge">3</span>
              </div>
            </button>

            <div className="dropdown">
              <button className="btn btn-light d-flex align-items-center gap-2">
                <div className="avatar avatar-sm">
                  {getUserInitials()}
                </div>
                <span className="hide-mobile">{user?.name || 'Admin'}</span>
                <ChevronIcon />
              </button>
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <strong>{user?.name || 'Admin'}</strong>
                  <div className="text-muted text-sm">{user?.email || 'admin@stocker.app'}</div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Profil</button>
                <button className="dropdown-item">Ayarlar</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogoutIcon />
                  <span className="ms-2">Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Toolbar with Breadcrumbs */}
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
        </div>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div>
              &copy; 2024 Stocker Admin. Tüm hakları saklıdır.
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Gizlilik</a>
              <a href="#" className="footer-link">Kullanım Koşulları</a>
              <a href="#" className="footer-link">Destek</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CustomLayout;