/**
 * =====================================
 * MODULE MENU CONFIGURATION
 * =====================================
 *
 * Centralized menu configuration for all dashboard modules.
 * Uses semantic colors from the theme system.
 */

import React from 'react';
import {
  InboxIcon,
  Squares2X2Icon,
  UserGroupIcon,
  ChartBarSquareIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  GlobeAltIcon,
  FlagIcon,
  CalendarIcon,
  PhoneIcon,
  BellIcon,
  GiftIcon,
  Cog6ToothIcon,
  DocumentIcon,
  BoltIcon,
  TagIcon,
  SwatchIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  HomeIcon,
  PencilIcon,
  CalculatorIcon,
  QrCodeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ViewColumnsIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  ShoppingCartIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowUturnLeftIcon,
  WalletIcon,
  ClockIcon,
  WrenchIcon,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  TrophyIcon,
  StarIcon,
  RocketLaunchIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon,
  HeartIcon,
  BanknotesIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  BuildingLibraryIcon,
  ReceiptRefundIcon,
  CogIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
  CircleStackIcon,
  CommandLineIcon,
  ListBulletIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { colors } from '@/theme/colors';

// =====================================
// TYPE DEFINITIONS
// =====================================

/**
 * All available module keys in the system
 */
export type ModuleKey = 'crm' | 'inventory' | 'sales' | 'purchase' | 'hr' | 'finance' | 'manufacturing' | 'settings' | 'communication' | 'modules';

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
    icon: <UserGroupIcon className="w-4 h-4" />,
    color: colors.brand.primary[600], // Was '#7c3aed' (Violet) -> Now Brand Indigo/Primary
    moduleCode: 'crm',
    description: 'Müşteri ilişkileri yönetimi',
    items: [
      { key: '/crm', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'crm-customers',
        icon: <UserIcon className="w-4 h-4" />,
        label: 'Müşteri Yönetimi',
        children: [
          { key: '/crm/customers', icon: <UserIcon className="w-4 h-4" />, label: 'Müşteriler' },
          { key: '/crm/leads', icon: <UserPlusIcon className="w-4 h-4" />, label: 'Potansiyeller' },
          { key: '/crm/segments', icon: <UsersIcon className="w-4 h-4" />, label: 'Segmentler' },
          { key: '/crm/referrals', icon: <ShareIcon className="w-4 h-4" />, label: 'Referanslar' },
        ],
      },
      {
        key: 'crm-sales',
        icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
        label: 'Satış Yönetimi',
        children: [
          { key: '/crm/opportunities', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Fırsatlar' },
          { key: '/crm/deals', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Anlaşmalar' },
          { key: '/crm/pipelines', icon: <FunnelIcon className="w-4 h-4" />, label: 'Pipeline' },
          { key: '/crm/sales-teams', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Satış Ekipleri' },
          { key: '/crm/territories', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Bölgeler' },
          { key: '/crm/competitors', icon: <FlagIcon className="w-4 h-4" />, label: 'Rakipler' },
        ],
      },
      {
        key: 'crm-activities',
        icon: <CalendarIcon className="w-4 h-4" />,
        label: 'Aktiviteler',
        children: [
          { key: '/crm/activities', icon: <CalendarIcon className="w-4 h-4" />, label: 'Aktiviteler' },
          { key: '/crm/meetings', icon: <CalendarIcon className="w-4 h-4" />, label: 'Toplantılar' },
          { key: '/crm/call-logs', icon: <PhoneIcon className="w-4 h-4" />, label: 'Arama Kayıtları' },
          { key: '/crm/campaigns', icon: <BellIcon className="w-4 h-4" />, label: 'Kampanyalar' },
        ],
      },
      {
        key: 'crm-loyalty',
        icon: <GiftIcon className="w-4 h-4" />,
        label: 'Sadakat',
        children: [
          { key: '/crm/loyalty-programs', icon: <GiftIcon className="w-4 h-4" />, label: 'Sadakat Programları' },
        ],
      },
      {
        key: 'crm-tools',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Araçlar',
        children: [
          { key: '/crm/documents', icon: <DocumentIcon className="w-4 h-4" />, label: 'Dökümanlar' },
          { key: '/crm/workflows', icon: <BoltIcon className="w-4 h-4" />, label: 'Workflows' },
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
      { key: '/inventory', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'inv-products',
        icon: <Squares2X2Icon className="w-4 h-4" />,
        label: 'Ürün Yönetimi',
        children: [
          { key: '/inventory/products', icon: <Squares2X2Icon className="w-4 h-4" />, label: 'Ürünler' },
          { key: '/inventory/categories', icon: <TagIcon className="w-4 h-4" />, label: 'Kategoriler' },
          { key: '/inventory/brands', icon: <SwatchIcon className="w-4 h-4" />, label: 'Markalar' },
          { key: '/inventory/product-variants', icon: <CubeIcon className="w-4 h-4" />, label: 'Varyantlar' },
          { key: '/inventory/product-bundles', icon: <GiftIcon className="w-4 h-4" />, label: 'Paketler' },
        ],
      },
      {
        key: 'inv-stock',
        icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
        label: 'Stok İşlemleri',
        children: [
          { key: '/inventory/stock', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Görünümü' },
          { key: '/inventory/warehouses', icon: <HomeIcon className="w-4 h-4" />, label: 'Depolar' },
          { key: '/inventory/stock-movements', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Hareketler' },
          { key: '/inventory/stock-transfers', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Transferler' },
          { key: '/inventory/stock-adjustments', icon: <PencilIcon className="w-4 h-4" />, label: 'Düzeltmeler' },
          { key: '/inventory/stock-counts', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Sayımlar' },
        ],
      },
      {
        key: 'inv-tracking',
        icon: <QrCodeIcon className="w-4 h-4" />,
        label: 'İzleme & Takip',
        children: [
          { key: '/inventory/serial-numbers', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Seri Numaraları' },
          { key: '/inventory/lot-batches', icon: <InboxIcon className="w-4 h-4" />, label: 'Lot/Parti' },
          { key: '/inventory/shelf-life', icon: <ClockIcon className="w-4 h-4" />, label: 'Raf Ömrü' },
          { key: '/inventory/stock-reservations', icon: <LockClosedIcon className="w-4 h-4" />, label: 'Rezervasyonlar' },
          { key: '/inventory/stock-alerts', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'Uyarılar' },
        ],
      },
      {
        key: 'inv-quality',
        icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />,
        label: 'Kalite Yönetimi',
        children: [
          { key: '/inventory/quality-control', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Kalite Kontrol' },
          { key: '/inventory/cycle-counts', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Dönemsel Sayımlar' },
        ],
      },
      {
        key: 'inv-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar & Analiz',
        children: [
          { key: '/inventory/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Raporlar' },
          { key: '/inventory/analytics', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Analizler' },
          { key: '/inventory/analysis', icon: <ChartBarIcon className="w-4 h-4" />, label: 'ABC/XYZ Analizi' },
          { key: '/inventory/forecasting', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Tahminleme' },
          { key: '/inventory/costing', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Maliyetlendirme' },
          { key: '/inventory/audit-trail', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Denetim İzi' },
        ],
      },
      {
        key: 'inv-settings',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Tanımlar',
        children: [
          { key: '/inventory/units', icon: <ViewColumnsIcon className="w-4 h-4" />, label: 'Birimler' },
          { key: '/inventory/suppliers', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Tedarikçiler' },
          { key: '/inventory/locations', icon: <MapPinIcon className="w-4 h-4" />, label: 'Lokasyonlar' },
          { key: '/inventory/warehouse-zones', icon: <HomeIcon className="w-4 h-4" />, label: 'Depo Bölgeleri' },
          { key: '/inventory/price-lists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri' },
          { key: '/inventory/barcodes', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Barkodlar' },
          { key: '/inventory/barcode-definitions', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Barkod Tanımları' },
          { key: '/inventory/packaging-types', icon: <CubeIcon className="w-4 h-4" />, label: 'Ambalaj Tipleri' },
          { key: '/inventory/reorder-rules', icon: <BoltIcon className="w-4 h-4" />, label: 'Sipariş Kuralları' },
          { key: '/inventory/product-attributes', icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />, label: 'Özellikler' },
        ],
      },
    ],
  },
  sales: {
    title: 'Satış',
    icon: <ShoppingCartIcon className="w-4 h-4" />,
    color: colors.semantic.warning.default, // Was '#f59e0b' -> Now Semantic Warning (Amber)
    moduleCode: 'sales',
    description: 'Sipariş ve fatura yönetimi',
    items: [
      { key: '/sales', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'sales-quotations',
        icon: <DocumentCheckIcon className="w-4 h-4" />,
        label: 'Teklifler',
        children: [
          { key: '/sales/quotations', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Satış Teklifleri' },
        ],
      },
      {
        key: 'sales-orders',
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        label: 'İşlemler',
        children: [
          { key: '/sales/orders', icon: <ShoppingCartIcon className="w-4 h-4" />, label: 'Siparişler' },
          { key: '/sales/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Faturalar' },
          { key: '/sales/e-invoices', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'E-Fatura' },
          { key: '/sales/shipments', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Sevkiyatlar' },
          { key: '/sales/returns', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'İadeler' },
        ],
      },
      {
        key: 'sales-finance',
        icon: <WalletIcon className="w-4 h-4" />,
        label: 'Finans',
        children: [
          { key: '/sales/payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Ödemeler' },
          { key: '/sales/customers', icon: <UserIcon className="w-4 h-4" />, label: 'Bakiyeler' },
          { key: '/sales/commissions', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Komisyonlar' },
        ],
      },
      {
        key: 'sales-contracts',
        icon: <DocumentIcon className="w-4 h-4" />,
        label: 'Sözleşmeler',
        children: [
          { key: '/sales/contracts', icon: <DocumentIcon className="w-4 h-4" />, label: 'Müşteri Sözleşmeleri' },
        ],
      },
      {
        key: 'sales-territories',
        icon: <GlobeAltIcon className="w-4 h-4" />,
        label: 'Satış Bölgeleri',
        children: [
          { key: '/sales/territories', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Bölgeler' },
        ],
      },
      {
        key: 'sales-marketing',
        icon: <TagIcon className="w-4 h-4" />,
        label: 'Pazarlama',
        children: [
          { key: '/sales/discounts', icon: <TagIcon className="w-4 h-4" />, label: 'İndirimler' },
          { key: '/sales/segments', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Müşteri Segmentleri' },
          { key: '/sales/pricelists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri' },
        ],
      },
      {
        key: 'sales-performance',
        icon: <FlagIcon className="w-4 h-4" />,
        label: 'Performans',
        children: [
          { key: '/sales/targets', icon: <FlagIcon className="w-4 h-4" />, label: 'Satış Hedefleri' },
        ],
      },
      {
        key: 'sales-logistics',
        icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
        label: 'Lojistik',
        children: [
          { key: '/sales/reservations', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Rezervasyonları' },
          { key: '/sales/backorders', icon: <ClockIcon className="w-4 h-4" />, label: 'Bekleyen Siparişler' },
          { key: '/sales/delivery-notes', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'İrsaliyeler' },
        ],
      },
      {
        key: 'sales-financial',
        icon: <BookOpenIcon className="w-4 h-4" />,
        label: 'Finansal İşlemler',
        children: [
          { key: '/sales/advance-payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Avans Ödemeler' },
          { key: '/sales/credit-notes', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'Alacak Dekontları' },
        ],
      },
      {
        key: 'sales-postsales',
        icon: <WrenchIcon className="w-4 h-4" />,
        label: 'Satış Sonrası',
        children: [
          { key: '/sales/service', icon: <WrenchIcon className="w-4 h-4" />, label: 'Servis Talepleri' },
          { key: '/sales/warranty', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Garanti Sorgulama' },
        ],
      },
    ],
  },
  settings: {
    title: 'Ayarlar',
    icon: <Cog6ToothIcon className="w-4 h-4" />,
    color: colors.slate[600], // Was '#6b7280' -> Slate 600
    moduleCode: null, // Always enabled
    description: 'Sistem ayarları',
    items: [
      { key: '/settings', icon: <Cog6ToothIcon className="w-4 h-4" />, label: 'Genel Ayarlar' },
      {
        key: 'settings-org',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Organizasyon',
        children: [
          { key: '/settings/users', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Kullanıcılar' },
          { key: '/settings/roles', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Roller' },
          { key: '/settings/departments', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Departmanlar' },
        ],
      },
      {
        key: 'settings-security',
        icon: <ShieldExclamationIcon className="w-4 h-4" />,
        label: 'Güvenlik',
        children: [
          { key: '/settings/security', icon: <ShieldExclamationIcon className="w-4 h-4" />, label: 'Güvenlik Ayarları' },
          { key: '/settings/audit-logs', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Denetim Kayıtları' },
        ],
      },
      {
        key: 'settings-system',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Sistem',
        children: [
          { key: '/settings/backup', icon: <DocumentIcon className="w-4 h-4" />, label: 'Yedekleme' },
          { key: '/settings/data-migration', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Veri Aktarımı' },
        ],
      },
    ],
  },
  communication: {
    title: 'İletişim',
    icon: <BellIcon className="w-4 h-4" />,
    color: colors.brand.secondary[500], // Pink/Fuchsia for communication
    moduleCode: null, // Always enabled
    description: 'Bildirim ve hatırlatıcılar',
    items: [
      { key: '/notifications', icon: <BellIcon className="w-4 h-4" />, label: 'Bildirimler' },
      { key: '/reminders', icon: <ClockIcon className="w-4 h-4" />, label: 'Hatırlatıcılar' },
    ],
  },
  hr: {
    title: 'İnsan Kaynakları',
    icon: <IdentificationIcon className="w-4 h-4" />,
    color: colors.semantic.info.default, // Was '#0ea5e9' -> Info Blue/Sky
    moduleCode: 'hr',
    description: 'Çalışan ve bordro yönetimi',
    items: [
      { key: '/hr', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'hr-employees',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Çalışan Yönetimi',
        children: [
          { key: '/hr/employees', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Çalışanlar' },
          { key: '/hr/departments', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Departmanlar' },
          { key: '/hr/positions', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Pozisyonlar' },
          { key: '/hr/employee-skills', icon: <WrenchIcon className="w-4 h-4" />, label: 'Yetkinlikler' },
          { key: '/hr/employee-assets', icon: <InboxIcon className="w-4 h-4" />, label: 'Zimmetler' },
          { key: '/hr/employee-benefits', icon: <HeartIcon className="w-4 h-4" />, label: 'Yan Haklar' },
        ],
      },
      {
        key: 'hr-attendance',
        icon: <ClockIcon className="w-4 h-4" />,
        label: 'Devam & İzin',
        children: [
          { key: '/hr/attendance', icon: <ClockIcon className="w-4 h-4" />, label: 'Devam Takibi' },
          { key: '/hr/leaves', icon: <CalendarIcon className="w-4 h-4" />, label: 'İzinler' },
          { key: '/hr/leave-types', icon: <TagIcon className="w-4 h-4" />, label: 'İzin Türleri' },
          { key: '/hr/leave-accrual', icon: <CalculatorIcon className="w-4 h-4" />, label: 'İzin Hak Ediş Hesabı' },
          { key: '/hr/holidays', icon: <CalendarIcon className="w-4 h-4" />, label: 'Tatil Günleri' },
          { key: '/hr/time-sheets', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Puantaj' },
        ],
      },
      {
        key: 'hr-payroll',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Bordro & Masraf',
        children: [
          { key: '/hr/payroll', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Bordro' },
          { key: '/hr/payslips', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Bordro Makbuzları' },
          { key: '/hr/expenses', icon: <WalletIcon className="w-4 h-4" />, label: 'Masraflar' },
          { key: '/hr/severance-calculator', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Tazminat Hesaplama' },
        ],
      },
      {
        key: 'hr-sgk',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'SGK İşlemleri',
        children: [
          { key: '/hr/sgk-declarations', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'SGK Bildirgeleri' },
        ],
      },
      {
        key: 'hr-performance',
        icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
        label: 'Performans',
        children: [
          { key: '/hr/performance', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Değerlendirmeler' },
          { key: '/hr/goals', icon: <FunnelIcon className="w-4 h-4" />, label: 'Hedefler' },
          { key: '/hr/career-paths', icon: <TrophyIcon className="w-4 h-4" />, label: 'Kariyer Yolları' },
          { key: '/hr/succession-plans', icon: <StarIcon className="w-4 h-4" />, label: 'Yedekleme Planları' },
        ],
      },
      {
        key: 'hr-training',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'Eğitim & Sertifika',
        children: [
          { key: '/hr/trainings', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Eğitimler' },
          { key: '/hr/certifications', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Sertifikalar' },
        ],
      },
      {
        key: 'hr-recruitment',
        icon: <UserPlusIcon className="w-4 h-4" />,
        label: 'İşe Alım',
        children: [
          { key: '/hr/job-postings', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'İş İlanları' },
          { key: '/hr/job-applications', icon: <DocumentMagnifyingGlassIcon className="w-4 h-4" />, label: 'Başvurular' },
          { key: '/hr/interviews', icon: <CalendarIcon className="w-4 h-4" />, label: 'Mülakatlar' },
          { key: '/hr/onboardings', icon: <RocketLaunchIcon className="w-4 h-4" />, label: 'İşe Alışım' },
        ],
      },
      {
        key: 'hr-overtime',
        icon: <ClockIcon className="w-4 h-4" />,
        label: 'Fazla Mesai',
        children: [
          { key: '/hr/overtimes', icon: <ClockIcon className="w-4 h-4" />, label: 'Fazla Mesailer' },
        ],
      },
      {
        key: 'hr-relations',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Çalışan İlişkileri',
        children: [
          { key: '/hr/grievances', icon: <ExclamationCircleIcon className="w-4 h-4" />, label: 'Şikayetler' },
          { key: '/hr/disciplinary-actions', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'Disiplin İşlemleri' },
        ],
      },
      {
        key: 'hr-tools',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Araçlar',
        children: [
          { key: '/hr/documents', icon: <DocumentIcon className="w-4 h-4" />, label: 'Belgeler' },
          { key: '/hr/announcements', icon: <BellIcon className="w-4 h-4" />, label: 'Duyurular' },
          { key: '/hr/shifts', icon: <ClockIcon className="w-4 h-4" />, label: 'Vardiyalar' },
          { key: '/hr/work-schedules', icon: <CalendarIcon className="w-4 h-4" />, label: 'Çalışma Programları' },
          { key: '/hr/work-locations', icon: <MapPinIcon className="w-4 h-4" />, label: 'Lokasyonlar' },
        ],
      },
      {
        key: 'hr-settings',
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
        label: 'Türkiye Mevzuatı',
        children: [
          { key: '/hr/settings/minimum-wage', icon: <BanknotesIcon className="w-4 h-4" />, label: 'Asgari Ücret Yönetimi' },
          { key: '/hr/settings/tax-rates', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Vergi Oranları' },
        ],
      },
    ],
  },
  purchase: {
    title: 'Satın Alma',
    icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
    color: colors.brand.primary[500], // Violet/Indigo for purchase
    moduleCode: 'purchase',
    description: 'Tedarik ve satın alma yönetimi',
    items: [
      { key: '/purchase', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'purchase-suppliers',
        icon: <BuildingStorefrontIcon className="w-4 h-4" />,
        label: 'Tedarikçi Yönetimi',
        children: [
          { key: '/purchase/suppliers', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Tedarikçiler' },
          { key: '/purchase/evaluations', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Değerlendirmeler' },
        ],
      },
      {
        key: 'purchase-requests',
        icon: <DocumentIcon className="w-4 h-4" />,
        label: 'Talepler & Teklifler',
        children: [
          { key: '/purchase/requests', icon: <DocumentIcon className="w-4 h-4" />, label: 'Satın Alma Talepleri' },
          { key: '/purchase/quotations', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Teklif Talepleri (RFQ)' },
        ],
      },
      {
        key: 'purchase-orders',
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        label: 'Siparişler',
        children: [
          { key: '/purchase/orders', icon: <ShoppingCartIcon className="w-4 h-4" />, label: 'Satın Alma Siparişleri' },
          { key: '/purchase/goods-receipts', icon: <InboxIcon className="w-4 h-4" />, label: 'Mal Alım Belgeleri' },
        ],
      },
      {
        key: 'purchase-finance',
        icon: <DocumentTextIcon className="w-4 h-4" />,
        label: 'Finans',
        children: [
          { key: '/purchase/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Faturalar' },
          { key: '/purchase/payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Ödemeler' },
          { key: '/purchase/budgets', icon: <WalletIcon className="w-4 h-4" />, label: 'Bütçeler' },
        ],
      },
      {
        key: 'purchase-pricing',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Fiyatlandırma',
        children: [
          { key: '/purchase/price-lists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri' },
        ],
      },
      {
        key: 'purchase-returns',
        icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
        label: 'İadeler',
        children: [
          { key: '/purchase/returns', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'İade Belgeleri' },
        ],
      },
      {
        key: 'purchase-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar',
        children: [
          { key: '/purchase/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Raporlar' },
        ],
      },
    ],
  },
  finance: {
    title: 'Finans',
    icon: <BanknotesIcon className="w-4 h-4" />,
    color: colors.semantic.success.dark, // Green for finance
    moduleCode: 'finance',
    description: 'Finansal yönetim ve muhasebe',
    items: [
      { key: '/finance', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'finance-invoices',
        icon: <DocumentTextIcon className="w-4 h-4" />,
        label: 'Faturalar',
        children: [
          { key: '/finance/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Tüm Faturalar' },
          { key: '/finance/invoices/sales', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Satış Faturaları' },
          { key: '/finance/invoices/purchase', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Alış Faturaları' },
        ],
      },
      {
        key: 'finance-accounts',
        icon: <ScaleIcon className="w-4 h-4" />,
        label: 'Cari Hesaplar',
        children: [
          { key: '/finance/current-accounts', icon: <ScaleIcon className="w-4 h-4" />, label: 'Cari Hesaplar' },
          { key: '/finance/current-account-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Cari Hareketler' },
        ],
      },
      {
        key: 'finance-banking',
        icon: <BuildingLibraryIcon className="w-4 h-4" />,
        label: 'Banka & Kasa',
        children: [
          { key: '/finance/bank-accounts', icon: <BuildingLibraryIcon className="w-4 h-4" />, label: 'Banka Hesapları' },
          { key: '/finance/bank-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Banka Hareketleri' },
          { key: '/finance/cash-accounts', icon: <WalletIcon className="w-4 h-4" />, label: 'Kasa Hesapları' },
          { key: '/finance/cash-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Kasa Hareketleri' },
        ],
      },
      {
        key: 'finance-payments',
        icon: <CreditCardIcon className="w-4 h-4" />,
        label: 'Ödeme & Tahsilat',
        children: [
          { key: '/finance/payments', icon: <CreditCardIcon className="w-4 h-4" />, label: 'Ödemeler' },
          { key: '/finance/collections', icon: <ReceiptRefundIcon className="w-4 h-4" />, label: 'Tahsilatlar' },
          { key: '/finance/payment-plans', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Ödeme Planları' },
        ],
      },
      {
        key: 'finance-instruments',
        icon: <DocumentCheckIcon className="w-4 h-4" />,
        label: 'Ticari Belgeler',
        children: [
          { key: '/finance/checks', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Çekler' },
          { key: '/finance/promissory-notes', icon: <DocumentIcon className="w-4 h-4" />, label: 'Senetler' },
        ],
      },
      {
        key: 'finance-expenses',
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
        label: 'Giderler',
        children: [
          { key: '/finance/expenses', icon: <ReceiptPercentIcon className="w-4 h-4" />, label: 'Gider Kayıtları' },
          { key: '/finance/expense-categories', icon: <TagIcon className="w-4 h-4" />, label: 'Gider Kategorileri' },
          { key: '/finance/cost-centers', icon: <ViewColumnsIcon className="w-4 h-4" />, label: 'Maliyet Merkezleri' },
        ],
      },
      {
        key: 'finance-forex',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Döviz',
        children: [
          { key: '/finance/currencies', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Para Birimleri' },
          { key: '/finance/exchange-rates', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Döviz Kurları' },
        ],
      },
      {
        key: 'finance-assets',
        icon: <BuildingOfficeIcon className="w-4 h-4" />,
        label: 'Duran Varlıklar',
        children: [
          { key: '/finance/fixed-assets', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Duran Varlıklar' },
          { key: '/finance/depreciation', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Amortisman' },
        ],
      },
      {
        key: 'finance-budgeting',
        icon: <CalculatorIcon className="w-4 h-4" />,
        label: 'Bütçe',
        children: [
          { key: '/finance/budgets', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Bütçeler' },
          { key: '/finance/budget-items', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Bütçe Kalemleri' },
        ],
      },
      {
        key: 'finance-accounting',
        icon: <BookOpenIcon className="w-4 h-4" />,
        label: 'Muhasebe',
        children: [
          { key: '/finance/chart-of-accounts', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Hesap Planı' },
          { key: '/finance/journal-entries', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Yevmiye Fişleri' },
          { key: '/finance/accounting-periods', icon: <CalendarIcon className="w-4 h-4" />, label: 'Hesap Dönemleri' },
        ],
      },
      {
        key: 'finance-taxes',
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
        label: 'Vergiler',
        children: [
          { key: '/finance/tax-rates', icon: <ReceiptPercentIcon className="w-4 h-4" />, label: 'Vergi Oranları' },
          { key: '/finance/withholding-taxes', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Stopajlar' },
        ],
      },
      {
        key: 'finance-tax-compliance',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'Vergi İşlemleri (GİB)',
        children: [
          { key: '/finance/tax/ba-bs', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Ba-Bs Formu' },
          { key: '/finance/tax/declarations', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Vergi Beyannameleri' },
          { key: '/finance/tax/muhtasar', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Muhtasar Beyanname' },
          { key: '/finance/tax/provisional', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Geçici Vergi' },
          { key: '/finance/tax/calendar', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Vergi Takvimi' },
          { key: '/finance/inflation-accounting', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Enflasyon Muhasebesi' },
        ],
      },
      {
        key: 'finance-einvoice',
        icon: <DocumentDuplicateIcon className="w-4 h-4" />,
        label: 'e-Belge (GİB)',
        children: [
          { key: '/finance/e-invoice', icon: <DocumentDuplicateIcon className="w-4 h-4" />, label: 'e-Fatura' },
          { key: '/finance/e-invoice/waybill', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'e-İrsaliye' },
          { key: '/finance/e-ledger', icon: <BookOpenIcon className="w-4 h-4" />, label: 'e-Defter' },
          { key: '/finance/e-invoice/settings', icon: <Cog6ToothIcon className="w-4 h-4" />, label: 'GİB Ayarları' },
        ],
      },
      {
        key: 'finance-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar',
        children: [
          { key: '/finance/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Finansal Raporlar' },
          { key: '/finance/aging-reports', icon: <ClockIcon className="w-4 h-4" />, label: 'Yaşlandırma Raporları' },
          { key: '/finance/cash-flow', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Nakit Akışı' },
          { key: '/finance/reports/vat', icon: <CalculatorIcon className="w-4 h-4" />, label: 'KDV Raporu' },
          { key: '/finance/reports/withholding', icon: <ScaleIcon className="w-4 h-4" />, label: 'Stopaj Raporu' },
        ],
      },
    ],
  },
  manufacturing: {
    title: 'Üretim',
    icon: <CogIcon className="w-4 h-4" />,
    color: '#8b5cf6', // Purple for manufacturing
    moduleCode: 'manufacturing',
    description: 'Üretim planlama ve kalite kontrol',
    items: [
      { key: '/manufacturing', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard' },
      {
        key: 'mfg-planning',
        icon: <CalendarIcon className="w-4 h-4" />,
        label: 'Planlama',
        children: [
          { key: '/manufacturing/master-production-schedules', icon: <CalendarIcon className="w-4 h-4" />, label: 'Ana Üretim Planları (MPS)' },
          { key: '/manufacturing/mrp-plans', icon: <CalculatorIcon className="w-4 h-4" />, label: 'MRP Planları' },
          { key: '/manufacturing/capacity-plans', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Kapasite Planları' },
          { key: '/manufacturing/material-reservations', icon: <LockClosedIcon className="w-4 h-4" />, label: 'Malzeme Rezervasyonları' },
        ],
      },
      {
        key: 'mfg-orders',
        icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
        label: 'Üretim Emirleri',
        children: [
          { key: '/manufacturing/production-orders', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Üretim Emirleri' },
          { key: '/manufacturing/subcontract-orders', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Fason Siparişler' },
        ],
      },
      {
        key: 'mfg-bom',
        icon: <CircleStackIcon className="w-4 h-4" />,
        label: 'Ürün Yapısı',
        children: [
          { key: '/manufacturing/bom', icon: <CircleStackIcon className="w-4 h-4" />, label: 'Ürün Ağaçları (BOM)' },
          { key: '/manufacturing/routings', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Rotalar' },
        ],
      },
      {
        key: 'mfg-resources',
        icon: <CpuChipIcon className="w-4 h-4" />,
        label: 'Kaynaklar',
        children: [
          { key: '/manufacturing/work-centers', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'İş Merkezleri' },
        ],
      },
      {
        key: 'mfg-quality',
        icon: <BeakerIcon className="w-4 h-4" />,
        label: 'Kalite',
        children: [
          { key: '/manufacturing/quality-inspections', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Kalite Kontrolleri' },
          { key: '/manufacturing/quality-management', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Kalite Yönetimi' },
          { key: '/manufacturing/quality-management/ncr', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'NCR (Uygunsuzluklar)' },
          { key: '/manufacturing/quality-management/capa', icon: <ShieldExclamationIcon className="w-4 h-4" />, label: 'CAPA (Düzeltici Aksiyonlar)' },
        ],
      },
      {
        key: 'mfg-maintenance',
        icon: <WrenchIcon className="w-4 h-4" />,
        label: 'Bakım',
        children: [
          { key: '/manufacturing/maintenance', icon: <WrenchScrewdriverIcon className="w-4 h-4" />, label: 'Bakım Yönetimi' },
        ],
      },
      {
        key: 'mfg-costing',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Maliyet',
        children: [
          { key: '/manufacturing/cost-accounting', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Maliyet Muhasebesi' },
        ],
      },
      {
        key: 'mfg-kpi',
        icon: <PresentationChartLineIcon className="w-4 h-4" />,
        label: 'KPI & Raporlar',
        children: [
          { key: '/manufacturing/kpi-dashboard', icon: <ChartBarIcon className="w-4 h-4" />, label: 'KPI Dashboard' },
          { key: '/manufacturing/kpi-dashboard/definitions', icon: <ListBulletIcon className="w-4 h-4" />, label: 'KPI Tanımları' },
        ],
      },
    ],
  },
  modules: {
    title: 'Modüller',
    icon: <Squares2X2Icon className="w-4 h-4" />,
    color: colors.semantic.info.dark, // Cyan/Teal for modules
    moduleCode: null, // Always enabled
    description: 'Modül yönetimi',
    items: [
      { key: '/modules', icon: <Squares2X2Icon className="w-4 h-4" />, label: 'Modül Yönetimi' },
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
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/manufacturing')) return 'manufacturing';
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
