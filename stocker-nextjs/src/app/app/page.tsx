'use client';

/**
 * App Home - Module Selection Page
 * Command Center / Dashboard Hub
 * Supports Dark (Premium) and Light (Classic) Themes
 */

import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Briefcase,
  MessageSquare,
  Calendar,
  Boxes,
  TrendingUp,
  Command,
  Wallet,
  Factory,
  Sun,
  Moon,
  ClipboardList,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import SetupWizardModal from '@/components/setup/SetupWizardModal';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { AppThemeProvider, useAppTheme } from '@/components/providers/AppThemeProvider';

// Dynamic import for GradientMesh
const GradientMesh = dynamic(() => import('@/components/landing/GradientMesh'), {
  ssr: false,
  loading: () => null,
});

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  path: string;
  badge?: string;
  badgeType?: 'active' | 'subscription' | 'coming-soon';
  disabled?: boolean;
}

// Module configurations
const MODULE_CONFIGS = [
  {
    id: 'crm',
    title: 'CRM',
    description: 'Müşteri ilişkileri ve satış fırsatları',
    icon: Users,
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    path: '/crm',
    moduleCode: 'crm',
  },
  {
    id: 'sales',
    title: 'Satış',
    description: 'Sipariş, fatura ve ödeme yönetimi',
    icon: ShoppingCart,
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    path: '/sales',
    moduleCode: 'sales',
  },
  {
    id: 'inventory',
    title: 'Envanter',
    description: 'Envanter ve depo yönetimi',
    icon: Package,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    path: '/inventory',
    moduleCode: 'inventory',
  },
  {
    id: 'purchase',
    title: 'Satın Alma',
    description: 'Tedarik ve satın alma süreçleri',
    icon: ClipboardList,
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    path: '/purchase',
    moduleCode: 'purchase',
  },
  {
    id: 'hr',
    title: 'İnsan Kaynakları',
    description: 'Personel ve bordro yönetimi',
    icon: Briefcase,
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    path: '/hr',
    moduleCode: 'hr',
  },
  {
    id: 'finance',
    title: 'Finans',
    description: 'Muhasebe, fatura ve ödeme yönetimi',
    icon: BarChart3,
    iconBg: 'bg-green-50 dark:bg-green-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
    path: '/finance',
    moduleCode: 'finance',
  },
  {
    id: 'manufacturing',
    title: 'Üretim',
    description: 'Üretim planlama, iş emirleri ve kalite kontrol',
    icon: Factory,
    iconBg: 'bg-orange-50 dark:bg-orange-500/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    path: '/manufacturing',
    moduleCode: 'manufacturing',
  },
  {
    id: 'dashboards',
    title: 'Analitik',
    description: 'Raporlar ve iş zekası',
    icon: TrendingUp,
    iconBg: 'bg-rose-50 dark:bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    path: '/dashboard',
    alwaysEnabled: true,
  },
  {
    id: 'apps',
    title: 'Uygulamalar',
    description: 'Modül yönetimi ve entegrasyonlar',
    icon: Boxes,
    iconBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    path: '/modules',
    alwaysEnabled: true,
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Sistem ve hesap ayarları',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    path: '/settings',
    alwaysEnabled: true,
  },
  {
    id: 'messaging',
    title: 'Mesajlaşma',
    description: 'İletişim ve bildirimler',
    icon: MessageSquare,
    iconBg: 'bg-pink-50 dark:bg-pink-500/10',
    iconColor: 'text-pink-600 dark:text-pink-400',
    path: '/app/messaging',
    alwaysEnabled: true,
  },
  {
    id: 'calendar',
    title: 'Takvim',
    description: 'Etkinlik ve toplantı yönetimi',
    icon: Calendar,
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    path: '/calendar',
    comingSoon: true,
  },
];

function AppContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { tenant } = useTenant();
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();
  const { theme, toggleTheme } = useAppTheme();

  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isSearchFocused) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  const modules: ModuleCard[] = useMemo(() => {
    return MODULE_CONFIGS.map(config => {
      const Icon = config.icon;
      if (config.alwaysEnabled) {
        return { ...config, icon: Icon, disabled: false };
      }
      if ('comingSoon' in config && config.comingSoon) {
        return {
          ...config,
          icon: Icon,
          badge: 'Yakında',
          badgeType: 'coming-soon',
          disabled: true,
        };
      }
      const hasAccess = ('moduleCode' in config) && config.moduleCode && activeModuleCodes.has(config.moduleCode.toLowerCase());
      return {
        ...config,
        icon: Icon,
        badge: hasAccess ? 'Aktif' : 'Abonelik Gerekli',
        badgeType: hasAccess ? 'active' : 'subscription',
        disabled: !hasAccess,
      } as ModuleCard;
    });
  }, [activeModuleCodes]);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(
      m => m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
    );
  }, [modules, searchQuery]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const requiresSetup = localStorage.getItem('requiresSetup');
      if (requiresSetup === 'true') {
        setSetupModalOpen(true);
      }
    }
  }, [isLoading, isAuthenticated]);

  const handleSetupComplete = () => {
    localStorage.removeItem('requiresSetup');
    setSetupModalOpen(false);
    window.location.reload();
  };

  const handleModuleClick = (module: ModuleCard) => {
    if (module.disabled) return;
    router.push(module.path);
  };

  const handleLogout = () => logout();

  if (isLoading || !isAuthenticated || !user || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0f1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : 'light-theme'}>
      <div
        className="min-h-screen relative overflow-hidden transition-colors duration-500 text-slate-900 dark:text-white"
        style={{
          backgroundColor: isDark ? '#0c0f1a' : '#f8fafc' // Explicitly set to bg-slate-50 (#f8fafc) or dark (#0c0f1a)
        }}
      >
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {isDark ? (
            <>
              <Suspense fallback={null}>
                <GradientMesh />
              </Suspense>
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.15) 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
          )}
        </div>

        {/* Header */}
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-200/80'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Logo & Team Name */}
              <div className="flex items-center gap-3">
                <div className="flex items-center h-8">
                  <Image
                    src={isDark ? "/stoocker_white.png" : "/stoocker_black.png"}
                    alt="Stoocker"
                    width={120}
                    height={40}
                    priority
                    className="object-contain"
                  />
                </div>
                <span className={`hidden sm:block ${isDark ? 'text-white/20' : 'text-slate-300'}`}>/</span>
                <span className={`text-sm hidden sm:block font-light ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  {tenant?.name || 'Workspace'}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-4">
                {/* Resources Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsResourcesMenuOpen(!isResourcesMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isDark ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                  >
                    <span>Kaynaklar</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isResourcesMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isResourcesMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsResourcesMenuOpen(false)} />
                      <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border py-2 z-20 overflow-hidden ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                        <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                          Destek Aracı
                        </div>
                        <a href="#" className={`px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                          <HelpCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          <span>Yardım Merkezi</span>
                        </a>
                        <a href="#" className={`px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                          <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          <span>Dokümantasyon</span>
                        </a>
                        <a href="#" className={`px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                          <LifeBuoy className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                          <span>Destek Talebi</span>
                        </a>
                        <div className={`border-t mt-2 pt-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          <a href="#" className="px-4 py-2.5 text-sm flex items-center justify-between text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/5 group transition-colors">
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4" />
                              <span>Topluluk</span>
                            </div>
                            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  title={isDark ? "Açık Temaya Geç" : "Koyu Temaya Geç"}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-200 text-slate-600'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                      {user?.firstName}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-1 z-20 overflow-hidden ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{user?.email}</p>
                        </div>
                        <button onClick={() => router.push('/settings')} className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                          <Settings className="w-4 h-4" /> Ayarlar
                        </button>
                        <div className={`border-t mt-1 pt-1 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Çıkış Yap
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="mb-10 text-center sm:text-left">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Hoş Geldiniz, {user?.firstName} 👋
            </h2>
            <p className={`text-lg ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
              Bugün ne üzerinde çalışmak istersiniz?
            </p>
          </div>

          <div className="mb-16 relative z-20">
            <div className="relative max-w-3xl mx-auto group">
              <div className={`absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors duration-200 ${isSearchFocused ? 'text-indigo-500 scale-110' : (isDark ? 'text-white/40' : 'text-slate-400')}`}>
                <Search className="w-6 h-6" />
              </div>
              {isDark && isSearchFocused && (
                <div className="absolute -inset-1 bg-indigo-500/30 rounded-3xl blur-xl transition-all duration-500" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Modül, rapor veya ayar arayın..."
                className={`w-full pl-16 pr-24 py-5 h-16 rounded-2xl text-lg backdrop-blur-xl transition-all duration-300 relative z-10 focus:outline-none ${isDark
                  ? `bg-slate-900/60 border ${isSearchFocused ? 'border-indigo-500/50 ring-1 ring-indigo-500/50 text-white shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-white/10 text-white/80 hover:border-white/20'}`
                  : `bg-white border-2 text-slate-900 ${isSearchFocused ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-xl shadow-indigo-500/10' : 'border-slate-200 shadow-lg shadow-slate-900/5 hover:border-slate-300 hover:shadow-xl'}`
                  }`}
              />
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none z-20">
                <kbd className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isDark ? 'text-white/40 bg-white/5 border-white/5' : 'text-slate-400 bg-slate-100 border-slate-200'}`}>
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <button
                    onClick={() => handleModuleClick(module)}
                    disabled={module.disabled}
                    className={`w-full text-left p-6 rounded-2xl border group relative overflow-hidden h-[200px] flex flex-col justify-between transition-all duration-300 ease-out ${isDark
                      ? module.disabled
                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border-white/5 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:-translate-y-1'
                      : module.disabled
                        ? 'bg-slate-50 border-slate-200 opacity-50'
                        : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-white/5 border border-white/5' : module.iconBg}`}>
                        <Icon className={`w-6 h-6 transition-colors ${isDark ? 'text-white/70 group-hover:text-indigo-400' : module.iconColor}`} />
                      </div>
                      {module.badge && (
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${module.badgeType === 'active'
                          ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700'
                          : isDark ? 'bg-white/5 text-white/40 border-white/5' : 'bg-slate-100 text-slate-600'}`}>{module.badge}</span>
                      )}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'}`}>{module.title}</h3>
                      <p className={`text-sm line-clamp-2 ${isDark ? 'text-white/40 group-hover:text-white/60' : 'text-slate-500'}`}>{module.description}</p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <footer className={`mt-24 pt-8 border-t ${isDark ? 'border-white/5 text-white/40' : 'border-slate-200 text-slate-500'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
              <p>© 2026 Stocker. Tüm hakları saklıdır.</p>
              <div className="flex items-center gap-6">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-white/5 text-white/30' : 'bg-slate-100 text-slate-400'}`}>v2.4.0-pro</span>
              </div>
            </div>
          </footer>
        </main>
        <SetupWizardModal open={setupModalOpen} onComplete={handleSetupComplete} />
      </div>
    </div>
  );
}

export default function AppHomePage() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
