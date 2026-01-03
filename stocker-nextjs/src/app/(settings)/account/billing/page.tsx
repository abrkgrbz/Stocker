'use client';

/**
 * Billing Settings Page
 * Integrated with Lemon Squeezy via billing.service.ts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  FileText,
  Download,
  CheckCircle,
  Calendar,
  Building,
  Crown,
  Zap,
  Users,
  HardDrive,
  ChevronRight,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Pause,
  Play,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { billingService, type SubscriptionDto, type PlanDto } from '@/lib/api/services/billing.service';
import { showAlert } from '@/lib/utils/alerts';

// Plan features based on subscription
const getPlanFeatures = (planName: string) => {
  const features: { icon: LucideIcon; label: string; included: boolean }[] = [];

  if (planName.toLowerCase().includes('starter') || planName.toLowerCase().includes('basic')) {
    features.push(
      { icon: Users, label: '5 Kullanıcı', included: true },
      { icon: HardDrive, label: '10GB Depolama', included: true },
      { icon: Zap, label: 'Temel API Erişimi', included: true },
      { icon: FileText, label: 'Standart Raporlar', included: true },
    );
  } else if (planName.toLowerCase().includes('professional') || planName.toLowerCase().includes('pro')) {
    features.push(
      { icon: Users, label: '25 Kullanıcı', included: true },
      { icon: HardDrive, label: '50GB Depolama', included: true },
      { icon: Zap, label: 'Gelişmiş API Erişimi', included: true },
      { icon: FileText, label: 'Gelişmiş Raporlar', included: true },
    );
  } else if (planName.toLowerCase().includes('enterprise') || planName.toLowerCase().includes('business')) {
    features.push(
      { icon: Users, label: 'Sınırsız Kullanıcı', included: true },
      { icon: HardDrive, label: '500GB Depolama', included: true },
      { icon: Zap, label: 'Tam API Erişimi', included: true },
      { icon: FileText, label: 'Özel Raporlar', included: true },
    );
  } else {
    features.push(
      { icon: Users, label: '10 Kullanıcı', included: true },
      { icon: HardDrive, label: '25GB Depolama', included: true },
      { icon: Zap, label: 'API Erişimi', included: true },
      { icon: FileText, label: 'Raporlar', included: true },
    );
  }

  return features;
};

// Format currency
const formatCurrency = (amount: number, currency: string = 'USD') => {
  const currencyMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    TRY: '₺',
    GBP: '£',
  };
  const symbol = currencyMap[currency.toUpperCase()] || currency;
  return `${symbol}${(amount / 100).toFixed(2)}`;
};

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Status badge component
const StatusBadge = ({ status, isPaused, isCancelled }: { status: string; isPaused?: boolean; isCancelled?: boolean }) => {
  if (isCancelled) {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full">
        İptal Edildi
      </span>
    );
  }
  if (isPaused) {
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600 rounded-full">
        Duraklatıldı
      </span>
    );
  }

  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Aktif' },
    on_trial: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Deneme' },
    deneme: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Deneme' },
    trial: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Deneme' },
    past_due: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Ödeme Bekliyor' },
    unpaid: { bg: 'bg-red-50', text: 'text-red-600', label: 'Ödenmedi' },
    cancelled: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'İptal Edildi' },
    expired: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Süresi Doldu' },
  };

  const statusStyle = statusMap[status.toLowerCase()] || { bg: 'bg-blue-50', text: 'text-blue-600', label: status };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} rounded-full`}>
      {statusStyle.label}
    </span>
  );
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch subscription data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionRes, plansRes] = await Promise.all([
        billingService.getSubscription(),
        billingService.getPlans(),
      ]);

      // Handle subscription response - API returns { success, subscription } directly
      const subData = subscriptionRes as any;
      if (subData.success && (subData.subscription || subData.data?.subscription)) {
        setSubscription(subData.subscription || subData.data?.subscription);
      }

      // Handle plans response - API returns { success, plans } directly
      const plansData = plansRes as any;
      if (plansData.success && (plansData.plans || plansData.data?.plans)) {
        setPlans(plansData.plans || plansData.data?.plans);
      }
    } catch (err) {
      console.error('Failed to fetch billing data:', err);
      setError('Fatura bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show success toast
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    const confirmed = await showAlert.confirm(
      'Aboneliği İptal Et',
      'Aboneliğinizi iptal etmek istediğinizden emin misiniz? Mevcut dönem sonuna kadar erişiminiz devam edecektir.'
    );

    if (!confirmed) return;

    try {
      setActionLoading('cancel');
      const response = await billingService.cancelSubscription();

      if (response.success) {
        showSuccess('Abonelik başarıyla iptal edildi.');
        await fetchData();
      } else {
        await showAlert.error('Hata', response.message || 'Abonelik iptal edilemedi.');
      }
    } catch (err) {
      console.error('Cancel subscription error:', err);
      await showAlert.error('Hata', 'Abonelik iptal edilirken bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle pause subscription
  const handlePauseSubscription = async () => {
    const confirmed = await showAlert.confirm(
      'Aboneliği Duraklat',
      'Aboneliğinizi duraklatmak istediğinizden emin misiniz?'
    );

    if (!confirmed) return;

    try {
      setActionLoading('pause');
      const response = await billingService.pauseSubscription();

      if (response.success) {
        showSuccess('Abonelik başarıyla duraklatıldı.');
        await fetchData();
      } else {
        await showAlert.error('Hata', response.message || 'Abonelik duraklatılamadı.');
      }
    } catch (err) {
      console.error('Pause subscription error:', err);
      await showAlert.error('Hata', 'Abonelik duraklatılırken bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle resume subscription
  const handleResumeSubscription = async () => {
    try {
      setActionLoading('resume');
      const response = await billingService.resumeSubscription();

      if (response.success) {
        showSuccess('Abonelik başarıyla devam ettirildi.');
        await fetchData();
      } else {
        await showAlert.error('Hata', response.message || 'Abonelik devam ettirilemedi.');
      }
    } catch (err) {
      console.error('Resume subscription error:', err);
      await showAlert.error('Hata', 'Abonelik devam ettirilirken bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  // Check if user is on trial (no LemonSqueezy subscription yet)
  const isTrialUser = subscription?.status?.toLowerCase() === 'deneme' ||
                      subscription?.status?.toLowerCase() === 'trial' ||
                      subscription?.status?.toLowerCase() === 'on_trial';

  // Handle open customer portal
  const handleOpenPortal = async () => {
    // Trial users don't have LemonSqueezy portal access
    if (isTrialUser) {
      await showAlert.info(
        'Deneme Sürümü',
        'Müşteri portalı ücretli abonelik başladıktan sonra kullanılabilir olacaktır. Bir plan seçerek aboneliğinizi başlatabilirsiniz.'
      );
      return;
    }

    try {
      setActionLoading('portal');

      // First check if subscription has a portal URL
      if (subscription?.customerPortalUrl) {
        window.open(subscription.customerPortalUrl, '_blank');
        return;
      }

      // Otherwise fetch from API
      const response = await billingService.getCustomerPortal();

      // Handle response - API returns { success, portalUrl } directly
      const portalData = response as any;
      if (portalData.success && (portalData.portalUrl || portalData.data?.portalUrl)) {
        window.open(portalData.portalUrl || portalData.data?.portalUrl, '_blank');
      } else {
        await showAlert.error('Hata', 'Müşteri portalı açılamadı.');
      }
    } catch (err) {
      console.error('Open portal error:', err);
      await showAlert.error('Hata', 'Müşteri portalı açılırken bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle update payment method
  const handleUpdatePayment = async () => {
    // Trial users don't have payment method yet
    if (isTrialUser) {
      await showAlert.info(
        'Deneme Sürümü',
        'Ödeme yöntemi eklemek için önce bir plan seçmeniz gerekmektedir.'
      );
      return;
    }

    if (subscription?.updatePaymentMethodUrl) {
      window.open(subscription.updatePaymentMethodUrl, '_blank');
    } else {
      await handleOpenPortal();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500">Fatura bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !subscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-sm text-slate-600">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Henüz Bir Aboneliğiniz Yok</h2>
          <p className="text-slate-500 mb-6">
            Stocker&apos;ın tüm özelliklerinden yararlanmak için bir plan seçin.
          </p>

          {/* Available Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.variantId}
                className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-900">{plan.productName}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.variantName}</p>
                <p className="text-2xl font-bold text-slate-900 mt-4">
                  {plan.priceFormatted || formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-slate-500">
                    /{plan.interval === 'month' ? 'ay' : plan.interval === 'year' ? 'yıl' : plan.interval}
                  </span>
                </p>
                <button
                  onClick={async () => {
                    try {
                      setActionLoading(`checkout-${plan.variantId}`);
                      const response = await billingService.createCheckout({
                        variantId: plan.variantId,
                        successUrl: `${window.location.origin}/account/billing?success=true`,
                        cancelUrl: `${window.location.origin}/account/billing?cancelled=true`,
                      });

                      if (response.success && response.data?.checkoutUrl) {
                        window.location.href = response.data.checkoutUrl;
                      } else {
                        await showAlert.error('Hata', 'Ödeme sayfası açılamadı.');
                      }
                    } catch (err) {
                      console.error('Checkout error:', err);
                      await showAlert.error('Hata', 'Bir hata oluştu.');
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  disabled={actionLoading === `checkout-${plan.variantId}`}
                  className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading === `checkout-${plan.variantId}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Planı Seç'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const planFeatures = getPlanFeatures(subscription.productName);
  const billingIntervalText = subscription.billingInterval === 'month' ? 'ay' :
                              subscription.billingInterval === 'year' ? 'yıl' :
                              subscription.billingInterval;

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-lg"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-slate-900">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card - Plan Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl">
              <Crown className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  {subscription.productName} - {subscription.variantName}
                </h1>
                <StatusBadge
                  status={subscription.status}
                  isPaused={subscription.isPaused}
                  isCancelled={subscription.isCancelled}
                />
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(subscription.unitPrice, subscription.currency)}
                </span>
                <span className="text-slate-400">/{billingIntervalText}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenPortal}
              disabled={actionLoading === 'portal'}
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Müşteri Portalı
                </>
              )}
            </button>
            {!subscription.isCancelled && (
              <button
                onClick={handleOpenPortal}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Planı Yükselt
              </button>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {planFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">{feature.label}</span>
              </div>
            );
          })}
        </div>

        {/* Subscription Info & Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {subscription.trialEndsAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Deneme bitiş: <span className="font-medium text-slate-700">{formatDate(subscription.trialEndsAt)}</span></span>
              </div>
            )}
            {subscription.renewsAt && !subscription.isCancelled && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Sonraki fatura: <span className="font-medium text-slate-700">{formatDate(subscription.renewsAt)}</span></span>
              </div>
            )}
            {subscription.endsAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Bitiş tarihi: <span className="font-medium text-slate-700">{formatDate(subscription.endsAt)}</span></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Pause/Resume Button */}
            {!subscription.isCancelled && (
              subscription.isPaused ? (
                <button
                  onClick={handleResumeSubscription}
                  disabled={actionLoading === 'resume'}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {actionLoading === 'resume' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Devam Ettir
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePauseSubscription}
                  disabled={actionLoading === 'pause'}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {actionLoading === 'pause' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Duraklat
                    </>
                  )}
                </button>
              )
            )}

            {/* Cancel Button */}
            {!subscription.isCancelled && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Aboneliği İptal Et
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment Method */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Ödeme Yöntemi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Aktif ödeme kartınız</p>
            </div>
            <button
              onClick={handleUpdatePayment}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Düzenle
            </button>
          </div>
          <div className="p-6">
            {/* Current Card */}
            {subscription.cardBrand && subscription.cardLastFour ? (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {subscription.cardBrand} •••• {subscription.cardLastFour}
                  </p>
                  <p className="text-xs text-slate-500">Kayıtlı kart</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Kart bilgisi yok</p>
                  <p className="text-xs text-slate-400">Lemon Squeezy portalından ekleyebilirsiniz</p>
                </div>
              </div>
            )}

            {/* Add/Update Card via Portal */}
            <button
              onClick={handleUpdatePayment}
              className="mt-4 w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {subscription.cardLastFour ? 'Ödeme Yöntemini Güncelle' : 'Ödeme Yöntemi Ekle'}
            </button>
          </div>
        </div>

        {/* Right: Subscription Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Abonelik Bilgileri</h2>
              <p className="text-xs text-slate-500 mt-0.5">Abonelik detayları</p>
            </div>
            <button
              onClick={handleOpenPortal}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Portalda Görüntüle <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Building className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Abonelik ID</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{subscription.id}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Durum</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {subscription.statusFormatted || subscription.status}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Fatura Döngüsü</p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">{billingIntervalText}lık</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Hızlı İşlemler</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleOpenPortal}
              disabled={actionLoading === 'portal'}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <div className="p-2 bg-blue-50 rounded-lg">
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Müşteri Portalı</p>
                <p className="text-xs text-slate-500">Tüm fatura ve abonelik işlemleri</p>
              </div>
            </button>

            <button
              onClick={handleUpdatePayment}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Ödeme Yöntemi</p>
                <p className="text-xs text-slate-500">Kart bilgilerini güncelle</p>
              </div>
            </button>

            <button
              onClick={handleOpenPortal}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-amber-50 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Fatura Geçmişi</p>
                <p className="text-xs text-slate-500">Tüm faturaları görüntüle</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Available Plans for Upgrade */}
      {plans.length > 0 && !subscription.isCancelled && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Mevcut Planlar</h2>
              <p className="text-xs text-slate-500 mt-0.5">Plan değiştirmek için bir seçenek seçin</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan = plan.variantId === subscription.id ||
                                     (plan.productName === subscription.productName && plan.variantName === subscription.variantName);

                return (
                  <div
                    key={plan.variantId}
                    className={`border rounded-xl p-4 transition-colors ${
                      isCurrentPlan
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-900">{plan.productName}</h3>
                      {isCurrentPlan && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                          Mevcut
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{plan.variantName}</p>
                    <p className="text-lg font-bold text-slate-900 mt-2">
                      {plan.priceFormatted || formatCurrency(plan.price)}
                      <span className="text-xs font-normal text-slate-500">
                        /{plan.interval === 'month' ? 'ay' : plan.interval === 'year' ? 'yıl' : plan.interval}
                      </span>
                    </p>
                    {!isCurrentPlan && (
                      <button
                        onClick={async () => {
                          // Trial users need to go through checkout, not change-plan
                          if (isTrialUser) {
                            const confirmed = await showAlert.confirm(
                              'Abonelik Başlat',
                              `${plan.productName} - ${plan.variantName} planına abone olmak istediğinizden emin misiniz?`
                            );

                            if (!confirmed) return;

                            try {
                              setActionLoading(`checkout-${plan.variantId}`);
                              const response = await billingService.createCheckout({
                                variantId: plan.variantId,
                                successUrl: `${window.location.origin}/account/billing?success=true`,
                                cancelUrl: `${window.location.origin}/account/billing?cancelled=true`,
                              });

                              // Handle response - API returns { success, checkoutUrl } directly
                              const checkoutData = response as any;
                              if (checkoutData.success && (checkoutData.checkoutUrl || checkoutData.data?.checkoutUrl)) {
                                window.location.href = checkoutData.checkoutUrl || checkoutData.data?.checkoutUrl;
                              } else {
                                await showAlert.error('Hata', 'Ödeme sayfası açılamadı.');
                              }
                            } catch (err) {
                              console.error('Checkout error:', err);
                              await showAlert.error('Hata', 'Bir hata oluştu.');
                            } finally {
                              setActionLoading(null);
                            }
                            return;
                          }

                          // Paid users can change plan
                          const confirmed = await showAlert.confirm(
                            'Plan Değiştir',
                            `${plan.productName} - ${plan.variantName} planına geçmek istediğinizden emin misiniz?`
                          );

                          if (!confirmed) return;

                          try {
                            setActionLoading(`change-${plan.variantId}`);
                            const response = await billingService.changePlan({ newVariantId: plan.variantId });

                            // Handle response format
                            const changeData = response as any;
                            if (changeData.success) {
                              showSuccess('Plan başarıyla değiştirildi.');
                              await fetchData();
                            } else {
                              await showAlert.error('Hata', changeData.message || changeData.error || 'Plan değiştirilemedi.');
                            }
                          } catch (err) {
                            console.error('Change plan error:', err);
                            await showAlert.error('Hata', 'Plan değiştirilirken bir hata oluştu.');
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        disabled={actionLoading === `change-${plan.variantId}` || actionLoading === `checkout-${plan.variantId}`}
                        className="mt-3 w-full px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {(actionLoading === `change-${plan.variantId}` || actionLoading === `checkout-${plan.variantId}`) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          isTrialUser ? 'Abone Ol' : 'Bu Plana Geç'
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
