'use client';

/**
 * Finance Dashboard Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React from 'react';
import { Table, Spin, Button, Progress } from 'antd';
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  ReceiptPercentIcon,
  WalletIcon,
  ArrowPathIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useInvoices,
  useCurrentAccounts,
  useExpenses,
  useBankAccounts,
  useFinanceDashboard,
  useVatReport,
  useBaBsForms,
  useTaxDeclarations,
} from '@/lib/api/hooks/useFinance';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

export default function FinanceDashboardPage() {
  // Current period for tax reports
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch Finance data
  const { data: invoicesData, isLoading: invoicesLoading, refetch: refetchInvoices } = useInvoices({ pageSize: 5 });
  const { data: currentAccountsData, isLoading: currentAccountsLoading } = useCurrentAccounts({ pageSize: 10 });
  const { data: expensesData, isLoading: expensesLoading } = useExpenses({ pageSize: 5 });
  const { data: bankAccountsData, isLoading: bankAccountsLoading } = useBankAccounts({ pageSize: 10 });
  const { data: dashboardData, isLoading: dashboardLoading } = useFinanceDashboard();

  // Fetch Tax related data
  const { data: vatReport, isLoading: vatLoading } = useVatReport(currentYear, currentMonth);
  const { data: baBsFormsData, isLoading: baBsLoading } = useBaBsForms({ pageSize: 5 });
  const { data: taxDeclarationsData, isLoading: taxDeclarationsLoading } = useTaxDeclarations({ pageSize: 5 });

  const invoices = invoicesData?.items || [];
  const currentAccounts = currentAccountsData?.items || [];
  const expenses = expensesData?.items || [];
  const bankAccounts = bankAccountsData?.items || [];
  const baBsForms = baBsFormsData?.items || [];
  const taxDeclarations = taxDeclarationsData?.items || [];

  // Turkish month names
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // KDV Summary from VAT report
  const kdvSummary = {
    salesKdv: vatReport?.totalSalesKdv || 0,
    purchaseKdv: vatReport?.totalPurchaseKdv || 0,
    netKdv: vatReport?.netKdv || 0,
    payable: vatReport?.payableKdv || 0,
    carryForward: vatReport?.carryForwardCredit || 0,
  };

  // Tax Calendar - Important dates
  const getTaxCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Key Turkish tax deadlines
    const deadlines = [
      { type: 'KDV Beyannamesi', day: 26, description: 'Aylık KDV beyannamesi son gün' },
      { type: 'Muhtasar', day: 26, description: 'Muhtasar beyanname son gün' },
      { type: 'Ba-Bs Formu', day: 31, description: 'Aylık Ba-Bs formu bildirimi' },
      { type: 'SGK Bildirimi', day: 26, description: 'Aylık SGK prim bildirimi' },
    ];

    return deadlines.map(d => {
      let deadlineDate = new Date(year, month, d.day);
      // If deadline has passed, show next month's deadline
      if (deadlineDate < now) {
        deadlineDate = new Date(year, month + 1, d.day);
      }
      const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...d, date: deadlineDate, daysUntil };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const taxCalendar = getTaxCalendar();

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
    { label: 'Faturalar', href: '/finance/invoices', icon: <DocumentTextIcon className="w-5 h-5 text-slate-600" />, count: invoicesData?.totalCount || 0 },
    { label: 'Cari Hesaplar', href: '/finance/current-accounts', icon: <WalletIcon className="w-5 h-5 text-slate-600" />, count: currentAccountsData?.totalCount || 0 },
    { label: 'Giderler', href: '/finance/expenses', icon: <ReceiptPercentIcon className="w-5 h-5 text-slate-600" />, count: expensesData?.totalCount || 0 },
    { label: 'Banka Hesaplari', href: '/finance/bank-accounts', icon: <BuildingLibraryIcon className="w-5 h-5 text-slate-600" />, count: bankAccountsData?.totalCount || 0 },
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
          Draft: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Taslak' },
          Pending: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Beklemede' },
          Approved: { bg: 'bg-slate-400', text: 'text-white', label: 'Onaylandi' },
          Paid: { bg: 'bg-slate-900', text: 'text-white', label: 'Odendi' },
          PartiallyPaid: { bg: 'bg-slate-600', text: 'text-white', label: 'Kismi Odeme' },
          Overdue: { bg: 'bg-slate-700', text: 'text-white', label: 'Vadesi Gecti' },
          Cancelled: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Iptal' },
        };
        const variant = variants[status] || variants.Draft;
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${variant.bg} ${variant.text}`}>
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
          <div className="text-sm font-medium text-slate-900">{text || 'Isimsiz Gider'}</div>
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BanknotesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Finans Dashboard</h1>
              <p className="text-sm text-slate-500">Finansal durumunuzu ve nakit akisinizi izleyin</p>
            </div>
            <Link href="/finance/invoices/new">
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Yeni Fatura
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {item.count?.toLocaleString('tr-TR') || '0'}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalReceivables)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Alacak</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalPayables)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Borc</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <BuildingLibraryIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalBankBalance)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Banka Bakiyesi</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.totalReceivables - metrics.totalPayables + metrics.totalBankBalance)}
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Net Durum</div>
        </div>
      </div>

      {/* Monthly Performance Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.monthlyRevenue)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aylik Gelir</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
              <ReceiptPercentIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.monthlyExpenses)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aylik Gider</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.pendingInvoices}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen Fatura</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.overdueInvoices}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Vadesi Gecmis</div>
        </div>
      </div>

      {/* Tax & Compliance Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Vergi & Uyum</h2>
          <Link href="/finance/tax/declarations" className="text-xs text-slate-500 hover:text-slate-700">
            Tüm vergi işlemleri
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* KDV Summary Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ScaleIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">KDV Özeti</h3>
                  <p className="text-xs text-slate-500">{monthNames[currentMonth - 1]} {currentYear}</p>
                </div>
              </div>
              <Link href="/finance/reports/vat">
                <ChevronRightIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </Link>
            </div>

            {vatLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spin size="small" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Hesaplanan KDV</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(kdvSummary.salesKdv)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">İndirilecek KDV</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(kdvSummary.purchaseKdv)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-700">
                      {kdvSummary.payable > 0 ? 'Ödenecek KDV' : 'Devreden KDV'}
                    </span>
                    <span className={`text-sm font-bold ${kdvSummary.payable > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(kdvSummary.payable > 0 ? kdvSummary.payable : kdvSummary.carryForward)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ba-Bs Forms Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Ba-Bs Formu</h3>
                  <p className="text-xs text-slate-500">5.000 TL üzeri bildirim</p>
                </div>
              </div>
              <Link href="/finance/tax/ba-bs">
                <ChevronRightIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </Link>
            </div>

            {baBsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spin size="small" />
              </div>
            ) : baBsForms.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 mb-2">Bu dönem için form yok</p>
                <Link href="/finance/tax/ba-bs/new">
                  <Button size="small" className="!text-xs">
                    Form Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {baBsForms.slice(0, 3).map((form: any) => (
                  <div key={form.id} className="flex items-center justify-between py-2 px-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                        form.formType === 'Ba' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {form.formType}
                      </span>
                      <span className="text-xs text-slate-600">{form.period}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      form.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' :
                      form.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {form.status === 'Filed' ? 'Gönderildi' :
                       form.status === 'Approved' ? 'Onaylandı' : 'Taslak'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tax Calendar Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Vergi Takvimi</h3>
                  <p className="text-xs text-slate-500">Yaklaşan son tarihler</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {taxCalendar.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.daysUntil <= 3 ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    ) : item.daysUntil <= 7 ? (
                      <ClockIcon className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    )}
                    <div>
                      <div className="text-xs font-medium text-slate-700">{item.type}</div>
                      <div className="text-xs text-slate-500">{dayjs(item.date).format('DD MMM')}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    item.daysUntil <= 3 ? 'bg-red-100 text-red-700' :
                    item.daysUntil <= 7 ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.daysUntil} gün
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tax Declarations Quick View */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Vergi Beyannameleri</h2>
          <Link href="/finance/tax/declarations" className="text-xs text-slate-500 hover:text-slate-700">
            Tümünü gör
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {taxDeclarationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" />
            </div>
          ) : taxDeclarations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Beyanname bulunmuyor</h3>
              <p className="text-xs text-slate-400 mb-4">
                Vergi beyannamelerinizi buradan takip edebilirsiniz
              </p>
              <Link href="/finance/tax/declarations/new">
                <Button
                  type="primary"
                  size="small"
                  className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                >
                  Beyanname Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {taxDeclarations.slice(0, 4).map((declaration: any) => (
                <Link key={declaration.id} href={`/finance/tax/declarations/${declaration.id}`}>
                  <div className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                        {declaration.declarationType}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        declaration.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' :
                        declaration.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                        declaration.status === 'Approved' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {declaration.status === 'Filed' ? 'Gönderildi' :
                         declaration.status === 'Paid' ? 'Ödendi' :
                         declaration.status === 'Approved' ? 'Onaylandı' : 'Taslak'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">{declaration.period}</div>
                    <div className="text-lg font-bold text-slate-900">
                      {formatCurrency(declaration.taxAmount || 0)}
                    </div>
                    {declaration.dueDate && (
                      <div className="text-xs text-slate-500 mt-1">
                        Son: {dayjs(declaration.dueDate).format('DD MMM YYYY')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bank Accounts Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Banka Hesaplari</h2>
          <Link href="/finance/bank-accounts" className="text-xs text-slate-500 hover:text-slate-700">
            Tumunu gor
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccountsLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))
          ) : bankAccounts.length === 0 ? (
            <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <BuildingLibraryIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">Henuz banka hesabi eklenmemis</p>
              <Link href="/finance/bank-accounts/new" className="text-xs text-slate-700 hover:text-slate-900 mt-2 inline-block font-medium">
                Banka Hesabi Ekle
              </Link>
            </div>
          ) : (
            bankAccounts.slice(0, 3).map((account) => (
              <Link key={account.id} href={`/finance/bank-accounts/${account.id}`}>
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BuildingLibraryIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{account.bankName || account.accountName}</div>
                      <div className="text-xs text-slate-500 truncate">{account.accountNumber || account.iban || '-'}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
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
            <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Son Faturalar</h2>
            <Link href="/finance/invoices" className="text-xs text-slate-500 hover:text-slate-700">
              Tumunu gor
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin size="large" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Fatura bulunmuyor</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Ilk faturanizi olusturun
                </p>
                <Link href="/finance/invoices/new">
                  <Button
                    type="primary"
                    size="small"
                    className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                  >
                    Fatura Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                rowKey="id"
                pagination={false}
                size="small"
                className={tableClassName}
                onRow={(record) => ({
                  onClick: () => window.location.href = `/finance/invoices/${record.id}`,
                  className: 'cursor-pointer',
                })}
              />
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Son Giderler</h2>
            <Link href="/finance/expenses" className="text-xs text-slate-500 hover:text-slate-700">
              Tumunu gor
            </Link>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spin size="large" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <ReceiptPercentIcon className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Gider bulunmuyor</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Ilk giderinizi kaydedin
                </p>
                <Link href="/finance/expenses/new">
                  <Button
                    type="primary"
                    size="small"
                    className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                  >
                    Gider Ekle
                  </Button>
                </Link>
              </div>
            ) : (
              <Table
                columns={expenseColumns}
                dataSource={expenses}
                rowKey="id"
                pagination={false}
                size="small"
                className={tableClassName}
                onRow={(record) => ({
                  onClick: () => window.location.href = `/finance/expenses/${record.id}`,
                  className: 'cursor-pointer',
                })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Current Accounts Overview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-900 uppercase tracking-wider">Cari Hesap Durumu</h2>
          <Link href="/finance/current-accounts" className="text-xs text-slate-500 hover:text-slate-700">
            Tumunu gor
          </Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {currentAccountsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : currentAccounts.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <WalletIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-700 mb-1">Cari hesap bulunmuyor</h3>
              <p className="text-xs text-slate-400 mb-4">
                Musteri veya tedarikci cari hesaplari burada gorunecek
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentAccounts.slice(0, 5).map((account) => (
                <Link key={account.id} href={`/finance/current-accounts/${account.id}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-6 px-6 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <WalletIcon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{account.accountName || account.customerName || account.vendorName}</div>
                        <div className="text-xs text-slate-500">
                          {account.accountCode} - {account.accountTypeName || (account.accountType === 'Customer' ? 'Musteri' : 'Tedarikci')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${account.balance >= 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {formatCurrency(account.balance || 0, account.currency || 'TRY')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {account.balance >= 0 ? 'Alacak' : 'Borc'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
