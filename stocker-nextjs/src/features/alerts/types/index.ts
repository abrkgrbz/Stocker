// =====================================
// ALERTS MODULE TYPES
// Central Alert System
// =====================================

export type AlertCategory =
  | 'System'
  | 'Order'
  | 'Quotation'
  | 'Invoice'
  | 'Contract'
  | 'Payment'
  | 'Shipment'
  | 'Return'
  | 'Stock'
  | 'Warehouse'
  | 'Product'
  | 'Customer'
  | 'Lead'
  | 'Opportunity'
  | 'Budget'
  | 'Credit'
  | 'Employee'
  | 'Payroll';

export type AlertSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface Alert {
  id: number;
  category: AlertCategory;
  severity: AlertSeverity;
  sourceModule: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface AlertFilterParams {
  category?: AlertCategory;
  minSeverity?: AlertSeverity;
  sourceModule?: string;
  isRead?: boolean;
  includeDismissed?: boolean;
  limit?: number;
  offset?: number;
}

export interface UnreadCountResponse {
  count: number;
}

// =====================================
// ALERT UI HELPERS
// =====================================

export const alertSeverityConfig: Record<AlertSeverity, { label: string; color: string; bgColor: string; icon: string }> = {
  Info: {
    label: 'Bilgi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: 'InformationCircleIcon',
  },
  Low: {
    label: 'Düşük',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    icon: 'BellIcon',
  },
  Medium: {
    label: 'Orta',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: 'ExclamationTriangleIcon',
  },
  High: {
    label: 'Yüksek',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: 'ExclamationCircleIcon',
  },
  Critical: {
    label: 'Kritik',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: 'XCircleIcon',
  },
};

export const alertCategoryConfig: Record<AlertCategory, { label: string; icon: string }> = {
  System: { label: 'Sistem', icon: 'CogIcon' },
  Order: { label: 'Sipariş', icon: 'ShoppingCartIcon' },
  Quotation: { label: 'Teklif', icon: 'DocumentTextIcon' },
  Invoice: { label: 'Fatura', icon: 'DocumentIcon' },
  Contract: { label: 'Sözleşme', icon: 'DocumentDuplicateIcon' },
  Payment: { label: 'Ödeme', icon: 'CreditCardIcon' },
  Shipment: { label: 'Sevkiyat', icon: 'TruckIcon' },
  Return: { label: 'İade', icon: 'ArrowUturnLeftIcon' },
  Stock: { label: 'Stok', icon: 'CubeIcon' },
  Warehouse: { label: 'Depo', icon: 'BuildingStorefrontIcon' },
  Product: { label: 'Ürün', icon: 'TagIcon' },
  Customer: { label: 'Müşteri', icon: 'UserIcon' },
  Lead: { label: 'Potansiyel', icon: 'UserPlusIcon' },
  Opportunity: { label: 'Fırsat', icon: 'SparklesIcon' },
  Budget: { label: 'Bütçe', icon: 'BanknotesIcon' },
  Credit: { label: 'Kredi', icon: 'CurrencyDollarIcon' },
  Employee: { label: 'Personel', icon: 'UserGroupIcon' },
  Payroll: { label: 'Bordro', icon: 'CalculatorIcon' },
};
