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
  ChatBubbleLeftRightIcon,
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
  /**
   * Required permission to see this menu item
   * Format: "Resource:PermissionType" (e.g., "CRM:View", "Users:Edit")
   * If not specified, the item is always visible
   */
  permission?: string;
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
      { key: '/crm', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'CRM:View' },
      {
        key: 'crm-customers',
        icon: <UserIcon className="w-4 h-4" />,
        label: 'Müşteri Yönetimi',
        permission: 'CRM.Customers:View',
        children: [
          { key: '/crm/customers', icon: <UserIcon className="w-4 h-4" />, label: 'Müşteriler', permission: 'CRM.Customers:View' },
          { key: '/crm/leads', icon: <UserPlusIcon className="w-4 h-4" />, label: 'Potansiyeller', permission: 'CRM.Leads:View' },
          { key: '/crm/segments', icon: <UsersIcon className="w-4 h-4" />, label: 'Segmentler', permission: 'CRM.Segments:View' },
          { key: '/crm/referrals', icon: <ShareIcon className="w-4 h-4" />, label: 'Referanslar', permission: 'CRM.Referrals:View' },
        ],
      },
      {
        key: 'crm-sales',
        icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
        label: 'Satış Yönetimi',
        permission: 'CRM.Sales:View',
        children: [
          { key: '/crm/opportunities', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Fırsatlar', permission: 'CRM.Opportunities:View' },
          { key: '/crm/deals', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Anlaşmalar', permission: 'CRM.Deals:View' },
          { key: '/crm/pipelines', icon: <FunnelIcon className="w-4 h-4" />, label: 'Pipeline', permission: 'CRM.Pipelines:View' },
          { key: '/crm/sales-teams', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Satış Ekipleri', permission: 'CRM.SalesTeams:View' },
          { key: '/crm/territories', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Bölgeler', permission: 'CRM.Territories:View' },
          { key: '/crm/competitors', icon: <FlagIcon className="w-4 h-4" />, label: 'Rakipler', permission: 'CRM.Competitors:View' },
        ],
      },
      {
        key: 'crm-activities',
        icon: <CalendarIcon className="w-4 h-4" />,
        label: 'Aktiviteler',
        permission: 'CRM.Activities:View',
        children: [
          { key: '/crm/activities', icon: <CalendarIcon className="w-4 h-4" />, label: 'Aktiviteler', permission: 'CRM.Activities:View' },
          { key: '/crm/meetings', icon: <CalendarIcon className="w-4 h-4" />, label: 'Toplantılar', permission: 'CRM.Meetings:View' },
          { key: '/crm/call-logs', icon: <PhoneIcon className="w-4 h-4" />, label: 'Arama Kayıtları', permission: 'CRM.CallLogs:View' },
          { key: '/crm/campaigns', icon: <BellIcon className="w-4 h-4" />, label: 'Kampanyalar', permission: 'CRM.Campaigns:View' },
        ],
      },
      {
        key: 'crm-loyalty',
        icon: <GiftIcon className="w-4 h-4" />,
        label: 'Sadakat',
        permission: 'CRM.Loyalty:View',
        children: [
          { key: '/crm/loyalty-programs', icon: <GiftIcon className="w-4 h-4" />, label: 'Sadakat Programları', permission: 'CRM.LoyaltyPrograms:View' },
          { key: '/crm/loyalty-memberships', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Sadakat Üyelikleri', permission: 'CRM.LoyaltyMemberships:View' },
        ],
      },
      {
        key: 'crm-engagement',
        icon: <HeartIcon className="w-4 h-4" />,
        label: 'Etkileşim',
        permission: 'CRM.Engagement:View',
        children: [
          { key: '/crm/product-interests', icon: <ShoppingCartIcon className="w-4 h-4" />, label: 'Ürün İlgileri', permission: 'CRM.ProductInterests:View' },
          { key: '/crm/social-profiles', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Sosyal Medya Profilleri', permission: 'CRM.SocialMediaProfiles:View' },
          { key: '/crm/survey-responses', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Anket Yanıtları', permission: 'CRM.SurveyResponses:View' },
        ],
      },
      {
        key: 'crm-tools',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Araçlar',
        permission: 'CRM.Tools:View',
        children: [
          { key: '/crm/documents', icon: <DocumentIcon className="w-4 h-4" />, label: 'Dökümanlar', permission: 'CRM.Documents:View' },
          { key: '/crm/workflows', icon: <BoltIcon className="w-4 h-4" />, label: 'Workflows', permission: 'CRM.Workflows:View' },
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
      { key: '/inventory', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'Inventory:View' },
      {
        key: 'inv-products',
        icon: <Squares2X2Icon className="w-4 h-4" />,
        label: 'Ürün Yönetimi',
        permission: 'Inventory.Products:View',
        children: [
          { key: '/inventory/products', icon: <Squares2X2Icon className="w-4 h-4" />, label: 'Ürünler', permission: 'Inventory.Products:View' },
          { key: '/inventory/categories', icon: <TagIcon className="w-4 h-4" />, label: 'Kategoriler', permission: 'Inventory.Categories:View' },
          { key: '/inventory/brands', icon: <SwatchIcon className="w-4 h-4" />, label: 'Markalar', permission: 'Inventory.Brands:View' },
          { key: '/inventory/product-variants', icon: <CubeIcon className="w-4 h-4" />, label: 'Varyantlar', permission: 'Inventory.ProductVariants:View' },
          { key: '/inventory/product-bundles', icon: <GiftIcon className="w-4 h-4" />, label: 'Paketler', permission: 'Inventory.ProductBundles:View' },
        ],
      },
      {
        key: 'inv-stock',
        icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
        label: 'Stok İşlemleri',
        permission: 'Inventory.Stock:View',
        children: [
          { key: '/inventory/stock', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Görünümü', permission: 'Inventory.Stock:View' },
          { key: '/inventory/warehouses', icon: <HomeIcon className="w-4 h-4" />, label: 'Depolar', permission: 'Inventory.Warehouses:View' },
          { key: '/inventory/stock-movements', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Hareketler', permission: 'Inventory.StockMovements:View' },
          { key: '/inventory/stock-transfers', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Transferler', permission: 'Inventory.StockTransfers:View' },
          { key: '/inventory/stock-adjustments', icon: <PencilIcon className="w-4 h-4" />, label: 'Düzeltmeler', permission: 'Inventory.StockAdjustments:View' },
          { key: '/inventory/stock-counts', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Sayımlar', permission: 'Inventory.StockCounts:View' },
          { key: '/inventory/consignment-stocks', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Konsinye Stoklar', permission: 'Inventory.ConsignmentStocks:View' },
        ],
      },
      {
        key: 'inv-tracking',
        icon: <QrCodeIcon className="w-4 h-4" />,
        label: 'İzleme & Takip',
        permission: 'Inventory.Tracking:View',
        children: [
          { key: '/inventory/serial-numbers', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Seri Numaraları', permission: 'Inventory.SerialNumbers:View' },
          { key: '/inventory/lot-batches', icon: <InboxIcon className="w-4 h-4" />, label: 'Lot/Parti', permission: 'Inventory.LotBatches:View' },
          { key: '/inventory/shelf-life', icon: <ClockIcon className="w-4 h-4" />, label: 'Raf Ömrü', permission: 'Inventory.ShelfLife:View' },
          { key: '/inventory/shelf-life/rules', icon: <BoltIcon className="w-4 h-4" />, label: 'Raf Ömrü Kuralları', permission: 'Inventory.ShelfLifeRules:View' },
          { key: '/inventory/stock-reservations', icon: <LockClosedIcon className="w-4 h-4" />, label: 'Rezervasyonlar', permission: 'Inventory.StockReservations:View' },
          { key: '/inventory/stock-alerts', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'Uyarılar', permission: 'Inventory.StockAlerts:View' },
        ],
      },
      {
        key: 'inv-quality',
        icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />,
        label: 'Kalite Yönetimi',
        permission: 'Inventory.Quality:View',
        children: [
          { key: '/inventory/quality-control', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Kalite Kontrol', permission: 'Inventory.QualityControl:View' },
          { key: '/inventory/cycle-counts', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Dönemsel Sayımlar', permission: 'Inventory.CycleCounts:View' },
        ],
      },
      {
        key: 'inv-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar & Analiz',
        permission: 'Inventory.Reports:View',
        children: [
          { key: '/inventory/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Raporlar', permission: 'Inventory.Reports:View' },
          { key: '/inventory/analytics', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Analizler', permission: 'Inventory.Analytics:View' },
          { key: '/inventory/analysis', icon: <ChartBarIcon className="w-4 h-4" />, label: 'ABC/XYZ Analizi', permission: 'Inventory.Analysis:View' },
          { key: '/inventory/forecasting', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Tahminleme', permission: 'Inventory.Forecasting:View' },
          { key: '/inventory/costing', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Maliyetlendirme', permission: 'Inventory.Costing:View' },
          { key: '/inventory/audit-trail', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Denetim İzi', permission: 'Inventory.AuditTrail:View' },
        ],
      },
      {
        key: 'inv-settings',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Tanımlar',
        permission: 'Inventory.Settings:View',
        children: [
          { key: '/inventory/units', icon: <ViewColumnsIcon className="w-4 h-4" />, label: 'Birimler', permission: 'Inventory.Units:View' },
          { key: '/inventory/suppliers', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Tedarikçiler', permission: 'Inventory.Suppliers:View' },
          { key: '/inventory/locations', icon: <MapPinIcon className="w-4 h-4" />, label: 'Lokasyonlar', permission: 'Inventory.Locations:View' },
          { key: '/inventory/warehouse-zones', icon: <HomeIcon className="w-4 h-4" />, label: 'Depo Bölgeleri', permission: 'Inventory.WarehouseZones:View' },
          { key: '/inventory/price-lists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri', permission: 'Inventory.PriceLists:View' },
          { key: '/inventory/barcodes', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Barkodlar', permission: 'Inventory.Barcodes:View' },
          { key: '/inventory/barcode-definitions', icon: <QrCodeIcon className="w-4 h-4" />, label: 'Barkod Tanımları', permission: 'Inventory.BarcodeDefinitions:View' },
          { key: '/inventory/packaging-types', icon: <CubeIcon className="w-4 h-4" />, label: 'Ambalaj Tipleri', permission: 'Inventory.PackagingTypes:View' },
          { key: '/inventory/reorder-rules', icon: <BoltIcon className="w-4 h-4" />, label: 'Sipariş Kuralları', permission: 'Inventory.ReorderRules:View' },
          { key: '/inventory/product-attributes', icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />, label: 'Özellikler', permission: 'Inventory.ProductAttributes:View' },
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
      { key: '/sales', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'Sales:View' },
      {
        key: 'sales-quotations',
        icon: <DocumentCheckIcon className="w-4 h-4" />,
        label: 'Teklifler',
        permission: 'Sales.Quotations:View',
        children: [
          { key: '/sales/quotations', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Satış Teklifleri', permission: 'Sales.Quotations:View' },
        ],
      },
      {
        key: 'sales-orders',
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        label: 'İşlemler',
        permission: 'Sales.Orders:View',
        children: [
          { key: '/sales/orders', icon: <ShoppingCartIcon className="w-4 h-4" />, label: 'Siparişler', permission: 'Sales.Orders:View' },
          { key: '/sales/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Faturalar', permission: 'Sales.Invoices:View' },
          { key: '/sales/e-invoices', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'E-Fatura', permission: 'Sales.EInvoices:View' },
          { key: '/sales/shipments', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Sevkiyatlar', permission: 'Sales.Shipments:View' },
          { key: '/sales/returns', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'İadeler', permission: 'Sales.Returns:View' },
        ],
      },
      {
        key: 'sales-finance',
        icon: <WalletIcon className="w-4 h-4" />,
        label: 'Finans',
        permission: 'Sales.Finance:View',
        children: [
          { key: '/sales/payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Ödemeler', permission: 'Sales.Payments:View' },
          { key: '/sales/customers', icon: <UserIcon className="w-4 h-4" />, label: 'Bakiyeler', permission: 'Sales.Customers:View' },
          { key: '/sales/commissions', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Komisyonlar', permission: 'Sales.Commissions:View' },
        ],
      },
      {
        key: 'sales-contracts',
        icon: <DocumentIcon className="w-4 h-4" />,
        label: 'Sözleşmeler',
        permission: 'Sales.Contracts:View',
        children: [
          { key: '/sales/contracts', icon: <DocumentIcon className="w-4 h-4" />, label: 'Müşteri Sözleşmeleri', permission: 'Sales.Contracts:View' },
        ],
      },
      {
        key: 'sales-territories',
        icon: <GlobeAltIcon className="w-4 h-4" />,
        label: 'Satış Bölgeleri',
        permission: 'Sales.Territories:View',
        children: [
          { key: '/sales/territories', icon: <GlobeAltIcon className="w-4 h-4" />, label: 'Bölgeler', permission: 'Sales.Territories:View' },
        ],
      },
      {
        key: 'sales-marketing',
        icon: <TagIcon className="w-4 h-4" />,
        label: 'Pazarlama',
        permission: 'Sales.Marketing:View',
        children: [
          { key: '/sales/discounts', icon: <TagIcon className="w-4 h-4" />, label: 'İndirimler', permission: 'Sales.Discounts:View' },
          { key: '/sales/segments', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Müşteri Segmentleri', permission: 'Sales.Segments:View' },
          { key: '/sales/pricelists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri', permission: 'Sales.Pricelists:View' },
        ],
      },
      {
        key: 'sales-performance',
        icon: <FlagIcon className="w-4 h-4" />,
        label: 'Performans',
        permission: 'Sales.Performance:View',
        children: [
          { key: '/sales/targets', icon: <FlagIcon className="w-4 h-4" />, label: 'Satış Hedefleri', permission: 'Sales.Targets:View' },
        ],
      },
      {
        key: 'sales-opportunities',
        icon: <RocketLaunchIcon className="w-4 h-4" />,
        label: 'Fırsatlar',
        permission: 'Sales.Opportunities:View',
        children: [
          { key: '/sales/opportunities', icon: <RocketLaunchIcon className="w-4 h-4" />, label: 'Satış Fırsatları', permission: 'Sales.Opportunities:View' },
          { key: '/sales/pipelines', icon: <FunnelIcon className="w-4 h-4" />, label: 'Satış Hatları', permission: 'Sales.Pipelines:View' },
        ],
      },
      {
        key: 'sales-logistics',
        icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
        label: 'Lojistik',
        permission: 'Sales.Logistics:View',
        children: [
          { key: '/sales/reservations', icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Rezervasyonları', permission: 'Sales.Reservations:View' },
          { key: '/sales/backorders', icon: <ClockIcon className="w-4 h-4" />, label: 'Bekleyen Siparişler', permission: 'Sales.Backorders:View' },
          { key: '/sales/delivery-notes', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'İrsaliyeler', permission: 'Sales.DeliveryNotes:View' },
        ],
      },
      {
        key: 'sales-financial',
        icon: <BookOpenIcon className="w-4 h-4" />,
        label: 'Finansal İşlemler',
        permission: 'Sales.Financial:View',
        children: [
          { key: '/sales/advance-payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Avans Ödemeler', permission: 'Sales.AdvancePayments:View' },
          { key: '/sales/credit-notes', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'Alacak Dekontları', permission: 'Sales.CreditNotes:View' },
        ],
      },
      {
        key: 'sales-postsales',
        icon: <WrenchIcon className="w-4 h-4" />,
        label: 'Satış Sonrası',
        permission: 'Sales.PostSales:View',
        children: [
          { key: '/sales/service', icon: <WrenchIcon className="w-4 h-4" />, label: 'Servis Talepleri', permission: 'Sales.Service:View' },
          { key: '/sales/warranty', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Garanti Sorgulama', permission: 'Sales.Warranty:View' },
        ],
      },
      {
        key: 'sales-turkey-compliance',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'Türkiye Mevzuatı',
        permission: 'Sales.TurkeyCompliance:View',
        children: [
          { key: '/sales/withholding', icon: <ReceiptPercentIcon className="w-4 h-4" />, label: 'Tevkifat Yönetimi', permission: 'Sales.Withholding:View' },
          { key: '/sales/vat-rates', icon: <CalculatorIcon className="w-4 h-4" />, label: 'KDV Oranları', permission: 'Sales.VatRates:View' },
          { key: '/sales/e-archive', icon: <DocumentDuplicateIcon className="w-4 h-4" />, label: 'E-Arşiv Fatura', permission: 'Sales.EArchive:View' },
          { key: '/sales/gib-settings', icon: <Cog6ToothIcon className="w-4 h-4" />, label: 'GİB Ayarları', permission: 'Sales.GibSettings:View' },
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
      { key: '/settings', icon: <Cog6ToothIcon className="w-4 h-4" />, label: 'Genel Ayarlar', permission: 'Settings:View' },
      {
        key: 'settings-org',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Organizasyon',
        permission: 'Settings.Organization:View',
        children: [
          { key: '/settings/users', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Kullanıcılar', permission: 'Settings.Users:View' },
          { key: '/settings/roles', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Roller', permission: 'Settings.Roles:View' },
          { key: '/settings/departments', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Departmanlar', permission: 'Settings.Departments:View' },
        ],
      },
      {
        key: 'settings-security',
        icon: <ShieldExclamationIcon className="w-4 h-4" />,
        label: 'Güvenlik',
        permission: 'Settings.Security:View',
        children: [
          { key: '/settings/security', icon: <ShieldExclamationIcon className="w-4 h-4" />, label: 'Güvenlik Ayarları', permission: 'Settings.Security:View' },
          { key: '/settings/audit-logs', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Denetim Kayıtları', permission: 'Settings.AuditLogs:View' },
        ],
      },
      {
        key: 'settings-system',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Sistem',
        permission: 'Settings.System:View',
        children: [
          { key: '/settings/backup', icon: <DocumentIcon className="w-4 h-4" />, label: 'Yedekleme', permission: 'Settings.Backup:View' },
          { key: '/settings/data-migration', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Veri Aktarımı', permission: 'Settings.DataMigration:View' },
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
      { key: '/notifications?filter=unread', icon: <ExclamationCircleIcon className="w-4 h-4" />, label: 'Okunmamışlar' },
      { key: '/reminders', icon: <ClockIcon className="w-4 h-4" />, label: 'Hatırlatıcılar' },
      { key: '/reminders?filter=tasks', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Görevlerim' },
      { key: '/reminders?view=calendar', icon: <CalendarIcon className="w-4 h-4" />, label: 'Takvim' },
      { key: '/hr/announcements', icon: <FlagIcon className="w-4 h-4" />, label: 'Duyurular' },
    ],
  },
  hr: {
    title: 'İnsan Kaynakları',
    icon: <IdentificationIcon className="w-4 h-4" />,
    color: colors.semantic.info.default, // Was '#0ea5e9' -> Info Blue/Sky
    moduleCode: 'hr',
    description: 'Çalışan ve bordro yönetimi',
    items: [
      { key: '/hr', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'HR:View' },
      {
        key: 'hr-employees',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Çalışan Yönetimi',
        permission: 'HR.Employees:View',
        children: [
          { key: '/hr/employees', icon: <UserGroupIcon className="w-4 h-4" />, label: 'Çalışanlar', permission: 'HR.Employees:View' },
          { key: '/hr/departments', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Departmanlar', permission: 'HR.Departments:View' },
          { key: '/hr/positions', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Pozisyonlar', permission: 'HR.Positions:View' },
          { key: '/hr/employee-skills', icon: <WrenchIcon className="w-4 h-4" />, label: 'Yetkinlikler', permission: 'HR.EmployeeSkills:View' },
          { key: '/hr/employee-assets', icon: <InboxIcon className="w-4 h-4" />, label: 'Zimmetler', permission: 'HR.EmployeeAssets:View' },
          { key: '/hr/employee-benefits', icon: <HeartIcon className="w-4 h-4" />, label: 'Yan Haklar', permission: 'HR.EmployeeBenefits:View' },
        ],
      },
      {
        key: 'hr-attendance',
        icon: <ClockIcon className="w-4 h-4" />,
        label: 'Devam & İzin',
        permission: 'HR.Attendance:View',
        children: [
          { key: '/hr/attendance', icon: <ClockIcon className="w-4 h-4" />, label: 'Devam Takibi', permission: 'HR.Attendance:View' },
          { key: '/hr/leaves', icon: <CalendarIcon className="w-4 h-4" />, label: 'İzinler', permission: 'HR.Leaves:View' },
          { key: '/hr/leave-types', icon: <TagIcon className="w-4 h-4" />, label: 'İzin Türleri', permission: 'HR.LeaveTypes:View' },
          { key: '/hr/leave-accrual', icon: <CalculatorIcon className="w-4 h-4" />, label: 'İzin Hak Ediş Hesabı', permission: 'HR.LeaveAccrual:View' },
          { key: '/hr/holidays', icon: <CalendarIcon className="w-4 h-4" />, label: 'Tatil Günleri', permission: 'HR.Holidays:View' },
          { key: '/hr/time-sheets', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Puantaj', permission: 'HR.TimeSheets:View' },
        ],
      },
      {
        key: 'hr-payroll',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Bordro & Masraf',
        permission: 'HR.Payroll:View',
        children: [
          { key: '/hr/payroll', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Bordro', permission: 'HR.Payroll:View' },
          { key: '/hr/payslips', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Bordro Makbuzları', permission: 'HR.Payslips:View' },
          { key: '/hr/expenses', icon: <WalletIcon className="w-4 h-4" />, label: 'Masraflar', permission: 'HR.Expenses:View' },
          { key: '/hr/severance-calculator', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Tazminat Hesaplama', permission: 'HR.SeveranceCalculator:View' },
        ],
      },
      {
        key: 'hr-sgk',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'SGK İşlemleri',
        permission: 'HR.Sgk:View',
        children: [
          { key: '/hr/sgk-declarations', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'SGK Bildirgeleri', permission: 'HR.SgkDeclarations:View' },
        ],
      },
      {
        key: 'hr-performance',
        icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
        label: 'Performans',
        permission: 'HR.Performance:View',
        children: [
          { key: '/hr/performance', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Değerlendirmeler', permission: 'HR.Performance:View' },
          { key: '/hr/goals', icon: <FunnelIcon className="w-4 h-4" />, label: 'Hedefler', permission: 'HR.Goals:View' },
          { key: '/hr/career-paths', icon: <TrophyIcon className="w-4 h-4" />, label: 'Kariyer Yolları', permission: 'HR.CareerPaths:View' },
          { key: '/hr/succession-plans', icon: <StarIcon className="w-4 h-4" />, label: 'Yedekleme Planları', permission: 'HR.SuccessionPlans:View' },
        ],
      },
      {
        key: 'hr-training',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'Eğitim & Sertifika',
        permission: 'HR.Training:View',
        children: [
          { key: '/hr/trainings', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Eğitimler', permission: 'HR.Trainings:View' },
          { key: '/hr/certifications', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Sertifikalar', permission: 'HR.Certifications:View' },
        ],
      },
      {
        key: 'hr-recruitment',
        icon: <UserPlusIcon className="w-4 h-4" />,
        label: 'İşe Alım',
        permission: 'HR.Recruitment:View',
        children: [
          { key: '/hr/job-postings', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'İş İlanları', permission: 'HR.JobPostings:View' },
          { key: '/hr/job-applications', icon: <DocumentMagnifyingGlassIcon className="w-4 h-4" />, label: 'Başvurular', permission: 'HR.JobApplications:View' },
          { key: '/hr/interviews', icon: <CalendarIcon className="w-4 h-4" />, label: 'Mülakatlar', permission: 'HR.Interviews:View' },
          { key: '/hr/onboardings', icon: <RocketLaunchIcon className="w-4 h-4" />, label: 'İşe Alışım', permission: 'HR.Onboardings:View' },
        ],
      },
      {
        key: 'hr-overtime',
        icon: <ClockIcon className="w-4 h-4" />,
        label: 'Fazla Mesai',
        permission: 'HR.Overtime:View',
        children: [
          { key: '/hr/overtimes', icon: <ClockIcon className="w-4 h-4" />, label: 'Fazla Mesailer', permission: 'HR.Overtimes:View' },
        ],
      },
      {
        key: 'hr-relations',
        icon: <UserGroupIcon className="w-4 h-4" />,
        label: 'Çalışan İlişkileri',
        permission: 'HR.Relations:View',
        children: [
          { key: '/hr/grievances', icon: <ExclamationCircleIcon className="w-4 h-4" />, label: 'Şikayetler', permission: 'HR.Grievances:View' },
          { key: '/hr/disciplinary-actions', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'Disiplin İşlemleri', permission: 'HR.DisciplinaryActions:View' },
        ],
      },
      {
        key: 'hr-tools',
        icon: <Cog6ToothIcon className="w-4 h-4" />,
        label: 'Araçlar',
        permission: 'HR.Tools:View',
        children: [
          { key: '/hr/documents', icon: <DocumentIcon className="w-4 h-4" />, label: 'Belgeler', permission: 'HR.Documents:View' },
          { key: '/hr/announcements', icon: <BellIcon className="w-4 h-4" />, label: 'Duyurular', permission: 'HR.Announcements:View' },
          { key: '/hr/shifts', icon: <ClockIcon className="w-4 h-4" />, label: 'Vardiyalar', permission: 'HR.Shifts:View' },
          { key: '/hr/work-schedules', icon: <CalendarIcon className="w-4 h-4" />, label: 'Çalışma Programları', permission: 'HR.WorkSchedules:View' },
          { key: '/hr/work-locations', icon: <MapPinIcon className="w-4 h-4" />, label: 'Lokasyonlar', permission: 'HR.WorkLocations:View' },
        ],
      },
      {
        key: 'hr-settings',
        icon: <AdjustmentsHorizontalIcon className="w-4 h-4" />,
        label: 'Türkiye Mevzuatı',
        permission: 'HR.TurkeyCompliance:View',
        children: [
          { key: '/hr/settings/minimum-wage', icon: <BanknotesIcon className="w-4 h-4" />, label: 'Asgari Ücret Yönetimi', permission: 'HR.MinimumWage:View' },
          { key: '/hr/settings/tax-rates', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Vergi Oranları', permission: 'HR.TaxRates:View' },
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
      { key: '/purchase', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'Purchase:View' },
      {
        key: 'purchase-suppliers',
        icon: <BuildingStorefrontIcon className="w-4 h-4" />,
        label: 'Tedarikçi Yönetimi',
        permission: 'Purchase.Suppliers:View',
        children: [
          { key: '/purchase/suppliers', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Tedarikçiler', permission: 'Purchase.Suppliers:View' },
          { key: '/purchase/evaluations', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Değerlendirmeler', permission: 'Purchase.Evaluations:View' },
        ],
      },
      {
        key: 'purchase-requests',
        icon: <DocumentIcon className="w-4 h-4" />,
        label: 'Talepler & Teklifler',
        permission: 'Purchase.Requests:View',
        children: [
          { key: '/purchase/requests', icon: <DocumentIcon className="w-4 h-4" />, label: 'Satın Alma Talepleri', permission: 'Purchase.Requests:View' },
          { key: '/purchase/quotations', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Teklif Talepleri (RFQ)', permission: 'Purchase.Quotations:View' },
        ],
      },
      {
        key: 'purchase-orders',
        icon: <ShoppingCartIcon className="w-4 h-4" />,
        label: 'Siparişler',
        permission: 'Purchase.Orders:View',
        children: [
          { key: '/purchase/orders', icon: <ShoppingCartIcon className="w-4 h-4" />, label: 'Satın Alma Siparişleri', permission: 'Purchase.Orders:View' },
          { key: '/purchase/goods-receipts', icon: <InboxIcon className="w-4 h-4" />, label: 'Mal Alım Belgeleri', permission: 'Purchase.GoodsReceipts:View' },
        ],
      },
      {
        key: 'purchase-finance',
        icon: <DocumentTextIcon className="w-4 h-4" />,
        label: 'Finans',
        permission: 'Purchase.Finance:View',
        children: [
          { key: '/purchase/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Faturalar', permission: 'Purchase.Invoices:View' },
          { key: '/purchase/payments', icon: <WalletIcon className="w-4 h-4" />, label: 'Ödemeler', permission: 'Purchase.Payments:View' },
          { key: '/purchase/budgets', icon: <WalletIcon className="w-4 h-4" />, label: 'Bütçeler', permission: 'Purchase.Budgets:View' },
        ],
      },
      {
        key: 'purchase-pricing',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Fiyatlandırma',
        permission: 'Purchase.Pricing:View',
        children: [
          { key: '/purchase/price-lists', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Fiyat Listeleri', permission: 'Purchase.PriceLists:View' },
        ],
      },
      {
        key: 'purchase-returns',
        icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
        label: 'İadeler',
        permission: 'Purchase.Returns:View',
        children: [
          { key: '/purchase/returns', icon: <ArrowUturnLeftIcon className="w-4 h-4" />, label: 'İade Belgeleri', permission: 'Purchase.Returns:View' },
        ],
      },
      {
        key: 'purchase-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar',
        permission: 'Purchase.Reports:View',
        children: [
          { key: '/purchase/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Raporlar', permission: 'Purchase.Reports:View' },
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
      { key: '/finance', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'Finance:View' },
      {
        key: 'finance-invoices',
        icon: <DocumentTextIcon className="w-4 h-4" />,
        label: 'Faturalar',
        permission: 'Finance.Invoices:View',
        children: [
          { key: '/finance/invoices', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Tüm Faturalar', permission: 'Finance.Invoices:View' },
          { key: '/finance/invoices/sales', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Satış Faturaları', permission: 'Finance.SalesInvoices:View' },
          { key: '/finance/invoices/purchase', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Alış Faturaları', permission: 'Finance.PurchaseInvoices:View' },
        ],
      },
      {
        key: 'finance-accounts',
        icon: <ScaleIcon className="w-4 h-4" />,
        label: 'Cari Hesaplar',
        permission: 'Finance.CurrentAccounts:View',
        children: [
          { key: '/finance/current-accounts', icon: <ScaleIcon className="w-4 h-4" />, label: 'Cari Hesaplar', permission: 'Finance.CurrentAccounts:View' },
          { key: '/finance/current-account-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Cari Hareketler', permission: 'Finance.CurrentAccountTransactions:View' },
        ],
      },
      {
        key: 'finance-banking',
        icon: <BuildingLibraryIcon className="w-4 h-4" />,
        label: 'Banka & Kasa',
        permission: 'Finance.Banking:View',
        children: [
          { key: '/finance/bank-accounts', icon: <BuildingLibraryIcon className="w-4 h-4" />, label: 'Banka Hesapları', permission: 'Finance.BankAccounts:View' },
          { key: '/finance/bank-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Banka Hareketleri', permission: 'Finance.BankTransactions:View' },
          { key: '/finance/cash-accounts', icon: <WalletIcon className="w-4 h-4" />, label: 'Kasa Hesapları', permission: 'Finance.CashAccounts:View' },
          { key: '/finance/cash-transactions', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Kasa Hareketleri', permission: 'Finance.CashTransactions:View' },
        ],
      },
      {
        key: 'finance-payments',
        icon: <CreditCardIcon className="w-4 h-4" />,
        label: 'Ödeme & Tahsilat',
        permission: 'Finance.Payments:View',
        children: [
          { key: '/finance/payments', icon: <CreditCardIcon className="w-4 h-4" />, label: 'Ödemeler', permission: 'Finance.Payments:View' },
          { key: '/finance/collections', icon: <ReceiptRefundIcon className="w-4 h-4" />, label: 'Tahsilatlar', permission: 'Finance.Collections:View' },
          { key: '/finance/payment-plans', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Ödeme Planları', permission: 'Finance.PaymentPlans:View' },
        ],
      },
      {
        key: 'finance-instruments',
        icon: <DocumentCheckIcon className="w-4 h-4" />,
        label: 'Ticari Belgeler',
        permission: 'Finance.Instruments:View',
        children: [
          { key: '/finance/checks', icon: <DocumentCheckIcon className="w-4 h-4" />, label: 'Çekler', permission: 'Finance.Checks:View' },
          { key: '/finance/promissory-notes', icon: <DocumentIcon className="w-4 h-4" />, label: 'Senetler', permission: 'Finance.PromissoryNotes:View' },
        ],
      },
      {
        key: 'finance-expenses',
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
        label: 'Giderler',
        permission: 'Finance.Expenses:View',
        children: [
          { key: '/finance/expenses', icon: <ReceiptPercentIcon className="w-4 h-4" />, label: 'Gider Kayıtları', permission: 'Finance.Expenses:View' },
          { key: '/finance/expense-categories', icon: <TagIcon className="w-4 h-4" />, label: 'Gider Kategorileri', permission: 'Finance.ExpenseCategories:View' },
          { key: '/finance/cost-centers', icon: <ViewColumnsIcon className="w-4 h-4" />, label: 'Maliyet Merkezleri', permission: 'Finance.CostCenters:View' },
        ],
      },
      {
        key: 'finance-forex',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Döviz',
        permission: 'Finance.Forex:View',
        children: [
          { key: '/finance/currencies', icon: <CurrencyDollarIcon className="w-4 h-4" />, label: 'Para Birimleri', permission: 'Finance.Currencies:View' },
          { key: '/finance/exchange-rates', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Döviz Kurları', permission: 'Finance.ExchangeRates:View' },
        ],
      },
      {
        key: 'finance-assets',
        icon: <BuildingOfficeIcon className="w-4 h-4" />,
        label: 'Duran Varlıklar',
        permission: 'Finance.Assets:View',
        children: [
          { key: '/finance/fixed-assets', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'Duran Varlıklar', permission: 'Finance.FixedAssets:View' },
          { key: '/finance/depreciation', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Amortisman', permission: 'Finance.Depreciation:View' },
        ],
      },
      {
        key: 'finance-budgeting',
        icon: <CalculatorIcon className="w-4 h-4" />,
        label: 'Bütçe',
        permission: 'Finance.Budgeting:View',
        children: [
          { key: '/finance/budgets', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Bütçeler', permission: 'Finance.Budgets:View' },
          { key: '/finance/budget-items', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Bütçe Kalemleri', permission: 'Finance.BudgetItems:View' },
        ],
      },
      {
        key: 'finance-accounting',
        icon: <BookOpenIcon className="w-4 h-4" />,
        label: 'Muhasebe',
        permission: 'Finance.Accounting:View',
        children: [
          { key: '/finance/chart-of-accounts', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Hesap Planı', permission: 'Finance.ChartOfAccounts:View' },
          { key: '/finance/journal-entries', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Yevmiye Fişleri', permission: 'Finance.JournalEntries:View' },
          { key: '/finance/accounting-periods', icon: <CalendarIcon className="w-4 h-4" />, label: 'Hesap Dönemleri', permission: 'Finance.AccountingPeriods:View' },
        ],
      },
      {
        key: 'finance-taxes',
        icon: <ReceiptPercentIcon className="w-4 h-4" />,
        label: 'Vergiler',
        permission: 'Finance.Taxes:View',
        children: [
          { key: '/finance/tax-rates', icon: <ReceiptPercentIcon className="w-4 h-4" />, label: 'Vergi Oranları', permission: 'Finance.TaxRates:View' },
          { key: '/finance/withholding-taxes', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Stopajlar', permission: 'Finance.WithholdingTaxes:View' },
        ],
      },
      {
        key: 'finance-tax-compliance',
        icon: <ShieldCheckIcon className="w-4 h-4" />,
        label: 'Vergi İşlemleri (GİB)',
        permission: 'Finance.TaxCompliance:View',
        children: [
          { key: '/finance/tax/ba-bs', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Ba-Bs Formu', permission: 'Finance.BaBs:View' },
          { key: '/finance/tax/declarations', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Vergi Beyannameleri', permission: 'Finance.TaxDeclarations:View' },
          { key: '/finance/tax/muhtasar', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'Muhtasar Beyanname', permission: 'Finance.Muhtasar:View' },
          { key: '/finance/tax/provisional', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Geçici Vergi', permission: 'Finance.ProvisionalTax:View' },
          { key: '/finance/tax/calendar', icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Vergi Takvimi', permission: 'Finance.TaxCalendar:View' },
          { key: '/finance/inflation-accounting', icon: <ArrowTrendingUpIcon className="w-4 h-4" />, label: 'Enflasyon Muhasebesi', permission: 'Finance.InflationAccounting:View' },
        ],
      },
      {
        key: 'finance-einvoice',
        icon: <DocumentDuplicateIcon className="w-4 h-4" />,
        label: 'e-Belge (GİB)',
        permission: 'Finance.EInvoice:View',
        children: [
          { key: '/finance/e-invoice', icon: <DocumentDuplicateIcon className="w-4 h-4" />, label: 'e-Fatura', permission: 'Finance.EInvoice:View' },
          { key: '/finance/e-invoice/waybill', icon: <DocumentTextIcon className="w-4 h-4" />, label: 'e-İrsaliye', permission: 'Finance.EWaybill:View' },
          { key: '/finance/e-ledger', icon: <BookOpenIcon className="w-4 h-4" />, label: 'e-Defter', permission: 'Finance.ELedger:View' },
          { key: '/finance/e-invoice/settings', icon: <Cog6ToothIcon className="w-4 h-4" />, label: 'GİB Ayarları', permission: 'Finance.EInvoiceSettings:View' },
        ],
      },
      {
        key: 'finance-reports',
        icon: <ChartBarIcon className="w-4 h-4" />,
        label: 'Raporlar',
        permission: 'Finance.Reports:View',
        children: [
          { key: '/finance/reports', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Finansal Raporlar', permission: 'Finance.Reports:View' },
          { key: '/finance/aging-reports', icon: <ClockIcon className="w-4 h-4" />, label: 'Yaşlandırma Raporları', permission: 'Finance.AgingReports:View' },
          { key: '/finance/cash-flow', icon: <PresentationChartLineIcon className="w-4 h-4" />, label: 'Nakit Akışı', permission: 'Finance.CashFlow:View' },
          { key: '/finance/reports/vat', icon: <CalculatorIcon className="w-4 h-4" />, label: 'KDV Raporu', permission: 'Finance.VatReport:View' },
          { key: '/finance/reports/withholding', icon: <ScaleIcon className="w-4 h-4" />, label: 'Stopaj Raporu', permission: 'Finance.WithholdingReport:View' },
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
      { key: '/manufacturing', icon: <ChartBarSquareIcon className="w-4 h-4" />, label: 'Dashboard', permission: 'Manufacturing:View' },
      {
        key: 'mfg-planning',
        icon: <CalendarIcon className="w-4 h-4" />,
        label: 'Planlama',
        permission: 'Manufacturing.Planning:View',
        children: [
          { key: '/manufacturing/master-production-schedules', icon: <CalendarIcon className="w-4 h-4" />, label: 'Ana Üretim Planları (MPS)', permission: 'Manufacturing.MasterProductionSchedules:View' },
          { key: '/manufacturing/mrp-plans', icon: <CalculatorIcon className="w-4 h-4" />, label: 'MRP Planları', permission: 'Manufacturing.MrpPlans:View' },
          { key: '/manufacturing/capacity-plans', icon: <ChartBarIcon className="w-4 h-4" />, label: 'Kapasite Planları', permission: 'Manufacturing.CapacityPlans:View' },
          { key: '/manufacturing/material-reservations', icon: <LockClosedIcon className="w-4 h-4" />, label: 'Malzeme Rezervasyonları', permission: 'Manufacturing.MaterialReservations:View' },
        ],
      },
      {
        key: 'mfg-orders',
        icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
        label: 'Üretim Emirleri',
        permission: 'Manufacturing.Orders:View',
        children: [
          { key: '/manufacturing/production-orders', icon: <ClipboardDocumentListIcon className="w-4 h-4" />, label: 'Üretim Emirleri', permission: 'Manufacturing.ProductionOrders:View' },
          { key: '/manufacturing/subcontract-orders', icon: <BuildingStorefrontIcon className="w-4 h-4" />, label: 'Fason Siparişler', permission: 'Manufacturing.SubcontractOrders:View' },
        ],
      },
      {
        key: 'mfg-bom',
        icon: <CircleStackIcon className="w-4 h-4" />,
        label: 'Ürün Yapısı',
        permission: 'Manufacturing.Bom:View',
        children: [
          { key: '/manufacturing/bom', icon: <CircleStackIcon className="w-4 h-4" />, label: 'Ürün Ağaçları (BOM)', permission: 'Manufacturing.Bom:View' },
          { key: '/manufacturing/routings', icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Rotalar', permission: 'Manufacturing.Routings:View' },
        ],
      },
      {
        key: 'mfg-resources',
        icon: <CpuChipIcon className="w-4 h-4" />,
        label: 'Kaynaklar',
        permission: 'Manufacturing.Resources:View',
        children: [
          { key: '/manufacturing/work-centers', icon: <BuildingOfficeIcon className="w-4 h-4" />, label: 'İş Merkezleri', permission: 'Manufacturing.WorkCenters:View' },
        ],
      },
      {
        key: 'mfg-quality',
        icon: <BeakerIcon className="w-4 h-4" />,
        label: 'Kalite',
        permission: 'Manufacturing.Quality:View',
        children: [
          { key: '/manufacturing/quality-inspections', icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />, label: 'Kalite Kontrolleri', permission: 'Manufacturing.QualityInspections:View' },
          { key: '/manufacturing/quality-management', icon: <ShieldCheckIcon className="w-4 h-4" />, label: 'Kalite Yönetimi', permission: 'Manufacturing.QualityManagement:View' },
          { key: '/manufacturing/quality-management/ncr', icon: <ExclamationTriangleIcon className="w-4 h-4" />, label: 'NCR (Uygunsuzluklar)', permission: 'Manufacturing.Ncr:View' },
          { key: '/manufacturing/quality-management/capa', icon: <ShieldExclamationIcon className="w-4 h-4" />, label: 'CAPA (Düzeltici Aksiyonlar)', permission: 'Manufacturing.Capa:View' },
        ],
      },
      {
        key: 'mfg-maintenance',
        icon: <WrenchIcon className="w-4 h-4" />,
        label: 'Bakım',
        permission: 'Manufacturing.Maintenance:View',
        children: [
          { key: '/manufacturing/maintenance', icon: <WrenchScrewdriverIcon className="w-4 h-4" />, label: 'Bakım Yönetimi', permission: 'Manufacturing.Maintenance:View' },
        ],
      },
      {
        key: 'mfg-costing',
        icon: <CurrencyDollarIcon className="w-4 h-4" />,
        label: 'Maliyet',
        permission: 'Manufacturing.Costing:View',
        children: [
          { key: '/manufacturing/cost-accounting', icon: <CalculatorIcon className="w-4 h-4" />, label: 'Maliyet Muhasebesi', permission: 'Manufacturing.CostAccounting:View' },
        ],
      },
      {
        key: 'mfg-kpi',
        icon: <PresentationChartLineIcon className="w-4 h-4" />,
        label: 'KPI & Raporlar',
        permission: 'Manufacturing.Kpi:View',
        children: [
          { key: '/manufacturing/kpi-dashboard', icon: <ChartBarIcon className="w-4 h-4" />, label: 'KPI Dashboard', permission: 'Manufacturing.KpiDashboard:View' },
          { key: '/manufacturing/kpi-dashboard/definitions', icon: <ListBulletIcon className="w-4 h-4" />, label: 'KPI Tanımları', permission: 'Manufacturing.KpiDefinitions:View' },
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
  if (pathname.startsWith('/notifications') || pathname.startsWith('/reminders') || pathname.startsWith('/chat')) return 'communication';
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
