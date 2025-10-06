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
    </>
  );
}
