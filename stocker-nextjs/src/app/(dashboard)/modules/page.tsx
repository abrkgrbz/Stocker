'use client';

import React, { useState, useMemo } from 'react';
import { Input, Tooltip } from 'antd';
import {
  ChartBarIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  StarIcon,
  UsersIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

// Module definitions with enhanced styling
const modules = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri ilişkileri yönetimi ve satış süreçleri',
    longDescription: 'Müşteri verilerinizi merkezi bir sistemde yönetin, satış pipeline\'ınızı takip edin ve müşteri memnuniyetini artırın.',
    icon: UsersIcon,
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    gradientFrom: 'from-emerald-50',
    gradientTo: 'to-teal-50',
    enabled: true,
    favorite: true,
    features: ['Müşteri Yönetimi', 'Satış Pipeline', 'Aktivite Takibi', 'Raporlama'],
    stats: { users: 156, records: '2.4K', growth: '+12%' },
    tier: 'premium',
  },
  {
    id: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve depo operasyonları',
    longDescription: 'Çoklu depo yönetimi, barkod entegrasyonu ve otomatik stok uyarıları ile envanterinizi kontrol altında tutun.',
    icon: ShoppingCartIcon,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-indigo-50',
    enabled: false,
    favorite: false,
    features: ['Ürün Kataloğu', 'Depo Takibi', 'Barkod Sistemi', 'Stok Uyarıları'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'standard',
    recommended: true,
  },
  {
    id: 'finance',
    name: 'Finans',
    description: 'Muhasebe, faturalama ve mali raporlar',
    longDescription: 'E-fatura entegrasyonu, gelir-gider takibi ve detaylı mali raporlarla finansınızı yönetin.',
    icon: CurrencyDollarIcon,
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    gradientFrom: 'from-amber-50',
    gradientTo: 'to-orange-50',
    enabled: false,
    favorite: true,
    features: ['E-Fatura', 'Gelir/Gider', 'Banka Hesapları', 'Vergi Raporları'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'premium',
  },
  {
    id: 'analytics',
    name: 'Raporlama',
    description: 'İş zekası ve gelişmiş analitik',
    longDescription: 'Özelleştirilebilir dashboardlar, KPI takibi ve tahmine dayalı analizlerle veriye dayalı kararlar alın.',
    icon: ChartBarIcon,
    color: '#8b5cf6',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-500',
    gradientFrom: 'from-violet-50',
    gradientTo: 'to-purple-50',
    enabled: false,
    favorite: false,
    features: ['Dashboard Builder', 'KPI Takibi', 'Veri Görselleştirme', 'Export'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'enterprise',
  },
  {
    id: 'hrm',
    name: 'İnsan Kaynakları',
    description: 'Personel yönetimi ve bordro işlemleri',
    longDescription: 'Personel özlük dosyaları, izin takibi, bordro hesaplama ve performans değerlendirme süreçlerini yönetin.',
    icon: UsersIcon,
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-500',
    gradientFrom: 'from-pink-50',
    gradientTo: 'to-rose-50',
    enabled: false,
    favorite: false,
    features: ['Personel Kartları', 'İzin Takibi', 'Bordro', 'Performans'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'standard',
  },
  {
    id: 'purchase',
    name: 'Satın Alma',
    description: 'Tedarik zinciri ve satın alma süreçleri',
    longDescription: 'Tedarikçi yönetimi, satın alma siparişleri ve mal kabul süreçlerini entegre bir şekilde yönetin.',
    icon: ClipboardDocumentListIcon,
    color: '#14b8a6',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-500',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-cyan-50',
    enabled: false,
    favorite: false,
    features: ['Tedarikçiler', 'Satın Alma Siparişleri', 'Mal Kabul', 'Ödemeler'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'standard',
  },
  {
    id: 'production',
    name: 'Üretim',
    description: 'Üretim planlama ve kalite kontrol',
    longDescription: 'Üretim emirleri, reçete yönetimi, kapasite planlama ve kalite kontrol süreçlerini optimize edin.',
    icon: Cog6ToothIcon,
    color: '#64748b',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-500',
    gradientFrom: 'from-slate-50',
    gradientTo: 'to-gray-100',
    enabled: false,
    favorite: false,
    features: ['Üretim Emirleri', 'Reçeteler', 'Kapasite Planlama', 'Kalite'],
    stats: { users: 0, records: '0', growth: '-' },
    tier: 'enterprise',
  },
];

const tierConfig: Record<string, { label: string; style: string; iconStyle: string }> = {
  standard: { label: 'Standard', style: 'bg-gray-100 text-gray-600', iconStyle: 'text-gray-400' },
  premium: { label: 'Premium', style: 'bg-amber-50 text-amber-700', iconStyle: 'text-amber-500' },
  enterprise: { label: 'Enterprise', style: 'bg-violet-50 text-violet-700', iconStyle: 'text-violet-500' },
};

// Simulated user data
const userData = {
  name: 'Ahmet',
  recentModules: ['crm', 'finance', 'inventory'],
};

export default function ModulesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Handlers
  const handleActivate = (id: string) => console.log('Activate:', id);
  const handleOpen = (id: string) => console.log('Open:', id);
  const handleSettings = (id: string) => console.log('Settings:', id);
  const handleToggleFavorite = (id: string) => console.log('Toggle favorite:', id);

  // Computed values
  const activeModules = modules.filter(m => m.enabled);
  const favoriteModules = modules.filter(m => m.favorite);
  const recentModules = userData.recentModules.map(id => modules.find(m => m.id === id)).filter(Boolean);
  const recommendedModules = modules.filter(m => m.recommended);
  const totalUsers = modules.reduce((sum, m) => sum + m.stats.users, 0);

  // Filtered modules based on search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Left Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 280 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-20 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-900">Modül Yönetimi</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Quick Stats Widget */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-100">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Squares2X2Icon className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium opacity-90">Hızlı İstatistikler</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-2xl font-bold">{activeModules.length}</div>
                    <div className="text-xs opacity-75">Aktif Modül</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <div className="text-xs opacity-75">Kullanıcı</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Section */}
          {!sidebarCollapsed && favoriteModules.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <StarSolidIcon className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">Favorilerim</span>
              </div>
              <div className="space-y-1">
                {favoriteModules.map(module => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      onClick={() => module.enabled ? handleOpen(module.id) : handleActivate(module.id)}
                    >
                      <div className={`p-1.5 rounded-lg ${module.bgColor}`}>
                        <Icon className={`w-4 h-4 ${module.textColor}`} />
                      </div>
                      <span className="text-sm text-gray-700 truncate">{module.name}</span>
                      {module.enabled && (
                        <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Modules Section */}
          {!sidebarCollapsed && recentModules.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Son Kullanılanlar</span>
              </div>
              <div className="space-y-1">
                {recentModules.slice(0, 5).map(module => {
                  if (!module) return null;
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      onClick={() => module.enabled ? handleOpen(module.id) : handleActivate(module.id)}
                    >
                      <div className={`p-1.5 rounded-lg ${module.bgColor}`}>
                        <Icon className={`w-4 h-4 ${module.textColor}`} />
                      </div>
                      <span className="text-sm text-gray-700 truncate">{module.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsed state icons */}
          {sidebarCollapsed && (
            <div className="p-2 space-y-2">
              <Tooltip title="Favoriler" placement="right">
                <button className="w-full p-2 rounded-lg hover:bg-gray-100 flex justify-center">
                  <StarSolidIcon className="w-5 h-5 text-amber-500" />
                </button>
              </Tooltip>
              <Tooltip title="Son Kullanılanlar" placement="right">
                <button className="w-full p-2 rounded-lg hover:bg-gray-100 flex justify-center">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? 64 : 280 }}
      >
        <div className="max-w-7xl mx-auto p-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Welcome Message */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Merhaba {userData.name} 👋
              </h1>
              <p className="text-gray-500">
                İşletmeniz için ihtiyaç duyduğunuz modülleri keşfedin ve aktifleştirin
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Active Modules */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Aktif Modüller</span>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{activeModules.length}</span>
                  <span className="text-sm text-gray-400">/ {modules.length}</span>
                </div>
              </div>

              {/* Monthly Growth */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Bu Ayki Artış</span>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-600">+12%</span>
                  <span className="text-sm text-gray-400">kullanım</span>
                </div>
              </div>

              {/* Recommended */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Önerilen Modüller</span>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <SparklesIcon className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{recommendedModules.length}</span>
                  <span className="text-sm text-gray-400">modül</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Modül ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-gray-200 hover:border-gray-300 focus:border-indigo-500"
                allowClear
              />
            </div>
          </motion.div>

          {/* Contextual Tip */}
          {activeModules.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
            >
              <LightBulbIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  <span className="font-medium">İpucu:</span> Stok Yönetimi modülünü aktifleştirerek envanter takibine başlayın. CRM ile entegre çalışarak müşteri siparişlerini otomatik takip edebilirsiniz.
                </p>
              </div>
            </motion.div>
          )}

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredModules.map((module, index) => {
                const Icon = module.icon;
                const tier = tierConfig[module.tier];
                const isActive = module.enabled;
                const isHovered = hoveredCard === module.id;
                const isExpanded = expandedCard === module.id;

                return (
                  <motion.div
                    key={module.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredCard(module.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`
                        group relative bg-white rounded-2xl p-5 min-h-[280px]
                        transition-all duration-300 ease-out cursor-pointer
                        ${isHovered ? '-translate-y-1 shadow-xl' : 'shadow-sm'}
                        ${isActive
                          ? `border-2 ${module.borderColor} shadow-lg bg-gradient-to-br ${module.gradientFrom} ${module.gradientTo}`
                          : `border border-gray-200 hover:border-gray-300 bg-gradient-to-br ${module.gradientFrom}/30 ${module.gradientTo}/30`
                        }
                      `}
                      style={{
                        boxShadow: isActive && isHovered
                          ? `0 20px 40px -12px ${module.color}30`
                          : undefined
                      }}
                    >
                      {/* Active Glow Effect */}
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 50% 0%, ${module.color}15, transparent 70%)`
                          }}
                        />
                      )}

                      {/* Recommended Badge */}
                      {module.recommended && !isActive && (
                        <div className="absolute -top-2 left-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-sm">
                            <SparklesIcon className="w-3 h-3" />
                            Önerilen
                          </span>
                        </div>
                      )}

                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute -top-px -right-px">
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-bl-xl rounded-tr-2xl"
                            style={{ backgroundColor: module.color }}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                            </span>
                            Aktif
                          </div>
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(module.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/80 transition-colors z-10"
                      >
                        {module.favorite ? (
                          <StarSolidIcon className="w-5 h-5 text-amber-500" />
                        ) : (
                          <StarIcon className="w-5 h-5 text-gray-300 hover:text-amber-500 transition-colors" />
                        )}
                      </button>

                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4 pr-8">
                        {/* Icon with background circle */}
                        <div
                          className={`relative p-3 rounded-xl ${module.bgColor} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
                        >
                          <Icon className={`w-7 h-7 ${module.textColor}`} />
                          {/* Decorative ring */}
                          <div
                            className="absolute inset-0 rounded-xl border-2 opacity-20"
                            style={{ borderColor: module.color }}
                          />
                        </div>

                        {/* Title & Tier */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {module.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${tier.style}`}>
                              {tier.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats Row - Only for Active */}
                      {isActive && (
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex-1 text-center">
                            <div className="text-xl font-bold text-gray-900">{module.stats.users}</div>
                            <div className="text-xs text-gray-500">Kullanıcı</div>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div className="flex-1 text-center">
                            <div className="text-xl font-bold text-gray-900">{module.stats.records}</div>
                            <div className="text-xs text-gray-500">Kayıt</div>
                          </div>
                          <div className="w-px h-8 bg-gray-200" />
                          <div className="flex-1 text-center">
                            <div className="text-xl font-bold text-emerald-600">{module.stats.growth}</div>
                            <div className="text-xs text-gray-500">Büyüme</div>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {module.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckIcon
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color: module.color }}
                              />
                              <span className="text-sm text-gray-600 truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expandable Description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                          >
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              {module.longDescription}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* More Info Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCard(isExpanded ? null : module.id);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
                      >
                        <InformationCircleIcon className="w-4 h-4" />
                        {isExpanded ? 'Daha az' : 'Daha fazla bilgi'}
                      </button>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-100 mt-auto">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpen(module.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                              style={{
                                backgroundColor: module.color,
                                boxShadow: isHovered ? `0 8px 20px -6px ${module.color}60` : undefined
                              }}
                            >
                              Modülü Aç
                              <ArrowUpRightIcon className="w-4 h-4" />
                            </button>
                            <Tooltip title="Ayarlar">
                              <button
                                onClick={() => handleSettings(module.id)}
                                className="inline-flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <Cog6ToothIcon className="w-5 h-5" />
                              </button>
                            </Tooltip>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleActivate(module.id)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 group/btn active:scale-[0.98]"
                          >
                            Aktifleştir
                            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredModules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Modül bulunamadı</h3>
              <p className="text-gray-500">"{searchQuery}" araması için sonuç yok</p>
            </motion.div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }} />
              </div>

              {/* Gradient Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full filter blur-3xl opacity-20" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <StarIcon className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">Enterprise Plan</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Tüm modüllere sınırsız erişim
                  </h3>
                  <p className="text-gray-400 max-w-lg">
                    Enterprise plan ile tüm modülleri, premium özellikleri ve öncelikli desteği kullanın.
                    İşletmenizi bir üst seviyeye taşıyın.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                    Planları İncele
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-xl hover:bg-white/10 hover:text-white transition-colors">
                    Modül Öner
                    <SparklesIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
