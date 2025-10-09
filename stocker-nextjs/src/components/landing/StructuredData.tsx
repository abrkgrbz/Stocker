export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Stocker',
    description: 'Akıllı stok yönetim ve envanter takip sistemi',
    url: 'https://stocker.app',
    logo: 'https://stocker.app/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-XXX-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['tr', 'en'],
    },
    sameAs: [
      'https://twitter.com/stocker',
      'https://linkedin.com/company/stocker',
      'https://facebook.com/stocker',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Stocker',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      description: '14 gün ücretsiz deneme',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Stocker nedir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Stocker, işletmelerin stok yönetimi ve envanter takibini kolaylaştıran bulut tabanlı bir SaaS platformudur.',
        },
      },
      {
        '@type': 'Question',
        name: 'Ücretsiz deneme süresi ne kadar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '14 gün boyunca tüm özellikleri ücretsiz deneyebilirsiniz. Kredi kartı bilgisi gerekmez.',
        },
      },
    ],
  };

  const industryUseCasesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Stocker Sektörel Çözümler',
    description: 'Farklı sektörlere özel stok yönetimi çözümleri',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Perakende Stok Yönetimi',
          description: 'Mağaza stok yönetimi, raf takibi, hızlı satış noktası entegrasyonu, barkod okuma sistemi',
          serviceType: 'Retail Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'Perakende Sektörü',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: 'E-ticaret Stok Yönetimi',
          description: 'Multi-kanal stok senkronizasyonu, Trendyol, Hepsiburada, N11 entegrasyonu, otomatik sipariş takibi',
          serviceType: 'E-commerce Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'E-ticaret Firmaları',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: 'Üretim Stok Yönetimi',
          description: 'Hammadde takibi, üretim planlama, fire yönetimi, seri takip, reçete yönetimi',
          serviceType: 'Manufacturing Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'Üretim Firmaları',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Service',
          name: 'Sağlık Sektörü Stok Yönetimi',
          description: 'İlaç ve medikal malzeme yönetimi, son kullanma tarihi takibi, lot yönetimi, reçete kontrol',
          serviceType: 'Healthcare Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'Sağlık Kurumları',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 5,
        item: {
          '@type': 'Service',
          name: 'Toptan Ticaret Stok Yönetimi',
          description: 'Büyük hacimli stok yönetimi, depo optimizasyonu, müşteri bazlı fiyatlandırma, bayi takibi',
          serviceType: 'Wholesale Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'Toptan Ticaret Firmaları',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 6,
        item: {
          '@type': 'Service',
          name: 'Otomotiv Stok Yönetimi',
          description: 'Yedek parça yönetimi, OEM kodları, araç bazlı stok organizasyonu, parça katalogu',
          serviceType: 'Automotive Inventory Management',
          audience: {
            '@type': 'Audience',
            audienceType: 'Otomotiv Sektörü',
          },
        },
      },
    ],
  };

  const integrationsSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Stocker Entegrasyon Platformu',
    applicationCategory: 'BusinessApplication',
    description: 'ERP, e-ticaret, muhasebe ve kargo sistemleriyle tam entegrasyon',
    featureList: [
      'SAP, Oracle ERP, Microsoft Dynamics entegrasyonu',
      'Logo, Netsis, Mikro ERP desteği',
      'Trendyol, Hepsiburada, N11, Amazon TR entegrasyonu',
      'Logo, Mikro, Eta muhasebe entegrasyonu',
      'İyzico, PayTR, Stripe ödeme entegrasyonu',
      'Aras Kargo, Yurtiçi, MNG kargo entegrasyonu',
      'RESTful API ve Webhook desteği',
    ],
    offers: {
      '@type': 'Offer',
      name: 'Entegrasyon Paketleri',
      description: 'Tüm popüler sistemlerle hazır entegrasyonlar',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(industryUseCasesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(integrationsSchema) }}
      />
    </>
  );
}
