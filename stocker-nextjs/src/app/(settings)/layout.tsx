'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, User, Shield, Bell, CreditCard } from 'lucide-react';

// Account settings navigation items
const accountNavItems = [
  {
    key: 'profile',
    label: 'Profilim',
    href: '/account/profile',
    icon: User,
    description: 'Kişisel bilgilerinizi yönetin',
  },
  {
    key: 'security',
    label: 'Hesap Güvenliği',
    href: '/account/security',
    icon: Shield,
    description: 'Şifre ve güvenlik ayarları',
  },
  {
    key: 'notifications',
    label: 'Bildirimler',
    href: '/account/notifications',
    icon: Bell,
    description: 'Bildirim tercihlerinizi ayarlayın',
  },
  {
    key: 'billing',
    label: 'Faturalandırma',
    href: '/account/billing',
    icon: CreditCard,
    description: 'Ödeme ve fatura bilgileri',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Hesap Ayarları
          </h1>
          <Link
            href="/app"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <X className="w-5 h-5 text-slate-600" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Settings Navigation - Left Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-65px)] bg-slate-50 border-r border-slate-200">
          <nav className="p-4 space-y-1">
            {accountNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      isActive ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area - Right Side */}
        <main className="flex-1 p-8 overflow-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
