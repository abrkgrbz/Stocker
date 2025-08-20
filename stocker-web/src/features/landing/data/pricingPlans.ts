export interface PricingPlan {
  name: string;
  price: number;
  oldPrice?: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  badge?: string;
  savings?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Başlangıç',
    price: 499,
    oldPrice: 799,
    currency: '₺',
    period: 'ay',
    description: 'Küçük işletmeler için ideal başlangıç',
    features: [
      '5 kullanıcıya kadar',
      'CRM modülü',
      'Stok yönetimi',
      '10 GB bulut depolama',
      'E-posta desteği',
      'Temel raporlama',
      'Mobil uygulama erişimi'
    ],
    popular: false,
    savings: '%37 tasarruf'
  },
  {
    name: 'Profesyonel',
    price: 999,
    oldPrice: 1499,
    currency: '₺',
    period: 'ay',
    description: 'En popüler seçim',
    features: [
      '25 kullanıcıya kadar',
      'Tüm temel modüller',
      'E-fatura & E-defter',
      '100 GB bulut depolama',
      'Öncelikli 7/24 destek',
      'Gelişmiş analitik',
      'API erişimi',
      'Ücretsiz eğitim (3 saat)'
    ],
    popular: true,
    badge: 'En Çok Tercih Edilen',
    savings: '%33 tasarruf'
  },
  {
    name: 'Kurumsal',
    price: 2499,
    currency: '₺',
    period: 'ay',
    description: 'Büyük ölçekli işletmeler için',
    features: [
      'Sınırsız kullanıcı',
      'Tüm premium modüller',
      'Özel entegrasyonlar',
      'Sınırsız depolama',
      'Özel hesap yöneticisi',
      'Özelleştirilebilir çözümler',
      '%99.9 SLA garantisi',
      'Yerinde kurulum & eğitim'
    ],
    popular: false,
    badge: 'Özel Çözüm'
  }
];