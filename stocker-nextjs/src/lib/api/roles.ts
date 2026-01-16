/**
 * Role Management API Service
 * Handles CRUD operations for dynamic role management
 */

import { apiClient } from './client';

import logger from '../utils/logger';
export interface Permission {
  resource: string;
  permissionType: number;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // Format: "resource:permissionType"
  userCount: number;
  isSystemRole: boolean;
  createdDate: string; // DateTime from backend
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

export enum PermissionType {
  View = 0,
  Create = 1,
  Edit = 2,
  Delete = 3,
  Export = 4,
  Import = 5,
  Approve = 6,
  Execute = 7,
}

export const PERMISSION_TYPE_LABELS: Record<PermissionType, string> = {
  [PermissionType.View]: 'Görüntüleme',
  [PermissionType.Create]: 'Oluşturma',
  [PermissionType.Edit]: 'Düzenleme',
  [PermissionType.Delete]: 'Silme',
  [PermissionType.Export]: 'Dışa Aktarma',
  [PermissionType.Import]: 'İçe Aktarma',
  [PermissionType.Approve]: 'Onaylama',
  [PermissionType.Execute]: 'Yürütme',
};

// Resource definition with module mapping
export interface ResourceDefinition {
  value: string;
  label: string;
  moduleCode?: string; // If null, it's a core/system resource available to all
  icon?: string;
}

// Module-based resource categories
export interface ModuleResourceCategory {
  moduleCode: string;
  moduleName: string;
  icon: string;
  color: string;
  resources: ResourceDefinition[];
}

// Core/System resources - available to all tenants (Settings module)
export const CORE_RESOURCES: ResourceDefinition[] = [
  { value: 'Settings', label: 'Genel Ayarlar', icon: '⚙️' },
  { value: 'Settings.Users', label: 'Kullanıcılar', icon: '👥' },
  { value: 'Settings.Roles', label: 'Roller', icon: '🔐' },
  { value: 'Settings.Departments', label: 'Departmanlar', icon: '🏢' },
  { value: 'Settings.Security', label: 'Güvenlik Ayarları', icon: '🛡️' },
  { value: 'Settings.AuditLogs', label: 'Denetim Kayıtları', icon: '📋' },
  { value: 'Settings.Backup', label: 'Yedekleme', icon: '💾' },
  { value: 'Settings.DataMigration', label: 'Veri Aktarımı', icon: '🔄' },
];

// Module-specific resources - matching module-menus.tsx permission definitions
export const MODULE_RESOURCES: ModuleResourceCategory[] = [
  {
    moduleCode: 'INVENTORY',
    moduleName: 'Stok Yönetimi',
    icon: '📦',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    resources: [
      { value: 'Inventory', label: 'Dashboard', moduleCode: 'INVENTORY' },
      // Ürün Yönetimi
      { value: 'Inventory.Products', label: 'Ürünler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Categories', label: 'Kategoriler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Brands', label: 'Markalar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.ProductVariants', label: 'Varyantlar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.ProductBundles', label: 'Paketler', moduleCode: 'INVENTORY' },
      // Stok İşlemleri
      { value: 'Inventory.Stock', label: 'Stok Görünümü', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Warehouses', label: 'Depolar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockMovements', label: 'Hareketler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockTransfers', label: 'Transferler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockAdjustments', label: 'Düzeltmeler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockCounts', label: 'Sayımlar', moduleCode: 'INVENTORY' },
      // İzleme
      { value: 'Inventory.SerialNumbers', label: 'Seri Numaraları', moduleCode: 'INVENTORY' },
      { value: 'Inventory.LotBatches', label: 'Lot/Parti', moduleCode: 'INVENTORY' },
      { value: 'Inventory.ShelfLife', label: 'Raf Ömrü', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockReservations', label: 'Rezervasyonlar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.StockAlerts', label: 'Uyarılar', moduleCode: 'INVENTORY' },
      // Kalite
      { value: 'Inventory.QualityControl', label: 'Kalite Kontrol', moduleCode: 'INVENTORY' },
      { value: 'Inventory.CycleCounts', label: 'Dönemsel Sayımlar', moduleCode: 'INVENTORY' },
      // Raporlar
      { value: 'Inventory.Reports', label: 'Raporlar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Analytics', label: 'Analizler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Analysis', label: 'ABC/XYZ Analizi', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Forecasting', label: 'Tahminleme', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Costing', label: 'Maliyetlendirme', moduleCode: 'INVENTORY' },
      { value: 'Inventory.AuditTrail', label: 'Denetim İzi', moduleCode: 'INVENTORY' },
      // Ayarlar
      { value: 'Inventory.Units', label: 'Birimler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Suppliers', label: 'Tedarikçiler', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Locations', label: 'Lokasyonlar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.WarehouseZones', label: 'Depo Bölgeleri', moduleCode: 'INVENTORY' },
      { value: 'Inventory.PriceLists', label: 'Fiyat Listeleri', moduleCode: 'INVENTORY' },
      { value: 'Inventory.Barcodes', label: 'Barkodlar', moduleCode: 'INVENTORY' },
      { value: 'Inventory.BarcodeDefinitions', label: 'Barkod Tanımları', moduleCode: 'INVENTORY' },
      { value: 'Inventory.PackagingTypes', label: 'Ambalaj Tipleri', moduleCode: 'INVENTORY' },
      { value: 'Inventory.ReorderRules', label: 'Sipariş Kuralları', moduleCode: 'INVENTORY' },
      { value: 'Inventory.ProductAttributes', label: 'Özellikler', moduleCode: 'INVENTORY' },
    ],
  },
  {
    moduleCode: 'SALES',
    moduleName: 'Satış Yönetimi',
    icon: '💰',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    resources: [
      { value: 'Sales', label: 'Dashboard', moduleCode: 'SALES' },
      // Satış Süreçleri
      { value: 'Sales.Quotations', label: 'Satış Teklifleri', moduleCode: 'SALES' },
      { value: 'Sales.Orders', label: 'Siparişler', moduleCode: 'SALES' },
      { value: 'Sales.Invoices', label: 'Faturalar', moduleCode: 'SALES' },
      { value: 'Sales.EInvoices', label: 'E-Fatura', moduleCode: 'SALES' },
      { value: 'Sales.Shipments', label: 'Sevkiyatlar', moduleCode: 'SALES' },
      { value: 'Sales.Returns', label: 'İadeler', moduleCode: 'SALES' },
      // Finans
      { value: 'Sales.Payments', label: 'Ödemeler', moduleCode: 'SALES' },
      { value: 'Sales.Customers', label: 'Bakiyeler', moduleCode: 'SALES' },
      { value: 'Sales.Commissions', label: 'Komisyonlar', moduleCode: 'SALES' },
      // Sözleşmeler
      { value: 'Sales.Contracts', label: 'Müşteri Sözleşmeleri', moduleCode: 'SALES' },
      // Bölgeler
      { value: 'Sales.Territories', label: 'Bölgeler', moduleCode: 'SALES' },
      // Pazarlama
      { value: 'Sales.Discounts', label: 'İndirimler', moduleCode: 'SALES' },
      { value: 'Sales.Segments', label: 'Müşteri Segmentleri', moduleCode: 'SALES' },
      { value: 'Sales.Pricelists', label: 'Fiyat Listeleri', moduleCode: 'SALES' },
      // Performans
      { value: 'Sales.Targets', label: 'Satış Hedefleri', moduleCode: 'SALES' },
      // Lojistik
      { value: 'Sales.Reservations', label: 'Stok Rezervasyonları', moduleCode: 'SALES' },
      { value: 'Sales.Backorders', label: 'Bekleyen Siparişler', moduleCode: 'SALES' },
      { value: 'Sales.DeliveryNotes', label: 'İrsaliyeler', moduleCode: 'SALES' },
      // Finansal
      { value: 'Sales.AdvancePayments', label: 'Avans Ödemeler', moduleCode: 'SALES' },
      { value: 'Sales.CreditNotes', label: 'Alacak Dekontları', moduleCode: 'SALES' },
      // Satış Sonrası
      { value: 'Sales.Service', label: 'Servis Talepleri', moduleCode: 'SALES' },
      { value: 'Sales.Warranty', label: 'Garanti Sorgulama', moduleCode: 'SALES' },
      // Türkiye Mevzuatı
      { value: 'Sales.Withholding', label: 'Tevkifat Yönetimi', moduleCode: 'SALES' },
      { value: 'Sales.VatRates', label: 'KDV Oranları', moduleCode: 'SALES' },
      { value: 'Sales.EArchive', label: 'E-Arşiv Fatura', moduleCode: 'SALES' },
      { value: 'Sales.GibSettings', label: 'GİB Ayarları', moduleCode: 'SALES' },
    ],
  },
  {
    moduleCode: 'PURCHASE',
    moduleName: 'Satınalma Yönetimi',
    icon: '🛒',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    resources: [
      { value: 'Purchase', label: 'Dashboard', moduleCode: 'PURCHASE' },
      // Tedarikçiler
      { value: 'Purchase.Suppliers', label: 'Tedarikçiler', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Evaluations', label: 'Değerlendirmeler', moduleCode: 'PURCHASE' },
      // Talepler
      { value: 'Purchase.Requests', label: 'Satın Alma Talepleri', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Quotations', label: 'Teklif Talepleri (RFQ)', moduleCode: 'PURCHASE' },
      // Siparişler
      { value: 'Purchase.Orders', label: 'Satın Alma Siparişleri', moduleCode: 'PURCHASE' },
      { value: 'Purchase.GoodsReceipts', label: 'Mal Alım Belgeleri', moduleCode: 'PURCHASE' },
      // Finans
      { value: 'Purchase.Invoices', label: 'Faturalar', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Payments', label: 'Ödemeler', moduleCode: 'PURCHASE' },
      { value: 'Purchase.Budgets', label: 'Bütçeler', moduleCode: 'PURCHASE' },
      // Fiyatlama
      { value: 'Purchase.PriceLists', label: 'Fiyat Listeleri', moduleCode: 'PURCHASE' },
      // İadeler
      { value: 'Purchase.Returns', label: 'İade Belgeleri', moduleCode: 'PURCHASE' },
      // Raporlar
      { value: 'Purchase.Reports', label: 'Raporlar', moduleCode: 'PURCHASE' },
    ],
  },
  {
    moduleCode: 'CRM',
    moduleName: 'Müşteri İlişkileri',
    icon: '💼',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    resources: [
      { value: 'CRM', label: 'Dashboard', moduleCode: 'CRM' },
      // Müşteriler
      { value: 'CRM.Customers', label: 'Müşteriler', moduleCode: 'CRM' },
      { value: 'CRM.Leads', label: 'Potansiyeller', moduleCode: 'CRM' },
      { value: 'CRM.Segments', label: 'Segmentler', moduleCode: 'CRM' },
      { value: 'CRM.Referrals', label: 'Referanslar', moduleCode: 'CRM' },
      // Satış
      { value: 'CRM.Opportunities', label: 'Fırsatlar', moduleCode: 'CRM' },
      { value: 'CRM.Deals', label: 'Anlaşmalar', moduleCode: 'CRM' },
      { value: 'CRM.Pipelines', label: 'Pipeline', moduleCode: 'CRM' },
      { value: 'CRM.SalesTeams', label: 'Satış Ekipleri', moduleCode: 'CRM' },
      { value: 'CRM.Territories', label: 'Bölgeler', moduleCode: 'CRM' },
      { value: 'CRM.Competitors', label: 'Rakipler', moduleCode: 'CRM' },
      // Aktiviteler
      { value: 'CRM.Activities', label: 'Aktiviteler', moduleCode: 'CRM' },
      { value: 'CRM.Meetings', label: 'Toplantılar', moduleCode: 'CRM' },
      { value: 'CRM.CallLogs', label: 'Arama Kayıtları', moduleCode: 'CRM' },
      { value: 'CRM.Campaigns', label: 'Kampanyalar', moduleCode: 'CRM' },
      // Sadakat
      { value: 'CRM.LoyaltyPrograms', label: 'Sadakat Programları', moduleCode: 'CRM' },
      // Araçlar
      { value: 'CRM.Documents', label: 'Dökümanlar', moduleCode: 'CRM' },
      { value: 'CRM.Workflows', label: 'Workflows', moduleCode: 'CRM' },
    ],
  },
  {
    moduleCode: 'HR',
    moduleName: 'İnsan Kaynakları',
    icon: '👔',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    resources: [
      { value: 'HR', label: 'Dashboard', moduleCode: 'HR' },
      // Çalışanlar
      { value: 'HR.Employees', label: 'Çalışanlar', moduleCode: 'HR' },
      { value: 'HR.Departments', label: 'Departmanlar', moduleCode: 'HR' },
      { value: 'HR.Positions', label: 'Pozisyonlar', moduleCode: 'HR' },
      { value: 'HR.EmployeeSkills', label: 'Yetkinlikler', moduleCode: 'HR' },
      { value: 'HR.EmployeeAssets', label: 'Zimmetler', moduleCode: 'HR' },
      { value: 'HR.EmployeeBenefits', label: 'Yan Haklar', moduleCode: 'HR' },
      // Zaman ve Devam
      { value: 'HR.Attendance', label: 'Devam Takibi', moduleCode: 'HR' },
      { value: 'HR.Leaves', label: 'İzinler', moduleCode: 'HR' },
      { value: 'HR.LeaveTypes', label: 'İzin Türleri', moduleCode: 'HR' },
      { value: 'HR.LeaveAccrual', label: 'İzin Hak Ediş Hesabı', moduleCode: 'HR' },
      { value: 'HR.Holidays', label: 'Tatil Günleri', moduleCode: 'HR' },
      { value: 'HR.TimeSheets', label: 'Puantaj', moduleCode: 'HR' },
      // Bordro
      { value: 'HR.Payroll', label: 'Bordro', moduleCode: 'HR' },
      { value: 'HR.Payslips', label: 'Bordro Makbuzları', moduleCode: 'HR' },
      { value: 'HR.Expenses', label: 'Masraflar', moduleCode: 'HR' },
      { value: 'HR.SeveranceCalculator', label: 'Tazminat Hesaplama', moduleCode: 'HR' },
      // SGK
      { value: 'HR.SgkDeclarations', label: 'SGK Bildirgeleri', moduleCode: 'HR' },
      // Performans
      { value: 'HR.Performance', label: 'Değerlendirmeler', moduleCode: 'HR' },
      { value: 'HR.Goals', label: 'Hedefler', moduleCode: 'HR' },
      { value: 'HR.CareerPaths', label: 'Kariyer Yolları', moduleCode: 'HR' },
      { value: 'HR.SuccessionPlans', label: 'Yedekleme Planları', moduleCode: 'HR' },
      // Eğitim
      { value: 'HR.Trainings', label: 'Eğitimler', moduleCode: 'HR' },
      { value: 'HR.Certifications', label: 'Sertifikalar', moduleCode: 'HR' },
      // İşe Alım
      { value: 'HR.JobPostings', label: 'İş İlanları', moduleCode: 'HR' },
      { value: 'HR.JobApplications', label: 'Başvurular', moduleCode: 'HR' },
      { value: 'HR.Interviews', label: 'Mülakatlar', moduleCode: 'HR' },
      { value: 'HR.Onboardings', label: 'İşe Alışım', moduleCode: 'HR' },
      // Fazla Mesai
      { value: 'HR.Overtimes', label: 'Fazla Mesailer', moduleCode: 'HR' },
      // Çalışan İlişkileri
      { value: 'HR.Grievances', label: 'Şikayetler', moduleCode: 'HR' },
      { value: 'HR.DisciplinaryActions', label: 'Disiplin İşlemleri', moduleCode: 'HR' },
      // Araçlar
      { value: 'HR.Documents', label: 'Belgeler', moduleCode: 'HR' },
      { value: 'HR.Announcements', label: 'Duyurular', moduleCode: 'HR' },
      { value: 'HR.Shifts', label: 'Vardiyalar', moduleCode: 'HR' },
      { value: 'HR.WorkSchedules', label: 'Çalışma Programları', moduleCode: 'HR' },
      { value: 'HR.WorkLocations', label: 'Lokasyonlar', moduleCode: 'HR' },
      // Türkiye Mevzuatı
      { value: 'HR.MinimumWage', label: 'Asgari Ücret Yönetimi', moduleCode: 'HR' },
      { value: 'HR.TaxRates', label: 'Vergi Oranları', moduleCode: 'HR' },
    ],
  },
  {
    moduleCode: 'FINANCE',
    moduleName: 'Finans Yönetimi',
    icon: '💳',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    resources: [
      { value: 'Finance', label: 'Dashboard', moduleCode: 'FINANCE' },
      // Faturalar
      { value: 'Finance.Invoices', label: 'Tüm Faturalar', moduleCode: 'FINANCE' },
      { value: 'Finance.SalesInvoices', label: 'Satış Faturaları', moduleCode: 'FINANCE' },
      { value: 'Finance.PurchaseInvoices', label: 'Alış Faturaları', moduleCode: 'FINANCE' },
      // Cari Hesaplar
      { value: 'Finance.CurrentAccounts', label: 'Cari Hesaplar', moduleCode: 'FINANCE' },
      { value: 'Finance.CurrentAccountTransactions', label: 'Cari Hareketler', moduleCode: 'FINANCE' },
      // Bankacılık
      { value: 'Finance.BankAccounts', label: 'Banka Hesapları', moduleCode: 'FINANCE' },
      { value: 'Finance.BankTransactions', label: 'Banka Hareketleri', moduleCode: 'FINANCE' },
      { value: 'Finance.CashAccounts', label: 'Kasa Hesapları', moduleCode: 'FINANCE' },
      { value: 'Finance.CashTransactions', label: 'Kasa Hareketleri', moduleCode: 'FINANCE' },
      // Ödemeler
      { value: 'Finance.Payments', label: 'Ödemeler', moduleCode: 'FINANCE' },
      { value: 'Finance.Collections', label: 'Tahsilatlar', moduleCode: 'FINANCE' },
      { value: 'Finance.PaymentPlans', label: 'Ödeme Planları', moduleCode: 'FINANCE' },
      // Araçlar
      { value: 'Finance.Checks', label: 'Çekler', moduleCode: 'FINANCE' },
      { value: 'Finance.PromissoryNotes', label: 'Senetler', moduleCode: 'FINANCE' },
      // Giderler
      { value: 'Finance.Expenses', label: 'Gider Kayıtları', moduleCode: 'FINANCE' },
      { value: 'Finance.ExpenseCategories', label: 'Gider Kategorileri', moduleCode: 'FINANCE' },
      { value: 'Finance.CostCenters', label: 'Maliyet Merkezleri', moduleCode: 'FINANCE' },
      // Döviz
      { value: 'Finance.Currencies', label: 'Para Birimleri', moduleCode: 'FINANCE' },
      { value: 'Finance.ExchangeRates', label: 'Döviz Kurları', moduleCode: 'FINANCE' },
      // Varlıklar
      { value: 'Finance.FixedAssets', label: 'Duran Varlıklar', moduleCode: 'FINANCE' },
      { value: 'Finance.Depreciation', label: 'Amortisman', moduleCode: 'FINANCE' },
      // Bütçeleme
      { value: 'Finance.Budgets', label: 'Bütçeler', moduleCode: 'FINANCE' },
      { value: 'Finance.BudgetItems', label: 'Bütçe Kalemleri', moduleCode: 'FINANCE' },
      // Muhasebe
      { value: 'Finance.ChartOfAccounts', label: 'Hesap Planı', moduleCode: 'FINANCE' },
      { value: 'Finance.JournalEntries', label: 'Yevmiye Fişleri', moduleCode: 'FINANCE' },
      { value: 'Finance.AccountingPeriods', label: 'Hesap Dönemleri', moduleCode: 'FINANCE' },
      // Vergiler
      { value: 'Finance.TaxRates', label: 'Vergi Oranları', moduleCode: 'FINANCE' },
      { value: 'Finance.WithholdingTaxes', label: 'Stopajlar', moduleCode: 'FINANCE' },
      // Vergi Uyumu
      { value: 'Finance.BaBs', label: 'Ba-Bs Formu', moduleCode: 'FINANCE' },
      { value: 'Finance.TaxDeclarations', label: 'Vergi Beyannameleri', moduleCode: 'FINANCE' },
      { value: 'Finance.Muhtasar', label: 'Muhtasar Beyanname', moduleCode: 'FINANCE' },
      { value: 'Finance.ProvisionalTax', label: 'Geçici Vergi', moduleCode: 'FINANCE' },
      { value: 'Finance.TaxCalendar', label: 'Vergi Takvimi', moduleCode: 'FINANCE' },
      { value: 'Finance.InflationAccounting', label: 'Enflasyon Muhasebesi', moduleCode: 'FINANCE' },
      // E-Belge
      { value: 'Finance.EInvoice', label: 'e-Fatura', moduleCode: 'FINANCE' },
      { value: 'Finance.EWaybill', label: 'e-İrsaliye', moduleCode: 'FINANCE' },
      { value: 'Finance.ELedger', label: 'e-Defter', moduleCode: 'FINANCE' },
      { value: 'Finance.EInvoiceSettings', label: 'GİB Ayarları', moduleCode: 'FINANCE' },
      // Raporlar
      { value: 'Finance.Reports', label: 'Finansal Raporlar', moduleCode: 'FINANCE' },
      { value: 'Finance.AgingReports', label: 'Yaşlandırma Raporları', moduleCode: 'FINANCE' },
      { value: 'Finance.CashFlow', label: 'Nakit Akışı', moduleCode: 'FINANCE' },
      { value: 'Finance.VatReport', label: 'KDV Raporu', moduleCode: 'FINANCE' },
      { value: 'Finance.WithholdingReport', label: 'Stopaj Raporu', moduleCode: 'FINANCE' },
    ],
  },
  {
    moduleCode: 'MANUFACTURING',
    moduleName: 'Üretim Yönetimi',
    icon: '🏭',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    resources: [
      { value: 'Manufacturing', label: 'Dashboard', moduleCode: 'MANUFACTURING' },
      // Planlama
      { value: 'Manufacturing.MasterProductionSchedules', label: 'Ana Üretim Planları (MPS)', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.MrpPlans', label: 'MRP Planları', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.CapacityPlans', label: 'Kapasite Planları', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.MaterialReservations', label: 'Malzeme Rezervasyonları', moduleCode: 'MANUFACTURING' },
      // Emirler
      { value: 'Manufacturing.ProductionOrders', label: 'Üretim Emirleri', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.SubcontractOrders', label: 'Fason Siparişler', moduleCode: 'MANUFACTURING' },
      // Ürün Ağaçları
      { value: 'Manufacturing.Bom', label: 'Ürün Ağaçları (BOM)', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.Routings', label: 'Rotalar', moduleCode: 'MANUFACTURING' },
      // Kaynaklar
      { value: 'Manufacturing.WorkCenters', label: 'İş Merkezleri', moduleCode: 'MANUFACTURING' },
      // Kalite
      { value: 'Manufacturing.QualityInspections', label: 'Kalite Kontrolleri', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.QualityManagement', label: 'Kalite Yönetimi', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.Ncr', label: 'NCR (Uygunsuzluklar)', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.Capa', label: 'CAPA (Düzeltici Aksiyonlar)', moduleCode: 'MANUFACTURING' },
      // Bakım
      { value: 'Manufacturing.Maintenance', label: 'Bakım Yönetimi', moduleCode: 'MANUFACTURING' },
      // Maliyet
      { value: 'Manufacturing.CostAccounting', label: 'Maliyet Muhasebesi', moduleCode: 'MANUFACTURING' },
      // KPI
      { value: 'Manufacturing.KpiDashboard', label: 'KPI Dashboard', moduleCode: 'MANUFACTURING' },
      { value: 'Manufacturing.KpiDefinitions', label: 'KPI Tanımları', moduleCode: 'MANUFACTURING' },
    ],
  },
];

// Legacy flat list for backward compatibility
export const AVAILABLE_RESOURCES: ResourceDefinition[] = [
  ...CORE_RESOURCES,
  ...MODULE_RESOURCES.flatMap(m => m.resources),
];

/**
 * Get resources available to a tenant based on their active modules
 */
export function getAvailableResourcesForModules(activeModuleCodes: string[]): {
  coreResources: ResourceDefinition[];
  moduleResources: ModuleResourceCategory[];
} {
  const normalizedCodes = activeModuleCodes.map(c => c.toUpperCase());

  return {
    coreResources: CORE_RESOURCES,
    moduleResources: MODULE_RESOURCES.filter(m =>
      normalizedCodes.includes(m.moduleCode.toUpperCase())
    ),
  };
}

/**
 * Get all roles for current tenant
 */
export async function getRoles(): Promise<Role[]> {
  const response = await apiClient.get<{ success: boolean; data: Role[]; message: string }>(
    '/api/tenant/roles'
  );
  // apiClient returns the backend response directly: { success, data: Role[], message }
  return (response as any).data || [];
}

/**
 * Get a single role by ID
 */
export async function getRole(roleId: string): Promise<Role> {
  const response = await apiClient.get<{ success: boolean; data: Role; message: string }>(
    `/api/tenant/roles/${roleId}`
  );
  return (response as any).data as Role;
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  // Convert Permission[] to DTO format expected by backend
  const requestData = {
    name: data.name,
    description: data.description,
    permissions: data.permissions.map((p) => ({
      resource: p.resource,
      permissionType: p.permissionType,
    })),
  };

  const response = await apiClient.post<{ success: boolean; data: Role; message: string }>(
    '/api/tenant/roles',
    requestData
  );
  return (response as any).data as Role;
}

/**
 * Update an existing role
 */
export async function updateRole(roleId: string, data: UpdateRoleRequest): Promise<void> {
  // Convert Permission[] to DTO format expected by backend
  const requestData = {
    name: data.name,
    description: data.description,
    permissions: data.permissions.map((p) => ({
      resource: p.resource,
      permissionType: p.permissionType,
    })),
  };

  await apiClient.put(`/api/tenant/roles/${roleId}`, requestData);
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(`/api/tenant/roles/${roleId}`);
}

/**
 * Parse permission string to Permission object
 * Format: "resource:permissionType" -> { resource, permissionType }
 * Handles both numeric (e.g., "Users:1") and string enum names (e.g., "Users:Create")
 */
export function parsePermission(permissionStr: string): Permission {
  const [resource, permissionTypeStr] = permissionStr.split(':');

  // Try to parse as number first
  const numericType = parseInt(permissionTypeStr, 10);

  // If it's a valid number, use it directly
  if (!isNaN(numericType)) {
    return {
      resource,
      permissionType: numericType,
    };
  }

  // Otherwise, it's a string enum name - convert to numeric value
  // Map string enum names to their numeric values
  const permissionTypeMap: Record<string, PermissionType> = {
    'View': PermissionType.View,
    'Create': PermissionType.Create,
    'Edit': PermissionType.Edit,
    'Delete': PermissionType.Delete,
    'Export': PermissionType.Export,
    'Import': PermissionType.Import,
    'Approve': PermissionType.Approve,
    'Execute': PermissionType.Execute,
  };

  const permissionType = permissionTypeMap[permissionTypeStr];

  if (permissionType === undefined) {
    logger.warn(`Unknown permission type: ${permissionTypeStr}`);
    return {
      resource,
      permissionType: 0, // Default to View
    };
  }

  return {
    resource,
    permissionType,
  };
}

/**
 * Format permission object to string
 * { resource, permissionType } -> "resource:permissionType"
 */
export function formatPermission(permission: Permission): string {
  return `${permission.resource}:${permission.permissionType}`;
}

/**
 * Get user-friendly permission label
 */
export function getPermissionLabel(permission: Permission): string {
  const resource = AVAILABLE_RESOURCES.find((r) => r.value === permission.resource);
  const resourceLabel = resource?.label || permission.resource;
  const typeLabel = PERMISSION_TYPE_LABELS[permission.permissionType as PermissionType];
  return `${resourceLabel} - ${typeLabel}`;
}

/**
 * Group permissions by resource
 */
export function groupPermissionsByResource(
  permissions: Permission[]
): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}
