/**
 * Subdomain utility functions for multi-tenant SaaS
 */

/**
 * Get the current subdomain from the URL
 * @returns The subdomain or null if on main domain
 */
export const getCurrentSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Skip if localhost or IP address
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    // Check for subdomain in localStorage for development
    return localStorage.getItem('dev-subdomain') || null;
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // Must have at least subdomain.domain.tld
  if (parts.length < 3) {
    return null;
  }
  
  const subdomain = parts[0];
  
  // Skip common subdomains that aren't tenants
  if (['www', 'api', 'admin', 'app', 'mail', 'ftp'].includes(subdomain)) {
    return null;
  }
  
  return subdomain;
};

/**
 * Check if currently on a tenant subdomain
 * @returns True if on a tenant subdomain
 */
export const isOnTenantSubdomain = (): boolean => {
  return getCurrentSubdomain() !== null;
};

/**
 * Get the base domain (without subdomain)
 * @returns The base domain
 */
export const getBaseDomain = (): string => {
  const hostname = window.location.hostname;
  
  // For localhost/development
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return hostname;
  }
  
  const parts = hostname.split('.');
  
  // Return last two parts (domain.tld)
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  
  return hostname;
};

/**
 * Build a URL for a specific subdomain
 * @param subdomain The subdomain to use
 * @param path Optional path to append
 * @returns The full URL
 */
export const buildSubdomainUrl = (subdomain: string, path: string = '/'): string => {
  const protocol = window.location.protocol;
  const baseDomain = getBaseDomain();
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // For localhost/development
  if (baseDomain === 'localhost' || 
      baseDomain === '127.0.0.1' ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(baseDomain)) {
    // Store subdomain in localStorage for development
    localStorage.setItem('dev-subdomain', subdomain);
    return `${protocol}//${baseDomain}${port}${path}`;
  }
  
  return `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
};

/**
 * Navigate to a subdomain
 * @param subdomain The subdomain to navigate to
 * @param path Optional path to navigate to
 */
export const navigateToSubdomain = (subdomain: string, path: string = '/'): void => {
  const url = buildSubdomainUrl(subdomain, path);
  window.location.href = url;
};

/**
 * Navigate to the main domain (remove subdomain)
 * @param path Optional path to navigate to
 */
export const navigateToMainDomain = (path: string = '/'): void => {
  const protocol = window.location.protocol;
  const baseDomain = getBaseDomain();
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // Clear dev subdomain if in development
  if (baseDomain === 'localhost' || 
      baseDomain === '127.0.0.1' ||
      /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(baseDomain)) {
    localStorage.removeItem('dev-subdomain');
  }
  
  window.location.href = `${protocol}//${baseDomain}${port}${path}`;
};

/**
 * Get tenant code from subdomain or header
 * @returns The tenant code or null
 */
export const getTenantCode = (): string | null => {
  // First try subdomain
  const subdomain = getCurrentSubdomain();
  if (subdomain) {
    return subdomain;
  }
  
  // Then try localStorage (for development or header-based tenancy)
  return localStorage.getItem('X-Tenant-Code') || null;
};

/**
 * Set tenant code for header-based tenancy
 * @param code The tenant code
 */
export const setTenantCode = (code: string): void => {
  localStorage.setItem('X-Tenant-Code', code);
};

/**
 * Clear tenant code
 */
export const clearTenantCode = (): void => {
  localStorage.removeItem('X-Tenant-Code');
  localStorage.removeItem('dev-subdomain');
};