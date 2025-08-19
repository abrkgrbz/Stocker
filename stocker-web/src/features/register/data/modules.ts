export interface Module {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  required?: boolean;
  category: 'core' | 'addon' | 'integration';
  icon?: string;
  popular?: boolean;
}

export const modules: Module[] = [
  // Temel Modüller
  {
    id: 'crm',
    name: 'CRM - Müşteri Yönetimi',
    description: 'Müşteri ilişkileri, satış süreçleri ve fırsat yönetimi',
    price: 149,
    category: 'core',
    icon: 'UserOutlined',
    features: [
      'Müşteri ve firma kartları',
      'İletişim geçmişi',
      'Satış fırsatları takibi',
      'Aktivite yönetimi',
      'Müşteri segmentasyonu'
    ],
    popular: true
  },
  {
    id: 'stock',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi, depo yönetimi ve stok hareketleri',
    price: 199,
    category: 'core',
    icon: 'InboxOutlined',
    required: true,
    features: [
      'Çoklu depo yönetimi',
      'Stok hareket takibi',
      'Minimum stok uyarıları',
      'Barkod sistemi',
      'Sayım ve envanter'
    ]
  },
  {
    id: 'accounting',
    name: 'Muhasebe',
    description: 'Fatura, cari hesap ve finansal raporlama',
    price: 249,
    category: 'core',
    icon: 'CalculatorOutlined',
    required: true,
    features: [
      'Alış/Satış faturaları',
      'Cari hesap takibi',
      'Kasa ve banka işlemleri',
      'KDV hesaplamaları',
      'Mali müşavir entegrasyonu'
    ]
  },
  {
    id: 'hr',
    name: 'İnsan Kaynakları',
    description: 'Personel yönetimi, bordro ve izin takibi',
    price: 179,
    category: 'core',
    icon: 'TeamOutlined',
    features: [
      'Personel kartları',
      'İzin ve devamsızlık takibi',
      'Bordro hazırlama',
      'Performans değerlendirme',
      'Organizasyon şeması'
    ]
  },

  // Eklenti Modüller
  {
    id: 'ecommerce',
    name: 'E-Ticaret',
    description: 'Online satış kanalları ve marketplace entegrasyonları',
    price: 299,
    category: 'addon',
    icon: 'ShoppingCartOutlined',
    popular: true,
    features: [
      'B2B/B2C satış portalı',
      'Marketplace entegrasyonları',
      'Ürün yönetimi',
      'Sipariş takibi',
      'Kargo entegrasyonu'
    ]
  },
  {
    id: 'production',
    name: 'Üretim Planlama',
    description: 'Üretim süreçleri, reçete ve iş emirleri',
    price: 349,
    category: 'addon',
    icon: 'ToolOutlined',
    features: [
      'Ürün reçeteleri',
      'İş emirleri',
      'Üretim planlama',
      'Maliyet hesaplama',
      'Kalite kontrol'
    ]
  },
  {
    id: 'project',
    name: 'Proje Yönetimi',
    description: 'Proje takibi, görev yönetimi ve zaman takibi',
    price: 199,
    category: 'addon',
    icon: 'ProjectOutlined',
    features: [
      'Proje planlama',
      'Görev atama ve takibi',
      'Gantt şeması',
      'Zaman takibi',
      'Kaynak yönetimi'
    ]
  },
  {
    id: 'logistics',
    name: 'Lojistik',
    description: 'Sevkiyat, rota optimizasyonu ve araç takibi',
    price: 229,
    category: 'addon',
    icon: 'CarOutlined',
    features: [
      'Sevkiyat planlama',
      'Araç ve filo yönetimi',
      'Rota optimizasyonu',
      'Teslimat takibi',
      'Nakliye faturaları'
    ]
  },
  {
    id: 'pos',
    name: 'POS - Satış Noktası',
    description: 'Mağaza satış sistemi ve kasa yönetimi',
    price: 149,
    category: 'addon',
    icon: 'ShopOutlined',
    features: [
      'Hızlı satış ekranı',
      'Çoklu ödeme yöntemleri',
      'Vardiya yönetimi',
      'Z raporu',
      'Offline çalışma'
    ]
  },

  // Entegrasyon Modülleri
  {
    id: 'einvoice',
    name: 'e-Fatura & e-Arşiv',
    description: 'GİB entegrasyonu ve e-belge yönetimi',
    price: 99,
    category: 'integration',
    icon: 'FileTextOutlined',
    features: [
      'e-Fatura gönderimi',
      'e-Arşiv fatura',
      'e-İrsaliye',
      'e-Müstahsil',
      'GİB portal entegrasyonu'
    ]
  },
  {
    id: 'marketplace',
    name: 'Marketplace Entegrasyonları',
    description: 'Trendyol, Hepsiburada, Amazon entegrasyonları',
    price: 199,
    category: 'integration',
    icon: 'ApiOutlined',
    features: [
      'Trendyol entegrasyonu',
      'Hepsiburada entegrasyonu',
      'Amazon entegrasyonu',
      'N11 entegrasyonu',
      'Stok ve fiyat senkronizasyonu'
    ]
  },
  {
    id: 'banking',
    name: 'Banka Entegrasyonları',
    description: 'Otomatik banka mutabakatı ve pos entegrasyonu',
    price: 149,
    category: 'integration',
    icon: 'BankOutlined',
    features: [
      'Banka hesap hareketleri',
      'Otomatik mutabakat',
      'Sanal pos entegrasyonu',
      'Toplu ödeme',
      'Ekstre aktarımı'
    ]
  },
  {
    id: 'bi',
    name: 'İş Zekası & Raporlama',
    description: 'Gelişmiş raporlama ve veri analitiği',
    price: 279,
    category: 'integration',
    icon: 'BarChartOutlined',
    features: [
      'Özelleştirilebilir dashboardlar',
      'Satış analizleri',
      'Karlılık raporları',
      'Trend analizleri',
      'Veri görselleştirme'
    ]
  }
];

export const basePackages = [
  {
    id: 'starter',
    name: 'Başlangıç',
    description: '1-10 kullanıcı',
    basePrice: 99,
    userLimit: 10,
    features: [
      '10 GB depolama',
      'Email desteği',
      'Temel raporlar'
    ]
  },
  {
    id: 'professional',
    name: 'Profesyonel',
    description: '11-50 kullanıcı',
    basePrice: 199,
    userLimit: 50,
    popular: true,
    features: [
      '100 GB depolama',
      'Öncelikli destek',
      'Gelişmiş raporlar',
      'API erişimi'
    ]
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    description: '50+ kullanıcı',
    basePrice: 499,
    userLimit: -1,
    features: [
      'Sınırsız depolama',
      '7/24 telefon desteği',
      'Özel raporlar',
      'Tam API erişimi',
      'Özel eğitim'
    ]
  }
];

export const calculateTotalPrice = (selectedModules: string[], basePackageId: string): number => {
  const basePackage = basePackages.find(p => p.id === basePackageId);
  if (!basePackage) return 0;

  const modulesPrice = modules
    .filter(m => selectedModules.includes(m.id))
    .reduce((total, module) => total + module.price, 0);

  return basePackage.basePrice + modulesPrice;
};

export const getRequiredModules = (): string[] => {
  return modules.filter(m => m.required).map(m => m.id);
};

export const getModulesByCategory = (category: 'core' | 'addon' | 'integration') => {
  return modules.filter(m => m.category === category);
};