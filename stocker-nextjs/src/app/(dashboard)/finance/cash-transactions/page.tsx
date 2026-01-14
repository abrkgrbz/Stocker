'use client';

/**
 * Cash Transactions (Kasa Hareketleri) List Page
 * Placeholder - API not yet implemented
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React from 'react';
import { Button, Empty } from 'antd';
import {
  ArrowsRightLeftIcon,
  ArrowLeftIcon,
  ClockIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function CashTransactionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kasa Hareketleri</h1>
              <p className="text-sm text-slate-500">Kasa giriş/çıkış işlemlerini yönetin</p>
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
            Kasa hareketleri modülü şu anda geliştirme aşamasındadır.
            Bu özellik yakında kullanıma sunulacaktır.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="primary"
              onClick={() => router.push('/finance/bank-transactions')}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Banka Hareketlerine Git
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
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Kasa Giriş İşlemleri</h3>
          <p className="text-xs text-slate-500">
            Nakit satış tahsilatları, avans iadeleri ve diğer kasa giriş işlemlerini kaydedin.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-4">
            <WalletIcon className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Kasa Çıkış İşlemleri</h3>
          <p className="text-xs text-slate-500">
            Nakit ödemeler, masraflar ve diğer kasa çıkış işlemlerini kaydedin.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
            <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Kasalar Arası Transfer</h3>
          <p className="text-xs text-slate-500">
            Farklı kasalar veya banka hesapları arasında para transferi yapın.
          </p>
        </div>
      </div>
    </div>
  );
}
