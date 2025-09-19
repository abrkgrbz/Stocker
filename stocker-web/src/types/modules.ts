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
    color: '#3b82f6',
    isActive: true,
    category: 'core'
  },
  {
    id: 'sales',
    name: 'Satış',
    description: 'Satış ve Sipariş Yönetimi',
    icon: 'ShoppingCartOutlined',
    route: '/sales',
    color: '#10b981',
    isActive: true,
    category: 'core'
  },
  {
    id: 'inventory',
    name: 'Stok',
    description: 'Envanter ve Stok Takibi',
    icon: 'InboxOutlined',
    route: '/inventory',
    color: '#f59e0b',
    isActive: true,
    category: 'operations'
  },
  {
    id: 'accounting',
    name: 'Muhasebe',
    description: 'Finansal İşlemler ve Raporlama',
    icon: 'CalculatorOutlined',
    route: '/accounting',
    color: '#8b5cf6',
    isActive: true,
    category: 'finance'
  },
  {
    id: 'hr',
    name: 'İnsan Kaynakları',
    description: 'Personel ve Bordro Yönetimi',
    icon: 'UserOutlined',
    route: '/hr',
    color: '#ec4899',
    isActive: true,
    category: 'hr'
  },
  {
    id: 'production',
    name: 'Üretim',
    description: 'Üretim Planlama ve Takibi',
    icon: 'ToolOutlined',
    route: '/production',
    color: '#14b8a6',
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
    color: '#ef4444',
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
    color: '#06b6d4',
    isActive: false,
    isComingSoon: true,
    category: 'analytics'
  }
];