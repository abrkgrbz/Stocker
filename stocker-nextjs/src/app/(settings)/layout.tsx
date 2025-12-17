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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hesap Ayarları
          </h1>
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Dashboard'a Dön"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Settings Navigation - Left Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-65px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
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
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 -ml-1 pl-5'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area - Right Side */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
