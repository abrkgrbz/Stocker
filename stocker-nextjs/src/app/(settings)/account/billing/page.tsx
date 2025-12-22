'use client';

/**
 * Billing Settings Page
 * Consistent with Profile Page Design Language
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

const invoices = [
  { id: 'INV-2024-001', date: '2024-01-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-012', date: '2023-12-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-011', date: '2023-11-15', amount: '₺2,499.00', status: 'paid' },
];

const planFeatures = [
  { icon: Users, label: '10 Kullanıcı', included: true },
  { icon: HardDrive, label: '50GB Depolama', included: true },
  { icon: Zap, label: 'API Erişimi', included: true },
  { icon: FileText, label: 'Gelişmiş Raporlar', included: true },
];

export default function BillingPage() {
  const [successMessage, setSuccessMessage] = useState('');

  const currentPlan = {
    name: 'Professional',
    price: '₺2,499',
    period: 'ay',
    nextBilling: '15 Şubat 2024',
    status: 'active',
  };

  const paymentMethod = {
    type: 'visa',
    last4: '4242',
    expiry: '12/2025',
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-lg"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-slate-900">{successMessage}</span>
        </motion.div>
      )}

      {/* Header Card - Plan Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl">
              <Crown className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{currentPlan.name}</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
                  Aktif
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{currentPlan.price}</span>
                <span className="text-slate-400">/{currentPlan.period}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Planları Karşılaştır
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              Planı Yükselt
            </button>
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

        {/* Next Billing */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>Sonraki fatura: <span className="font-medium text-slate-700">{currentPlan.nextBilling}</span></span>
          </div>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Aboneliği İptal Et
          </button>
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
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Düzenle
            </button>
          </div>
          <div className="p-6">
            {/* Current Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                <CreditCard className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">•••• •••• •••• {paymentMethod.last4}</p>
                <p className="text-xs text-slate-500">Son kullanma: {paymentMethod.expiry}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Add New Card */}
            <button className="mt-4 w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Kart Ekle
            </button>
          </div>
        </div>

        {/* Right: Billing Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Fatura Bilgileri</h2>
              <p className="text-xs text-slate-500 mt-0.5">Faturalarınızda görünecek bilgiler</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Düzenle
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Building className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Örnek Şirket A.Ş.</p>
                <p className="text-xs text-slate-500 mt-0.5">Vergi No: 1234567890</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">İstanbul, Türkiye</p>
                <p className="text-xs text-slate-500 mt-0.5">Örnek Mah. Test Sok. No: 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Fatura Geçmişi</h2>
            <p className="text-xs text-slate-500 mt-0.5">{invoices.length} fatura bulundu</p>
          </div>
          <button className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1">
            Tümünü Görüntüle <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{invoice.id}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(invoice.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-900">{invoice.amount}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {invoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Kullanım Özeti</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Kullanıcılar</span>
                <span className="text-sm font-medium text-slate-900">7/10</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Depolama</span>
                <span className="text-sm font-medium text-slate-900">32/50 GB</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
            {/* API Calls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">API İstekleri</span>
                <span className="text-sm font-medium text-slate-900">8,234/10,000</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
