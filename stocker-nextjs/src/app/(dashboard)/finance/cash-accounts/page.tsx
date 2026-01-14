'use client';

/**
 * Cash Accounts (Kasa Hesapları) List Page
 * Placeholder - API not yet implemented
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React from 'react';
import { Button, Empty } from 'antd';
import {
  WalletIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function CashAccountsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <WalletIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kasa Hesapları</h1>
              <p className="text-sm text-slate-500">Kasa hesaplarını yönetin</p>
            </div>
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
            >
              Geri
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-white border border-slate-200 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
            <ClockIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Yakında Hizmetinizde
          </h2>
          <p className="text-slate-500 max-w-md mb-6">
            Kasa hesapları modülü şu anda geliştirme aşamasındadır.
            Bu özellik yakında kullanıma sunulacaktır.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              onClick={() => router.push('/finance/bank-accounts')}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Banka Hesaplarına Git
            </Button>
            <Button
              onClick={() => router.push('/finance')}
              className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
            >
              Finans Paneline Dön
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Çoklu Kasa Yönetimi</h3>
          <p className="text-xs text-slate-500">
            Farklı para birimleri ve lokasyonlar için ayrı kasa hesapları oluşturabileceksiniz.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Nakit Akışı Takibi</h3>
          <p className="text-xs text-slate-500">
            Günlük, haftalık ve aylık nakit hareketlerini detaylı olarak izleyebileceksiniz.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Kasa Sayımı</h3>
          <p className="text-xs text-slate-500">
            Düzenli kasa sayımları yaparak fiziki ve kayıtlı tutarları karşılaştırabileceksiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
