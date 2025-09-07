import { useState, useEffect, useCallback } from 'react';

interface MasterLayoutState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (value: boolean) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  searchVisible: boolean;
  setSearchVisible: (value: boolean) => void;
}

export const useMasterLayout = (): MasterLayoutState => {
  // Load initial values from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('master-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('master-dark-mode');
    if (saved) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [fullscreen, setFullscreen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('master-sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('master-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle fullscreen changes
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullscreen(true);
      }).catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setFullscreen(false);
      }).catch((err) => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && !collapsed) {
        setCollapsed(true);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileDrawerOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return {
    collapsed,
    setCollapsed,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    darkMode,
    setDarkMode,
    fullscreen,
    toggleFullscreen,
    searchVisible,
    setSearchVisible,
  };
};