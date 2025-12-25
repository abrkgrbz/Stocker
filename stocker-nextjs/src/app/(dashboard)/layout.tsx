'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Avatar, Dropdown, Spin, Button, Tooltip, Popover, Badge, Drawer } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserAddOutlined,
  ContactsOutlined,
  DollarOutlined,
  RiseOutlined,
  CalendarOutlined,
  FunnelPlotOutlined,
  GroupOutlined,
  NotificationOutlined,
  FileOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WalletOutlined,
  InboxOutlined,
  SwapOutlined,
  CalculatorOutlined,
  HomeOutlined,
  TagsOutlined,
  TrademarkOutlined,
  ColumnWidthOutlined,
  ArrowLeftOutlined,
  BarcodeOutlined,
  WarningOutlined,
  EditOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  LockOutlined,
  AuditOutlined,
  LineChartOutlined,
  AccountBookOutlined,
  GiftOutlined,
  SlidersOutlined,
  SkinOutlined,
  BarChartOutlined,
  IdcardOutlined,
  ReconciliationOutlined,
  RollbackOutlined,
  FileDoneOutlined,
  PhoneOutlined,
  ShareAltOutlined,
  AimOutlined,
  GlobalOutlined,
  RocketOutlined,
  ToolOutlined,
  HeartOutlined,
  TrophyOutlined,
  SolutionOutlined,
  ExclamationCircleOutlined,
  CrownOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Search, HelpCircle, Plus, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import { SignalRProvider } from '@/lib/signalr/signalr-context';
import { NotificationCenter } from '@/features/notifications/components';
import { useNotificationHub } from '@/lib/signalr/notification-hub';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';
import { message } from 'antd';
import GlobalSearch from '@/components/common/GlobalSearch';

const { Header, Sider, Content } = Layout;

// Module configurations with their menu items
const MODULE_MENUS = {
  crm: {
    title: 'CRM',
    icon: <TeamOutlined />,
    color: '#7c3aed',
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
    icon: <InboxOutlined />,
    color: '#10b981',
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
          { key: '/inventory/stock', icon: <InboxOutlined />, label: 'Stok Görünümü' },
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
          { key: '/inventory/lot-batches', icon: <InboxOutlined />, label: 'Lot/Parti' },
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
    color: '#f59e0b',
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
        ],
      },
    ],
  },
  settings: {
    title: 'Ayarlar',
    icon: <SettingOutlined />,
    color: '#6b7280',
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
    color: '#ec4899',
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
    color: '#0ea5e9',
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
          { key: '/hr/employee-assets', icon: <InboxOutlined />, label: 'Zimmetler' },
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
    color: '#8b5cf6',
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
          { key: '/purchase/goods-receipts', icon: <InboxOutlined />, label: 'Mal Alım Belgeleri' },
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
    color: '#0891b2',
    moduleCode: null, // Always enabled
    description: 'Modül yönetimi',
    items: [
      { key: '/modules', icon: <AppstoreOutlined />, label: 'Modül Yönetimi' },
    ],
  },
};

// Detect current module from pathname
function getCurrentModule(pathname: string): keyof typeof MODULE_MENUS | null {
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

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [moduleSwitcherOpen, setModuleSwitcherOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch active modules for the user
  const { data: modulesData, isLoading: modulesLoading } = useActiveModules();

  // Create a Set of active module codes for fast lookup
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Initialize SignalR notification hub
  useNotificationHub();

  // Check onboarding status
  const {
    wizardData,
    requiresOnboarding,
    loading: onboardingLoading,
    completeOnboarding
  } = useOnboarding();

  const handleOnboardingComplete = async (data: any): Promise<{ tenantId?: string; success?: boolean }> => {
    try {
      console.log('🚀 Onboarding data being sent:', data);
      const result = await completeOnboarding(data);
      console.log('✅ Onboarding complete response:', result);
      console.log('📊 provisioningStarted:', result.provisioningStarted);
      console.log('🏢 tenantId:', result.tenantId);

      // Don't show success message here - it will be shown by SetupProgressModal
      // Return tenantId for progress tracking
      // If provisioningStarted is true, the progress modal will show
      // Otherwise (tenant already active), redirect immediately
      const returnValue = {
        tenantId: result.provisioningStarted ? result.tenantId : undefined,
        success: true
      };
      console.log('🎯 Returning to OnboardingModal:', returnValue);
      return returnValue;
    } catch (error) {
      console.error('❌ Onboarding error:', error);
      message.error('Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('stoocker.app');
      if (isProduction) {
        window.location.href = 'https://auth.stoocker.app/login';
      } else {
        router.push('/login');
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Get current module based on pathname
  const currentModule = useMemo(() => getCurrentModule(pathname), [pathname]);
  const moduleConfig = currentModule ? MODULE_MENUS[currentModule] : null;

  // Get selected keys for menu
  const getSelectedKeys = useMemo(() => {
    // For nested routes, match to parent
    const routeMappings: Record<string, string> = {
      '/inventory/products': '/inventory/products',
      '/inventory/product-variants': '/inventory/product-variants',
      '/inventory/product-bundles': '/inventory/product-bundles',
      '/inventory/product-attributes': '/inventory/product-attributes',
      '/inventory/warehouses': '/inventory/warehouses',
      '/inventory/stock-movements': '/inventory/stock-movements',
      '/inventory/stock-transfers': '/inventory/stock-transfers',
      '/inventory/stock-counts': '/inventory/stock-counts',
      '/inventory/stock-adjustments': '/inventory/stock-adjustments',
      '/inventory/lot-batches': '/inventory/lot-batches',
      '/inventory/serial-numbers': '/inventory/serial-numbers',
      '/inventory/stock-reservations': '/inventory/stock-reservations',
      '/inventory/stock-alerts': '/inventory/stock-alerts',
      '/inventory/reports': '/inventory/reports',
      '/inventory/barcodes': '/inventory/barcodes',
      '/inventory/audit-trail': '/inventory/audit-trail',
      '/inventory/forecasting': '/inventory/forecasting',
      '/inventory/costing': '/inventory/costing',
      '/inventory/stock': '/inventory/stock',
      '/inventory/analytics': '/inventory/analytics',
      '/inventory/analysis': '/inventory/analysis',
      '/inventory/categories': '/inventory/categories',
      '/inventory/brands': '/inventory/brands',
      '/inventory/units': '/inventory/units',
      '/inventory/suppliers': '/inventory/suppliers',
      '/inventory/locations': '/inventory/locations',
      '/inventory/price-lists': '/inventory/price-lists',
      '/sales/orders': '/sales/orders',
      '/sales/invoices': '/sales/invoices',
      '/sales/e-invoices': '/sales/e-invoices',
      '/sales/payments': '/sales/payments',
      '/sales/customers': '/sales/customers',
      '/sales/quotations': '/sales/quotations',
      '/sales/returns': '/sales/returns',
      '/sales/commissions': '/sales/commissions',
      '/sales/discounts': '/sales/discounts',
      '/sales/contracts': '/sales/contracts',
      '/sales/territories': '/sales/territories',
      '/sales/shipments': '/sales/shipments',
      // HR Module
      '/hr/employees': '/hr/employees',
      '/hr/departments': '/hr/departments',
      '/hr/positions': '/hr/positions',
      '/hr/attendance': '/hr/attendance',
      '/hr/leaves': '/hr/leaves',
      '/hr/leave-types': '/hr/leave-types',
      '/hr/holidays': '/hr/holidays',
      '/hr/payroll': '/hr/payroll',
      '/hr/payslips': '/hr/payslips',
      '/hr/expenses': '/hr/expenses',
      '/hr/performance': '/hr/performance',
      '/hr/goals': '/hr/goals',
      '/hr/trainings': '/hr/trainings',
      '/hr/documents': '/hr/documents',
      '/hr/announcements': '/hr/announcements',
      '/hr/shifts': '/hr/shifts',
      '/hr/work-schedules': '/hr/work-schedules',
      '/hr/work-locations': '/hr/work-locations',
      '/hr/job-postings': '/hr/job-postings',
      '/hr/certifications': '/hr/certifications',
      '/hr/overtimes': '/hr/overtimes',
      // HR Module - New Entities
      '/hr/career-paths': '/hr/career-paths',
      '/hr/disciplinary-actions': '/hr/disciplinary-actions',
      '/hr/employee-assets': '/hr/employee-assets',
      '/hr/employee-benefits': '/hr/employee-benefits',
      '/hr/employee-skills': '/hr/employee-skills',
      '/hr/grievances': '/hr/grievances',
      '/hr/interviews': '/hr/interviews',
      '/hr/job-applications': '/hr/job-applications',
      '/hr/onboardings': '/hr/onboardings',
      '/hr/succession-plans': '/hr/succession-plans',
      '/hr/time-sheets': '/hr/time-sheets',
      // CRM Module - New Entities
      '/crm/call-logs': '/crm/call-logs',
      '/crm/meetings': '/crm/meetings',
      '/crm/territories': '/crm/territories',
      '/crm/sales-teams': '/crm/sales-teams',
      '/crm/competitors': '/crm/competitors',
      '/crm/loyalty-programs': '/crm/loyalty-programs',
      '/crm/referrals': '/crm/referrals',
      // Purchase Module
      '/purchase/suppliers': '/purchase/suppliers',
      '/purchase/evaluations': '/purchase/evaluations',
      '/purchase/requests': '/purchase/requests',
      '/purchase/quotations': '/purchase/quotations',
      '/purchase/orders': '/purchase/orders',
      '/purchase/goods-receipts': '/purchase/goods-receipts',
      '/purchase/invoices': '/purchase/invoices',
      '/purchase/payments': '/purchase/payments',
      '/purchase/budgets': '/purchase/budgets',
      '/purchase/price-lists': '/purchase/price-lists',
      '/purchase/returns': '/purchase/returns',
      '/purchase/reports': '/purchase/reports',
    };

    for (const [prefix, key] of Object.entries(routeMappings)) {
      if (pathname.startsWith(prefix)) return [key];
    }

    return [pathname];
  }, [pathname]);

  if (authLoading || tenantLoading || onboardingLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Block access to dashboard if onboarding is not completed
  if (requiresOnboarding) {
    return (
      <div className="flex items-center justify-center bg-gray-50" style={{ minHeight: '100dvh' }}>
        <OnboardingModal
          visible={true}
          wizardData={wizardData || { currentStepIndex: 0, totalSteps: 4, progressPercentage: 0 }}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  // Check module access - block access to modules user doesn't have
  const modulePathPrefixes: Record<string, string> = {
    '/crm': 'crm',
    '/hr': 'hr',
    '/inventory': 'inventory',
    '/sales': 'sales',
    '/purchase': 'purchase',
  };

  // Paths that are always allowed (no module required)
  const alwaysAllowedPaths = ['/dashboard', '/settings', '/modules', '/profile', '/notifications', '/reminders', '/app'];
  const isAlwaysAllowed = alwaysAllowedPaths.some(path => pathname.startsWith(path));

  if (!isAlwaysAllowed) {
    // Check if current path requires a specific module
    for (const [prefix, moduleCode] of Object.entries(modulePathPrefixes)) {
      if (pathname.startsWith(prefix)) {
        // User is trying to access a module path - check if they have access
        const hasAccess = activeModuleCodes.has(moduleCode);
        if (!hasAccess) {
          // Redirect to /app with a message
          return (
            <div className="flex items-center justify-center bg-gray-50" style={{ minHeight: '100dvh' }}>
              <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
                <h2 className="text-xl font-semibold mt-4 mb-2">Erişim Yetkiniz Yok</h2>
                <p className="text-gray-500 mb-4">
                  Bu modüle erişim için aboneliğinizi yükseltmeniz gerekmektedir.
                </p>
                <Button type="primary" onClick={() => router.push('/app')} style={{ background: '#1a1a1a' }}>
                  Ana Sayfaya Dön
                </Button>
              </div>
            </div>
          );
        }
        break;
      }
    }
  }

  const handleMenuClick = (key: string) => {
    router.push(key);
  };

  const handleBackToApp = () => {
    router.push('/app');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Çıkış Yap', danger: true },
  ];

  const handleUserMenuClick = (key: string) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      router.push('/account/profile');
    }
  };

  // Sidebar content - shared between desktop and mobile
  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Module Header - Fixed */}
      <div
        style={{
          height: 64,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #f0f0f0',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Modüllere Dön">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              handleBackToApp();
              setMobileMenuOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
        {moduleConfig && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${moduleConfig.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: moduleConfig.color,
                fontSize: 16,
              }}
            >
              {moduleConfig.icon}
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>
              {moduleConfig.title}
            </span>
          </div>
        )}
      </div>

      {/* Module Menu - Scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
        }}
      >
        {moduleConfig && (
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys}
            items={moduleConfig.items}
            onClick={({ key }) => {
              handleMenuClick(key);
              setMobileMenuOpen(false);
            }}
            style={{ borderRight: 0, paddingTop: 8, paddingBottom: 8 }}
          />
        )}
      </div>

      {/* Quick Module Switch - Fixed Bottom */}
      <div
        style={{
          padding: 16,
          borderTop: '1px solid #f0f0f0',
          background: '#fafafa',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 11, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Hızlı Geçiş
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(MODULE_MENUS)
            .filter(([key]) => key !== currentModule && key !== 'modules')
            .slice(0, 4)
            .map(([key, config]) => (
              <Tooltip key={key} title={config.title}>
                <Button
                  type="text"
                  size="small"
                  icon={config.icon}
                  onClick={() => {
                    router.push(config.items[0]?.key || `/${key}`);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    color: config.color,
                    background: `${config.color}10`,
                    border: 'none',
                  }}
                />
              </Tooltip>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <Layout style={{ minHeight: '100dvh' }}>
        {/* Desktop Sidebar - Hidden on mobile */}
        <Sider
          theme="light"
          width={240}
          style={{
            height: '100dvh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            borderRight: '1px solid #f0f0f0',
            zIndex: 100,
            transition: 'transform 0.2s ease-in-out',
          }}
          className="dashboard-sider hidden lg:block"
        >
          {sidebarContent}
        </Sider>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={280}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
          }}
          className="lg:hidden"
        >
          {sidebarContent}
        </Drawer>

        <Layout className="lg:ml-[240px] ml-0">
          <Header
            style={{
              padding: '0 12px',
              background: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              height: 56,
            }}
            className="sm:px-5"
          >
            {/* Left: Mobile Menu + Tenant Name + Module Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="sm:gap-3">
              {/* Mobile Menu Button - Only visible on mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MenuIcon className="w-5 h-5" strokeWidth={2} />
              </button>

              <div style={{ fontWeight: 600, fontSize: 14, color: '#334155' }} className="hidden sm:block">
                {tenant?.name || 'Stocker'}
              </div>

              {/* Divider - Hidden on mobile */}
              <div style={{ width: 1, height: 20, background: '#e2e8f0' }} className="hidden sm:block" />

              {/* Module Switcher Button */}
              <Popover
                open={moduleSwitcherOpen}
                onOpenChange={setModuleSwitcherOpen}
                trigger="click"
                placement="bottomLeft"
                arrow={false}
                content={
                  <div style={{ width: 320, padding: 8 }}>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                    }}>
                      Modüller
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(MODULE_MENUS)
                        .filter(([key]) => key !== 'modules' && key !== 'communication')
                        .map(([key, config]) => {
                          const isActive = config.moduleCode === null || activeModuleCodes.has(config.moduleCode?.toLowerCase() || '');
                          const isCurrent = currentModule === key;

                          return (
                            <div
                              key={key}
                              onClick={() => {
                                if (isActive) {
                                  router.push(config.items[0]?.key || `/${key}`);
                                  setModuleSwitcherOpen(false);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 8,
                                cursor: isActive ? 'pointer' : 'not-allowed',
                                opacity: isActive ? 1 : 0.5,
                                background: isCurrent ? `${config.color}15` : 'transparent',
                                border: isCurrent ? `1px solid ${config.color}30` : '1px solid transparent',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (isActive && !isCurrent) {
                                  e.currentTarget.style.background = '#f5f5f5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrent) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: `${config.color}15`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: config.color,
                                  fontSize: 18,
                                }}
                              >
                                {config.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontWeight: 600,
                                  fontSize: 14,
                                  color: isCurrent ? config.color : '#333',
                                }}>
                                  {config.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#999' }}>
                                  {config.description}
                                </div>
                              </div>
                              {isCurrent && (
                                <Badge color={config.color} />
                              )}
                              {!isActive && (
                                <span style={{
                                  fontSize: 10,
                                  color: '#999',
                                  background: '#f0f0f0',
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}>
                                  Pasif
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    <div style={{
                      borderTop: '1px solid #f0f0f0',
                      marginTop: 12,
                      paddingTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          router.push('/app');
                          setModuleSwitcherOpen(false);
                        }}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Tüm Modüller
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          router.push('/modules');
                          setModuleSwitcherOpen(false);
                        }}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Modül Yönetimi
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button
                  type="text"
                  icon={<AppstoreOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#666',
                    fontWeight: 500,
                  }}
                >
                  Modüller
                </Button>
              </Popover>
            </div>

            {/* Center: Global Search Bar - Hidden on very small screens, icon on mobile */}
            <div className="flex-1 flex justify-center px-2 sm:px-4 lg:px-8">
              {/* Desktop Search Bar */}
              <button
                type="button"
                className="
                  hidden sm:flex
                  w-full max-w-md h-9 px-3 items-center gap-2
                  bg-slate-100 hover:bg-slate-200/80
                  border border-transparent hover:border-slate-300
                  rounded-lg transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1
                  group
                "
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-500" strokeWidth={2} />
                <span className="flex-1 text-left text-sm text-slate-400 group-hover:text-slate-500">
                  Ara...
                </span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
                  ⌘K
                </kbd>
              </button>
              {/* Mobile Search Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="sm:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Help Button - Hidden on mobile */}
              <Tooltip title="Yardım & Destek">
                <button
                  type="button"
                  className="
                    hidden sm:flex
                    w-8 h-8 items-center justify-center
                    text-slate-400 hover:text-slate-600
                    border border-slate-200 hover:border-slate-300 hover:bg-slate-50
                    rounded-full transition-all duration-150
                  "
                  onClick={() => router.push('/help')}
                >
                  <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </Tooltip>

              {/* Notifications */}
              <NotificationCenter />

              {/* Divider - Hidden on mobile */}
              <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1 sm:mx-2" />

              {/* Quick Create Button */}
              <Popover
                open={quickCreateOpen}
                onOpenChange={setQuickCreateOpen}
                trigger="click"
                placement="bottomRight"
                arrow={false}
                content={
                  <div style={{ width: 280, padding: 8 }}>
                    <div style={{
                      fontSize: 12,
                      color: '#999',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                    }}>
                      Hızlı Oluştur
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* CRM Items */}
                      {activeModuleCodes.has('crm') && (
                        <>
                          <div
                            onClick={() => { router.push('/crm/customers/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <ContactsOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Müşteri</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/crm/leads/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <UserAddOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Potansiyel</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/crm/opportunities/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#7c3aed15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#7c3aed',
                              fontSize: 14,
                            }}>
                              <RiseOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Fırsat</div>
                              <div style={{ fontSize: 12, color: '#999' }}>CRM</div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* Inventory Items */}
                      {activeModuleCodes.has('inventory') && (
                        <div
                          onClick={() => { router.push('/inventory/products/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#10b98115',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            fontSize: 14,
                          }}>
                            <AppstoreOutlined />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Ürün</div>
                            <div style={{ fontSize: 12, color: '#999' }}>Envanter</div>
                          </div>
                        </div>
                      )}
                      {/* Sales Items */}
                      {activeModuleCodes.has('sales') && (
                        <>
                          <div
                            onClick={() => { router.push('/sales/orders/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#f59e0b15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#f59e0b',
                              fontSize: 14,
                            }}>
                              <ShoppingCartOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Sipariş</div>
                              <div style={{ fontSize: 12, color: '#999' }}>Satış</div>
                            </div>
                          </div>
                          <div
                            onClick={() => { router.push('/sales/invoices/new'); setQuickCreateOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: '#f59e0b15',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#f59e0b',
                              fontSize: 14,
                            }}>
                              <FileTextOutlined />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Fatura</div>
                              <div style={{ fontSize: 12, color: '#999' }}>Satış</div>
                            </div>
                          </div>
                        </>
                      )}
                      {/* HR Items */}
                      {activeModuleCodes.has('hr') && (
                        <div
                          onClick={() => { router.push('/hr/employees/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#0ea5e915',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0ea5e9',
                            fontSize: 14,
                          }}>
                            <IdcardOutlined />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Çalışan</div>
                            <div style={{ fontSize: 12, color: '#999' }}>İK</div>
                          </div>
                        </div>
                      )}
                      {/* Purchase Items */}
                      {activeModuleCodes.has('purchase') && (
                        <div
                          onClick={() => { router.push('/purchase/orders/new'); setQuickCreateOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#8b5cf615',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8b5cf6',
                            fontSize: 14,
                          }}>
                            <ReconciliationOutlined />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>Yeni Satın Alma</div>
                            <div style={{ fontSize: 12, color: '#999' }}>Satın Alma</div>
                          </div>
                        </div>
                      )}
                      {/* No modules active message */}
                      {activeModuleCodes.size === 0 && (
                        <div style={{ padding: '16px 12px', textAlign: 'center', color: '#999' }}>
                          Aktif modül bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                }
              >
                <Tooltip title="Hızlı Oluştur">
                  <button
                    type="button"
                    className="
                      w-8 h-8 flex items-center justify-center
                      bg-slate-900 hover:bg-slate-800
                      text-white rounded-lg transition-all duration-150
                    "
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Tooltip>
              </Popover>

              {/* Divider - Hidden on small mobile */}
              <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1 sm:mx-2" />

              {/* User Menu */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: ({ key }) => handleUserMenuClick(key) }}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="
                    flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1.5
                    hover:bg-slate-100 rounded-lg transition-colors
                  "
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">
                    {user?.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" strokeWidth={2} />
                </button>
              </Dropdown>
            </div>
          </Header>

          <Content style={{ overflow: 'initial' }}>
            {/* Responsive content padding */}
            <div className="m-3 sm:m-4 lg:mx-6 lg:mt-6">
              <div className="p-3 sm:p-4 lg:p-6 bg-white min-h-[360px] rounded-lg">
                {children}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignalRProvider>
      <DashboardContent>{children}</DashboardContent>
    </SignalRProvider>
  );
}
