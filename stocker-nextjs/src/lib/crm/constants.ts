// CRM Module Constants

export const CRM_COLORS = {
  leads: {
    New: '#1890ff',
    Contacted: '#52c41a',
    Qualified: '#722ed1',
    Lost: '#ff4d4f',
  },
  deals: {
    Open: '#1890ff',
    Won: '#52c41a',
    Lost: '#ff4d4f',
  },
  activities: {
    Call: '#1890ff',
    Email: '#13c2c2',
    Meeting: '#52c41a',
    Task: '#fa8c16',
    Note: '#8c8c8c',
  },
  customers: {
    Active: '#52c41a',
    Inactive: '#d9d9d9',
    Pending: '#fa8c16',
  },
  priority: {
    High: '#ff4d4f',
    Medium: '#fa8c16',
    Low: '#52c41a',
  },
} as const;

export const CRM_STATUS_LABELS = {
  leads: {
    New: 'Yeni',
    Contacted: 'İletişimde',
    Qualified: 'Nitelikli',
    Lost: 'Kayıp',
  },
  deals: {
    Open: 'Açık',
    Won: 'Kazanıldı',
    Lost: 'Kaybedildi',
  },
  activities: {
    Call: 'Arama',
    Email: 'E-posta',
    Meeting: 'Toplantı',
    Task: 'Görev',
    Note: 'Not',
  },
  customers: {
    Active: 'Aktif',
    Inactive: 'Pasif',
    Pending: 'Beklemede',
  },
  activityStatus: {
    Scheduled: 'Planlandı',
    Completed: 'Tamamlandı',
    Cancelled: 'İptal',
  },
} as const;

export const CRM_ICONS = {
  activities: {
    Call: 'PhoneOutlined',
    Email: 'MailOutlined',
    Meeting: 'TeamOutlined',
    Task: 'FileTextOutlined',
    Note: 'FileTextOutlined',
  },
} as const;

export const CRM_ROUTES = {
  dashboard: '/crm',
  customers: '/crm/customers',
  leads: '/crm/leads',
  deals: '/crm/deals',
  activities: '/crm/activities',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
