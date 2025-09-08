import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../metronic/ui/card';
import { Button } from '../../metronic/ui/button';
import { Badge } from '../../metronic/ui/badge';
import { Input } from '../../metronic/ui/input';
import { Avatar } from '../../metronic/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../metronic/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../metronic/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../metronic/ui/dropdown-menu';
import { Label } from '../../metronic/ui/label';
import { Checkbox } from '../../metronic/ui/checkbox';
import { 
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import tenantService from '../../services/tenantService';
import { Toaster, toast } from '../../metronic/ui/sonner';

const TenantsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch tenants
  const { data: tenantsData, isLoading, refetch } = useQuery({
    queryKey: ['tenants', page, searchTerm, statusFilter, planFilter],
    queryFn: () => tenantService.getTenants(page, 25, {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
      plan: planFilter !== 'all' ? [planFilter] : undefined,
    }),
  });

  // Mock data for demonstration
  const mockTenants = [
    {
      id: '1',
      name: 'Acme Corporation',
      domain: 'acme.stoocker.app',
      email: 'admin@acme.com',
      phone: '+90 212 555 0123',
      status: 'active',
      plan: 'enterprise',
      users: 245,
      storage: '85GB / 100GB',
      createdAt: '2024-01-15',
      lastActivity: '2 dakika önce',
      revenue: '₺45,000',
      owner: 'Ahmet Yılmaz'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      domain: 'techstart.stoocker.app',
      email: 'info@techstart.com',
      phone: '+90 216 555 0456',
      status: 'active',
      plan: 'premium',
      users: 189,
      storage: '45GB / 50GB',
      createdAt: '2024-02-20',
      lastActivity: '1 saat önce',
      revenue: '₺32,000',
      owner: 'Mehmet Kaya'
    },
    {
      id: '3',
      name: 'Global Systems',
      domain: 'global.stoocker.app',
      email: 'contact@global.com',
      phone: '+90 312 555 0789',
      status: 'active',
      plan: 'premium',
      users: 156,
      storage: '38GB / 50GB',
      createdAt: '2024-03-10',
      lastActivity: '3 saat önce',
      revenue: '₺28,500',
      owner: 'Ayşe Demir'
    },
    {
      id: '4',
      name: 'Innovation Labs',
      domain: 'labs.stoocker.app',
      email: 'hello@labs.com',
      phone: '+90 232 555 0234',
      status: 'suspended',
      plan: 'business',
      users: 134,
      storage: '22GB / 25GB',
      createdAt: '2024-01-28',
      lastActivity: '1 gün önce',
      revenue: '₺24,000',
      owner: 'Fatma Şahin'
    },
    {
      id: '5',
      name: 'Digital Solutions',
      domain: 'digital.stoocker.app',
      email: 'support@digital.com',
      phone: '+90 224 555 0567',
      status: 'active',
      plan: 'business',
      users: 98,
      storage: '18GB / 25GB',
      createdAt: '2024-04-05',
      lastActivity: '5 saat önce',
      revenue: '₺18,000',
      owner: 'Ali Çelik'
    },
    {
      id: '6',
      name: 'StartUp Hub',
      domain: 'startup.stoocker.app',
      email: 'info@startup.com',
      phone: '+90 262 555 0890',
      status: 'trial',
      plan: 'starter',
      users: 12,
      storage: '2GB / 5GB',
      createdAt: '2024-11-01',
      lastActivity: '30 dakika önce',
      revenue: '₺0',
      owner: 'Zeynep Aydın'
    }
  ];

  const tenants = tenantsData?.data || mockTenants;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenants(tenants.map(t => t.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleSelectTenant = (tenantId: string, checked: boolean) => {
    if (checked) {
      setSelectedTenants([...selectedTenants, tenantId]);
    } else {
      setSelectedTenants(selectedTenants.filter(id => id !== tenantId));
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await tenantService.deleteTenant(tenantId);
      toast.success('Tenant başarıyla silindi');
      refetch();
    } catch (error) {
      toast.error('Tenant silinirken hata oluştu');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'trial':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      suspended: 'destructive',
      trial: 'secondary',
      inactive: 'outline'
    };

    const labels: Record<string, string> = {
      active: 'Aktif',
      suspended: 'Askıda',
      trial: 'Deneme',
      inactive: 'Pasif'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="gap-1">
        {getStatusIcon(status)}
        {labels[status] || status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
      premium: 'bg-blue-100 text-blue-700 border-blue-200',
      business: 'bg-green-100 text-green-700 border-green-200',
      starter: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
      <Badge variant="outline" className={colors[plan] || ''}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Tüm müşteri hesaplarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Tenant Oluştur</DialogTitle>
                <DialogDescription>
                  Yeni bir müşteri hesabı oluşturun.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Şirket Adı</Label>
                  <Input id="name" placeholder="Acme Corporation" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" placeholder="acme" />
                  <p className="text-xs text-gray-500">.stoocker.app uzantısı otomatik eklenecek</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" placeholder="admin@acme.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select defaultValue="starter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => {
                  toast.success('Tenant başarıyla oluşturuldu');
                  setIsCreateDialogOpen(false);
                }}>
                  Oluştur
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">487</p>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-green-500 font-medium">+12%</span> geçen aya göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktif Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">423</p>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">%86.8 aktif oran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">12,487</p>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Tüm tenantlarda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aylık Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">₺487K</p>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="text-green-500 font-medium">+24%</span> büyüme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tenant ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="suspended">Askıda</SelectItem>
                <SelectItem value="trial">Deneme</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Planlar</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tenant Listesi</CardTitle>
            {selectedTenants.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Toplu İşlem
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil ({selectedTenants.length})
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedTenants.length === tenants.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Tenant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Kullanıcılar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Depolama</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Gelir</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Son Aktivite</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 dark:text-gray-400">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedTenants.includes(tenant.id)}
                        onCheckedChange={(checked) => handleSelectTenant(tenant.id, checked as boolean)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {tenant.name.charAt(0)}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="py-3 px-4">
                      {getPlanBadge(tenant.plan)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{tenant.users}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm">{tenant.storage}</p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${parseInt(tenant.storage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold">{tenant.revenue}</p>
                      <p className="text-xs text-gray-500">Aylık</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-500">{tenant.lastActivity}</p>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Kullanıcı Ekle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Faturalandırma
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTenant(tenant.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Toplam {tenants.length} kayıttan 1-{Math.min(25, tenants.length)} arası gösteriliyor
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantsPage;