'use client';

import React, { useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Table } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { LiveBadge, LastUpdated } from '@/components/status';
import { LineChart, BarChart, PieChart, AreaChart, generateTimeSeriesData, SalesChart, InventoryChart, CustomerChart, FinancialChart } from '@/components/charts';
import { KPICard, ComparisonCard, DashboardGrid, ChartWidget } from '@/components/dashboard';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';

const { Title } = Typography;

export default function DashboardPage() {
  const [lastUpdate] = useState(new Date());
  const { layouts, setLayouts } = useDashboardLayout();

  // Mock chart data
  const salesData = generateTimeSeriesData(7, ['Satışlar', 'Hedef'], [50000, 120000]);

  const categoryData = [
    { name: 'Elektronik', value: 450 },
    { name: 'Giyim', value: 320 },
    { name: 'Gıda', value: 280 },
    { name: 'Ev & Yaşam', value: 190 },
    { name: 'Diğer', value: 150 },
  ];

  const monthlyData = generateTimeSeriesData(12, ['Gelir', 'Gider'], [100000, 200000]);

  // Mock table data for recent orders
  const recentOrders = [
    {
      key: '1',
      orderNo: 'ORD-001',
      customer: 'Ahmet Yılmaz',
      amount: 450,
      status: 'Tamamlandı',
      updatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      key: '2',
      orderNo: 'ORD-002',
      customer: 'Ayşe Demir',
      amount: 780,
      status: 'İşlemde',
      updatedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      key: '3',
      orderNo: 'ORD-003',
      customer: 'Mehmet Kaya',
      amount: 1200,
      status: 'Beklemede',
      updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ];

  const columns = [
    {
      title: 'Sipariş No',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: 'Müşteri',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₺${amount.toFixed(2)}`,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Güncelleme',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: Date) => (
        <LastUpdated
          timestamp={date}
          prefix="Güncellendi"
          size="small"
          showIcon={false}
          refreshInterval={30000}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Title level={2}>Dashboard</Title>
        <LastUpdated timestamp={lastUpdate} refreshInterval={60000} />
      </div>
      <p>Hoş geldiniz! Stok yönetim sisteminize genel bakış.</p>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Toplam Satış"
            value={12450}
            prefix="₺"
            icon={<DollarOutlined />}
            trend={{ value: 1250, percentage: 11.2, label: 'son haftaya göre' }}
            isLive={true}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Siparişler"
            value={342}
            icon={<ShoppingCartOutlined />}
            trend={{ value: 27, percentage: 8.5, label: 'son haftaya göre' }}
            isLive={true}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Müşteriler"
            value={128}
            icon={<UserOutlined />}
            trend={{ value: 4, percentage: 3.2, label: 'son haftaya göre' }}
            isLive={false}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Büyüme"
            value={12.5}
            suffix="%"
            icon={<RiseOutlined />}
            trend={{ value: -0.3, percentage: -2.1, label: 'son aya göre' }}
            isLive={false}
            color="#faad14"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Satış Trendi (Son 7 Gün)">
            <LineChart
              data={salesData}
              lines={[
                { dataKey: 'Satışlar', stroke: '#8b5cf6', name: 'Satışlar' },
                { dataKey: 'Hedef', stroke: '#ec4899', name: 'Hedef' },
              ]}
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Kategori Dağılımı">
            <PieChart
              data={categoryData}
              height={300}
              innerRadius={60}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Aylık Gelir/Gider">
            <AreaChart
              data={monthlyData}
              areas={[
                { dataKey: 'Gelir', stroke: '#10b981', name: 'Gelir' },
                { dataKey: 'Gider', stroke: '#ef4444', name: 'Gider' },
              ]}
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Haftalık Performans">
            <BarChart
              data={salesData}
              bars={[
                { dataKey: 'Satışlar', fill: '#8b5cf6', name: 'Satışlar' },
              ]}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Performance Comparison */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <ComparisonCard
            title="Kategori Performansı"
            items={categoryData}
            valueFormatter={(value) => `${value} ürün`}
          />
        </Col>
        <Col xs={24} lg={12}>
          <ComparisonCard
            title="Satış Dağılımı (Son Hafta)"
            items={[
              { label: 'Pazartesi', value: 45000, color: '#8b5cf6' },
              { label: 'Salı', value: 52000, color: '#a78bfa' },
              { label: 'Çarşamba', value: 48000, color: '#c4b5fd' },
              { label: 'Perşembe', value: 61000, color: '#ddd6fe' },
              { label: 'Cuma', value: 73000, color: '#ede9fe' },
              { label: 'Cumartesi', value: 58000, color: '#f3e8ff' },
              { label: 'Pazar', value: 42000, color: '#faf5ff' },
            ]}
            valueFormatter={(value) => `₺${value.toLocaleString('tr-TR')}`}
          />
        </Col>
      </Row>

      {/* Interactive Charts Section with Drag & Drop */}
      <div style={{ marginTop: 24 }}>
        <DashboardGrid
          layouts={layouts}
          onLayoutChange={(layout, allLayouts) => setLayouts(allLayouts)}
        >
          <div key="sales-chart">
            <ChartWidget id="sales-chart" title="Satış Analizi">
              <SalesChart />
            </ChartWidget>
          </div>
          <div key="inventory-chart">
            <ChartWidget id="inventory-chart" title="Stok Yönetimi">
              <InventoryChart />
            </ChartWidget>
          </div>
          <div key="customer-chart">
            <ChartWidget id="customer-chart" title="Müşteri Analizi">
              <CustomerChart />
            </ChartWidget>
          </div>
          <div key="financial-chart">
            <ChartWidget id="financial-chart" title="Finansal Analiz">
              <FinancialChart />
            </ChartWidget>
          </div>
        </DashboardGrid>
      </div>

      {/* Recent Orders Table */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <span>Son Siparişler</span>
            <LiveBadge isLive size="small" />
          </div>
        }
        style={{ marginTop: 24 }}
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          pagination={false}
        />
      </Card>
    </div>
  );
}
