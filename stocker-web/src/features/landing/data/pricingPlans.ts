export interface PricingPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Başlangıç',
    price: 499,
    currency: '₺',
    period: 'ay',
    description: 'Küçük işletmeler için ideal',
    features: [
      '5 kullanıcıya kadar',
      'CRM modülü',
      'Stok takibi',
      '10 GB depolama',
      'E-posta desteği',
      'Temel raporlar',
      'Mobil uygulama'
    ],
    popular: false
  },
  {
    name: 'Profesyonel',
    price: 999,
    currency: '₺',
    period: 'ay',
    description: 'Büyüyen işletmeler için',
    features: [
      '25 kullanıcıya kadar',
      'CRM + Stok + Muhasebe',
      'E-fatura entegrasyonu',
      '100 GB depolama',
      'Öncelikli destek',
      'Gelişmiş raporlar',
      'API erişimi',
      'Özel eğitim'
    ],
    popular: true
  },
  {
    name: 'Kurumsal',
    price: 2499,
    currency: '₺',
    period: 'ay',
    description: 'Büyük organizasyonlar için',
    features: [
      'Sınırsız kullanıcı',
      'Tüm modüller dahil',
      'Tüm entegrasyonlar',
      'Sınırsız depolama',
      '7/24 VIP destek',
      'Özel geliştirmeler',
      'SLA garantisi',
      'Yerinde eğitim'
    ],
    popular: false
  }
];