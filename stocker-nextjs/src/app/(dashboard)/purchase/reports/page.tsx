'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DatePicker,
  Select,
  Table,
  Progress,
  Tabs,
  Spin,
  Empty,
} from 'antd';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ShoppingCartIcon,
  TrophyIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import {
  useSupplierSummary,
  usePurchaseOrderSummary,
  usePurchaseInvoiceSummary,
  useSuppliers,
} from '@/lib/api/hooks/usePurchase';

const { RangePicker } = DatePicker;

const CHART_COLORS = [
  '#1e293b', // slate-800
  '#334155', // slate-700
  '#475569', // slate-600
  '#64748b', // slate-500
  '#94a3b8', // slate-400
  '#cbd5e1', // slate-300
  '#e2e8f0', // slate-200
  '#f1f5f9', // slate-100
];

export default function PurchaseReportsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>();

  // Fetch data
  const { data: supplierSummary, isLoading: loadingSuppliers } = useSupplierSummary();
  const { data: orderSummary, isLoading: loadingOrders } = usePurchaseOrderSummary();
  const { data: invoiceSummary, isLoading: loadingInvoices } = usePurchaseInvoiceSummary();
  const { data: suppliersData } = useSuppliers({ pageSize: 100 });

  const isLoading = loadingSuppliers || loadingOrders || loadingInvoices;

  // Mock monthly trend data (in real app, this would come from API)
  const monthlyTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = dayjs().month();
    return months.slice(0, currentMonth + 1).map((month) => ({
      month,
      siparişler: Math.floor(Math.random() * 50) + 10,
      faturalar: Math.floor(Math.random() * 40) + 5,
      tutar: Math.floor(Math.random() * 500000) + 100000,
    }));
  }, []);

  // Supplier performance data
  const supplierPerformanceData = useMemo(() => {
    if (!suppliersData?.items) return [];
    return suppliersData.items.slice(0, 10).map((supplier) => ({
      name: supplier.name.length > 20 ? supplier.name.substring(0, 20) + '...' : supplier.name,
      fullName: supplier.name,
      bakiye: supplier.currentBalance || 0,
      puan: supplier.rating || 0,
      durum: supplier.status,
    }));
  }, [suppliersData]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    if (!orderSummary?.ordersByStatus) return [];
    return Object.entries(orderSummary.ordersByStatus).map(([status, count], index) => ({
      name: getStatusLabel(status),
      value: count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [orderSummary]);

  // Invoice status distribution
  const invoiceStatusData = useMemo(() => {
    if (!invoiceSummary?.invoicesByStatus) return [];
    return Object.entries(invoiceSummary.invoicesByStatus).map(([status, count], index) => ({
      name: getInvoiceStatusLabel(status),
      value: count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [invoiceSummary]);

  // Top suppliers by amount
  const topSuppliersByAmount = useMemo(() => {
    if (!orderSummary?.amountBySupplier) return [];
    return Object.entries(orderSummary.amountBySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([supplier, amount], index) => ({
        name: supplier.length > 15 ? supplier.substring(0, 15) + '...' : supplier,
        fullName: supplier,
        tutar: amount,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [orderSummary]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-200">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
                ? entry.value.toLocaleString('tr-TR')
                : entry.value}
              {entry.name === 'tutar' && ' ₺'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Status label helpers
  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Draft: 'Taslak',
      PendingApproval: 'Onay Bekliyor',
      Confirmed: 'Onaylandı',
      Rejected: 'Reddedildi',
      Sent: 'Gönderildi',
      PartiallyReceived: 'Kısmen Alındı',
      Received: 'Teslim Alındı',
      Completed: 'Tamamlandı',
      Cancelled: 'İptal',
      Closed: 'Kapatıldı',
    };
    return labels[status] || status;
  }

  function getInvoiceStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Draft: 'Taslak',
      PendingApproval: 'Onay Bekliyor',
      Approved: 'Onaylandı',
      Rejected: 'Reddedildi',
      PartiallyPaid: 'Kısmen Ödendi',
      Paid: 'Ödendi',
      Cancelled: 'İptal',
    };
    return labels[status] || status;
  }

  // Export functions
  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Genel Bakış
        </span>
      ),
      children: (
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Monthly Trend */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Aylık Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrendData}>
                    <defs>
                      <linearGradient id="colorSiparis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e293b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFatura" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="siparişler"
                      name="Siparişler"
                      stroke="#1e293b"
                      fillOpacity={1}
                      fill="url(#colorSiparis)"
                    />
                    <Area
                      type="monotone"
                      dataKey="faturalar"
                      name="Faturalar"
                      stroke="#64748b"
                      fillOpacity={1}
                      fill="url(#colorFatura)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Pie */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Sipariş Durumları</h3>
                {orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">En Çok Sipariş Verilen Tedarikçiler</h3>
                {topSuppliersByAmount.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topSuppliersByAmount} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="tutar" name="Tutar" fill="#1e293b" radius={[0, 4, 4, 0]}>
                        {topSuppliersByAmount.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>

            {/* Invoice Status */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Fatura Durumları</h3>
                {invoiceStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={invoiceStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {invoiceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'suppliers',
      label: (
        <span className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4" />
          Tedarikçi Performansı
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Supplier Performance Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-medium text-slate-900">Tedarikçi Performans Tablosu</h3>
            </div>
            <Table
              dataSource={supplierPerformanceData}
              rowKey="name"
              pagination={{ pageSize: 10 }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
              columns={[
                {
                  title: 'Tedarikçi',
                  dataIndex: 'fullName',
                  key: 'fullName',
                  render: (name: string) => (
                    <span className="text-sm font-medium text-slate-900">{name}</span>
                  ),
                },
                {
                  title: 'Durum',
                  dataIndex: 'durum',
                  key: 'durum',
                  render: (status: string) => {
                    const config: Record<string, { bg: string; text: string; label: string }> = {
                      Active: { bg: 'bg-slate-800', text: 'text-white', label: 'Aktif' },
                      Inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pasif' },
                      Pending: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Bekliyor' },
                      Blacklisted: { bg: 'bg-slate-400', text: 'text-white', label: 'Bloklu' },
                      OnHold: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Beklemede' },
                    };
                    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
                    return (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
                        {c.label}
                      </span>
                    );
                  },
                },
                {
                  title: 'Puan',
                  dataIndex: 'puan',
                  key: 'puan',
                  render: (rating: number) => (
                    <div className="flex items-center gap-2">
                      <TrophyIcon className={`w-4 h-4 ${rating >= 4 ? 'text-slate-800' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium text-slate-900">{rating.toFixed(1)}</span>
                      <Progress
                        percent={rating * 20}
                        size="small"
                        showInfo={false}
                        strokeColor={rating >= 4 ? '#1e293b' : rating >= 3 ? '#64748b' : '#94a3b8'}
                        style={{ width: 60 }}
                      />
                    </div>
                  ),
                  sorter: (a, b) => a.puan - b.puan,
                },
                {
                  title: 'Bakiye',
                  dataIndex: 'bakiye',
                  key: 'bakiye',
                  render: (balance: number) => (
                    <span className={`text-sm font-medium ${balance > 0 ? 'text-slate-700' : 'text-slate-500'}`}>
                      {balance.toLocaleString('tr-TR')} ₺
                    </span>
                  ),
                  sorter: (a, b) => a.bakiye - b.bakiye,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Supplier by Type */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Tedarikçi Dağılımı (Tipe Göre)</h3>
                {supplierSummary?.suppliersByType && Object.keys(supplierSummary.suppliersByType).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(supplierSummary.suppliersByType).map(([type, count], index) => ({
                          name: getSupplierTypeLabel(type),
                          value: count,
                          color: CHART_COLORS[index % CHART_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(supplierSummary.suppliersByType).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>

            {/* Supplier by City */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Tedarikçi Dağılımı (Şehre Göre)</h3>
                {supplierSummary?.suppliersByCity && Object.keys(supplierSummary.suppliersByCity).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(supplierSummary.suppliersByCity)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([city, count]) => ({
                          city: city || 'Belirtilmemiş',
                          count,
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="city" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip />
                      <Bar dataKey="count" name="Tedarikçi Sayısı" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'orders',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingCartIcon className="w-4 h-4" />
          Sipariş Analitiği
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Order KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{orderSummary?.totalOrders || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Sipariş</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{orderSummary?.pendingOrders || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{orderSummary?.completedOrders || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlanan</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(orderSummary?.pendingAmount || 0).toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bekleyen Tutar</div>
            </div>
          </div>

          {/* Order Amount by Supplier */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Tedarikçiye Göre Sipariş Tutarları</h3>
            {orderSummary?.amountBySupplier && Object.keys(orderSummary.amountBySupplier).length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={Object.entries(orderSummary.amountBySupplier)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 15)
                    .map(([supplier, amount]) => ({
                      supplier: supplier.length > 20 ? supplier.substring(0, 20) + '...' : supplier,
                      tutar: amount,
                    }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="supplier" tick={{ fontSize: 12, fill: '#64748b' }} width={150} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="tutar" name="Tutar" fill="#1e293b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'invoices',
      label: (
        <span className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4" />
          Fatura Analitiği
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Invoice KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{invoiceSummary?.totalInvoices || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Fatura</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{invoiceSummary?.paidInvoices || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Ödenen</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{invoiceSummary?.overdueInvoices || 0}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Geciken</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {(invoiceSummary?.overdueAmount || 0).toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Geciken Tutar</div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Invoice Payment Progress */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Ödeme Durumu</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-500">Toplam Fatura Tutarı</span>
                      <span className="text-sm font-medium text-slate-900">
                        {(invoiceSummary?.totalAmount || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <Progress
                      percent={100}
                      showInfo={false}
                      strokeColor="#e2e8f0"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">Ödenen Tutar</span>
                      <span className="text-sm font-medium text-slate-800">
                        {(invoiceSummary?.totalPaidAmount || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <Progress
                      percent={invoiceSummary?.totalAmount
                        ? Math.round((invoiceSummary.totalPaidAmount / invoiceSummary.totalAmount) * 100)
                        : 0}
                      showInfo={false}
                      strokeColor="#1e293b"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-500">Kalan Tutar</span>
                      <span className="text-sm font-medium text-slate-600">
                        {(invoiceSummary?.totalRemainingAmount || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <Progress
                      percent={invoiceSummary?.totalAmount
                        ? Math.round((invoiceSummary.totalRemainingAmount / invoiceSummary.totalAmount) * 100)
                        : 0}
                      showInfo={false}
                      strokeColor="#64748b"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Amount by Supplier */}
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Tedarikçiye Göre Fatura Tutarları</h3>
                {invoiceSummary?.amountBySupplier && Object.keys(invoiceSummary.amountBySupplier).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(invoiceSummary.amountBySupplier)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([supplier, amount]) => ({
                          supplier: supplier.length > 15 ? supplier.substring(0, 15) + '...' : supplier,
                          tutar: amount,
                        }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="supplier" tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="tutar" name="Tutar" fill="#334155" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satın Alma Raporları</h1>
            <p className="text-sm text-slate-500">Tedarikçi performansı, sipariş analitiği ve finansal raporlar</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            Yazdır
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Tarih Aralığı</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              format="DD.MM.YYYY"
            />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Tedarikçi</span>
            <Select
              placeholder="Tüm Tedarikçiler"
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="label"
              value={selectedSupplier}
              onChange={setSelectedSupplier}
              options={suppliersData?.items?.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {supplierSummary?.activeSuppliers || 0}
            <span className="text-sm text-slate-400 font-normal">/{supplierSummary?.totalSuppliers || 0}</span>
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Tedarikçiler</div>
          <Progress
            percent={supplierSummary?.totalSuppliers
              ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
              : 0}
            showInfo={false}
            strokeColor="#1e293b"
            size="small"
            className="mt-2"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{orderSummary?.totalOrders || 0}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Siparişler</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-slate-600">{orderSummary?.pendingOrders || 0} bekleyen</span>
            {' / '}
            <span className="text-slate-800">{orderSummary?.completedOrders || 0} tamamlanan</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-slate-700" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{invoiceSummary?.totalInvoices || 0}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Faturalar</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="text-slate-800">{invoiceSummary?.paidInvoices || 0} ödenen</span>
            {' / '}
            <span className="text-slate-600">{invoiceSummary?.overdueInvoices || 0} geciken</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {(orderSummary?.totalAmount || 0).toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Tutar</div>
          <div className="text-xs text-slate-500 mt-1">
            {(invoiceSummary?.totalRemainingAmount || 0).toLocaleString('tr-TR')} ₺ ödenmemiş
          </div>
        </div>
      </div>

      {/* Tabs with Charts */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Tabs
          defaultActiveKey="overview"
          items={tabItems}
          className="[&_.ant-tabs-nav]:px-6 [&_.ant-tabs-nav]:pt-2 [&_.ant-tabs-content]:p-6"
        />
      </div>
    </div>
  );
}

// Helper function
function getSupplierTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Manufacturer: 'Üretici',
    Wholesaler: 'Toptancı',
    Distributor: 'Distribütör',
    Importer: 'İthalatçı',
    Retailer: 'Perakendeci',
    ServiceProvider: 'Hizmet Sağlayıcı',
    Other: 'Diğer',
  };
  return labels[type] || type;
}
