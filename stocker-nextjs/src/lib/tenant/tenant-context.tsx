'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { extractTenantSubdomain } from '@/lib/utils/auth';

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
