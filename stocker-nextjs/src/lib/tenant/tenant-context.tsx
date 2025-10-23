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

      // Store in localStorage for quick access
      localStorage.setItem('tenantId', tenantInfo.id);
      localStorage.setItem('tenantIdentifier', tenantInfo.identifier);

      console.log('💾 Saved to localStorage:', {
        tenantId: tenantInfo.id,
        tenantIdentifier: tenantInfo.identifier,
      });

      return true;
    } catch (error) {
      console.error('❌ Tenant validation failed:', error);
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
