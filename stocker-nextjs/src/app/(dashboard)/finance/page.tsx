'use client';

/**
 * Finance Dashboard Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Minimal accent colors (only on icons)
 */

import React from 'react';
import { Table, Spin } from 'antd';
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChevronRightIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useInvoices,
  useCurrentAccounts,
  useExpenses,
  useBankAccounts,
  useFinanceDashboard,
} from '@/lib/api/hooks/useFinance';
import { PageContainer } from '@/components/ui/enterprise-page';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function FinanceDashboardPage() {
  // Fetch Finance data
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ pageSize: 5 });
  const { data: currentAccountsData, isLoading: currentAccountsLoading } = useCurrentAccounts({ pageSize: 10 });
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ pageSize: 5 });
  const { data: bankAccountsData, isLoading: bankAccountsLoading } = useBankAccounts({ pageSize: 10 });
  const { data: dashboardData, isLoading: dashboardLoading } = useFinanceDashboard();

  const invoices = invoicesData?.items || [];
  const currentAccounts = currentAccountsData?.items || [];
  const expenses = expensesData?.items || [];
  const bankAccounts = bankAccountsData?.items || [];

  // Calculate metrics from dashboard data or fallback to calculated values
  const metrics = {
    totalReceivables: dashboardData?.totalReceivables || currentAccounts.reduce((sum, ca) => sum + (ca.balance > 0 ? ca.balance : 0), 0),
    totalPayables: dashboardData?.totalPayables || currentAccounts.reduce((sum, ca) => sum + (ca.balance < 0 ? Math.abs(ca.balance) : 0), 0),
    totalBankBalance: dashboardData?.totalBankBalance || bankAccounts.reduce((sum, ba) => sum + (ba.currentBalance || 0), 0),
    monthlyRevenue: dashboardData?.monthlyRevenue || invoices.filter(i => i.invoiceType === 'Sales').reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    monthlyExpenses: dashboardData?.monthlyExpenses || expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    pendingInvoices: dashboardData?.pendingInvoices || invoices.filter(i => i.status === 'Draft' || i.status === 'Pending').length,
    overdueInvoices: dashboardData?.overdueInvoices || invoices.filter(i => i.status === 'Overdue').length,
    activeCurrentAccounts: currentAccounts.filter(ca => ca.isActive).length,
  };

  // Quick navigation items - monochrome slate colors
  const quickNavItems = [
    { label: 'Faturalar', href: '/finance/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, count: invoicesData?.totalCount || 0 },
    { label: 'Cari Hesaplar', href: '/finance/current-accounts', icon: <WalletIcon className="w-4 h-4" />, count: currentAccountsData?.totalCount || 0 },
    { label: 'Giderler', href: '/finance/expenses', icon: <ReceiptPercentIcon className="w-4 h-4" />, count: expensesData?.totalCount || 0 },
    { label: 'Banka Hesapları', href: '/finance/bank-accounts', icon: <BuildingLibraryIcon className="w-4 h-4" />, count: bankAccountsData?.totalCount || 0 },
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  // Recent invoices columns
  const invoiceColumns: ColumnsType<any> = [
    {
      title: 'Fatura',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'Taslak'}</div>
          <div className="text-xs text-slate-500">{record.customerName || record.vendorName || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount, record) => (
        <span className="text-sm font-medium text-slate-900">
          {formatCurrency(amount || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const variants: Record<string, { bg: string; text: string; label: string }> = {
          Draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Taslak' },
          Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Beklemede' },
          Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
          Paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ödendi' },
          PartiallyPaid: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Kısmi Ödeme' },
          Overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vadesi Geçti' },
          Cancelled: { bg: 'bg-slate-50', text: 'text-slate-400', label: 'İptal' },
        };
        const variant = variants[status] || variants.Draft;
        return (
          <span className={`px-2 py-0.5 text-xs rounded-full ${variant.bg} ${variant.text}`}>
            {variant.label}
          </span>
        );
      },
    },
  ];

  // Recent expenses columns
  const expenseColumns: ColumnsType<any> = [
    {
      title: 'Gider',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text || 'İsimsiz Gider'}</div>
          <div className="text-xs text-slate-500">{record.categoryName || record.category || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span className="text-sm font-medium text-slate-900">
          {formatCurrency(amount || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'expenseDate',
      key: 'expenseDate',
      render: (date) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD MMM YYYY') : '-'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Page Header - Clean & Minimal */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Finans Dashboard</h1>
            <p className="text-sm text-slate-500">Finansal durumunuzu ve nakit akışınızı izleyin</p>
          </div>
          <Link href="/finance/invoices/new">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Yeni Fatura
            </button>
          </Link>
        </div>
      </div>

      {/* Combined Overview Cards - Navigation + KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  {React.cloneElement(item.icon, { className: 'text-slate-500', style: { fontSize: 16 } })}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">
                {item.count?.toLocaleString('tr-TR') || '0'}
              </div>
              <div className="text-sm text-slate-500">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alacaklar</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics.totalReceivables)}</div>
          <div className="text-sm text-slate-500">Toplam Alacak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Borçlar</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics.totalPayables)}</div>
          <div className="text-sm text-slate-500">Toplam Borç</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Banka</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{formatCurrency(metrics.totalBankBalance)}</div>
          <div className="text-sm text-slate-500">Toplam Bakiye</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Net</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.totalReceivables - metrics.totalPayables + metrics.totalBankBalance)}
          </div>
          <div className="text-sm text-slate-500">Net Durum</div>
        </div>
      </div>

      {/* Monthly Performance Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bu Ay</span>
          </div>
          <div className="text-2xl font-semibold text-emerald-600">{formatCurrency(metrics.monthlyRevenue)}</div>
          <div className="text-sm text-slate-500">Aylık Gelir</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ReceiptPercentIcon className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bu Ay</span>
          </div>
          <div className="text-2xl font-semibold text-red-600">{formatCurrency(metrics.monthlyExpenses)}</div>
          <div className="text-sm text-slate-500">Aylık Gider</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bekleyen</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{metrics.pendingInvoices}</div>
          <div className="text-sm text-slate-500">Bekleyen Fatura</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Geciken</span>
          </div>
          <div className="text-2xl font-semibold text-red-600">{metrics.overdueInvoices}</div>
          <div className="text-sm text-slate-500">Vadesi Geçmiş</div>
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900">Banka Hesapları</h2>
          <Link href="/finance/bank-accounts" className="text-xs text-slate-500 hover:text-slate-700">
            Tümünü gör →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccountsLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))
          ) : bankAccounts.length === 0 ? (
            <div className="col-span-3 bg-white border border-slate-200 rounded-lg p-8 text-center">
              <BuildingLibraryIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Henüz banka hesabı eklenmemiş</p>
              <Link href="/finance/bank-accounts/new" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Banka Hesabı Ekle →
              </Link>
            </div>
          ) : (
            bankAccounts.slice(0, 3).map((account) => (
              <Link key={account.id} href={`/finance/bank-accounts/${account.id}`}>
                <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BuildingLibraryIcon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{account.bankName || account.accountName}</div>
                      <div className="text-xs text-slate-500 truncate">{account.accountNumber || account.iban || '-'}</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {formatCurrency(account.currentBalance || 0, account.currency || 'TRY')}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Recent Invoices & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900">Son Faturalar</h2>
            <Link href="/finance/invoices" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg">
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <DocumentTextIcon className="w-4 h-4 text-slate-300" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Fatura bulunmuyor</h3>
                <p className="text-xs text-slate-400 mb-4">
                  İlk faturanızı oluşturun
                </p>
                <Link href="/finance/invoices/new">
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                    Fatura Ekle
                  </button>
                </Link>
              </div>
            ) : (
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                rowKey="id"
                pagination={false}
                size="small"
                className="enterprise-table"
                onRow={(record) => ({
                  onClick: () => window.location.href = `/finance/invoices/${record.id}`,
                  className: 'cursor-pointer hover:bg-slate-50',
                })}
              />
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900">Son Giderler</h2>
            <Link href="/finance/expenses" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg">
            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <ReceiptPercentIcon className="w-4 h-4 text-slate-300" />
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">Gider bulunmuyor</h3>
                <p className="text-xs text-slate-400 mb-4">
                  İlk giderinizi kaydedin
                </p>
                <Link href="/finance/expenses/new">
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                    Gider Ekle
                  </button>
                </Link>
              </div>
            ) : (
              <Table
                columns={expenseColumns}
                dataSource={expenses}
                rowKey="id"
                pagination={false}
                size="small"
                className="enterprise-table"
                onRow={(record) => ({
                  onClick: () => window.location.href = `/finance/expenses/${record.id}`,
                  className: 'cursor-pointer hover:bg-slate-50',
                })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Current Accounts Overview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900">Cari Hesap Durumu</h2>
          <Link href="/finance/current-accounts" className="text-xs text-slate-500 hover:text-slate-700">
            Tümünü gör →
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          {currentAccountsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin />
            </div>
          ) : currentAccounts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <WalletIcon className="w-4 h-4 text-slate-300" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">Cari hesap bulunmuyor</h3>
              <p className="text-xs text-slate-400 mb-4">
                Müşteri veya tedarikçi cari hesapları burada görünecek
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentAccounts.slice(0, 5).map((account) => (
                <Link key={account.id} href={`/finance/current-accounts/${account.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <WalletIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{account.accountName || account.customerName || account.vendorName}</div>
                        <div className="text-xs text-slate-500">
                          {account.accountCode} - {account.accountTypeName || (account.accountType === 'Customer' ? 'Müşteri' : 'Tedarikçi')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${account.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance || 0, account.currency || 'TRY')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {account.balance >= 0 ? 'Alacak' : 'Borç'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
