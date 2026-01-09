'use client';

import React from 'react';
import { Table, Progress } from 'antd';
import {
  ChevronRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  WalletIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSalesStatistics, useSalesOrders } from '@/lib/api/hooks/useSales';
import { useInvoiceStatistics, useInvoices } from '@/lib/api/hooks/useInvoices';
import { usePaymentStatistics } from '@/lib/api/hooks/usePayments';
import type { SalesOrderListItem, SalesOrderStatus } from '@/lib/api/services/sales.service';
import type { InvoiceListItem } from '@/lib/api/services/invoice.service';
import dayjs from 'dayjs';

const statusConfig: Record<SalesOrderStatus, { bgColor: string; textColor: string; label: string }> = {
  Draft: { bgColor: 'bg-slate-100', textColor: 'text-slate-600', label: 'Taslak' },
  Approved: { bgColor: 'bg-slate-200', textColor: 'text-slate-700', label: 'Onaylı' },
  Confirmed: { bgColor: 'bg-slate-300', textColor: 'text-slate-800', label: 'Onaylandı' },
  Shipped: { bgColor: 'bg-slate-400', textColor: 'text-white', label: 'Gönderildi' },
  Delivered: { bgColor: 'bg-slate-500', textColor: 'text-white', label: 'Teslim Edildi' },
  Completed: { bgColor: 'bg-slate-700', textColor: 'text-white', label: 'Tamamlandı' },
  Cancelled: { bgColor: 'bg-slate-900', textColor: 'text-white', label: 'İptal' },
};

export default function SalesDashboardPage() {
  const router = useRouter();

  const { data: salesStats, isLoading: salesStatsLoading } = useSalesStatistics();
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStatistics();
  const { data: paymentStats, isLoading: paymentStatsLoading } = usePaymentStatistics();
  const { data: recentOrders, isLoading: ordersLoading } = useSalesOrders({ pageSize: 5 });
  const { data: overdueInvoices, isLoading: overdueLoading } = useInvoices({ status: 'Overdue', pageSize: 5 });

  const hasOverdueInvoices = (invoiceStats?.overdueInvoices ?? 0) > 0;
  const overdueAmount = overdueInvoices?.items?.reduce((sum, inv) => sum + inv.grandTotal, 0) ?? 0;

  const columns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record: SalesOrderListItem) => (
        <button
          onClick={() => router.push(`/sales/orders/${record.id}`)}
          className="text-slate-900 font-medium hover:text-slate-600 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tarih',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'Tutar',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (amount: number, record: SalesOrderListItem) => (
        <span className="font-medium text-slate-900">
          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: record.currency }).format(amount)}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: SalesOrderStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CurrencyDollarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Satış Dashboard</h1>
          <p className="text-sm text-slate-500">Satış operasyonlarınızın genel görünümü</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Orders Card */}
        <button
          onClick={() => router.push('/sales/orders')}
          className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Sipariş</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {salesStatsLoading ? '...' : (salesStats?.totalOrders ?? 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {salesStats?.draftOrders ?? 0} taslak, {salesStats?.approvedOrders ?? 0} onaylı
          </p>
        </button>

        {/* Total Invoices Card */}
        <button
          onClick={() => router.push('/sales/invoices')}
          className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Fatura</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {invoiceStatsLoading ? '...' : (invoiceStats?.totalInvoices ?? 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {invoiceStats?.overdueInvoices ?? 0} gecikmiş
          </p>
        </button>

        {/* Total Payments Card */}
        <button
          onClick={() => router.push('/sales/payments')}
          className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Ödeme</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {paymentStatsLoading ? '...' : (paymentStats?.totalPayments ?? 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {paymentStats?.pendingPayments ?? 0} beklemede
          </p>
        </button>

        {/* Total Revenue Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-500">Toplam Gelir</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {salesStatsLoading ? '...' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(salesStats?.totalRevenue ?? 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ort: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(salesStats?.averageOrderValue ?? 0)}
          </p>
        </div>
      </div>

      {/* Overdue Invoices Alert */}
      {hasOverdueInvoices && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-slate-700" />
            <span className="text-slate-700">
              <strong>{invoiceStats?.overdueInvoices ?? 0} adet vadesi geçmiş fatura</strong> bulunmaktadır.
              Toplam tutar: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(overdueAmount)}
            </span>
          </div>
          <button
            onClick={() => router.push('/sales/invoices?status=Overdue')}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Faturaları Görüntüle
          </button>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Order Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Sipariş Durumları</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Taslak</span>
                <span className="text-sm font-medium text-slate-900">{salesStats?.draftOrders ?? 0}</span>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.draftOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#94a3b8"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Onaylı</span>
                <span className="text-sm font-medium text-slate-900">{salesStats?.approvedOrders ?? 0}</span>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.approvedOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#64748b"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Tamamlanan</span>
                <span className="text-sm font-medium text-slate-900">{salesStats?.completedOrders ?? 0}</span>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.completedOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#334155"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">İptal</span>
                <span className="text-sm font-medium text-slate-900">{salesStats?.cancelledOrders ?? 0}</span>
              </div>
              <Progress
                percent={salesStats?.totalOrders ? ((salesStats?.cancelledOrders ?? 0) / salesStats.totalOrders) * 100 : 0}
                showInfo={false}
                strokeColor="#0f172a"
                trailColor="#f1f5f9"
              />
            </div>
          </div>
        </div>

        {/* Invoice Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Fatura Durumları</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Taslak</span>
                <span className="text-sm font-medium text-slate-900">{invoiceStats?.draftInvoices ?? 0}</span>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.draftInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#94a3b8"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Kesilmiş</span>
                <span className="text-sm font-medium text-slate-900">{invoiceStats?.issuedInvoices ?? 0}</span>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.issuedInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#64748b"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Ödenmiş</span>
                <span className="text-sm font-medium text-slate-900">{invoiceStats?.paidInvoices ?? 0}</span>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.paidInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#334155"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Gecikmiş</span>
                <span className="text-sm font-medium text-slate-900">{invoiceStats?.overdueInvoices ?? 0}</span>
              </div>
              <Progress
                percent={invoiceStats?.totalInvoices ? ((invoiceStats?.overdueInvoices ?? 0) / invoiceStats.totalInvoices) * 100 : 0}
                showInfo={false}
                strokeColor="#0f172a"
                trailColor="#f1f5f9"
              />
            </div>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Ödeme Durumları</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Beklemede</span>
                <span className="text-sm font-medium text-slate-900">{paymentStats?.pendingPayments ?? 0}</span>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.pendingPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#94a3b8"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Reddedilen</span>
                <span className="text-sm font-medium text-slate-900">{paymentStats?.rejectedPayments ?? 0}</span>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.rejectedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#64748b"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Tamamlanan</span>
                <span className="text-sm font-medium text-slate-900">{paymentStats?.completedPayments ?? 0}</span>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.completedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#334155"
                trailColor="#f1f5f9"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">İade</span>
                <span className="text-sm font-medium text-slate-900">{paymentStats?.refundedPayments ?? 0}</span>
              </div>
              <Progress
                percent={paymentStats?.totalPayments ? ((paymentStats?.refundedPayments ?? 0) / paymentStats.totalPayments) * 100 : 0}
                showInfo={false}
                strokeColor="#0f172a"
                trailColor="#f1f5f9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Overdue Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Son Siparişler</h3>
            <button
              onClick={() => router.push('/sales/orders')}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              Tümünü Gör
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <Table
            columns={columns}
            dataSource={recentOrders?.items ?? []}
            rowKey="id"
            loading={ordersLoading}
            pagination={false}
            size="small"
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">Vadesi Geçmiş Faturalar</h3>
            </div>
            <button
              onClick={() => router.push('/sales/invoices?status=Overdue')}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              Tümü
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {overdueLoading ? (
            <div className="text-center py-8 text-slate-500">Yükleniyor...</div>
          ) : overdueInvoices?.items?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Vadesi geçmiş fatura yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueInvoices?.items?.map((invoice: InvoiceListItem) => {
                const daysOverdue = dayjs().diff(dayjs(invoice.dueDate), 'day');
                return (
                  <button
                    key={invoice.id}
                    onClick={() => router.push(`/sales/invoices/${invoice.id}`)}
                    className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-white">
                        {daysOverdue} gün gecikmiş
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{invoice.customerName}</p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.grandTotal)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
