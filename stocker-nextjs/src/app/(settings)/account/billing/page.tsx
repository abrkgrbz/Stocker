'use client';

import React from 'react';
import { CreditCard, FileText, Download, CheckCircle, AlertCircle, Calendar, Building } from 'lucide-react';

const invoices = [
  { id: 'INV-2024-001', date: '2024-01-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-012', date: '2023-12-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-011', date: '2023-11-15', amount: '₺2,499.00', status: 'paid' },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Faturalandırma</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Abonelik ve ödeme bilgilerinizi yönetin
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm">Mevcut Plan</p>
            <h3 className="text-2xl font-bold mt-1">Professional</h3>
            <p className="text-blue-100 text-sm mt-2">Aylık ₺2,499.00</p>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            Aktif
          </span>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
            Planı Yükselt
          </button>
          <button className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">
            Planları Karşılaştır
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ödeme Yöntemi</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Düzenle
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Son kullanma: 12/2025</p>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <button className="mt-4 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          + Yeni Kart Ekle
        </button>
      </div>

      {/* Billing Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Fatura Bilgileri</h3>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Düzenle
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Örnek Şirket A.Ş.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vergi No: 1234567890</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 dark:text-white">İstanbul, Türkiye</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Örnek Mah. Test Sok. No: 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Fatura Geçmişi</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(invoice.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.amount}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {invoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Tüm faturaları görüntüle →
          </button>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Aboneliği İptal Et</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Aboneliğinizi iptal ettiğinizde, dönem sonuna kadar erişiminiz devam edecektir.
            </p>
            <button className="mt-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Aboneliği İptal Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
