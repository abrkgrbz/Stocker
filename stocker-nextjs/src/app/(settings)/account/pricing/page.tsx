'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Boxes,
  Puzzle,
  Check,
  Loader2,
  AlertCircle,
  Calculator,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Crown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  billingService,
  type ModulePricingItem,
  type ModuleBundleItem,
  type AddOnItem,
  type PriceLineItem,
} from '@/lib/api/services/billing.service';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

export default function PricingPage() {
  const [modules, setModules] = useState<ModulePricingItem[]>([]);
  const [bundles, setBundles] = useState<ModuleBundleItem[]>([]);
  const [addOns, setAddOns] = useState<AddOnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [userCount, setUserCount] = useState(1);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Price calculation state
  const [calculating, setCalculating] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<{
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    lineItems: PriceLineItem[];
  } | null>(null);

  // UI state
  const [showAddOns, setShowAddOns] = useState(false);

  // Fetch pricing data
  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await billingService.getFullPricing();
      const data = response as any;

      if (data.success) {
        setModules(data.modules || []);
        setBundles(data.bundles || []);
        setAddOns(data.addOns || []);
      } else {
        setError('Fiyat bilgileri yuklenemedi.');
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      setError('Fiyat bilgileri yuklenirken hata olustu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Calculate price when selection changes
  const calculatePrice = useCallback(async () => {
    // Don't calculate if nothing selected
    if (!selectedBundle && selectedModules.length === 0) {
      setCalculatedPrice(null);
      return;
    }

    try {
      setCalculating(true);

      const response = await billingService.calculatePrice({
        bundleCode: selectedBundle || undefined,
        moduleCodes: selectedModules,
        addOnCodes: selectedAddOns,
        userCount,
        billingCycle,
      });

      const data = response as any;
      if (data.success) {
        setCalculatedPrice({
          subtotal: data.subtotal,
          discount: data.discount,
          tax: data.tax,
          total: data.total,
          lineItems: data.lineItems || [],
        });
      }
    } catch (err) {
      console.error('Failed to calculate price:', err);
    } finally {
      setCalculating(false);
    }
  }, [selectedBundle, selectedModules, selectedAddOns, userCount, billingCycle]);

  useEffect(() => {
    const debounce = setTimeout(calculatePrice, 300);
    return () => clearTimeout(debounce);
  }, [calculatePrice]);

  // Format currency
  const formatPrice = (amount: number, cycle?: BillingCycle) => {
    const formatted = amount.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    if (cycle) {
      return `${formatted}/${cycle === 'monthly' ? 'ay' : 'yil'}`;
    }
    return formatted;
  };

  // Toggle module selection
  const toggleModule = (moduleCode: string) => {
    // If a bundle is selected, clear it first
    if (selectedBundle) {
      setSelectedBundle(null);
    }

    setSelectedModules((prev) =>
      prev.includes(moduleCode)
        ? prev.filter((c) => c !== moduleCode)
        : [...prev, moduleCode]
    );
  };

  // Select bundle
  const selectBundle = (bundleCode: string) => {
    if (selectedBundle === bundleCode) {
      setSelectedBundle(null);
    } else {
      setSelectedBundle(bundleCode);
      // Clear individual module selection when bundle is selected
      setSelectedModules([]);
    }
  };

  // Toggle add-on
  const toggleAddOn = (addOnCode: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnCode)
        ? prev.filter((c) => c !== addOnCode)
        : [...prev, addOnCode]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500">Fiyatlar yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={fetchPricing}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fiyatlandirma</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ihtiyaciniza uygun modulleri ve paketleri secin
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Aylik
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
              billingCycle === 'yearly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Yillik
            <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
              %20 Indirim
            </span>
          </button>
        </div>
      </div>

      {/* Bundles Section */}
      {bundles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Paketler</h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              Onerilen
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.map((bundle) => {
              const isSelected = selectedBundle === bundle.bundleCode;
              const price = billingCycle === 'yearly' ? bundle.yearlyPrice : bundle.monthlyPrice;

              return (
                <motion.div
                  key={bundle.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectBundle(bundle.bundleCode)}
                  className={cn(
                    'relative cursor-pointer rounded-xl border-2 p-6 transition-all',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  )}
                >
                  {/* Popular badge */}
                  {bundle.bundleCode === 'FULL_ERP' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        En Populer
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{bundle.bundleName}</h3>
                      <p className="text-sm text-slate-500 mt-1">{bundle.description}</p>
                    </div>
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300 bg-white'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatPrice(price)}
                      </span>
                      <span className="text-slate-500">/{billingCycle === 'monthly' ? 'ay' : 'yil'}</span>
                    </div>
                    {bundle.savingsAmount > 0 && (
                      <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        {formatPrice(bundle.savingsAmount)} tasarruf
                      </p>
                    )}
                  </div>

                  {/* Included modules */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Dahil Moduller:</p>
                    <div className="flex flex-wrap gap-1">
                      {bundle.moduleCodes.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded"
                        >
                          {modules.find((m) => m.moduleCode === code)?.moduleName || code}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Bireysel Moduller</h2>
          <span className="text-sm text-slate-500">(Ihtiyaciniza gore secin)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => {
            const isSelected = selectedModules.includes(module.moduleCode);
            const isInBundle = selectedBundle
              ? bundles.find((b) => b.bundleCode === selectedBundle)?.moduleCodes.includes(module.moduleCode)
              : false;
            const price = billingCycle === 'yearly' ? module.yearlyPrice : module.monthlyPrice;

            return (
              <motion.div
                key={module.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isInBundle && toggleModule(module.moduleCode)}
                className={cn(
                  'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                  isInBundle
                    ? 'border-emerald-300 bg-emerald-50/50 cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                {module.isCore && (
                  <div className="absolute -top-2 -right-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-white rounded-full">
                      Core
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {module.icon && <span className="text-xl">{module.icon}</span>}
                    <h3 className="font-semibold text-slate-900">{module.moduleName}</h3>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isInBundle
                        ? 'border-emerald-500 bg-emerald-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 bg-white'
                    )}
                  >
                    {(isSelected || isInBundle) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {module.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{module.description}</p>
                )}

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">{formatPrice(price)}</span>
                  <span className="text-xs text-slate-500">/{billingCycle === 'monthly' ? 'ay' : 'yil'}</span>
                </div>

                {isInBundle && (
                  <p className="text-xs text-emerald-600 mt-2">Pakete dahil</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add-ons Section */}
      {addOns.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddOns(!showAddOns)}
            className="flex items-center gap-2 w-full text-left"
          >
            <Zap className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Ek Ozellikler</h2>
            <span className="text-sm text-slate-500">({addOns.length} adet)</span>
            {showAddOns ? (
              <ChevronUp className="w-5 h-5 text-slate-400 ml-auto" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 ml-auto" />
            )}
          </button>

          <AnimatePresence>
            {showAddOns && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {addOns.map((addOn) => {
                  const isSelected = selectedAddOns.includes(addOn.code);
                  const price = billingCycle === 'yearly' && addOn.yearlyPrice
                    ? addOn.yearlyPrice
                    : addOn.monthlyPrice;

                  return (
                    <motion.div
                      key={addOn.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAddOn(addOn.code)}
                      className={cn(
                        'cursor-pointer rounded-xl border-2 p-4 transition-all',
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-500 uppercase">{addOn.type}</span>
                          <h3 className="font-semibold text-slate-900 mt-1">{addOn.name}</h3>
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                            isSelected
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {addOn.description && (
                        <p className="text-xs text-slate-500 mt-2">{addOn.description}</p>
                      )}

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900">{formatPrice(price)}</span>
                        <span className="text-xs text-slate-500">/{billingCycle === 'monthly' ? 'ay' : 'yil'}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price Calculator - Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* User Count */}
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-500" />
              <label className="text-sm font-medium text-slate-700">Kullanici Sayisi:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUserCount((c) => Math.max(1, c - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-slate-300 rounded-lg py-1.5"
                />
                <button
                  onClick={() => setUserCount((c) => c + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="flex items-center gap-6">
              {calculating ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : calculatedPrice ? (
                <>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Ara Toplam</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatPrice(calculatedPrice.subtotal)}
                    </p>
                  </div>
                  {calculatedPrice.discount > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-emerald-600">Indirim</p>
                      <p className="text-sm font-medium text-emerald-600">
                        -{formatPrice(calculatedPrice.discount)}
                      </p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-slate-500">KDV (%20)</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatPrice(calculatedPrice.tax)}
                    </p>
                  </div>
                  <div className="pl-4 border-l border-slate-200">
                    <p className="text-xs text-slate-500">Toplam</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatPrice(calculatedPrice.total, billingCycle)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Fiyat hesaplamak icin modul veya paket secin</p>
              )}

              <button
                disabled={!calculatedPrice}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Aboneligi Baslat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacer for fixed calculator */}
      <div className="h-24" />
    </div>
  );
}
