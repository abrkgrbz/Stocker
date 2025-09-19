import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CalculatorOutlined,
  UserOutlined,
  ToolOutlined,
  ProjectOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
  CrownOutlined,
  RocketOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  GlobalOutlined,
  CustomerServiceOutlined,
  SafetyOutlined,
  DashboardOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import { availableModules, Module } from '@/types/modules';
import './modern-style.css';

// Enhanced icon mapping with more icons
const iconMap: { [key: string]: React.ReactNode } = {
  TeamOutlined: <TeamOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  InboxOutlined: <InboxOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  UserOutlined: <UserOutlined />,
  ToolOutlined: <ToolOutlined />,
  ProjectOutlined: <ProjectOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  CustomerServiceOutlined: <CustomerServiceOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DashboardOutlined: <DashboardOutlined />
};

// Background patterns
const patterns = [
  'radial-gradient(circle at 20% 80%, rgba(103, 126, 234, 0.1) 0%, transparent 50%)',
  'radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
  'radial-gradient(circle at 40% 40%, rgba(255, 107, 107, 0.05) 0%, transparent 50%)',
  'radial-gradient(circle at 60% 60%, rgba(46, 213, 115, 0.05) 0%, transparent 50%)',
];

const ModernModulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated loading
    setTimeout(() => {
      const userModules = localStorage.getItem('user_modules');
      if (userModules) {
        const moduleIds = JSON.parse(userModules);
        const filtered = availableModules.map(module => ({
          ...module,
          isActive: moduleIds.includes(module.id) || module.isActive
        }));
        setModules(filtered);
      } else {
        setModules(availableModules);
      }
      setIsLoading(false);
    }, 1000);

    // Animated background
    const animateBackground = () => {
      const style = {
        background: `
          ${patterns[Math.floor(Math.random() * patterns.length)]},
          ${patterns[Math.floor(Math.random() * patterns.length)]},
          linear-gradient(135deg, #667eea 0%, #764ba2 100%)
        `
      };
      setBackgroundStyle(style);
    };

    animateBackground();
    const interval = setInterval(animateBackground, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleModuleClick = (module: Module) => {
    if (module.isActive && !module.isComingSoon) {
      // Add click animation
      const element = document.getElementById(`module-${module.id}`);
      if (element) {
        element.classList.add('module-clicked');
        setTimeout(() => {
          navigate(module.route);
        }, 300);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'Tümü', icon: <AppstoreOutlined />, color: '#667eea' },
    { key: 'core', label: 'Temel', icon: <RocketOutlined />, color: '#f368e0' },
    { key: 'finance', label: 'Finans', icon: <CalculatorOutlined />, color: '#48dbfb' },
    { key: 'operations', label: 'Operasyon', icon: <ToolOutlined />, color: '#ff9ff3' },
    { key: 'analytics', label: 'Analiz', icon: <BarChartOutlined />, color: '#54a0ff' },
    { key: 'hr', label: 'İK', icon: <UserOutlined />, color: '#feca57' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="modern-loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <RocketOutlined className="loading-icon" />
        </div>
        <h2>Modüller yükleniyor...</h2>
      </div>
    );
  }

  return (
    <div className="modern-modules-screen" style={backgroundStyle}>
      {/* Animated background particles */}
      <div className="particle-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }} />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="modern-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-animation">
                <AppstoreOutlined />
              </div>
              <h1>Stocker Modüller</h1>
            </div>
            <div className="user-info">
              <span className="welcome-text">Hoş geldiniz,</span>
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">Yönetici</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-container">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="Modül ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="header-actions">
              <button className="action-button">
                <SettingOutlined />
              </button>
              <button className="action-button" onClick={handleLogout}>
                <LogoutOutlined />
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="categories-container">
          {categories.map(cat => (
            <motion.button
              key={cat.key}
              className={`category-chip ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: selectedCategory === cat.key ? cat.color : 'transparent',
                borderColor: cat.color,
                color: selectedCategory === cat.key ? 'white' : cat.color
              }}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="modern-content">
        {/* Stats Cards */}
        <motion.div 
          className="stats-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card">
            <FireOutlined className="stat-icon" style={{ color: '#ff6b6b' }} />
            <div className="stat-content">
              <span className="stat-value">{modules.filter(m => m.isActive).length}</span>
              <span className="stat-label">Aktif Modül</span>
            </div>
          </div>
          <div className="stat-card">
            <ThunderboltOutlined className="stat-icon" style={{ color: '#ffd93d' }} />
            <div className="stat-content">
              <span className="stat-value">∞</span>
              <span className="stat-label">İşlem/Gün</span>
            </div>
          </div>
          <div className="stat-card">
            <StarOutlined className="stat-icon" style={{ color: '#6bcf7f' }} />
            <div className="stat-content">
              <span className="stat-value">Premium</span>
              <span className="stat-label">Paket</span>
            </div>
          </div>
        </motion.div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GlobalOutlined className="empty-icon" />
            <h3>Modül bulunamadı</h3>
            <p>Arama kriterlerinize uygun modül bulunmamaktadır.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="modules-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  id={`module-${module.id}`}
                  className={`module-card ${!module.isActive || module.isComingSoon ? 'disabled' : ''} ${hoveredModule === module.id ? 'hovered' : ''}`}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: module.isActive && !module.isComingSoon ? 1.05 : 1,
                    rotateY: module.isActive && !module.isComingSoon ? 5 : 0,
                  }}
                  whileTap={{ 
                    scale: module.isActive && !module.isComingSoon ? 0.95 : 1 
                  }}
                  onHoverStart={() => setHoveredModule(module.id)}
                  onHoverEnd={() => setHoveredModule(null)}
                  onClick={() => handleModuleClick(module)}
                  layout
                  style={{
                    background: module.isActive && !module.isComingSoon 
                      ? `linear-gradient(135deg, ${module.color}20 0%, ${module.color}10 100%)`
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: module.color,
                  }}
                >
                  {/* Status Badge */}
                  <div className={`status-badge ${module.isComingSoon ? 'coming-soon' : module.isActive ? 'active' : 'locked'}`}>
                    {module.isComingSoon ? (
                      <>
                        <ClockCircleOutlined />
                        <span>Yakında</span>
                      </>
                    ) : module.isActive ? (
                      <>
                        <CheckCircleOutlined />
                        <span>Aktif</span>
                      </>
                    ) : (
                      <>
                        <LockOutlined />
                        <span>Kilitli</span>
                      </>
                    )}
                  </div>

                  {/* Module Icon */}
                  <div className="module-icon-container">
                    <div 
                      className="module-icon"
                      style={{ 
                        background: module.isActive && !module.isComingSoon 
                          ? `linear-gradient(135deg, ${module.color} 0%, ${module.color}80 100%)`
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {iconMap[module.icon]}
                    </div>
                  </div>

                  {/* Module Info */}
                  <div className="module-info">
                    <h3 className="module-title">{module.name}</h3>
                    <p className="module-description">{module.description}</p>
                  </div>

                  {/* Hover Effects */}
                  {module.isActive && !module.isComingSoon && (
                    <div className="hover-overlay">
                      <div className="hover-content">
                        <RocketOutlined className="launch-icon" />
                        <span>Modülü Aç</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Premium Banner */}
        <motion.div 
          className="premium-banner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="premium-content">
            <CrownOutlined className="premium-icon" />
            <div className="premium-text">
              <h3>Daha fazla güç mü istiyorsunuz?</h3>
              <p>Premium özellikleri keşfedin ve işletmenizi bir sonraki seviyeye taşıyın.</p>
            </div>
            <button className="premium-button">
              Premium'a Yükselt
              <ThunderboltOutlined />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernModulesScreen;