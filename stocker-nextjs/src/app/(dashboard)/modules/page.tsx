'use client';

/**
 * Modules Page - Module Management & Marketplace
 * Clean, minimal design following project patterns
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Switch, Tag, message } from 'antd';
import {
  Search,
  Users,
  ShoppingCart,
  Boxes,
  Briefcase,
  Package,
  BarChart3,
  Settings,
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { useToggleModule } from '@/lib/api/hooks/useTenantModules';
import ModuleActivationModal from '@/components/modules/ModuleActivationModal';

// Module tier configuration
const TIER_CONFIG = {
  standard: {
    label: 'Standard',
    color: 'default',
  },
  premium: {
    label: 'Premium',
    color: 'default',
  },
  enterprise: {
    label: 'Enterprise',
    color: 'default',
  },
} as const;

// Module definitions - neutral color scheme
const MODULE_DEFINITIONS = [
  {
    id: 'crm',
    code: 'CRM',
    name: 'CRM',
    description: 'Müşteri ilişkileri yönetimi ve satış fırsatları',
    icon: Users,
    path: '/crm',
    tier: 'premium' as const,
    features: ['Müşteri Yönetimi', 'Satış Pipeline', 'Aktivite Takibi', 'Raporlama'],
  },
  {
    id: 'inventory',
    code: 'INVENTORY',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve depo operasyonları',
    icon: Boxes,
    path: '/inventory',
    tier: 'standard' as const,
    features: ['Ürün Kataloğu', 'Depo Takibi', 'Barkod Sistemi', 'Stok Uyarıları'],
  },
  {
    id: 'sales',
    code: 'SALES',
    name: 'Satış',
    description: 'Sipariş, fatura ve ödeme yönetimi',
    icon: ShoppingCart,
    path: '/sales',
    tier: 'standard' as const,
    features: ['Sipariş Yönetimi', 'Faturalama', 'Ödeme Takibi', 'Raporlar'],
  },
  {
    id: 'hr',
    code: 'HR',
    name: 'İnsan Kaynakları',
    description: 'Personel yönetimi ve bordro işlemleri',
    icon: Briefcase,
    path: '/hr',
    tier: 'standard' as const,
    features: ['Personel Kartları', 'İzin Takibi', 'Bordro', 'Performans'],
  },
  {
    id: 'purchase',
    code: 'PURCHASE',
    name: 'Satın Alma',
    description: 'Tedarik zinciri ve satın alma süreçleri',
    icon: Package,
    path: '/purchase',
    tier: 'standard' as const,
    features: ['Tedarikçiler', 'Satın Alma Siparişleri', 'Mal Kabul', 'Ödemeler'],
  },
  {
    id: 'finance',
    code: 'FINANCE',
    name: 'Finans',
    description: 'Muhasebe, nakit akışı ve finansal yönetim',
    icon: Wallet,
    path: '/finance',
    tier: 'premium' as const,
    features: ['Hesap Planı', 'Fatura Yönetimi', 'Nakit Akışı', 'Banka İşlemleri'],
  },
  {
    id: 'analytics',
    code: 'REPORTS',
    name: 'Raporlama',
    description: 'İş zekası ve gelişmiş analitik',
    icon: BarChart3,
    path: '/analytics',
    tier: 'enterprise' as const,
    features: ['Dashboard Builder', 'KPI Takibi', 'Veri Görselleştirme', 'Export'],
  },
  {
    id: 'production',
    code: 'PROJECTS',
    name: 'Üretim',
    description: 'Üretim planlama ve kalite kontrol',
    icon: Settings,
    path: '/production',
    tier: 'enterprise' as const,
    features: ['Üretim Emirleri', 'Reçeteler', 'Kapasite Planlama', 'Kalite'],
  },
];

export default function ModulesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingModule, setTogglingModule] = useState<string | null>(null);
  const [activationModal, setActivationModal] = useState<{
    isOpen: boolean;
    moduleCode: string;
    moduleName: string;
  }>({ isOpen: false, moduleCode: '', moduleName: '' });

  const { data: modulesData, isLoading, refetch } = useActiveModules();
  const toggleModuleMutation = useToggleModule();

  // Create a Set of active module codes
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toUpperCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Build modules with active status
  const modules = useMemo(() => {
    return MODULE_DEFINITIONS.map(mod => ({
      ...mod,
      isActive: activeModuleCodes.has(mod.code.toUpperCase()),
    }));
  }, [activeModuleCodes]);

  // Filter modules
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(
      m => m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
    );
  }, [modules, searchQuery]);

  // Stats
  const activeCount = modules.filter(m => m.isActive).length;

  // Handlers
  const handleModuleOpen = (module: typeof modules[0]) => {
    if (module.isActive) {
      router.push(module.path);
    }
  };

  // Open activation modal with pricing info
  const openActivationModal = (moduleCode: string, moduleName: string) => {
    setActivationModal({
      isOpen: true,
      moduleCode,
      moduleName,
    });
  };

  // Close activation modal
  const closeActivationModal = () => {
    setActivationModal({ isOpen: false, moduleCode: '', moduleName: '' });
  };

  // Handle successful activation from modal
  const handleActivationSuccess = () => {
    refetch();
  };

  const handleToggleModule = async (moduleCode: string, checked: boolean) => {
    setTogglingModule(moduleCode);
    try {
      await toggleModuleMutation.mutateAsync({ moduleCode, enable: checked });
      const action = checked ? 'etkinleştirildi' : 'devre dışı bırakıldı';
      message.success(`Modül başarıyla ${action}`);
      refetch();
    } catch (error) {
      console.error('Module toggle error:', error);
      message.error('İşlem başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setTogglingModule(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Modül Yönetimi
        </h1>
        <p className="text-slate-500">
          İşletmeniz için ihtiyaç duyduğunuz modülleri yönetin ve yapılandırın
        </p>
      </div>

      {/* Stats & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium text-slate-900">{activeCount}</span>
          <span>/ {modules.length} modül aktif</span>
        </div>

        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Modül ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="max-w-xs"
        />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          const tier = TIER_CONFIG[module.tier];
          const isToggling = togglingModule === module.code;

          return (
            <div
              key={module.id}
              className={`
                bg-white rounded-xl border p-5 transition-all duration-200
                ${module.isActive
                  ? 'border-slate-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
                }
                ${isToggling ? 'opacity-70' : ''}
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{module.name}</h3>
                      <Tag color={tier.color} className="text-xs">
                        {tier.label}
                      </Tag>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{module.description}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Check className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={module.isActive}
                    onChange={(checked) => handleToggleModule(module.code, checked)}
                    size="small"
                    disabled={isToggling}
                    loading={isToggling}
                  />
                  <span className={`text-sm ${module.isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {module.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {module.isActive ? (
                  <button
                    onClick={() => handleModuleOpen(module)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Aç
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => openActivationModal(module.code, module.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Aktifleştir
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Modül bulunamadı
          </h3>
          <p className="text-slate-500">
            &ldquo;{searchQuery}&rdquo; için sonuç yok
          </p>
        </div>
      )}

      {/* Module Activation Modal */}
      <ModuleActivationModal
        moduleCode={activationModal.moduleCode}
        moduleName={activationModal.moduleName}
        isOpen={activationModal.isOpen}
        onClose={closeActivationModal}
        onSuccess={handleActivationSuccess}
      />
    </div>
  );
}
