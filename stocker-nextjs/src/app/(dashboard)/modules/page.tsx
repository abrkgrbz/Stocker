'use client';

/**
 * Modules Page - Marketplace
 * Updated to support new Pricing System (Modules, Bundles, Addons)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Switch, Tag, message, Tabs, Button, Card } from 'antd';
import {
  Search,
  Users,
  ShoppingCart,
  Boxes,
  Briefcase,
  Package,
  BarChart3,
  Wallet,
  Factory,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Plus,
  Info
} from 'lucide-react';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { useToggleModule } from '@/lib/api/hooks/useTenantModules';
import { marketplaceService, type ModulePricing, type BundlePricing, type AddOnPricing } from '@/lib/api/services/marketplaceService';
import ModuleActivationModal from '@/components/modules/ModuleActivationModal';

// Icon mapping helper
const getIcon = (iconName: string) => {
  const map: Record<string, any> = {
    '📦': Boxes,
    '💰': ShoppingCart,
    '🛒': Package,
    '💵': Wallet,
    '👥': Users,
    '🤝': Users,
    '🏭': Factory,
    '🚚': Package,
    '✅': Check,
    '📊': BarChart3,
  };
  return map[iconName] || Zap;
};

export default function ModulesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [modules, setModules] = useState<ModulePricing[]>([]);
  const [bundles, setBundles] = useState<BundlePricing[]>([]);
  const [addOns, setAddOns] = useState<AddOnPricing[]>([]);

  const [activationModal, setActivationModal] = useState<{
    isOpen: boolean;
    moduleCode: string;
    moduleName: string;
  }>({ isOpen: false, moduleCode: '', moduleName: '' });

  // User state
  const { data: activeModulesData, refetch: refetchActive } = useActiveModules();
  const toggleModuleMutation = useToggleModule();

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    setIsLoading(true);
    try {
      const [m, b, a] = await Promise.all([
        marketplaceService.getModules(),
        marketplaceService.getBundles(),
        marketplaceService.getAddOns()
      ]);
      setModules(m);
      setBundles(b);
      setAddOns(a);
    } catch (error) {
      console.error(error);
      message.error('Market verileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a module is active for the current tenant
  const isModuleActive = (code: string) => {
    return activeModulesData?.modules?.some(m => m.code === code && m.isActive) || false;
  };

  // Filtered Lists
  const filteredModules = useMemo(() => {
    let list = modules;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.moduleName.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return list;
  }, [modules, searchQuery]);

  const filteredBundles = useMemo(() => {
    let list = bundles;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => b.bundleName.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    return list;
  }, [bundles, searchQuery]);


  // Actions
  const handleToggleModule = async (moduleCode: string, checked: boolean) => {
    try {
      await toggleModuleMutation.mutateAsync({ moduleCode, enable: checked });
      message.success(checked ? 'Modül etkinleştirildi' : 'Modül devre dışı bırakıldı');
      refetchActive();
    } catch (error) {
      message.error('İşlem başarısız.');
    }
  };

  const handleBuyBundle = (bundle: BundlePricing) => {
    message.info(`${bundle.bundleName} satın alma akışı başlatılıyor... (Demo)`);
  };

  const handleBuyAddOn = (addOn: AddOnPricing) => {
    message.info(`${addOn.name} ekleme akışı başlatılıyor... (Demo)`);
  };

  // Close activation modal
  const closeActivationModal = () => {
    setActivationModal({ isOpen: false, moduleCode: '', moduleName: '' });
  };

  // Handle successful activation from modal
  const handleActivationSuccess = () => {
    refetchActive();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Modül Marketi</h1>
        <p className="text-slate-500">İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar.</p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'modules', label: 'Modüller' },
            { key: 'bundles', label: 'Paketler (Bundles)' },
            { key: 'addons', label: 'Eklentiler' },
          ]}
          className="w-full sm:w-auto"
        />
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Ara..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* MODULES */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map(module => {
              const Icon = getIcon(module.icon);
              const active = isModuleActive(module.moduleCode);

              return (
                <div key={module.id} className={`bg-white rounded-xl border p-6 transition-all ${active ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{module.moduleName}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{module.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Aylık</span>
                        <span className="font-semibold">₺{module.monthlyPrice}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch size="small" checked={active} onChange={(c) => handleToggleModule(module.moduleCode, c)} />
                        <span className="text-xs font-medium text-slate-600">{active ? 'Aktif' : 'Pasif'}</span>
                      </div>
                      {active && (
                        <Button size="small" type="text" onClick={() => router.push(`/${module.moduleCode.toLowerCase()}`)}>
                          Git <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BUNDLES */}
        {activeTab === 'bundles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.map(bundle => (
              <div key={bundle.id} className="bg-white rounded-xl border border-slate-200 p-6 relative overflow-hidden group hover:shadow-lg transition-all">
                {bundle.discountPercent > 0 && (
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                    %{bundle.discountPercent} İndirim
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{bundle.bundleName}</h3>
                <p className="text-slate-500 text-sm mb-6">{bundle.description}</p>

                <div className="mb-6 space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400">İçerik</p>
                  <div className="flex flex-wrap gap-2">
                    {bundle.moduleCodes.map(code => (
                      <span key={code} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {modules.find(m => m.moduleCode === code)?.moduleName || code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₺{bundle.monthlyPrice}<span className="text-sm font-normal text-slate-500">/ay</span></p>
                  </div>
                  <Button type="primary" className="bg-slate-900" onClick={() => handleBuyBundle(bundle)}>
                    Satın Al
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADDONS */}
        {activeTab === 'addons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map(addon => (
              <div key={addon.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">{addon.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-1">{addon.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-bold">₺{addon.monthlyPrice}/ay</span>
                  <Button size="small" onClick={() => handleBuyAddOn(addon)}>Ekle</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
