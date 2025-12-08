'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Typography, Button, Space, List, Tag, Tooltip, Progress } from 'antd';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WalletOutlined,
  InboxOutlined,
  RollbackOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
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
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Chart color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function PurchaseDashboardPage() {
  const router = useRouter();

  const { data: supplierSummary } = useSupplierSummary();
  const { data: requestSummary } = usePurchaseRequestSummary();
  const { data: orderSummary } = usePurchaseOrderSummary();
  const { data: invoiceSummary } = usePurchaseInvoiceSummary();
  const { data: paymentSummary } = useSupplierPaymentSummary();
  const { data: returnSummary } = usePurchaseReturnSummary();

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Order status pie chart data
  const orderStatusData = useMemo(() => {
    if (!orderSummary) return [];
    return [
      { name: 'Taslak', value: orderSummary.draftOrders || 0, color: '#94a3b8' },
      { name: 'Onay Bekliyor', value: orderSummary.pendingOrders || 0, color: '#f59e0b' },
      { name: 'Onaylandı', value: orderSummary.confirmedOrders || 0, color: '#3b82f6' },
      { name: 'Tamamlandı', value: orderSummary.completedOrders || 0, color: '#10b981' },
    ].filter(item => item.value > 0);
  }, [orderSummary]);

  // Invoice status pie chart data
  const invoiceStatusData = useMemo(() => {
    if (!invoiceSummary) return [];
    return [
      { name: 'Taslak', value: invoiceSummary.draftInvoices || 0, color: '#94a3b8' },
      { name: 'Bekleyen', value: invoiceSummary.pendingInvoices || 0, color: '#f59e0b' },
      { name: 'Onaylı', value: invoiceSummary.approvedInvoices || 0, color: '#3b82f6' },
      { name: 'Ödenmiş', value: invoiceSummary.paidInvoices || 0, color: '#10b981' },
      { name: 'Vadesi Geçmiş', value: invoiceSummary.overdueInvoices || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [invoiceSummary]);

  // Monthly trend data (mock data - replace with actual API data when available)
  const monthlyTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const currentMonth = dayjs().month();
    return months.slice(0, currentMonth + 1).map((month, index) => ({
      name: month,
      siparisler: Math.floor(Math.random() * 50) + 10,
      faturalar: Math.floor(Math.random() * 40) + 5,
    }));
  }, []);

  // Custom tooltip for pie chart
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-600">{payload[0].value} adet</p>
        </div>
      );
    }
    return null;
  };

  const quickActions = [
    { icon: <ShopOutlined />, label: 'Yeni Tedarikçi', path: '/purchase/suppliers/new', color: '#8b5cf6' },
    { icon: <FileTextOutlined />, label: 'Yeni Talep', path: '/purchase/requests/new', color: '#a855f7' },
    { icon: <ShoppingCartOutlined />, label: 'Yeni Sipariş', path: '/purchase/orders/new', color: '#3b82f6' },
    { icon: <InboxOutlined />, label: 'Mal Alımı', path: '/purchase/goods-receipts/new', color: '#10b981' },
    { icon: <FileTextOutlined />, label: 'Yeni Fatura', path: '/purchase/invoices/new', color: '#f59e0b' },
    { icon: <WalletOutlined />, label: 'Yeni Ödeme', path: '/purchase/payments/new', color: '#06b6d4' },
    { icon: <RollbackOutlined />, label: 'Yeni İade', path: '/purchase/returns/new', color: '#ef4444' },
    { icon: <BarChartOutlined />, label: 'Raporlar', path: '/purchase/reports', color: '#0ea5e9' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-2">
          Satın Alma Dashboard
        </Title>
        <Text type="secondary">
          Tedarik zincirinizi ve satın alma operasyonlarınızı yönetin
        </Text>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6" size="small">
        <div className="flex items-center justify-between mb-4">
          <Text strong>Hızlı İşlemler</Text>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              icon={action.icon}
              onClick={() => router.push(action.path)}
              style={{
                borderColor: action.color,
                color: action.color,
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => router.push('/purchase/suppliers')}
            className="cursor-pointer"
          >
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <ShopOutlined style={{ color: '#8b5cf6' }} />
                  Tedarikçiler
                </span>
              }
              value={supplierSummary?.totalSuppliers || 0}
              suffix={
                <span className="text-sm text-gray-500">
                  / {supplierSummary?.activeSuppliers || 0} aktif
                </span>
              }
            />
            <div className="mt-2">
              <Progress
                percent={
                  supplierSummary?.totalSuppliers
                    ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                    : 0
                }
                size="small"
                strokeColor="#8b5cf6"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => router.push('/purchase/requests')}
            className="cursor-pointer"
          >
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <FileTextOutlined style={{ color: '#a855f7' }} />
                  Satın Alma Talepleri
                </span>
              }
              value={requestSummary?.pendingRequests || 0}
              valueStyle={{ color: '#a855f7' }}
              suffix={
                <span className="text-sm text-gray-500">
                  bekleyen
                </span>
              }
            />
            <div className="mt-2 flex items-center gap-2">
              <Tag color="green">{requestSummary?.approvedRequests || 0} Onaylı</Tag>
              <Tag color="purple">{requestSummary?.totalRequests || 0} Toplam</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => router.push('/purchase/orders')}
            className="cursor-pointer"
          >
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <ShoppingCartOutlined style={{ color: '#3b82f6' }} />
                  Açık Siparişler
                </span>
              }
              value={orderSummary?.pendingOrders || 0}
              valueStyle={{ color: '#3b82f6' }}
            />
            <div className="mt-2 flex items-center gap-2">
              <Tag color="blue">{orderSummary?.draftOrders || 0} Taslak</Tag>
              <Tag color="cyan">{orderSummary?.confirmedOrders || 0} Onaylı</Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => router.push('/purchase/invoices')}
            className="cursor-pointer"
          >
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <FileTextOutlined style={{ color: '#f59e0b' }} />
                  Bekleyen Faturalar
                </span>
              }
              value={invoiceSummary?.pendingInvoices || 0}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="mt-2 text-sm">
              <span className="text-red-500 flex items-center gap-1">
                <WarningOutlined />
                {invoiceSummary?.overdueInvoices || 0} vadesi geçmiş
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            hoverable
            onClick={() => router.push('/purchase/payments')}
            className="cursor-pointer"
          >
            <Statistic
              title={
                <span className="flex items-center gap-2">
                  <WalletOutlined style={{ color: '#10b981' }} />
                  Bu Ay Ödemeler
                </span>
              }
              value={formatCurrency(paymentSummary?.completedAmount || 0)}
              valueStyle={{ color: '#10b981', fontSize: '20px' }}
            />
            <div className="mt-2 text-sm text-gray-500">
              {paymentSummary?.completedPayments || 0} işlem tamamlandı
            </div>
          </Card>
        </Col>
      </Row>

      {/* Financial Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Finansal Özet" className="h-full">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(orderSummary?.totalAmount || 0)}
                  </div>
                  <div className="text-gray-600 mt-1">Toplam Sipariş Tutarı</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatCurrency(invoiceSummary?.totalRemainingAmount || 0)}
                  </div>
                  <div className="text-gray-600 mt-1">Ödenmemiş Fatura</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(invoiceSummary?.overdueAmount || 0)}
                  </div>
                  <div className="text-gray-600 mt-1">Vadesi Geçmiş</div>
                </div>
              </Col>
            </Row>

            <div className="mt-6 pt-6 border-t">
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tedarikçi Bakiyesi</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(supplierSummary?.totalBalance || 0)}
                    </span>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bekleyen Ödemeler</span>
                    <span className="font-semibold text-lg text-orange-600">
                      {formatCurrency(paymentSummary?.pendingAmount || 0)}
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="İade Durumu" className="h-full">
            <div className="space-y-4">
              <Statistic
                title="Toplam İadeler"
                value={returnSummary?.totalReturns || 0}
                prefix={<RollbackOutlined style={{ color: '#ef4444' }} />}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {returnSummary?.pendingReturns || 0}
                  </div>
                  <div className="text-xs text-gray-600">Bekleyen</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {returnSummary?.completedReturns || 0}
                  </div>
                  <div className="text-xs text-gray-600">Tamamlanan</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Toplam İade Tutarı</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(returnSummary?.totalReturnAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bekleyen İade</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(returnSummary?.pendingRefundAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card title="Aylık Trend" className="h-full">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyTrendData}>
                  <defs>
                    <linearGradient id="colorSiparisler" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFaturalar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="siparisler"
                    name="Siparişler"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorSiparisler)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="faturalar"
                    name="Faturalar"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorFaturalar)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sipariş Durumu Dağılımı" className="h-full">
            <div style={{ width: '100%', height: 300 }}>
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer>
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
                    <RechartsTooltip content={renderCustomTooltip} />
                    <Legend
                      formatter={(value: string) => <span className="text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Sipariş verisi bulunamadı
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Invoice Status Chart */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Fatura Durumu Dağılımı">
            <div style={{ width: '100%', height: 280 }}>
              {invoiceStatusData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={invoiceStatusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`${value} adet`, 'Miktar']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {invoiceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Fatura verisi bulunamadı
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Tedarikçi Özeti">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {supplierSummary?.activeSuppliers || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Aktif Tedarikçi</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {supplierSummary?.inactiveSuppliers || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Pasif Tedarikçi</div>
                </div>
              </Col>
              <Col span={24}>
                <div className="mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Aktif Oran</span>
                    <span className="font-medium">
                      {supplierSummary?.totalSuppliers
                        ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress
                    percent={
                      supplierSummary?.totalSuppliers
                        ? Math.round((supplierSummary.activeSuppliers / supplierSummary.totalSuppliers) * 100)
                        : 0
                    }
                    strokeColor={{
                      '0%': '#8b5cf6',
                      '100%': '#a855f7',
                    }}
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={24}>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-500">Toplam Bakiye</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(supplierSummary?.totalBalance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tipe Göre</span>
                    <Tag color="purple">{Object.keys(supplierSummary?.suppliersByType || {}).length} kategori</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Status Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ShopOutlined className="text-xl text-purple-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Tedarikçiler</div>
                <div className="text-xl font-semibold">{supplierSummary?.totalSuppliers || 0}</div>
              </div>
            </div>
            <Button
              type="link"
              className="mt-3 p-0"
              onClick={() => router.push('/purchase/suppliers')}
            >
              Tümünü Gör →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <FileTextOutlined className="text-xl text-violet-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Talepler</div>
                <div className="text-xl font-semibold">{requestSummary?.totalRequests || 0}</div>
              </div>
            </div>
            <Button
              type="link"
              className="mt-3 p-0"
              onClick={() => router.push('/purchase/requests')}
            >
              Tümünü Gör →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCartOutlined className="text-xl text-blue-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Siparişler</div>
                <div className="text-xl font-semibold">{orderSummary?.totalOrders || 0}</div>
              </div>
            </div>
            <Button
              type="link"
              className="mt-3 p-0"
              onClick={() => router.push('/purchase/orders')}
            >
              Tümünü Gör →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileTextOutlined className="text-xl text-amber-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Faturalar</div>
                <div className="text-xl font-semibold">{invoiceSummary?.totalInvoices || 0}</div>
              </div>
            </div>
            <Button
              type="link"
              className="mt-3 p-0"
              onClick={() => router.push('/purchase/invoices')}
            >
              Tümünü Gör →
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8} xl={4}>
          <Card size="small">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <WalletOutlined className="text-xl text-green-600" />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Ödemeler</div>
                <div className="text-xl font-semibold">{paymentSummary?.totalPayments || 0}</div>
              </div>
            </div>
            <Button
              type="link"
              className="mt-3 p-0"
              onClick={() => router.push('/purchase/payments')}
            >
              Tümünü Gör →
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
