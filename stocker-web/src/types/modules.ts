export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  isActive: boolean;
  isComingSoon?: boolean;
  category?: 'core' | 'finance' | 'operations' | 'analytics' | 'hr';
}

export interface UserModuleAccess {
  moduleId: string;
  hasAccess: boolean;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
}

export const availableModules: Module[] = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Müşteri İlişkileri Yönetimi',
    icon: 'TeamOutlined',
    route: '/crm',
    color: '#1890ff',
    isActive: true,
    category: 'core'
  },
  {
    id: 'sales',
    name: 'Satış',
    description: 'Satış ve Sipariş Yönetimi',
    icon: 'ShoppingCartOutlined',
    route: '/sales',
    color: '#52c41a',
    isActive: true,
    category: 'core'
  },
  {
    id: 'inventory',
    name: 'Stok',
    description: 'Envanter ve Stok Takibi',
    icon: 'InboxOutlined',
    route: '/inventory',
    color: '#fa8c16',
    isActive: true,
    category: 'operations'
  },
  {
    id: 'accounting',
    name: 'Muhasebe',
    description: 'Finansal İşlemler ve Raporlama',
    icon: 'CalculatorOutlined',
    route: '/accounting',
    color: '#722ed1',
    isActive: true,
    category: 'finance'
  },
  {
    id: 'hr',
    name: 'İnsan Kaynakları',
    description: 'Personel ve Bordro Yönetimi',
    icon: 'UserOutlined',
    route: '/hr',
    color: '#eb2f96',
    isActive: true,
    category: 'hr'
  },
  {
    id: 'production',
    name: 'Üretim',
    description: 'Üretim Planlama ve Takibi',
    icon: 'ToolOutlined',
    route: '/production',
    color: '#13c2c2',
    isActive: false,
    isComingSoon: true,
    category: 'operations'
  },
  {
    id: 'projects',
    name: 'Projeler',
    description: 'Proje ve Görev Yönetimi',
    icon: 'ProjectOutlined',
    route: '/projects',
    color: '#f5222d',
    isActive: false,
    isComingSoon: true,
    category: 'operations'
  },
  {
    id: 'analytics',
    name: 'Analizler',
    description: 'Raporlama ve İş Zekası',
    icon: 'BarChartOutlined',
    route: '/analytics',
    color: '#faad14',
    isActive: false,
    isComingSoon: true,
    category: 'analytics'
  }
];