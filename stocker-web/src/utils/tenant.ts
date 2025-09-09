// Tenant identification utilities

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
}

/**
 * Extract tenant slug from subdomain
 * @example acme.stocker.app -> acme
 */
export const getTenantSlugFromDomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for tenant in localStorage for dev
    return localStorage.getItem('dev_tenant') || null;
  }
  
  // Production subdomain extraction
  const parts = hostname.split('.');
  
  // Must have at least subdomain.domain.tld
  if (parts.length >= 3) {
    // First part is the tenant slug
    const slug = parts[0];
    
    // Exclude www and other reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail'];
    if (reservedSubdomains.includes(slug)) {
      return null;
    }
    
    return slug;
  }
  
  return null;
};

/**
 * Check if current domain is a tenant subdomain
 */
export const isTenantDomain = (): boolean => {
  return getTenantSlugFromDomain() !== null;
};

/**
 * Get tenant-specific API base URL
 */
export const getTenantApiUrl = (tenantSlug: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://api.stocker.app';
  return `${baseUrl}/tenant/${tenantSlug}`;
};

/**
 * Redirect to tenant subdomain
 */
export const redirectToTenantDomain = (tenantSlug: string): void => {
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // For development, store tenant and redirect to login
    localStorage.setItem('dev_tenant', tenantSlug);
    window.location.href = '/login';
  } else {
    // Production redirect to subdomain
    const baseDomain = currentHost.replace(/^[^.]+\./, '');
    window.location.href = `${protocol}//${tenantSlug}.${baseDomain}${port}/login`;
  }
};

/**
 * Get main domain URL (without subdomain)
 */
export const getMainDomainUrl = (): string => {
  const currentHost = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `${protocol}//${currentHost}${port}`;
  }
  
  // Remove subdomain if exists
  const parts = currentHost.split('.');
  if (parts.length >= 3) {
    const mainDomain = parts.slice(1).join('.');
    return `${protocol}//${mainDomain}${port}`;
  }
  
  return `${protocol}//${currentHost}${port}`;
};