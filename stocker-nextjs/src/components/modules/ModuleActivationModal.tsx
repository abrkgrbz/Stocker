'use client';

/**
 * Module Activation Modal
 * Displays module details, pricing, and activation options
 * Uses project's Headless UI Modal primitive
 */

import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/primitives/overlay/Modal';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon,
  CreditCardIcon,
  GiftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
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
  isIncludedInPackage?: boolean;
}

type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
type ActivationType = 'trial' | 'paid';

// =====================================
// BILLING CYCLE OPTIONS
// =====================================

const BILLING_OPTIONS: { value: BillingCycle; label: string; popular?: boolean }[] = [
  { value: 'monthly', label: 'Aylık' },
  { value: 'quarterly', label: '3 Aylık' },
  { value: 'semiannual', label: '6 Aylık' },
  { value: 'annual', label: 'Yıllık', popular: true },
];

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
  const [activationType, setActivationType] = useState<ActivationType>('trial');

  // Fetch module definition with pricing
  const { data: moduleInfo, isLoading: isLoadingModule } = useModuleDefinition(moduleCode);

  // Fetch calculated price
  const { data: priceInfo, isLoading: isLoadingPrice } = useModulePrice([moduleCode]);

  // Toggle module mutation
  const toggleModuleMutation = useToggleModule();

  // Calculate displayed price based on billing cycle
  const displayedPrice = useMemo(() => {
    if (!priceInfo) return { price: 0, originalPrice: 0, discount: 0, perMonth: 0 };

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

  // Get discount text for billing cycle
  const getDiscountText = (cycle: BillingCycle) => {
    if (!priceInfo) return '';
    switch (cycle) {
      case 'quarterly':
        return `%${priceInfo.quarterlyDiscount || 10} indirim`;
      case 'semiannual':
        return `%${priceInfo.semiAnnualDiscount || 15} indirim`;
      case 'annual':
        return `%${priceInfo.annualDiscount || 20} indirim`;
      default:
        return formatCurrency(priceInfo.monthlyTotal);
    }
  };

  // Handle activation
  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await toggleModuleMutation.mutateAsync({ moduleCode, enable: true });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Activation error:', error);
    } finally {
      setIsActivating(false);
    }
  };

  // Loading state
  const isLoading = isLoadingModule || isLoadingPrice;

  // Get button text
  const getButtonText = () => {
    if (isIncludedInPackage) return 'Modülü Aktifleştir';
    if (activationType === 'trial') return 'Denemeyi Başlat';
    return 'Satın Al';
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      showClose={true}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-sm text-slate-500">Yükleniyor...</span>
          </div>
        </div>
      ) : (
        <div className="-m-4">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
                {moduleInfo?.category || 'Standard'}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-1">{moduleInfo?.name || moduleName}</h2>
            <p className="text-slate-400 text-sm">{moduleInfo?.description}</p>

            {/* Price Display */}
            {!isIncludedInPackage && priceInfo && (
              <div className="mt-5 bg-white/10 rounded-lg p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(displayedPrice.perMonth)}</span>
                  <span className="text-slate-400 text-sm">/ ay</span>
                  {displayedPrice.discount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full">
                      %{displayedPrice.discount} indirim
                    </span>
                  )}
                </div>
                {billingCycle !== 'monthly' && (
                  <p className="text-slate-400 text-xs mt-1">
                    {formatCurrency(displayedPrice.price)} toplam (
                    {billingCycle === 'quarterly' ? '3 ay' : billingCycle === 'semiannual' ? '6 ay' : '12 ay'})
                  </p>
                )}
              </div>
            )}

            {/* Included in Package Badge */}
            {isIncludedInPackage && (
              <div className="mt-5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                <GiftIcon className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-100">Paketinize Dahil</p>
                  <p className="text-emerald-300/70 text-xs">Bu modül mevcut aboneliğinize dahildir</p>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Features */}
            <div className="mb-5">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Dahil Olan Özellikler</h3>
              <ul className="space-y-2">
                {moduleInfo?.features?.length ? (
                  moduleInfo.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature.featureName}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Temel modül özellikleri</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Raporlama ve analitik</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>API erişimi</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Dependencies Warning */}
            {moduleInfo?.dependencies && moduleInfo.dependencies.length > 0 && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Bağımlı Modüller</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Bu modül için şu modüller de gereklidir: {moduleInfo.dependencies.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Cycle Selection */}
            {!isIncludedInPackage && (
              <div className="mb-5">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Ödeme Dönemi</h3>
                <div className="grid grid-cols-4 gap-2">
                  {BILLING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBillingCycle(option.value)}
                      className={cn(
                        'relative py-2 px-3 rounded-lg border text-center transition-all',
                        billingCycle === option.value
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      )}
                    >
                      {option.popular && (
                        <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-medium rounded-full">
                          Popüler
                        </span>
                      )}
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className={cn(
                        'text-xs mt-0.5',
                        billingCycle === option.value ? 'text-slate-300' : 'text-slate-500'
                      )}>
                        {getDiscountText(option.value)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Activation Type Selection */}
            {!isIncludedInPackage && (
              <div className="space-y-2">
                {/* Trial Option */}
                <button
                  type="button"
                  onClick={() => setActivationType('trial')}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 border rounded-lg text-left transition-all',
                    activationType === 'trial'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    activationType === 'trial' ? 'border-slate-900' : 'border-slate-300'
                  )}>
                    {activationType === 'trial' && (
                      <div className="w-2 h-2 rounded-full bg-slate-900" />
                    )}
                  </div>
                  <ClockIcon className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">14 Gün Ücretsiz Dene</p>
                    <p className="text-xs text-slate-500">Kredi kartı gerekmez</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                    Ücretsiz
                  </span>
                </button>

                {/* Paid Option */}
                <button
                  type="button"
                  onClick={() => setActivationType('paid')}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 border rounded-lg text-left transition-all',
                    activationType === 'paid'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    activationType === 'paid' ? 'border-slate-900' : 'border-slate-300'
                  )}>
                    {activationType === 'paid' && (
                      <div className="w-2 h-2 rounded-full bg-slate-900" />
                    )}
                  </div>
                  <CreditCardIcon className="w-5 h-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Hemen Satın Al</p>
                    <p className="text-xs text-slate-500">Tam erişim, sınırsız kullanım</p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(displayedPrice.perMonth)}/ay
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleActivate}
              disabled={isActivating}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
                'text-sm font-medium text-white',
                'bg-slate-900 hover:bg-slate-800',
                'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
                'transition-colors',
                isActivating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isActivating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  {getButtonText()}
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
