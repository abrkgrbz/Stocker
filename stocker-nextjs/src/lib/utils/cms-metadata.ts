/**
 * CMS Metadata Utilities
 * Generates SEO metadata from CMS content for Next.js pages
 */

import type { Metadata } from 'next';
import type {
  BlogPost,
  DocArticle,
  CmsPage,
  Industry,
  Integration,
  PricingPlan,
} from '@/lib/api/services/cms.types';

const SITE_NAME = 'Stoocker';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stoocker.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.png`;

/**
 * Strip HTML tags from content for descriptions
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number = 160): string {
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength - 3) + '...';
}

/**
 * Generate metadata for blog post
 */
export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || `${post.title} | ${SITE_NAME} Blog`;
  const description = post.metaDescription || truncate(post.excerpt || post.content);

  return {
    title,
    description,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt || truncate(post.content),
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: post.featuredImage
        ? [{ url: post.featuredImage, alt: post.title }]
        : [{ url: DEFAULT_OG_IMAGE }],
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || truncate(post.content),
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

/**
 * Generate metadata for documentation article
 */
export function generateDocArticleMetadata(article: DocArticle): Metadata {
  const title = article.metaTitle || `${article.title} | ${SITE_NAME} Dökümanlar`;
  const description = article.metaDescription || truncate(article.excerpt || article.content);

  return {
    title,
    description,
    openGraph: {
      title: article.title,
      description: article.excerpt || truncate(article.content),
      type: 'article',
      modifiedTime: article.updatedAt,
      url: `${SITE_URL}/docs/${article.slug}`,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.excerpt || truncate(article.content),
    },
    alternates: {
      canonical: `${SITE_URL}/docs/${article.slug}`,
    },
  };
}

/**
 * Generate metadata for CMS page
 */
export function generatePageMetadata(page: CmsPage): Metadata {
  const title = page.metaTitle || `${page.title} | ${SITE_NAME}`;
  const description = page.metaDescription || truncate(page.content);

  return {
    title,
    description,
    openGraph: {
      title: page.title,
      description: page.metaDescription || truncate(page.content),
      type: 'website',
      url: `${SITE_URL}/${page.slug}`,
      siteName: SITE_NAME,
      images: page.featuredImage
        ? [{ url: page.featuredImage, alt: page.title }]
        : [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.metaDescription || truncate(page.content),
    },
    alternates: {
      canonical: `${SITE_URL}/${page.slug}`,
    },
  };
}

/**
 * Generate metadata for industry page
 */
export function generateIndustryMetadata(industry: Industry): Metadata {
  const title = `${industry.name} için Stok Yönetimi | ${SITE_NAME}`;
  const description = industry.description || `${industry.name} sektörü için özelleştirilmiş stok ve envanter yönetimi çözümleri.`;

  return {
    title,
    description,
    openGraph: {
      title: industry.name,
      description,
      type: 'website',
      url: `${SITE_URL}/industries/${industry.slug}`,
      siteName: SITE_NAME,
      images: industry.image
        ? [{ url: industry.image, alt: industry.name }]
        : [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: {
      canonical: `${SITE_URL}/industries/${industry.slug}`,
    },
  };
}

/**
 * Generate metadata for integration page
 */
export function generateIntegrationMetadata(integration: Integration): Metadata {
  const title = `${integration.name} Entegrasyonu | ${SITE_NAME}`;
  const description = integration.description || `Stoocker ile ${integration.name} entegrasyonu. Sistemlerinizi kolayca bağlayın.`;

  return {
    title,
    description,
    openGraph: {
      title: integration.name,
      description,
      type: 'website',
      url: `${SITE_URL}/integrations/${integration.slug}`,
      siteName: SITE_NAME,
      images: integration.logo
        ? [{ url: integration.logo, alt: integration.name }]
        : [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: {
      canonical: `${SITE_URL}/integrations/${integration.slug}`,
    },
  };
}

/**
 * Generate metadata for pricing plan page
 */
export function generatePricingPlanMetadata(plan: PricingPlan): Metadata {
  const title = `${plan.name} Planı | ${SITE_NAME} Fiyatlandırma`;
  const description = plan.description || `${plan.name} planı ile işletmenizi büyütün. Aylık ${plan.monthlyPrice} ${plan.currency}'den başlayan fiyatlar.`;

  return {
    title,
    description,
    openGraph: {
      title: plan.name,
      description,
      type: 'website',
      url: `${SITE_URL}/pricing/${plan.slug}`,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: {
      canonical: `${SITE_URL}/pricing/${plan.slug}`,
    },
  };
}

/**
 * Generate JSON-LD structured data for blog post
 */
export function generateBlogPostJsonLd(post: BlogPost): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || truncate(post.content),
    image: post.featuredImage || DEFAULT_OG_IMAGE,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate JSON-LD structured data for FAQ page
 */
export function generateFaqJsonLd(
  items: Array<{ question: string; answer: string }>
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(item.answer),
      },
    })),
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/stoocker',
      'https://linkedin.com/company/stoocker',
      'https://github.com/stoocker',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-212-xxx-xxxx',
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English'],
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return JSON.stringify(jsonLd);
}
