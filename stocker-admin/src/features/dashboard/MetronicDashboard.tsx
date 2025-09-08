import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../metronic/ui/card';
import { Button } from '../../metronic/ui/button';
import { Progress } from '../../metronic/ui/progress';
import { Badge } from '../../metronic/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../metronic/ui/tabs';
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
  ArrowDownRight
} from 'lucide-react';

const MetronicDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: '12,487',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Aktif Tenants',
      value: '487',
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Aylık Gelir',
      value: '₺487,250',
      change: '+24.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Aktif Paketler',
      value: '24',
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'orange'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'Yeni tenant oluşturdu', time: '2 dakika önce', type: 'success' },
    { id: 2, user: 'Mehmet Kaya', action: 'Premium pakete yükseltme yaptı', time: '15 dakika önce', type: 'info' },
    { id: 3, user: 'Ayşe Demir', action: 'Ödeme başarısız', time: '1 saat önce', type: 'error' },
    { id: 4, user: 'Fatma Şahin', action: 'Yeni kullanıcı ekledi', time: '2 saat önce', type: 'success' },
    { id: 5, user: 'Ali Çelik', action: 'Paketi iptal etti', time: '3 saat önce', type: 'warning' },
  ];

  const topTenants = [
    { name: 'Acme Corp', users: 245, plan: 'Enterprise', revenue: '₺45,000' },
    { name: 'TechStart Inc', users: 189, plan: 'Premium', revenue: '₺32,000' },
    { name: 'Global Systems', users: 156, plan: 'Premium', revenue: '₺28,500' },
    { name: 'Innovation Labs', users: 134, plan: 'Business', revenue: '₺24,000' },
    { name: 'Digital Solutions', users: 98, plan: 'Business', revenue: '₺18,000' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sistem genelinde özet ve istatistikler</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Canlı İzleme
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          
          return (
            <Card key={stat.title}>
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
                  <span className={`text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">vs geçen ay</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gelir Analizi</CardTitle>
            <CardDescription>Son 12 aylık gelir trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Gelir</TabsTrigger>
                <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                <TabsTrigger value="growth">Büyüme</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="space-y-4">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">Gelir grafiği burada gösterilecek</p>
                </div>
              </TabsContent>
              <TabsContent value="users" className="space-y-4">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">Kullanıcı grafiği burada gösterilecek</p>
                </div>
              </TabsContent>
              <TabsContent value="growth" className="space-y-4">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">Büyüme grafiği burada gösterilecek</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>Sistemdeki son işlemler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'error' ? 'bg-red-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4">
              Tümünü Görüntüle
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>En İyi Müşteriler</CardTitle>
          <CardDescription>Gelire göre en iyi 5 müşteri</CardDescription>
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
                </tr>
              </thead>
              <tbody>
                {topTenants.map((tenant) => (
                  <tr key={tenant.name} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                          {tenant.name.charAt(0)}
                        </div>
                        <span className="font-medium">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{tenant.users}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tenant.plan === 'Enterprise' ? 'default' : 'secondary'}>
                        {tenant.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{tenant.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
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
          <CardHeader>
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
          <CardHeader>
            <CardTitle className="text-sm">Güvenlik</CardTitle>
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

export default MetronicDashboard;