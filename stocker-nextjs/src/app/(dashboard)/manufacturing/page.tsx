'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Progress, Spin, Empty, Button } from 'antd';
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  CalculatorIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { useManufacturingDashboard } from '@/lib/api/hooks/useManufacturing';
import dayjs from 'dayjs';

const quickLinks = [
  { name: 'Urun Agaclari', href: '/manufacturing/bom', icon: CubeIcon, desc: 'BOM yonetimi' },
  { name: 'Uretim Emirleri', href: '/manufacturing/production-orders', icon: ClipboardDocumentListIcon, desc: 'Siparis takibi' },
  { name: 'Is Merkezleri', href: '/manufacturing/work-centers', icon: Cog6ToothIcon, desc: 'Kapasite yonetimi' },
  { name: 'Rotalar', href: '/manufacturing/routings', icon: ArrowPathIcon, desc: 'Uretim adimlari' },
  { name: 'MPS', href: '/manufacturing/master-production-schedules', icon: CalendarDaysIcon, desc: 'Ana uretim plani' },
  { name: 'Malzeme Rezervasyonlari', href: '/manufacturing/material-reservations', icon: CubeTransparentIcon, desc: 'Stok tahsisi' },
  { name: 'MRP', href: '/manufacturing/mrp-plans', icon: CalculatorIcon, desc: 'Malzeme planlama' },
  { name: 'Kalite Kontrol', href: '/manufacturing/quality-inspections', icon: ClipboardDocumentCheckIcon, desc: 'Kalite denetimi' },
  { name: 'Kapasite Planlari', href: '/manufacturing/capacity-plans', icon: ChartBarIcon, desc: 'Kapasite optimizasyonu' },
  { name: 'Maliyet Muhasebesi', href: '/manufacturing/cost-accounting', icon: CurrencyDollarIcon, desc: 'Maliyet analizi' },
  { name: 'Bakim', href: '/manufacturing/maintenance', icon: WrenchScrewdriverIcon, desc: 'Ekipman bakimi' },
  { name: 'Kalite Yonetimi', href: '/manufacturing/quality-management', icon: ShieldCheckIcon, desc: 'NCR & CAPA' },
  { name: 'Fason Siparisler', href: '/manufacturing/subcontract-orders', icon: TruckIcon, desc: 'Dis uretim' },
];

export default function ManufacturingDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading, refetch } = useManufacturingDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Empty description="Dashboard verileri yuklenemedi" />
      </div>
    );
  }

  const productionStats = [
    { label: 'Aktif Emirler', value: dashboard.activeProductionOrders, icon: PlayIcon, trend: null },
    { label: 'Bugunun Emirleri', value: dashboard.todaysOrders, icon: CalendarDaysIcon, trend: null },
    { label: 'Geciken Emirler', value: dashboard.overdueOrders, icon: ExclamationTriangleIcon, trend: 'negative' as const },
    { label: 'Tamamlanan', value: dashboard.completedToday, icon: CheckCircleIcon, trend: 'positive' as const },
  ];

  const kpiCards = [
    {
      title: 'OEE (Genel Ekipman Verimliligi)',
      value: dashboard.oeePercentage,
      suffix: '%',
      icon: ChartBarIcon,
      color: dashboard.oeePercentage >= 85 ? 'text-green-600' : dashboard.oeePercentage >= 60 ? 'text-yellow-600' : 'text-red-600',
      progress: true,
    },
    {
      title: 'Kalite Orani',
      value: dashboard.qualityRate,
      suffix: '%',
      icon: ShieldCheckIcon,
      color: dashboard.qualityRate >= 95 ? 'text-green-600' : dashboard.qualityRate >= 90 ? 'text-yellow-600' : 'text-red-600',
      progress: true,
    },
    {
      title: 'Zamaninda Teslim',
      value: dashboard.onTimeDeliveryRate,
      suffix: '%',
      icon: ClockIcon,
      color: dashboard.onTimeDeliveryRate >= 95 ? 'text-green-600' : dashboard.onTimeDeliveryRate >= 85 ? 'text-yellow-600' : 'text-red-600',
      progress: true,
    },
    {
      title: 'Kapasite Kullanimi',
      value: dashboard.capacityUtilization,
      suffix: '%',
      icon: Cog6ToothIcon,
      color: dashboard.capacityUtilization >= 90 ? 'text-red-600' : dashboard.capacityUtilization >= 70 ? 'text-green-600' : 'text-yellow-600',
      progress: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Uretim Yonetimi</h1>
          <p className="text-slate-500 mt-1">Uretim sureclerinizi tek noktadan yonetin</p>
        </div>
        <Button icon={<ArrowPathIcon className="w-4 h-4" />} onClick={() => refetch()} className="!border-slate-300 !text-slate-700">
          Yenile
        </Button>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {productionStats.map((stat, i) => (
          <div key={i} className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.trend === 'negative' ? 'text-red-600' : stat.trend === 'positive' ? 'text-green-600' : 'text-slate-600'}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'negative' ? 'text-red-600' : 'text-green-600'}`}>
                    {stat.trend === 'positive' ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
                  </div>
                )}
              </div>
              <div className={`text-2xl font-bold ${stat.trend === 'negative' && stat.value > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stat.value}
              </div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">{kpi.title}</div>
              </div>
              <div className={`text-3xl font-bold ${kpi.color} mb-2`}>
                {kpi.value}{kpi.suffix}
              </div>
              {kpi.progress && (
                <Progress
                  percent={kpi.value}
                  showInfo={false}
                  strokeColor={kpi.value >= 85 ? '#22c55e' : kpi.value >= 60 ? '#eab308' : '#ef4444'}
                  trailColor="#e2e8f0"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Production Orders */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Son Uretim Emirleri</h2>
              <Button type="link" onClick={() => router.push('/manufacturing/production-orders')} className="!text-slate-600 hover:!text-slate-900">
                Tumunu Gor
              </Button>
            </div>
            {dashboard.recentProductionOrders && dashboard.recentProductionOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentProductionOrders.map((order, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/manufacturing/production-orders/${order.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{order.orderNumber}</div>
                        <div className="text-sm text-slate-500">{order.productName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">{order.quantity} adet</div>
                        <div className="text-xs text-slate-500">{dayjs(order.plannedStartDate).format('DD.MM.YYYY')}</div>
                      </div>
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: order.status === 'Completed' ? '#dcfce7' : order.status === 'InProgress' ? '#e2e8f0' : '#f1f5f9',
                          color: order.status === 'Completed' ? '#166534' : order.status === 'InProgress' ? '#1e293b' : '#64748b',
                        }}
                      >
                        {order.status === 'Completed' ? 'Tamamlandi' : order.status === 'InProgress' ? 'Uretimde' : order.status === 'Planned' ? 'Planlandi' : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Uretim emri bulunamadi" />
            )}
          </div>
        </div>

        {/* Alerts & Issues */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Uyarilar</h2>
            {dashboard.alerts && dashboard.alerts.length > 0 ? (
              <div className="space-y-3">
                {dashboard.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.severity === 'Critical' ? 'bg-red-50' : alert.severity === 'Warning' ? 'bg-yellow-50' : 'bg-slate-50'
                    }`}
                  >
                    <ExclamationTriangleIcon
                      className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'Critical' ? 'text-red-600' : alert.severity === 'Warning' ? 'text-yellow-600' : 'text-slate-600'
                      }`}
                    />
                    <div>
                      <div className={`text-sm font-medium ${
                        alert.severity === 'Critical' ? 'text-red-900' : alert.severity === 'Warning' ? 'text-yellow-900' : 'text-slate-900'
                      }`}>
                        {alert.title}
                      </div>
                      <div className={`text-xs ${
                        alert.severity === 'Critical' ? 'text-red-700' : alert.severity === 'Warning' ? 'text-yellow-700' : 'text-slate-600'
                      }`}>
                        {alert.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-800">Aktif uyari bulunmuyor</div>
              </div>
            )}
          </div>

          {/* Maintenance Due */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Yaklasan Bakimlar</h2>
            {dashboard.upcomingMaintenance && dashboard.upcomingMaintenance.length > 0 ? (
              <div className="space-y-3">
                {dashboard.upcomingMaintenance.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <WrenchScrewdriverIcon className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{m.workCenterName}</div>
                        <div className="text-xs text-slate-500">{m.maintenanceType}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${dayjs(m.scheduledDate).diff(dayjs(), 'day') <= 3 ? 'text-red-600' : 'text-slate-600'}`}>
                      {dayjs(m.scheduledDate).format('DD.MM')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Yaklasan bakim bulunmuyor</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Hizli Erisim</h2>
        <div className="grid grid-cols-12 gap-4">
          {quickLinks.map((link, i) => (
            <div
              key={i}
              className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2"
              onClick={() => router.push(link.href)}
            >
              <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition-colors">
                  <link.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="font-medium text-slate-900 text-sm">{link.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{link.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
