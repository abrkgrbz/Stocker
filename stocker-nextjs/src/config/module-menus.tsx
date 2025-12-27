/**
 * =====================================
 * MODULE MENU CONFIGURATION
 * =====================================
 *
 * Centralized menu configuration for all dashboard modules.
 * Uses semantic colors from the theme system.
 */

import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';
import {
  TeamOutlined,
  DashboardOutlined,
  ContactsOutlined,
  UserAddOutlined,
  GroupOutlined,
  ShareAltOutlined,
  RiseOutlined,
  DollarOutlined,
  FunnelPlotOutlined,
  GlobalOutlined,
  AimOutlined,
  CalendarOutlined,
  PhoneOutlined,
  NotificationOutlined,
  GiftOutlined,
  SettingOutlined,
  FileOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TrademarkOutlined,
  SkinOutlined,
  SwapOutlined,
  HomeOutlined,
  EditOutlined,
  CalculatorOutlined,
  BarcodeOutlined,
  LockOutlined,
  WarningOutlined,
  BarChartOutlined,
  LineChartOutlined,
  AccountBookOutlined,
  AuditOutlined,
  ColumnWidthOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  SlidersOutlined,
  ShoppingCartOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  RollbackOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  BellOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  TrophyOutlined,
  CrownOutlined,
  RocketOutlined,
  ExclamationCircleOutlined,
  ReconciliationOutlined,
  SolutionOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { colors } from '@/theme/colors';

// =====================================
// TYPE DEFINITIONS
// =====================================

/**
 * All available module keys in the system
 */
export type ModuleKey = 'crm' | 'inventory' | 'sales' | 'purchase' | 'hr' | 'settings' | 'communication' | 'modules';

// Define the structure for module menu items
export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
  danger?: boolean;
}

export interface ModuleConfig {
  title: string;
  icon: React.ReactNode;
  color: string;
  moduleCode: string | null;
  description: string;
  items: MenuItem[];
}

export const MODULE_MENUS: Record<string, ModuleConfig> = {
  crm: {
    title: 'CRM',
    icon: <TeamOutlined />,
    color: colors.brand.primary[600], // Was '#7c3aed' (Violet) -> Now Brand Indigo/Primary
    moduleCode: 'crm',
    description: 'Müşteri ilişkileri yönetimi',
    items: [
      { key: '/crm', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'crm-customers',
        icon: <ContactsOutlined />,
        label: 'Müşteri Yönetimi',
        children: [
          { key: '/crm/customers', icon: <ContactsOutlined />, label: 'Müşteriler' },
          { key: '/crm/leads', icon: <UserAddOutlined />, label: 'Potansiyeller' },
          { key: '/crm/segments', icon: <GroupOutlined />, label: 'Segmentler' },
          { key: '/crm/referrals', icon: <ShareAltOutlined />, label: 'Referanslar' },
        ],
      },
      {
        key: 'crm-sales',
        icon: <RiseOutlined />,
        label: 'Satış Yönetimi',
        children: [
          { key: '/crm/opportunities', icon: <RiseOutlined />, label: 'Fırsatlar' },
          { key: '/crm/deals', icon: <DollarOutlined />, label: 'Anlaşmalar' },
          { key: '/crm/pipelines', icon: <FunnelPlotOutlined />, label: 'Pipeline' },
          { key: '/crm/sales-teams', icon: <TeamOutlined />, label: 'Satış Ekipleri' },
          { key: '/crm/territories', icon: <GlobalOutlined />, label: 'Bölgeler' },
          { key: '/crm/competitors', icon: <AimOutlined />, label: 'Rakipler' },
        ],
      },
      {
        key: 'crm-activities',
        icon: <CalendarOutlined />,
        label: 'Aktiviteler',
        children: [
          { key: '/crm/activities', icon: <CalendarOutlined />, label: 'Aktiviteler' },
          { key: '/crm/meetings', icon: <CalendarOutlined />, label: 'Toplantılar' },
          { key: '/crm/call-logs', icon: <PhoneOutlined />, label: 'Arama Kayıtları' },
          { key: '/crm/campaigns', icon: <NotificationOutlined />, label: 'Kampanyalar' },
        ],
      },
      {
        key: 'crm-loyalty',
        icon: <GiftOutlined />,
        label: 'Sadakat',
        children: [
          { key: '/crm/loyalty-programs', icon: <GiftOutlined />, label: 'Sadakat Programları' },
        ],
      },
      {
        key: 'crm-tools',
        icon: <SettingOutlined />,
        label: 'Araçlar',
        children: [
          { key: '/crm/documents', icon: <FileOutlined />, label: 'Dökümanlar' },
          { key: '/crm/workflows', icon: <ThunderboltOutlined />, label: 'Workflows' },
        ],
      },
    ],
  },
  inventory: {
    title: 'Envanter',
    icon: <InboxIcon className="w-4 h-4" />,
    color: colors.semantic.success.default, // Was '#10b981' -> Now Semantic Success (Emerald)
    moduleCode: 'inventory',
    description: 'Stok ve depo yönetimi',
    items: [
      { key: '/inventory', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'inv-products',
        icon: <AppstoreOutlined />,
        label: 'Ürün Yönetimi',
        children: [
          { key: '/inventory/products', icon: <AppstoreOutlined />, label: 'Ürünler' },
          { key: '/inventory/categories', icon: <TagsOutlined />, label: 'Kategoriler' },
          { key: '/inventory/brands', icon: <TrademarkOutlined />, label: 'Markalar' },
          { key: '/inventory/product-variants', icon: <SkinOutlined />, label: 'Varyantlar' },
          { key: '/inventory/product-bundles', icon: <GiftOutlined />, label: 'Paketler' },
        ],
      },
      {
        key: 'inv-stock',
        icon: <SwapOutlined />,
        label: 'Stok İşlemleri',
        children: [
          { key: '/inventory/stock', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Görünümü' },
          { key: '/inventory/warehouses', icon: <HomeOutlined />, label: 'Depolar' },
          { key: '/inventory/stock-movements', icon: <SwapOutlined />, label: 'Hareketler' },
          { key: '/inventory/stock-transfers', icon: <SwapOutlined />, label: 'Transferler' },
          { key: '/inventory/stock-adjustments', icon: <EditOutlined />, label: 'Düzeltmeler' },
          { key: '/inventory/stock-counts', icon: <CalculatorOutlined />, label: 'Sayımlar' },
        ],
      },
      {
        key: 'inv-tracking',
        icon: <BarcodeOutlined />,
        label: 'İzleme & Takip',
        children: [
          { key: '/inventory/serial-numbers', icon: <BarcodeOutlined />, label: 'Seri Numaraları' },
          { key: '/inventory/lot-batches', icon: <InboxIcon className="w-4 h-4" />, label: 'Lot/Parti' },
          { key: '/inventory/stock-reservations', icon: <LockOutlined />, label: 'Rezervasyonlar' },
          { key: '/inventory/stock-alerts', icon: <WarningOutlined />, label: 'Uyarılar' },
        ],
      },
      {
        key: 'inv-reports',
        icon: <BarChartOutlined />,
        label: 'Raporlar & Analiz',
        children: [
          { key: '/inventory/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
          { key: '/inventory/analytics', icon: <LineChartOutlined />, label: 'Analizler' },
          { key: '/inventory/analysis', icon: <BarChartOutlined />, label: 'ABC/XYZ Analizi' },
          { key: '/inventory/forecasting', icon: <LineChartOutlined />, label: 'Tahminleme' },
          { key: '/inventory/costing', icon: <AccountBookOutlined />, label: 'Maliyetlendirme' },
          { key: '/inventory/audit-trail', icon: <AuditOutlined />, label: 'Denetim İzi' },
        ],
      },
      {
        key: 'inv-settings',
        icon: <SettingOutlined />,
        label: 'Tanımlar',
        children: [
          { key: '/inventory/units', icon: <ColumnWidthOutlined />, label: 'Birimler' },
          { key: '/inventory/suppliers', icon: <ShopOutlined />, label: 'Tedarikçiler' },
          { key: '/inventory/locations', icon: <EnvironmentOutlined />, label: 'Lokasyonlar' },
          { key: '/inventory/price-lists', icon: <DollarOutlined />, label: 'Fiyat Listeleri' },
          { key: '/inventory/barcodes', icon: <BarcodeOutlined />, label: 'Barkodlar' },
          { key: '/inventory/product-attributes', icon: <SlidersOutlined />, label: 'Özellikler' },
        ],
      },
    ],
  },
  sales: {
    title: 'Satış',
    icon: <ShoppingCartOutlined />,
    color: colors.semantic.warning.default, // Was '#f59e0b' -> Now Semantic Warning (Amber)
    moduleCode: 'sales',
    description: 'Sipariş ve fatura yönetimi',
    items: [
      { key: '/sales', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'sales-quotations',
        icon: <FileDoneOutlined />,
        label: 'Teklifler',
        children: [
          { key: '/sales/quotations', icon: <FileDoneOutlined />, label: 'Satış Teklifleri' },
        ],
      },
      {
        key: 'sales-orders',
        icon: <ShoppingCartOutlined />,
        label: 'İşlemler',
        children: [
          { key: '/sales/orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
          { key: '/sales/invoices', icon: <FileTextOutlined />, label: 'Faturalar' },
          { key: '/sales/e-invoices', icon: <SafetyCertificateOutlined />, label: 'E-Fatura' },
          { key: '/sales/shipments', icon: <SwapOutlined />, label: 'Sevkiyatlar' },
          { key: '/sales/returns', icon: <RollbackOutlined />, label: 'İadeler' },
        ],
      },
      {
        key: 'sales-finance',
        icon: <WalletOutlined />,
        label: 'Finans',
        children: [
          { key: '/sales/payments', icon: <WalletOutlined />, label: 'Ödemeler' },
          { key: '/sales/customers', icon: <ContactsOutlined />, label: 'Bakiyeler' },
          { key: '/sales/commissions', icon: <CalculatorOutlined />, label: 'Komisyonlar' },
        ],
      },
      {
        key: 'sales-contracts',
        icon: <FileOutlined />,
        label: 'Sözleşmeler',
        children: [
          { key: '/sales/contracts', icon: <FileOutlined />, label: 'Müşteri Sözleşmeleri' },
        ],
      },
      {
        key: 'sales-territories',
        icon: <GlobalOutlined />,
        label: 'Satış Bölgeleri',
        children: [
          { key: '/sales/territories', icon: <GlobalOutlined />, label: 'Bölgeler' },
        ],
      },
      {
        key: 'sales-marketing',
        icon: <TagsOutlined />,
        label: 'Pazarlama',
        children: [
          { key: '/sales/discounts', icon: <TagsOutlined />, label: 'İndirimler' },
          { key: '/sales/segments', icon: <TeamOutlined />, label: 'Müşteri Segmentleri' },
          { key: '/sales/pricelists', icon: <DollarOutlined />, label: 'Fiyat Listeleri' },
        ],
      },
      {
        key: 'sales-performance',
        icon: <AimOutlined />,
        label: 'Performans',
        children: [
          { key: '/sales/targets', icon: <AimOutlined />, label: 'Satış Hedefleri' },
        ],
      },
      {
        key: 'sales-logistics',
        icon: <SwapOutlined />,
        label: 'Lojistik',
        children: [
          { key: '/sales/reservations', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Rezervasyonları' },
          { key: '/sales/backorders', icon: <ClockCircleOutlined />, label: 'Bekleyen Siparişler' },
          { key: '/sales/delivery-notes', icon: <FileTextOutlined />, label: 'İrsaliyeler' },
        ],
      },
      {
        key: 'sales-financial',
        icon: <AccountBookOutlined />,
        label: 'Finansal İşlemler',
        children: [
          { key: '/sales/advance-payments', icon: <WalletOutlined />, label: 'Avans Ödemeler' },
          { key: '/sales/credit-notes', icon: <RollbackOutlined />, label: 'Alacak Dekontları' },
        ],
      },
      {
        key: 'sales-postsales',
        icon: <ToolOutlined />,
        label: 'Satış Sonrası',
        children: [
          { key: '/sales/service', icon: <ToolOutlined />, label: 'Servis Talepleri' },
          { key: '/sales/warranty', icon: <SafetyCertificateOutlined />, label: 'Garanti Sorgulama' },
        ],
      },
    ],
  },
  settings: {
    title: 'Ayarlar',
    icon: <SettingOutlined />,
    color: colors.slate[600], // Was '#6b7280' -> Slate 600
    moduleCode: null, // Always enabled
    description: 'Sistem ayarları',
    items: [
      { key: '/settings', icon: <SettingOutlined />, label: 'Genel Ayarlar' },
      {
        key: 'settings-org',
        icon: <TeamOutlined />,
        label: 'Organizasyon',
        children: [
          { key: '/settings/users', icon: <TeamOutlined />, label: 'Kullanıcılar' },
          { key: '/settings/roles', icon: <SafetyCertificateOutlined />, label: 'Roller' },
          { key: '/settings/departments', icon: <ApartmentOutlined />, label: 'Departmanlar' },
        ],
      },
      {
        key: 'settings-security',
        icon: <SafetyOutlined />,
        label: 'Güvenlik',
        children: [
          { key: '/settings/security', icon: <SafetyOutlined />, label: 'Güvenlik Ayarları' },
        ],
      },
    ],
  },
  communication: {
    title: 'İletişim',
    icon: <BellOutlined />,
    color: colors.brand.secondary[500], // Pink/Fuchsia for communication
    moduleCode: null, // Always enabled
    description: 'Bildirim ve hatırlatıcılar',
    items: [
      { key: '/notifications', icon: <BellOutlined />, label: 'Bildirimler' },
      { key: '/reminders', icon: <ClockCircleOutlined />, label: 'Hatırlatıcılar' },
    ],
  },
  hr: {
    title: 'İnsan Kaynakları',
    icon: <IdcardOutlined />,
    color: colors.semantic.info.default, // Was '#0ea5e9' -> Info Blue/Sky
    moduleCode: 'hr',
    description: 'Çalışan ve bordro yönetimi',
    items: [
      { key: '/hr', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'hr-employees',
        icon: <TeamOutlined />,
        label: 'Çalışan Yönetimi',
        children: [
          { key: '/hr/employees', icon: <TeamOutlined />, label: 'Çalışanlar' },
          { key: '/hr/departments', icon: <ApartmentOutlined />, label: 'Departmanlar' },
          { key: '/hr/positions', icon: <SafetyCertificateOutlined />, label: 'Pozisyonlar' },
          { key: '/hr/employee-skills', icon: <ToolOutlined />, label: 'Yetkinlikler' },
          { key: '/hr/employee-assets', icon: <InboxIcon className="w-4 h-4" />, label: 'Zimmetler' },
          { key: '/hr/employee-benefits', icon: <HeartOutlined />, label: 'Yan Haklar' },
        ],
      },
      {
        key: 'hr-attendance',
        icon: <ClockCircleOutlined />,
        label: 'Devam & İzin',
        children: [
          { key: '/hr/attendance', icon: <ClockCircleOutlined />, label: 'Devam Takibi' },
          { key: '/hr/leaves', icon: <CalendarOutlined />, label: 'İzinler' },
          { key: '/hr/leave-types', icon: <TagsOutlined />, label: 'İzin Türleri' },
          { key: '/hr/holidays', icon: <CalendarOutlined />, label: 'Tatil Günleri' },
          { key: '/hr/time-sheets', icon: <ScheduleOutlined />, label: 'Puantaj' },
        ],
      },
      {
        key: 'hr-payroll',
        icon: <DollarOutlined />,
        label: 'Bordro & Masraf',
        children: [
          { key: '/hr/payroll', icon: <DollarOutlined />, label: 'Bordro' },
          { key: '/hr/payslips', icon: <FileTextOutlined />, label: 'Bordro Makbuzları' },
          { key: '/hr/expenses', icon: <WalletOutlined />, label: 'Masraflar' },
        ],
      },
      {
        key: 'hr-performance',
        icon: <RiseOutlined />,
        label: 'Performans',
        children: [
          { key: '/hr/performance', icon: <RiseOutlined />, label: 'Değerlendirmeler' },
          { key: '/hr/goals', icon: <FunnelPlotOutlined />, label: 'Hedefler' },
          { key: '/hr/career-paths', icon: <TrophyOutlined />, label: 'Kariyer Yolları' },
          { key: '/hr/succession-plans', icon: <CrownOutlined />, label: 'Yedekleme Planları' },
        ],
      },
      {
        key: 'hr-training',
        icon: <SafetyCertificateOutlined />,
        label: 'Eğitim & Sertifika',
        children: [
          { key: '/hr/trainings', icon: <SafetyCertificateOutlined />, label: 'Eğitimler' },
          { key: '/hr/certifications', icon: <SafetyCertificateOutlined />, label: 'Sertifikalar' },
        ],
      },
      {
        key: 'hr-recruitment',
        icon: <UserAddOutlined />,
        label: 'İşe Alım',
        children: [
          { key: '/hr/job-postings', icon: <FileTextOutlined />, label: 'İş İlanları' },
          { key: '/hr/job-applications', icon: <SolutionOutlined />, label: 'Başvurular' },
          { key: '/hr/interviews', icon: <CalendarOutlined />, label: 'Mülakatlar' },
          { key: '/hr/onboardings', icon: <RocketOutlined />, label: 'İşe Alışım' },
        ],
      },
      {
        key: 'hr-overtime',
        icon: <ClockCircleOutlined />,
        label: 'Fazla Mesai',
        children: [
          { key: '/hr/overtimes', icon: <ClockCircleOutlined />, label: 'Fazla Mesailer' },
        ],
      },
      {
        key: 'hr-relations',
        icon: <TeamOutlined />,
        label: 'Çalışan İlişkileri',
        children: [
          { key: '/hr/grievances', icon: <ExclamationCircleOutlined />, label: 'Şikayetler' },
          { key: '/hr/disciplinary-actions', icon: <WarningOutlined />, label: 'Disiplin İşlemleri' },
        ],
      },
      {
        key: 'hr-tools',
        icon: <SettingOutlined />,
        label: 'Araçlar',
        children: [
          { key: '/hr/documents', icon: <FileOutlined />, label: 'Belgeler' },
          { key: '/hr/announcements', icon: <NotificationOutlined />, label: 'Duyurular' },
          { key: '/hr/shifts', icon: <ClockCircleOutlined />, label: 'Vardiyalar' },
          { key: '/hr/work-schedules', icon: <CalendarOutlined />, label: 'Çalışma Programları' },
          { key: '/hr/work-locations', icon: <EnvironmentOutlined />, label: 'Lokasyonlar' },
        ],
      },
    ],
  },
  purchase: {
    title: 'Satın Alma',
    icon: <ReconciliationOutlined />,
    color: colors.brand.primary[500], // Violet/Indigo for purchase
    moduleCode: 'purchase',
    description: 'Tedarik ve satın alma yönetimi',
    items: [
      { key: '/purchase', icon: <DashboardOutlined />, label: 'Dashboard' },
      {
        key: 'purchase-suppliers',
        icon: <ShopOutlined />,
        label: 'Tedarikçi Yönetimi',
        children: [
          { key: '/purchase/suppliers', icon: <ShopOutlined />, label: 'Tedarikçiler' },
          { key: '/purchase/evaluations', icon: <LineChartOutlined />, label: 'Değerlendirmeler' },
        ],
      },
      {
        key: 'purchase-requests',
        icon: <FileOutlined />,
        label: 'Talepler & Teklifler',
        children: [
          { key: '/purchase/requests', icon: <FileOutlined />, label: 'Satın Alma Talepleri' },
          { key: '/purchase/quotations', icon: <FileDoneOutlined />, label: 'Teklif Talepleri (RFQ)' },
        ],
      },
      {
        key: 'purchase-orders',
        icon: <ShoppingCartOutlined />,
        label: 'Siparişler',
        children: [
          { key: '/purchase/orders', icon: <ShoppingCartOutlined />, label: 'Satın Alma Siparişleri' },
          { key: '/purchase/goods-receipts', icon: <InboxIcon className="w-4 h-4" />, label: 'Mal Alım Belgeleri' },
        ],
      },
      {
        key: 'purchase-finance',
        icon: <FileTextOutlined />,
        label: 'Finans',
        children: [
          { key: '/purchase/invoices', icon: <FileTextOutlined />, label: 'Faturalar' },
          { key: '/purchase/payments', icon: <WalletOutlined />, label: 'Ödemeler' },
          { key: '/purchase/budgets', icon: <WalletOutlined />, label: 'Bütçeler' },
        ],
      },
      {
        key: 'purchase-pricing',
        icon: <DollarOutlined />,
        label: 'Fiyatlandırma',
        children: [
          { key: '/purchase/price-lists', icon: <DollarOutlined />, label: 'Fiyat Listeleri' },
        ],
      },
      {
        key: 'purchase-returns',
        icon: <RollbackOutlined />,
        label: 'İadeler',
        children: [
          { key: '/purchase/returns', icon: <RollbackOutlined />, label: 'İade Belgeleri' },
        ],
      },
      {
        key: 'purchase-reports',
        icon: <BarChartOutlined />,
        label: 'Raporlar',
        children: [
          { key: '/purchase/reports', icon: <BarChartOutlined />, label: 'Raporlar' },
        ],
      },
    ],
  },
  modules: {
    title: 'Modüller',
    icon: <AppstoreOutlined />,
    color: colors.semantic.info.dark, // Cyan/Teal for modules
    moduleCode: null, // Always enabled
    description: 'Modül yönetimi',
    items: [
      { key: '/modules', icon: <AppstoreOutlined />, label: 'Modül Yönetimi' },
    ],
  },
};

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Determines the current module based on the pathname
 * @param pathname - Current URL pathname
 * @returns The module key or null if not found
 */
export function getCurrentModule(pathname: string): ModuleKey | null {
  if (pathname.startsWith('/crm')) return 'crm';
  if (pathname.startsWith('/inventory')) return 'inventory';
  if (pathname.startsWith('/sales')) return 'sales';
  if (pathname.startsWith('/purchase')) return 'purchase';
  if (pathname.startsWith('/hr')) return 'hr';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/notifications') || pathname.startsWith('/reminders')) return 'communication';
  if (pathname.startsWith('/modules')) return 'modules';
  return null;
}

/**
 * Gets the module configuration for a given module key
 * @param moduleKey - The module key
 * @returns The module configuration or undefined
 */
export function getModuleConfig(moduleKey: ModuleKey): ModuleConfig | undefined {
  return MODULE_MENUS[moduleKey];
}

/**
 * Gets all module keys
 * @returns Array of all module keys
 */
export function getAllModuleKeys(): ModuleKey[] {
  return Object.keys(MODULE_MENUS) as ModuleKey[];
}

/**
 * Checks if a module requires a specific module code to be enabled
 * @param moduleKey - The module key
 * @returns Whether the module requires activation
 */
export function isModuleCodeRequired(moduleKey: ModuleKey): boolean {
  const config = MODULE_MENUS[moduleKey];
  return config?.moduleCode !== null;
}
