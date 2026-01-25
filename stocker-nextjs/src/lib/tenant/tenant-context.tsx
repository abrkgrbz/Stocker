'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { extractTenantSubdomain } from '@/lib/utils/auth';

export interface TenantInfo {
  id: string;
  identifier: string;
  name: string;
  domain?: string;
  isActive: boolean;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  isLoading: boolean;
  isValidating: boolean;
  setTenant: (tenant: TenantInfo | null) => void;
  validateTenant: () => Promise<boolean>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: TenantInfo | null;
}

// Dev bypass mock tenant - only used when NEXT_PUBLIC_AUTH_BYPASS=true
const DEV_MOCK_TENANT: TenantInfo = {
  id: 'dev-tenant-id',
  identifier: 'dev',
  name: 'Dev Tenant',
  domain: 'localhost',
  isActive: true,
};

// TODO: Remove this bypass after Coolify migration is complete
const TEMPORARY_BYPASS_SUBDOMAINS = ['awcs0wg4840co8wwsscwwwck'];

// Check if current subdomain should bypass tenant validation
const shouldBypassTenantValidation = (): boolean => {
  if (typeof window === 'undefined') return false;
  const subdomain = window.location.hostname.split('.')[0];
  return TEMPORARY_BYPASS_SUBDOMAINS.includes(subdomain);
};

// Mock tenant for bypassed subdomains
const createBypassTenant = (subdomain: string): TenantInfo => ({
  id: `bypass-${subdomain}`,
  identifier: subdomain,
  name: `Bypass Tenant (${subdomain})`,
  domain: window.location.hostname,
  isActive: true,
});

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  // Check for auth bypass in development
  // const isAuthBypassed = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
  const isAuthBypassed = true; // Forced for local debugging

  const [tenant, setTenant] = useState<TenantInfo | null>(
    isAuthBypassed ? DEV_MOCK_TENANT : (initialTenant || null)
  );
  const [isLoading, setIsLoading] = useState(!isAuthBypassed);
  const [isValidating, setIsValidating] = useState(false);
  const hasInitialized = useRef(false);

  const extractTenantIdentifier = (): string | null => {
    if (typeof window === 'undefined') return null;

    const hostname = window.location.hostname;
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost';

    const mode = process.env.NEXT_PUBLIC_TENANT_MODE || 'subdomain';

    switch (mode) {
      case 'subdomain': {
        // Use consolidated utility function
        return extractTenantSubdomain(hostname, baseDomain);
      }

      case 'path': {
        const pathname = window.location.pathname;
        const match = pathname.match(/^\/t\/([^/]+)/);
        return match ? match[1] : null;
      }

      case 'header': {
        // This would be handled by middleware, not client-side
        return localStorage.getItem('tenantIdentifier');
      }

      default:
        return null;
    }
  };

  const validateTenant = async (): Promise<boolean> => {
    const identifier = extractTenantIdentifier();

    console.log('🔍 Tenant Context - Extracted identifier:', identifier);
    console.log('🌐 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');

    if (!identifier) {
      console.warn('⚠️ No tenant identifier found');
      setTenant(null);
      return false;
    }

    setIsValidating(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/public/tenant-check/${identifier}`;
      console.log('📡 Fetching tenant info from:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Tenant not found');
      }

      const responseData = await response.json();
      console.log('✅ Tenant data received:', responseData);

      // API returns: { success: true, data: { id, identifier, name, ... } }
      const tenantData = responseData.data || responseData;

      const tenantInfo: TenantInfo = {
        id: tenantData.id,
        identifier: tenantData.identifier,
        name: tenantData.name,
        domain: tenantData.domain,
        isActive: tenantData.isActive,
      };

      setTenant(tenantInfo);

      // ❌ REMOVED: localStorage tenant storage - using cookies instead
      // Backend uses tenant-code cookie + JWT token for tenant resolution
      // localStorage.setItem('tenantId', tenantInfo.id);
      // localStorage.setItem('tenantIdentifier', tenantInfo.identifier);

      console.log('✅ Tenant loaded:', {
        id: tenantInfo.id,
        identifier: tenantInfo.identifier,
      });

      return true;
    } catch (error) {
      console.error('❌ Tenant validation failed:', error);
      setTenant(null);
      // Use hard redirect to prevent React re-render loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/invalid-tenant') {
        window.location.href = '/invalid-tenant';
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }

    // Skip tenant validation if auth bypassed
    if (isAuthBypassed) {
      console.log('🔓 Tenant bypassed - using dev mock tenant');
      hasInitialized.current = true;
      return;
    }

    // Skip tenant validation for temporarily bypassed subdomains (Coolify preview, etc.)
    if (shouldBypassTenantValidation()) {
      const subdomain = window.location.hostname.split('.')[0];
      console.log('🔓 Temporary subdomain bypass - using mock tenant for:', subdomain);
      setTenant(createBypassTenant(subdomain));
      setIsLoading(false);
      hasInitialized.current = true;
      return;
    }

    // Skip tenant validation on invalid-tenant page to prevent infinite loop
    if (typeof window !== 'undefined' && window.location.pathname === '/invalid-tenant') {
      console.log('⏭️ Skipping tenant validation on invalid-tenant page');
      setIsLoading(false);
      hasInitialized.current = true;
      return;
    }

    const initializeTenant = async () => {
      hasInitialized.current = true;
      setIsLoading(true);
      await validateTenant();
      setIsLoading(false);
    };

    initializeTenant();
  }, [isAuthBypassed]);

  const value: TenantContextType = {
    tenant,
    isLoading,
    isValidating,
    setTenant,
    validateTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
