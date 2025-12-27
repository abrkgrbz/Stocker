'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Select,
  Button,
  Table,
  Tag,
  Progress,
  Statistic,
  Tabs,
  Spin,
  Empty,
  Space,
} from 'antd';
import {
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
  usePurchaseOrders,
  usePurchaseInvoices,
} from '@/lib/api/hooks/usePurchase';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
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
  const { data: ordersData } = usePurchaseOrders({ pageSize: 100 });
  const { data: invoicesData } = usePurchaseInvoices({ pageSize: 100 });

  const isLoading = loadingSuppliers || loadingOrders || loadingInvoices;

  // Mock monthly trend data (in real app, this would come from API)
  const monthlyTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = dayjs().month();
    return months.slice(0, currentMonth + 1).map((month, index) => ({
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
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
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
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Title level={2} className="!mb-1">
              <ChartBarIcon className="w-4 h-4" className="mr-2" />
              Satın Alma Raporları
            </Title>
            <Text type="secondary">
              Tedarikçi performansı, sipariş analitiği ve finansal raporlar
            </Text>
          </div>
          <Space>
            <Button icon={<DocumentIcon className="w-4 h-4" />} onClick={handleExportExcel}>
              Excel
            </Button>
            <Button icon={<PrinterIcon className="w-4 h-4" />} onClick={handlePrint}>
              Yazdır
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Card size="small" className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <Text type="secondary" className="block mb-1">Tarih Aralığı</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                format="DD.MM.YYYY"
              />
            </div>
            <div>
              <Text type="secondary" className="block mb-1">Tedarikçi</Text>
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
        </Card>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={<span><UserGroupIcon className="w-4 h-4" className="mr-2" />Aktif Tedarikçiler</span>}
              value={supplierSummary?.activeSuppliers || 0}
              suffix={`/ ${supplierSummary?.totalSuppliers || 0}`}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="mt-2">
              <Progress
                percent={supplierSummary?.totalSuppliers
                  ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                  : 0}
                showInfo={false}
                strokeColor="#10b981"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={<span><ShoppingCartOutlined className="mr-2" />Toplam Sipariş</span>}
              value={orderSummary?.totalOrders || 0}
              valueStyle={{ color: '#3b82f6' }}
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className="text-orange-500">{orderSummary?.pendingOrders || 0} bekleyen</span>
              {' • '}
              <span className="text-green-500">{orderSummary?.completedOrders || 0} tamamlanan</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={<span><DocumentTextIcon className="w-4 h-4" className="mr-2" />Toplam Fatura</span>}
              value={invoiceSummary?.totalInvoices || 0}
              valueStyle={{ color: '#8b5cf6' }}
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className="text-green-500">{invoiceSummary?.paidInvoices || 0} ödenen</span>
              {' • '}
              <span className="text-red-500">{invoiceSummary?.overdueInvoices || 0} geciken</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={<span><CurrencyDollarIcon className="w-4 h-4" className="mr-2" />Toplam Tutar</span>}
              value={orderSummary?.totalAmount || 0}
              precision={0}
              suffix="₺"
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="mt-2 text-sm text-gray-500">
              <span className="text-orange-500">
                {(invoiceSummary?.totalRemainingAmount || 0).toLocaleString('tr-TR')} ₺ ödenmemiş
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <ChartBarIcon className="w-4 h-4" className="mr-1" />
                Genel Bakış
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* Monthly Trend */}
                <Col xs={24} lg={16}>
                  <Card title="Aylık Trend" size="small">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyTrendData}>
                        <defs>
                          <linearGradient id="colorSiparis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFatura" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="siparişler"
                          name="Siparişler"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorSiparis)"
                        />
                        <Area
                          type="monotone"
                          dataKey="faturalar"
                          name="Faturalar"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorFatura)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Order Status Pie */}
                <Col xs={24} lg={8}>
                  <Card title="Sipariş Durumları" size="small">
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
                  </Card>
                </Col>

                {/* Top Suppliers */}
                <Col xs={24} lg={12}>
                  <Card title="En Çok Sipariş Verilen Tedarikçiler" size="small">
                    {topSuppliersByAmount.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topSuppliersByAmount} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar dataKey="tutar" name="Tutar" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {topSuppliersByAmount.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Veri bulunamadı" />
                    )}
                  </Card>
                </Col>

                {/* Invoice Status */}
                <Col xs={24} lg={12}>
                  <Card title="Fatura Durumları" size="small">
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
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'suppliers',
            label: (
              <span>
                <UserGroupIcon className="w-4 h-4" className="mr-1" />
                Tedarikçi Performansı
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* Supplier Performance Table */}
                <Col xs={24}>
                  <Card title="Tedarikçi Performans Tablosu" size="small">
                    <Table
                      dataSource={supplierPerformanceData}
                      rowKey="name"
                      pagination={{ pageSize: 10 }}
                      columns={[
                        {
                          title: 'Tedarikçi',
                          dataIndex: 'fullName',
                          key: 'fullName',
                          render: (name: string) => (
                            <span className="font-medium">{name}</span>
                          ),
                        },
                        {
                          title: 'Durum',
                          dataIndex: 'durum',
                          key: 'durum',
                          render: (status: string) => {
                            const colors: Record<string, string> = {
                              Active: 'green',
                              Inactive: 'default',
                              Pending: 'orange',
                              Blacklisted: 'red',
                              OnHold: 'yellow',
                            };
                            const labels: Record<string, string> = {
                              Active: 'Aktif',
                              Inactive: 'Pasif',
                              Pending: 'Bekliyor',
                              Blacklisted: 'Bloklu',
                              OnHold: 'Beklemede',
                            };
                            return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
                          },
                        },
                        {
                          title: 'Puan',
                          dataIndex: 'puan',
                          key: 'puan',
                          render: (rating: number) => (
                            <div className="flex items-center gap-2">
                              <TrophyIcon className="w-4 h-4" className={rating >= 4 ? 'text-yellow-500' : 'text-gray-400'} />
                              <span className="font-medium">{rating.toFixed(1)}</span>
                              <Progress
                                percent={rating * 20}
                                size="small"
                                showInfo={false}
                                strokeColor={rating >= 4 ? '#faad14' : rating >= 3 ? '#52c41a' : '#ff4d4f'}
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
                            <span className={balance > 0 ? 'text-orange-500' : 'text-green-500'}>
                              {balance.toLocaleString('tr-TR')} ₺
                            </span>
                          ),
                          sorter: (a, b) => a.bakiye - b.bakiye,
                        },
                      ]}
                    />
                  </Card>
                </Col>

                {/* Supplier by Type */}
                <Col xs={24} lg={12}>
                  <Card title="Tedarikçi Dağılımı (Tipe Göre)" size="small">
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
                  </Card>
                </Col>

                {/* Supplier by City */}
                <Col xs={24} lg={12}>
                  <Card title="Tedarikçi Dağılımı (Şehre Göre)" size="small">
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip />
                          <Bar dataKey="count" name="Tedarikçi Sayısı" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Veri bulunamadı" />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'orders',
            label: (
              <span>
                <ShoppingCartOutlined className="mr-1" />
                Sipariş Analitiği
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* Order KPIs */}
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Toplam Sipariş"
                      value={orderSummary?.totalOrders || 0}
                      valueStyle={{ color: '#3b82f6' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Bekleyen Sipariş"
                      value={orderSummary?.pendingOrders || 0}
                      valueStyle={{ color: '#f59e0b' }}
                      prefix={<ExclamationTriangleIcon className="w-4 h-4" />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Tamamlanan"
                      value={orderSummary?.completedOrders || 0}
                      valueStyle={{ color: '#10b981' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Bekleyen Tutar"
                      value={orderSummary?.pendingAmount || 0}
                      precision={0}
                      suffix="₺"
                      valueStyle={{ color: '#ef4444' }}
                    />
                  </Card>
                </Col>

                {/* Order Amount by Supplier */}
                <Col xs={24}>
                  <Card title="Tedarikçiye Göre Sipariş Tutarları" size="small">
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
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="supplier" tick={{ fontSize: 12 }} width={150} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar dataKey="tutar" name="Tutar" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Veri bulunamadı" />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'invoices',
            label: (
              <span>
                <DocumentTextIcon className="w-4 h-4" className="mr-1" />
                Fatura Analitiği
              </span>
            ),
            children: (
              <Row gutter={[16, 16]}>
                {/* Invoice KPIs */}
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Toplam Fatura"
                      value={invoiceSummary?.totalInvoices || 0}
                      valueStyle={{ color: '#8b5cf6' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Ödenen"
                      value={invoiceSummary?.paidInvoices || 0}
                      valueStyle={{ color: '#10b981' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Geciken"
                      value={invoiceSummary?.overdueInvoices || 0}
                      valueStyle={{ color: '#ef4444' }}
                      prefix={<ExclamationTriangleIcon className="w-4 h-4" />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card size="small">
                    <Statistic
                      title="Geciken Tutar"
                      value={invoiceSummary?.overdueAmount || 0}
                      precision={0}
                      suffix="₺"
                      valueStyle={{ color: '#ef4444' }}
                    />
                  </Card>
                </Col>

                {/* Invoice Payment Progress */}
                <Col xs={24} lg={12}>
                  <Card title="Ödeme Durumu" size="small">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text>Toplam Fatura Tutarı</Text>
                          <Text strong>{(invoiceSummary?.totalAmount || 0).toLocaleString('tr-TR')} ₺</Text>
                        </div>
                        <Progress
                          percent={100}
                          showInfo={false}
                          strokeColor="#e5e7eb"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text className="text-green-600">Ödenen Tutar</Text>
                          <Text strong className="text-green-600">
                            {(invoiceSummary?.totalPaidAmount || 0).toLocaleString('tr-TR')} ₺
                          </Text>
                        </div>
                        <Progress
                          percent={invoiceSummary?.totalAmount
                            ? Math.round((invoiceSummary.totalPaidAmount / invoiceSummary.totalAmount) * 100)
                            : 0}
                          showInfo={false}
                          strokeColor="#10b981"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Text className="text-orange-500">Kalan Tutar</Text>
                          <Text strong className="text-orange-500">
                            {(invoiceSummary?.totalRemainingAmount || 0).toLocaleString('tr-TR')} ₺
                          </Text>
                        </div>
                        <Progress
                          percent={invoiceSummary?.totalAmount
                            ? Math.round((invoiceSummary.totalRemainingAmount / invoiceSummary.totalAmount) * 100)
                            : 0}
                          showInfo={false}
                          strokeColor="#f59e0b"
                        />
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Invoice Amount by Supplier */}
                <Col xs={24} lg={12}>
                  <Card title="Tedarikçiye Göre Fatura Tutarları" size="small">
                    {invoiceSummary?.amountBySupplier && Object.keys(invoiceSummary.amountBySupplier).length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={Object.entries(invoiceSummary.amountBySupplier)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([supplier, amount], index) => ({
                              supplier: supplier.length > 15 ? supplier.substring(0, 15) + '...' : supplier,
                              tutar: amount,
                            }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="supplier" tick={{ fontSize: 12 }} width={120} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar dataKey="tutar" name="Tutar" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Veri bulunamadı" />
                    )}
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
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
