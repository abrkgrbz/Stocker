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
  
  // Check if we have a subdomain
  // For stoocker.app (2 parts) - no subdomain
  // For demo.stoocker.app (3 parts) - has subdomain
  // For www.stoocker.app (3 parts) - reserved subdomain
  if (parts.length === 3 || (parts.length === 4 && parts[0] === 'www')) {
    // First part is potentially the tenant slug
    const slug = parts[0];
    
    // Exclude www and other reserved subdomains
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'master'];
    if (reservedSubdomains.includes(slug)) {
      return null;
    }
    
    return slug;
  } else if (parts.length === 2) {
    // Main domain without subdomain (stoocker.app)
    return null;
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
    // If we're already on a subdomain, get the base domain
    // If we're on the main domain (stoocker.app), use it as is
    let baseDomain = currentHost;
    
    // Check if we're on a subdomain (has more than 2 parts)
    const parts = currentHost.split('.');
    if (parts.length > 2) {
      // Remove the subdomain part (e.g., www.stoocker.app -> stoocker.app)
      baseDomain = parts.slice(-2).join('.');
    } else if (parts.length === 2) {
      // Already on base domain (stoocker.app)
      baseDomain = currentHost;
    }
    
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
  if (parts.length > 2) {
    // Has subdomain (e.g., demo.stoocker.app or www.stoocker.app)
    // Keep only the last two parts (stoocker.app)
    const mainDomain = parts.slice(-2).join('.');
    return `${protocol}//${mainDomain}${port}`;
  }
  
  // Already on main domain
  return `${protocol}//${currentHost}${port}`;
};