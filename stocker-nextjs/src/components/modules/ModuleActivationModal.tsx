'use client';

/**
 * Module Activation Modal
 * Displays module details, pricing, and activation options
 * Modern, clean design following Linear/Stripe patterns
 */

import React, { useMemo, useState } from 'react';
import { Modal, Spin, Tag, Radio, Button, message } from 'antd';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  AlertCircle,
  ArrowRight,
  Clock,
  CreditCard,
  Gift,
} from 'lucide-react';
import { useModuleDefinition, useModulePrice } from '@/lib/api/hooks/useModulePricing';
import { useToggleModule } from '@/lib/api/hooks/useTenantModules';

// =====================================
// TYPES
// =====================================

interface ModuleActivationModalProps {
  moduleCode: string;
  moduleName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isIncludedInPackage?: boolean; // If included in current subscription package
}

type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

// =====================================
// HELPER COMPONENTS
// =====================================

const PriceBadge = ({ discount }: { discount: number }) => {
  if (discount === 0) return null;
  return (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
      %{discount} indirim
    </span>
  );
};

const FeatureItem = ({ feature }: { feature: string }) => (
  <li className="flex items-start gap-2 text-sm text-slate-600">
    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
    <span>{feature}</span>
  </li>
);

// =====================================
// MAIN COMPONENT
// =====================================

export default function ModuleActivationModal({
  moduleCode,
  moduleName,
  isOpen,
  onClose,
  onSuccess,
  isIncludedInPackage = false,
}: ModuleActivationModalProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [isActivating, setIsActivating] = useState(false);
  const [activationType, setActivationType] = useState<'paid' | 'trial'>('paid');

  // Fetch module definition with pricing
  const { data: moduleInfo, isLoading: isLoadingModule } = useModuleDefinition(moduleCode);

  // Fetch calculated price
  const { data: priceInfo, isLoading: isLoadingPrice } = useModulePrice([moduleCode]);

  // Toggle module mutation
  const toggleModuleMutation = useToggleModule();

  // Calculate displayed price based on billing cycle
  const displayedPrice = useMemo(() => {
    if (!priceInfo) return { price: 0, originalPrice: 0, discount: 0 };

    switch (billingCycle) {
      case 'quarterly':
        return {
          price: priceInfo.quarterlyTotal,
          originalPrice: priceInfo.monthlyTotal * 3,
          discount: priceInfo.quarterlyDiscount,
          perMonth: priceInfo.quarterlyTotal / 3,
        };
      case 'semiannual':
        return {
          price: priceInfo.semiAnnualTotal,
          originalPrice: priceInfo.monthlyTotal * 6,
          discount: priceInfo.semiAnnualDiscount,
          perMonth: priceInfo.semiAnnualTotal / 6,
        };
      case 'annual':
        return {
          price: priceInfo.annualTotal,
          originalPrice: priceInfo.monthlyTotal * 12,
          discount: priceInfo.annualDiscount,
          perMonth: priceInfo.annualTotal / 12,
        };
      default:
        return {
          price: priceInfo.monthlyTotal,
          originalPrice: priceInfo.monthlyTotal,
          discount: 0,
          perMonth: priceInfo.monthlyTotal,
        };
    }
  }, [priceInfo, billingCycle]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: priceInfo?.currency || 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle activation
  const handleActivate = async () => {
    setIsActivating(true);
    try {
      if (isIncludedInPackage || activationType === 'trial') {
        // Direct activation (included in package or trial)
        await toggleModuleMutation.mutateAsync({ moduleCode, enable: true });
        message.success(
          activationType === 'trial'
            ? `${moduleName} modülü 14 günlük deneme süresiyle aktifleştirildi`
            : `${moduleName} modülü başarıyla aktifleştirildi`
        );
        onSuccess?.();
        onClose();
      } else {
        // Redirect to payment (LemonSqueezy or internal checkout)
        // For now, show a message - this will be connected to LemonSqueezy
        message.info('Ödeme sayfasına yönlendiriliyorsunuz...');

        // TODO: Implement LemonSqueezy checkout
        // window.location.href = `https://stoocker.lemonsqueezy.com/checkout/buy/${moduleInfo?.lemonSqueezyVariantId}`;

        // For demo, activate directly
        await toggleModuleMutation.mutateAsync({ moduleCode, enable: true });
        message.success(`${moduleName} modülü başarıyla aktifleştirildi`);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Activation error:', error);
      message.error('Modül aktifleştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsActivating(false);
    }
  };

  // Loading state
  const isLoading = isLoadingModule || isLoadingPrice;

  // Tier icon based on module category/tier
  const TierIcon = moduleInfo?.isCore ? Zap : moduleInfo?.category === 'premium' ? Crown : Sparkles;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      className="module-activation-modal"
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 16, overflow: 'hidden' },
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TierIcon className="w-5 h-5 text-amber-400" />
                  <Tag color="gold" className="text-xs border-0">
                    {moduleInfo?.category || 'Standard'}
                  </Tag>
                </div>
                <h2 className="text-2xl font-bold mb-1">{moduleInfo?.name || moduleName}</h2>
                <p className="text-slate-300 text-sm">{moduleInfo?.description}</p>
              </div>
            </div>

            {/* Price Display */}
            {!isIncludedInPackage && (
              <div className="mt-6 bg-white/10 rounded-xl p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{formatCurrency(displayedPrice.perMonth || 0)}</span>
                  <span className="text-slate-300 text-sm">/ ay</span>
                  {displayedPrice.discount > 0 && (
                    <PriceBadge discount={displayedPrice.discount} />
                  )}
                </div>
                {billingCycle !== 'monthly' && (
                  <p className="text-slate-400 text-xs mt-1">
                    {formatCurrency(displayedPrice.price)} toplam ({billingCycle === 'quarterly' ? '3 ay' : billingCycle === 'semiannual' ? '6 ay' : '12 ay'})
                  </p>
                )}
              </div>
            )}

            {/* Included in Package Badge */}
            {isIncludedInPackage && (
              <div className="mt-6 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4 flex items-center gap-3">
                <Gift className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-100">Paketinize Dahil</p>
                  <p className="text-emerald-200/70 text-xs">Bu modül mevcut aboneliğinize dahildir</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Dahil Olan Özellikler</h3>
              <ul className="space-y-2">
                {moduleInfo?.features?.map((feature, idx) => (
                  <FeatureItem key={idx} feature={feature.featureName} />
                )) || (
                  <>
                    <FeatureItem feature="Temel modül özellikleri" />
                    <FeatureItem feature="Raporlama ve analitik" />
                    <FeatureItem feature="API erişimi" />
                  </>
                )}
              </ul>
            </div>

            {/* Dependencies Warning */}
            {moduleInfo?.dependencies && moduleInfo.dependencies.length > 0 && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Bağımlı Modüller</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Bu modül için şu modüller de gereklidir: {moduleInfo.dependencies.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Cycle Selection (only if not included in package) */}
            {!isIncludedInPackage && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Ödeme Dönemi</h3>
                <Radio.Group
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Radio.Button value="monthly" className="h-auto py-2 px-3 text-center">
                      <div className="text-sm font-medium">Aylık</div>
                      <div className="text-xs text-slate-500">{formatCurrency(priceInfo?.monthlyTotal || 0)}</div>
                    </Radio.Button>
                    <Radio.Button value="quarterly" className="h-auto py-2 px-3 text-center">
                      <div className="text-sm font-medium">3 Aylık</div>
                      <div className="text-xs text-slate-500">%{priceInfo?.quarterlyDiscount || 10} indirim</div>
                    </Radio.Button>
                    <Radio.Button value="semiannual" className="h-auto py-2 px-3 text-center">
                      <div className="text-sm font-medium">6 Aylık</div>
                      <div className="text-xs text-slate-500">%{priceInfo?.semiAnnualDiscount || 15} indirim</div>
                    </Radio.Button>
                    <Radio.Button value="annual" className="h-auto py-2 px-3 text-center relative">
                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-medium rounded-full">
                        Popüler
                      </div>
                      <div className="text-sm font-medium">Yıllık</div>
                      <div className="text-xs text-slate-500">%{priceInfo?.annualDiscount || 20} indirim</div>
                    </Radio.Button>
                  </div>
                </Radio.Group>
              </div>
            )}

            {/* Activation Type Selection (only if not included in package) */}
            {!isIncludedInPackage && (
              <div className="mb-6">
                <Radio.Group
                  value={activationType}
                  onChange={(e) => setActivationType(e.target.value)}
                  className="w-full"
                >
                  <div className="space-y-2">
                    <label
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        activationType === 'trial'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Radio value="trial" />
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">14 Gün Ücretsiz Dene</p>
                        <p className="text-xs text-slate-500">Kredi kartı gerekmez</p>
                      </div>
                      <Tag color="blue">Ücretsiz</Tag>
                    </label>
                    <label
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                        activationType === 'paid'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Radio value="paid" />
                      <CreditCard className="w-5 h-5 text-emerald-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">Hemen Satın Al</p>
                        <p className="text-xs text-slate-500">Tam erişim, sınırsız kullanım</p>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(displayedPrice.perMonth || 0)}/ay
                      </span>
                    </label>
                  </div>
                </Radio.Group>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Vazgeç
            </button>
            <Button
              type="primary"
              size="large"
              onClick={handleActivate}
              loading={isActivating}
              className="bg-slate-900 hover:bg-slate-800 border-0 h-11 px-6 rounded-lg font-medium"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="end"
            >
              {isIncludedInPackage
                ? 'Modülü Aktifleştir'
                : activationType === 'trial'
                ? 'Denemeyi Başlat'
                : 'Satın Al'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
