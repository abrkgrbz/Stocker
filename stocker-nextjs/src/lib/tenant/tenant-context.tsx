'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TenantInfo {
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

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantInfo | null>(initialTenant || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const extractTenantIdentifier = (): string | null => {
    if (typeof window === 'undefined') return null;

    const hostname = window.location.hostname;

    // Skip tenant extraction for localhost
    if (hostname.includes('localhost') || hostname === '127.0.0.1') {
      return null;
    }

    // Skip tenant extraction for auth subdomain
    if (hostname.startsWith('auth.')) {
      return null;
    }

    // Extract base domain from hostname
    const parts = hostname.split('.');
    const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;

    // Skip tenant extraction for root domain
    if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      return null;
    }

    const mode = process.env.NEXT_PUBLIC_TENANT_MODE || 'subdomain';

    switch (mode) {
      case 'subdomain': {
        // If hostname is like tenant.stocker.com, extract "tenant"
        if (parts.length >= 3) {
          return parts[0];
        }
        return null;
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

    if (!identifier) {
      setTenant(null);
      return false;
    }

    setIsValidating(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/tenant-check/${identifier}`);

      if (!response.ok) {
        throw new Error('Tenant not found');
      }

      const tenantData = await response.json();

      const tenantInfo: TenantInfo = {
        id: tenantData.id,
        identifier: tenantData.identifier,
        name: tenantData.name,
        domain: tenantData.domain,
        isActive: tenantData.isActive,
      };

      setTenant(tenantInfo);

      // Store in localStorage for quick access
      localStorage.setItem('tenantId', tenantInfo.id);
      localStorage.setItem('tenantIdentifier', tenantInfo.identifier);

      return true;
    } catch (error) {
      console.error('Tenant validation failed:', error);
      setTenant(null);
      router.push('/invalid-tenant');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    const initializeTenant = async () => {
      setIsLoading(true);
      await validateTenant();
      setIsLoading(false);
    };

    initializeTenant();
  }, []);

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
