import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Breadcrumbs,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Switch,
  FormControlLabel,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Backup as BackupIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Assignment as AuditIcon,
  Monitor as MonitorIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  MonitorHeart as MonitorHeartIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
  children?: NavigationItem[];
  badge?: number;
}

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Ana Panel',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      id: 'tenants',
      label: 'Kiracı Yönetimi',
      icon: <BusinessIcon />,
      path: '/tenants',
      badge: 5, // New tenant requests
    },
    {
      id: 'users',
      label: 'Kullanıcı Yönetimi',
      icon: <PeopleIcon />,
      path: '/users',
    },
    {
      id: 'packages',
      label: 'Paket Yönetimi',
      icon: <CategoryIcon />,
      path: '/packages',
      badge: 4,
    },
    {
      id: 'invoices',
      label: 'Faturalar',
      icon: <ReceiptIcon />,
      path: '/invoices',
      badge: 12,
    },
    {
      id: 'payments',
      label: 'Ödemeler',
      icon: <PaymentIcon />,
      path: '/payments',
    },
    {
      id: 'email-templates',
      label: 'E-posta Şablonları',
      icon: <EmailIcon />,
      path: '/email-templates',
    },
    {
      id: 'backup',
      label: 'Yedekleme & Geri Yükleme',
      icon: <BackupIcon />,
      path: '/backup',
    },
    {
      id: 'notifications',
      label: 'Bildirim Ayarları',
      icon: <NotificationsIcon />,
      path: '/notification-settings',
    },
    {
      id: 'analytics',
      label: 'Analitik',
      icon: <AnalyticsIcon />,
      path: '/analytics',
    },
    {
      id: 'audit-logs',
      label: 'Denetim Günlükleri',
      icon: <HistoryIcon />,
      path: '/audit-logs',
    },
    {
      id: 'monitoring',
      label: 'Sistem İzleme',
      icon: <MonitorHeartIcon />,
      path: '/monitoring',
      badge: 3, // System alerts
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: <SettingsIcon />,
      path: '/settings',
    },
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Ana Sayfa', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> }
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const item = navigationItems.find(nav => nav.path === currentPath);
      if (item) {
        breadcrumbs.push({
          label: item.label,
          href: currentPath,
          icon: React.cloneElement(item.icon, { sx: { mr: 0.5 }, fontSize: 'inherit' })
        });
      }
    });

    return breadcrumbs;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleItemExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const active = item.path ? isActive(item.path) : false;

    return (
      <React.Fragment key={item.id}>
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              handleItemExpand(item.id);
            } else if (item.path) {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }
          }}
          sx={{
            minHeight: 48,
            px: sidebarCollapsed ? 1.5 : 2.5,
            pl: isChild ? (sidebarCollapsed ? 1.5 : 4) : (sidebarCollapsed ? 1.5 : 2.5),
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            bgcolor: active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
            color: active ? '#667eea' : 'inherit',
            '&:hover': {
              bgcolor: active ? 'rgba(102, 126, 234, 0.15)' : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: sidebarCollapsed ? 'auto' : 2,
              justifyContent: 'center',
              color: active ? '#667eea' : 'inherit',
            }}
          >
            {item.badge && !sidebarCollapsed ? (
              <Badge badgeContent={item.badge} color="error">
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
          </ListItemIcon>
          {!sidebarCollapsed && (
            <>
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: active ? 600 : 400,
                  }
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="error"
                  sx={{ height: 20, '& .MuiChip-label': { px: 1 } }}
                />
              )}
              {hasChildren && (
                isExpanded ? <ExpandLess /> : <ExpandMore />
              )}
            </>
          )}
        </ListItemButton>
        {hasChildren && !sidebarCollapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavigationItem(child, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1 : 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          minHeight: 80,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        {!sidebarCollapsed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AdminIcon sx={{ fontSize: 32, mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Stocker
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Admin Panel
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleSidebarCollapse} 
              sx={{ color: 'white' }}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Stocker Admin">
            <IconButton 
              onClick={handleSidebarCollapse} 
              sx={{ color: 'white' }}
            >
              <AdminIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {navigationItems.map(item => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Dark Mode Toggle */}
      {!sidebarCollapsed && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
              />
            }
            label="Karanlık Mod"
            sx={{ margin: 0 }}
          />
        </Box>
      )}

      {/* User Info Section */}
      {!sidebarCollapsed && user && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {user.name}
              </Typography>
              <Chip
                label={user.role === 'super_admin' ? 'Süper Yönetici' : 'Yönetici'}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`,
          ml: isMobile ? 0 : `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px`,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <Box
                    key={crumb.href}
                    component={isLast ? 'span' : Link}
                    to={isLast ? undefined : crumb.href}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isLast ? 'text.primary' : 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: isLast ? 'text.primary' : 'primary.main',
                      },
                    }}
                  >
                    {crumb.icon}
                    {crumb.label}
                  </Box>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark Mode Toggle for Mobile */}
            {isMobile && (
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            )}

            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: { width: 220 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profil
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Ayarlar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Çıkış Yap
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: { width: 320 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Bildirimler</Typography>
        </Box>
        <Divider />
        <MenuItem>
          <Box>
            <Typography variant="body2">Yeni kiracı kaydı</Typography>
            <Typography variant="caption" color="text.secondary">
              5 dakika önce
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Sistem uyarısı</Typography>
            <Typography variant="caption" color="text.secondary">
              2 saat önce
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Yedekleme tamamlandı</Typography>
            <Typography variant="caption" color="text.secondary">
              1 gün önce
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: isMobile ? 0 : (sidebarCollapsed ? collapsedDrawerWidth : drawerWidth), 
          flexShrink: 0 
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 10, // Account for AppBar height
          minHeight: '100vh',
          bgcolor: 'grey.50',
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            minHeight: 'calc(100vh - 120px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}
        >
          {children || <Outlet />}
        </Paper>
      </Box>

      {/* Expand Sidebar Button for Collapsed State */}
      {!isMobile && sidebarCollapsed && (
        <IconButton
          onClick={handleSidebarCollapse}
          sx={{
            position: 'fixed',
            left: collapsedDrawerWidth - 20,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            zIndex: theme.zIndex.drawer + 1,
            '&:hover': {
              bgcolor: 'background.default',
            },
          }}
          size="small"
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default AdminLayout;