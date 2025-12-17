'use client';

/**
 * App Home - Module Selection Page
 * Modern SaaS Launcher / Dashboard Hub
 * Clean Light Theme - Linear/Stripe Style
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import SetupWizardModal from '@/components/setup/SetupWizardModal';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
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
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    path: '/crm',
    moduleCode: 'crm',
  },
  {
    id: 'sales',
    title: 'Satış',
    description: 'Sipariş, fatura ve ödeme yönetimi',
    icon: ShoppingCart,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    path: '/sales',
    moduleCode: 'sales',
  },
  {
    id: 'inventory',
    title: 'Stok',
    description: 'Envanter ve depo yönetimi',
    icon: Boxes,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    path: '/inventory',
    moduleCode: 'inventory',
  },
  {
    id: 'hr',
    title: 'İnsan Kaynakları',
    description: 'Personel ve bordro yönetimi',
    icon: Briefcase,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    path: '/hr',
    moduleCode: 'hr',
  },
  {
    id: 'purchase',
    title: 'Satın Alma',
    description: 'Tedarik ve satın alma süreçleri',
    icon: Package,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    path: '/purchase',
    moduleCode: 'purchase',
  },
  {
    id: 'dashboards',
    title: 'Analitik',
    description: 'Raporlar ve iş zekası',
    icon: BarChart3,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    path: '/dashboard',
    alwaysEnabled: true,
  },
  {
    id: 'apps',
    title: 'Uygulamalar',
    description: 'Modül yönetimi ve entegrasyonlar',
    icon: TrendingUp,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    path: '/modules',
    alwaysEnabled: true,
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Sistem ve hesap ayarları',
    icon: Settings,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    path: '/settings',
    alwaysEnabled: true,
  },
  {
    id: 'messaging',
    title: 'Mesajlaşma',
    description: 'İletişim ve bildirimler',
    icon: MessageSquare,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    path: '/messaging',
    comingSoon: true,
  },
  {
    id: 'calendar',
    title: 'Takvim',
    description: 'Etkinlik ve toplantı yönetimi',
    icon: Calendar,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    path: '/calendar',
    comingSoon: true,
  },
];

export default function AppHomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { tenant } = useTenant();
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  // States
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Active module codes for fast lookup
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Build modules list with dynamic enabled status
  const modules: ModuleCard[] = useMemo(() => {
    return MODULE_CONFIGS.map(config => {
      const Icon = config.icon;

      // Always-enabled modules
      if (config.alwaysEnabled) {
        return {
          id: config.id,
          title: config.title,
          description: config.description,
          icon: Icon,
          iconBg: config.iconBg,
          iconColor: config.iconColor,
          path: config.path,
          disabled: false,
        };
      }

      // Coming soon features
      if (config.comingSoon) {
        return {
          id: config.id,
          title: config.title,
          description: config.description,
          icon: Icon,
          iconBg: config.iconBg,
          iconColor: config.iconColor,
          path: config.path,
          badge: 'Yakında',
          badgeType: 'coming-soon' as const,
          disabled: true,
        };
      }

      // Subscription-based modules
      const hasAccess = config.moduleCode && activeModuleCodes.has(config.moduleCode.toLowerCase());
      return {
        id: config.id,
        title: config.title,
        description: config.description,
        icon: Icon,
        iconBg: config.iconBg,
        iconColor: config.iconColor,
        path: config.path,
        badge: hasAccess ? 'Aktif' : 'Abonelik Gerekli',
        badgeType: hasAccess ? 'active' as const : 'subscription' as const,
        disabled: !hasAccess,
      };
    });
  }, [activeModuleCodes]);

  // Filter modules by search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(
      m => m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
    );
  }, [modules, searchQuery]);

  // Auth redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Setup check
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

  const handleLogout = () => {
    logout();
  };

  // Loading state
  if (isLoading || !isAuthenticated || !user || modulesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Team Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-slate-900">
                  {tenant?.name || 'Stocker'}
                </h1>
                <p className="text-xs text-slate-500">İşletme Yönetim Sistemi</p>
              </div>
            </div>

            {/* Right: Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profil
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Ayarlar
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Çalışma Alanı
          </h2>
          <p className="text-slate-500">
            Erişmek istediğiniz modülü seçin veya arayın
          </p>
        </div>

        {/* Search / Command Palette */}
        <div className="mb-10">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Modül ara..."
              className="w-full pl-12 pr-20 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded-md border border-slate-200">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Module Grid - Bento Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((module, index) => {
            const Icon = module.icon;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleModuleClick(module)}
                  disabled={module.disabled}
                  className={`
                    w-full text-left p-5 bg-white rounded-xl border transition-all duration-200 group relative
                    ${module.disabled
                      ? 'opacity-60 cursor-not-allowed border-slate-200'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                    }
                  `}
                >
                  {/* Badge */}
                  {module.badge && (
                    <span
                      className={`
                        absolute top-3 right-3 px-2 py-0.5 text-xs font-medium rounded-full
                        ${module.badgeType === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : module.badgeType === 'coming-soon'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }
                      `}
                    >
                      {module.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 ${module.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${module.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {module.description}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Modül bulunamadı
            </h3>
            <p className="text-slate-500">
              &ldquo;{searchQuery}&rdquo; için sonuç yok. Farklı bir arama deneyin.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2024 Stocker. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-6">
              <a href="/help" className="hover:text-slate-900 transition-colors">Yardım</a>
              <a href="/docs" className="hover:text-slate-900 transition-colors">Dokümantasyon</a>
              <a href="/support" className="hover:text-slate-900 transition-colors">Destek</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Setup Modal */}
      <SetupWizardModal open={setupModalOpen} onComplete={handleSetupComplete} />
    </div>
  );
}
