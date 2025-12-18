'use client';

import React from 'react';
import { CreditCard, FileText, Download, CheckCircle, AlertCircle, Calendar, Building, Crown } from 'lucide-react';

const invoices = [
  { id: 'INV-2024-001', date: '2024-01-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-012', date: '2023-12-15', amount: '₺2,499.00', status: 'paid' },
  { id: 'INV-2023-011', date: '2023-11-15', amount: '₺2,499.00', status: 'paid' },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Faturalandırma</h2>
        <p className="text-sm text-slate-500 mt-1">
          Abonelik ve ödeme bilgilerinizi yönetin
        </p>
      </div>

      {/* Current Plan - Professional Style */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <Crown className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Mevcut Plan</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Professional</h3>
              <p className="text-sm text-slate-600 mt-1">Aylık ₺2,499.00</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            Aktif
          </span>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
          <button className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
            Planı Yükselt
          </button>
          <button className="px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Planları Karşılaştır
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900">Ödeme Yöntemi</h3>
          <button className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Düzenle
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
            <CreditCard className="w-6 h-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">•••• •••• •••• 4242</p>
            <p className="text-xs text-slate-500">Son kullanma: 12/2025</p>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <button className="mt-4 w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          + Yeni Kart Ekle
        </button>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-900">Fatura Bilgileri</h3>
          <button className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Düzenle
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-900">Örnek Şirket A.Ş.</p>
              <p className="text-xs text-slate-500">Vergi No: 1234567890</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-900">İstanbul, Türkiye</p>
              <p className="text-xs text-slate-500">Örnek Mah. Test Sok. No: 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-medium text-slate-900">Fatura Geçmişi</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{invoice.id}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(invoice.date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-900">{invoice.amount}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {invoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
            Tüm faturaları görüntüle →
          </button>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div className="bg-red-50/50 rounded-xl border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-600">Aboneliği İptal Et</h3>
            <p className="text-sm text-slate-500 mt-1">
              Aboneliğinizi iptal ettiğinizde, dönem sonuna kadar erişiminiz devam edecektir.
            </p>
            <button className="mt-3 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              Aboneliği İptal Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
