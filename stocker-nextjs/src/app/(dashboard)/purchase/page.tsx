'use client';

/**
 * Purchase Dashboard Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Minimal accent colors (only on status indicators)
 * - Monochrome slate color palette
 */

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Spin } from 'antd';
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  PlusIcon,
  ShoppingCartIcon,
  TruckIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useSupplierSummary,
  usePurchaseRequestSummary,
  usePurchaseOrderSummary,
  usePurchaseInvoiceSummary,
  useSupplierPaymentSummary,
  usePurchaseReturnSummary,
} from '@/lib/api/hooks/usePurchase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';

import type { ColumnsType } from 'antd/es/table';

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

export default function PurchaseDashboardPage() {
  const router = useRouter();

  const { data: supplierSummary, isLoading: supplierLoading } = useSupplierSummary();
  const { data: requestSummary, isLoading: requestLoading } = usePurchaseRequestSummary();
  const { data: orderSummary, isLoading: orderLoading } = usePurchaseOrderSummary();
  const { data: invoiceSummary, isLoading: invoiceLoading } = usePurchaseInvoiceSummary();
  const { data: paymentSummary, isLoading: paymentLoading } = useSupplierPaymentSummary();
  const { data: returnSummary, isLoading: returnLoading } = usePurchaseReturnSummary();

  const isLoading = supplierLoading || requestLoading || orderLoading || invoiceLoading || paymentLoading || returnLoading;

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Quick navigation items
  const quickNavItems = [
    {
      label: 'Tedarikçiler',
      href: '/purchase/suppliers',
      icon: <BuildingStorefrontIcon className="w-4 h-4" />,
      count: supplierSummary?.totalSuppliers || 0,
      subtitle: `${supplierSummary?.activeSuppliers || 0} aktif`,
    },
    {
      label: 'Siparişler',
      href: '/purchase/orders',
      icon: <ShoppingCartIcon className="w-4 h-4" />,
      count: orderSummary?.totalOrders || 0,
      subtitle: `${orderSummary?.pendingOrders || 0} bekleyen`,
    },
    {
      label: 'Faturalar',
      href: '/purchase/invoices',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      count: invoiceSummary?.totalInvoices || 0,
      subtitle: `${invoiceSummary?.pendingInvoices || 0} bekleyen`,
    },
    {
      label: 'Ödemeler',
      href: '/purchase/payments',
      icon: <WalletIcon className="w-4 h-4" />,
      count: paymentSummary?.totalPayments || 0,
      subtitle: `${paymentSummary?.pendingPayments || 0} bekleyen`,
    },
  ];

  // Order status data for pie chart
  const orderStatusData = useMemo(() => {
    if (!orderSummary) return [];
    return [
      { name: 'Taslak', value: orderSummary.draftOrders || 0 },
      { name: 'Onay Bekliyor', value: orderSummary.pendingOrders || 0 },
      { name: 'Onaylandı', value: orderSummary.confirmedOrders || 0 },
      { name: 'Tamamlandı', value: orderSummary.completedOrders || 0 },
    ].filter(item => item.value > 0);
  }, [orderSummary]);

  // Invoice status data for bar chart
  const invoiceStatusData = useMemo(() => {
    if (!invoiceSummary) return [];
    return [
      { name: 'Taslak', value: invoiceSummary.draftInvoices || 0 },
      { name: 'Bekleyen', value: invoiceSummary.pendingInvoices || 0 },
      { name: 'Onaylı', value: invoiceSummary.approvedInvoices || 0 },
      { name: 'Ödenmiş', value: invoiceSummary.paidInvoices || 0 },
      { name: 'Vadesi Geçmiş', value: invoiceSummary.overdueInvoices || 0 },
    ].filter(item => item.value > 0);
  }, [invoiceSummary]);

  // Monthly trend data (mock - replace with real API)
  const monthlyTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = dayjs().month();
    return months.slice(0, currentMonth + 1).map((month) => ({
      name: month,
      siparisler: Math.floor(Math.random() * 50) + 10,
      faturalar: Math.floor(Math.random() * 40) + 5,
    }));
  }, []);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          <p className="font-medium text-slate-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-slate-600">
              {entry.name}: {entry.value.toLocaleString('tr-TR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Quick actions
  const quickActions = [
    { label: 'Yeni Sipariş', href: '/purchase/orders/new', icon: <ShoppingCartIcon className="w-4 h-4" /> },
    { label: 'Mal Alımı', href: '/purchase/goods-receipts/new', icon: <InboxIcon className="w-4 h-4" /> },
    { label: 'Yeni Fatura', href: '/purchase/invoices/new', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { label: 'Yeni Ödeme', href: '/purchase/payments/new', icon: <WalletIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Satın Alma</h1>
              <p className="text-sm text-slate-500">Tedarik zinciri ve satın alma operasyonları</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/purchase/orders/new">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Yeni Sipariş
              </button>
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
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  {React.cloneElement(item.icon, { className: 'w-4 h-4 text-slate-500' })}
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">
                {item.count.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-slate-500">{item.label}</div>
              <div className="text-xs text-slate-400 mt-1">{item.subtitle}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sipariş Tutarı</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(orderSummary?.totalAmount || 0)}
          </div>
          <div className="text-sm text-slate-500">Toplam</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ödenmemiş</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(invoiceSummary?.totalRemainingAmount || 0)}
          </div>
          <div className="text-sm text-slate-500">Fatura Tutarı</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Vadesi Geçmiş</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(invoiceSummary?.overdueAmount || 0)}
          </div>
          <div className="text-sm text-slate-500">Fatura Tutarı</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bu Ay</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            {formatCurrency(paymentSummary?.completedAmount || 0)}
          </div>
          <div className="text-sm text-slate-500">Ödeme Yapıldı</div>
        </div>
      </div>

      {/* Alerts Section */}
      {((invoiceSummary?.overdueInvoices || 0) > 0 || (orderSummary?.pendingOrders || 0) > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-5">Dikkat Gerektiren</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overdue Invoices Alert */}
            {(invoiceSummary?.overdueInvoices || 0) > 0 && (
              <Link href="/purchase/invoices?status=Overdue">
                <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{invoiceSummary?.overdueInvoices || 0}</div>
                      <div className="text-sm text-slate-500">Vadesi Geçmiş Fatura</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-slate-600">
                    {formatCurrency(invoiceSummary?.overdueAmount || 0)} tutarında →
                  </div>
                </div>
              </Link>
            )}

            {/* Pending Orders Alert */}
            {(orderSummary?.pendingOrders || 0) > 0 && (
              <Link href="/purchase/orders?status=Pending">
                <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <ShoppingCartIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{orderSummary?.pendingOrders || 0}</div>
                      <div className="text-sm text-slate-500">Onay Bekleyen Sipariş</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-slate-600">Onay bekliyor →</div>
                </div>
              </Link>
            )}

            {/* Pending Payments Alert */}
            {(paymentSummary?.pendingPayments || 0) > 0 && (
              <Link href="/purchase/payments?status=Pending">
                <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-500 flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{paymentSummary?.pendingPayments || 0}</div>
                      <div className="text-sm text-slate-500">Bekleyen Ödeme</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-slate-600">
                    {formatCurrency(paymentSummary?.pendingAmount || 0)} tutarında →
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aylık Trend</p>
          </div>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="siparisler"
                  name="Siparişler"
                  stroke="#1e293b"
                  fill="#1e293b"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="faturalar"
                  name="Faturalar"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
              <ChartBarIcon className="w-8 h-8 mb-2" />
              <span className="text-sm">Henüz veri yok</span>
            </div>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sipariş Durumu</p>
            <Link href="/purchase/orders" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length] }}
                    />
                    <span className="text-slate-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
              <ShoppingCartIcon className="w-8 h-8 mb-2" />
              <span className="text-sm">Sipariş verisi yok</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Status & Supplier Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Invoice Status Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fatura Durumu</p>
            <Link href="/purchase/invoices" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>
          {invoiceStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={invoiceStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Adet" radius={[0, 4, 4, 0]}>
                  {invoiceStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
              <DocumentTextIcon className="w-8 h-8 mb-2" />
              <span className="text-sm">Fatura verisi yok</span>
            </div>
          )}
        </div>

        {/* Supplier Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi Özeti</p>
            <Link href="/purchase/suppliers" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-3xl font-bold text-slate-900">{supplierSummary?.activeSuppliers || 0}</div>
              <div className="text-sm text-slate-500 mt-1">Aktif Tedarikçi</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-3xl font-bold text-slate-400">{supplierSummary?.inactiveSuppliers || 0}</div>
              <div className="text-sm text-slate-500 mt-1">Pasif Tedarikçi</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Aktif Oran</span>
                <span className="text-sm font-medium text-slate-900">
                  {supplierSummary?.totalSuppliers
                    ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      supplierSummary?.totalSuppliers
                        ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-500">Toplam Bakiye</span>
                <span className="text-lg font-semibold text-slate-900">
                  {formatCurrency(supplierSummary?.totalBalance || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Returns Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">İade Durumu</p>
            <Link href="/purchase/returns" className="text-xs text-slate-500 hover:text-slate-700">
              Tümünü gör →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-slate-900">{returnSummary?.totalReturns || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Toplam</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-amber-600">{returnSummary?.pendingReturns || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Bekleyen</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-emerald-600">{returnSummary?.completedReturns || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Tamamlanan</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Toplam İade Tutarı</span>
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(returnSummary?.totalReturnAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Bekleyen İade</span>
              <span className="text-sm font-semibold text-amber-600">
                {formatCurrency(returnSummary?.pendingRefundAmount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-5">Hızlı İşlemler</p>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      {React.cloneElement(action.icon, { className: 'w-5 h-5 text-slate-600' })}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex gap-3">
              <Link href="/purchase/requests" className="flex-1">
                <button className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                  Satın Alma Talepleri
                </button>
              </Link>
              <Link href="/purchase/reports" className="flex-1">
                <button className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                  Raporlar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link href="/purchase/suppliers">
          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Tedarikçiler</div>
                <div className="text-lg font-semibold text-slate-900">{supplierSummary?.totalSuppliers || 0}</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/purchase/requests">
          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Talepler</div>
                <div className="text-lg font-semibold text-slate-900">{requestSummary?.totalRequests || 0}</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/purchase/goods-receipts">
          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Mal Alımları</div>
                <div className="text-lg font-semibold text-slate-900">—</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/purchase/returns">
          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUturnLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">İadeler</div>
                <div className="text-lg font-semibold text-slate-900">{returnSummary?.totalReturns || 0}</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/purchase/reports">
          <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Raporlar</div>
                <div className="text-lg font-semibold text-slate-900">→</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
