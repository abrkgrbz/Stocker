import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../metronic/ui/card';
import { Button } from '../../metronic/ui/button';
import { Progress } from '../../metronic/ui/progress';
import { Badge } from '../../metronic/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../metronic/ui/tabs';
import { Avatar } from '../../metronic/ui/avatar';
import { 
  Users, 
  Building2, 
  Package, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  CreditCard,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Filter,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../metronic/ui/dropdown-menu';

const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Grafik verileri
  const revenueChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px'
        },
        formatter: (value) => `₺${value}K`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `₺${value}.000`
      }
    },
    colors: ['#667eea', '#f59e0b'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      }
    }
  };

  const revenueChartSeries = [
    {
      name: 'Gelir',
      data: [420, 380, 450, 470, 510, 480, 520, 545, 580, 590, 620, 650]
    },
    {
      name: 'Gider',
      data: [280, 250, 290, 310, 320, 300, 340, 350, 370, 360, 380, 390]
    }
  ];

  // Kullanıcı büyüme grafiği
  const userGrowthOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px'
        }
      }
    },
    colors: ['#10b981'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      }
    }
  };

  const userGrowthSeries = [
    {
      name: 'Yeni Kullanıcı',
      data: [145, 189, 234, 178, 256, 289, 312]
    }
  ];

  // Paket dağılımı
  const packageDistributionOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Enterprise', 'Premium', 'Business', 'Starter', 'Free'],
    colors: ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#475569'
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: any) {
        return Math.round(val) + "%"
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const packageDistributionSeries = [35, 25, 20, 15, 5];

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: '12,487',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: 'Son 30 gün'
    },
    {
      title: 'Aktif Tenants',
      value: '487',
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'green',
      description: 'Aktif abonelik'
    },
    {
      title: 'Aylık Gelir',
      value: '₺487,250',
      change: '+24.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple',
      description: 'MRR'
    },
    {
      title: 'Aktif Paketler',
      value: '24',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'orange',
      description: 'Satıştaki'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'Yeni tenant oluşturdu', tenant: 'ABC Corp', time: '2 dakika önce', type: 'success' },
    { id: 2, user: 'Mehmet Kaya', action: 'Premium pakete yükseltme yaptı', tenant: 'XYZ Ltd', time: '15 dakika önce', type: 'info' },
    { id: 3, user: 'Ayşe Demir', action: 'Ödeme başarısız', tenant: 'Demo Inc', time: '1 saat önce', type: 'error' },
    { id: 4, user: 'Fatma Şahin', action: 'Yeni kullanıcı ekledi', tenant: 'Test Co', time: '2 saat önce', type: 'success' },
    { id: 5, user: 'Ali Çelik', action: 'Paketi iptal etti', tenant: 'Sample LLC', time: '3 saat önce', type: 'warning' },
  ];

  const topTenants = [
    { name: 'Acme Corp', users: 245, plan: 'Enterprise', revenue: '₺45,000', growth: '+15%', status: 'active' },
    { name: 'TechStart Inc', users: 189, plan: 'Premium', revenue: '₺32,000', growth: '+8%', status: 'active' },
    { name: 'Global Systems', users: 156, plan: 'Premium', revenue: '₺28,500', growth: '+12%', status: 'active' },
    { name: 'Innovation Labs', users: 134, plan: 'Business', revenue: '₺24,000', growth: '-3%', status: 'warning' },
    { name: 'Digital Solutions', users: 98, plan: 'Business', revenue: '₺18,000', growth: '+5%', status: 'active' },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sistem genelinde özet ve istatistikler</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {dateRange === '7d' ? 'Son 7 Gün' : dateRange === '30d' ? 'Son 30 Gün' : 'Son 3 Ay'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDateRange('7d')}>Son 7 Gün</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('30d')}>Son 30 Gün</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('90d')}>Son 3 Ay</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <Icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {isUp ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
                {/* Background decoration */}
                <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/10 opacity-50`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gelir Analizi</CardTitle>
                <CardDescription>Aylık gelir ve gider takibi</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>CSV İndir</DropdownMenuItem>
                  <DropdownMenuItem>PDF Olarak Kaydet</DropdownMenuItem>
                  <DropdownMenuItem>Detaylı Rapor</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <ReactApexChart 
              options={revenueChartOptions} 
              series={revenueChartSeries} 
              type="area" 
              height={300} 
            />
          </CardContent>
        </Card>

        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Paket Dağılımı</CardTitle>
            <CardDescription>Aktif aboneliklerin dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactApexChart 
              options={packageDistributionOptions} 
              series={packageDistributionSeries} 
              type="donut" 
              height={280} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Büyümesi</CardTitle>
            <CardDescription>Haftalık yeni kullanıcı sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactApexChart 
              options={userGrowthOptions} 
              series={userGrowthSeries} 
              type="bar" 
              height={200} 
            />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>Sistemdeki son işlemler</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{activity.user}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.tenant}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.action}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>En İyi Müşteriler</CardTitle>
              <CardDescription>Gelire göre en iyi 5 müşteri</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Şirket</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Kullanıcılar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Plan</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Aylık Gelir</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Büyüme</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Durum</th>
                </tr>
              </thead>
              <tbody>
                {topTenants.map((tenant) => (
                  <tr key={tenant.name} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {tenant.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-gray-500">ID: {Math.random().toString(36).substr(2, 9)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{tenant.users}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={tenant.plan === 'Enterprise' ? 'default' : tenant.plan === 'Premium' ? 'secondary' : 'outline'}>
                        {tenant.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <p className="font-semibold">{tenant.revenue}</p>
                      <p className="text-xs text-gray-500">MRR</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        tenant.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tenant.growth.startsWith('+') ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {tenant.growth}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={
                          tenant.status === 'active' ? 'border-green-500 text-green-600' : 
                          tenant.status === 'warning' ? 'border-yellow-500 text-yellow-600' : 
                          'border-red-500 text-red-600'
                        }
                      >
                        {tenant.status === 'active' ? 'Aktif' : tenant.status === 'warning' ? 'Uyarı' : 'Pasif'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sunucu Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Kullanımı</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>RAM Kullanımı</span>
                  <span className="font-medium">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Kullanımı</span>
                  <span className="font-medium">82%</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">API Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Durum</span>
                <Badge className="bg-green-100 text-green-700">Çalışıyor</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="font-medium">99.98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ortalama Yanıt</span>
                <span className="font-medium">124ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">İstek/Dakika</span>
                <span className="font-medium">3,847</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Güvenlik Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Başarısız Girişler</span>
                <Badge variant="destructive">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Engellenen IP</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Son Tarama</span>
                <span className="text-xs text-gray-500">2 saat önce</span>
              </div>
              <Button variant="outline" className="w-full mt-2" size="sm">
                Güvenlik Raporu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;