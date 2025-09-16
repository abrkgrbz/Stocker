import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTenantSlugFromDomain, isTenantDomain } from '@/utils/tenant';

interface TenantContextType {
  tenantSlug: string | null;
  tenantId: string | null;
  isSubdomain: boolean;
  isValidTenant: boolean | null; // null = checking, true = valid, false = invalid
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantSlug] = useState<string | null>(getTenantSlugFromDomain());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isValidTenant, setIsValidTenant] = useState<boolean | null>(null);
  const isSubdomain = isTenantDomain();

  useEffect(() => {
    // If we're on a subdomain, validate the tenant exists
    if (isSubdomain && tenantSlug) {
      validateTenant();
    } else if (!isSubdomain) {
      // Not a subdomain, so it's valid (main domain)
      setIsValidTenant(true);
    }
  }, [tenantSlug, isSubdomain]);

  const validateTenant = async () => {
    if (!tenantSlug) {
      setIsValidTenant(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';
      const response = await fetch(`${apiUrl}/api/public/tenants/check/${tenantSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setIsValidTenant(true);
          // Store tenant data if needed
          if (data.id) {
            setTenantId(data.id);
            localStorage.setItem('tenant_id', data.id);
          }
        } else {
          setIsValidTenant(false);
        }
      } else {
        setIsValidTenant(false);
      }
    } catch (error) {
      setIsValidTenant(false);
    }
  };

  useEffect(() => {
    // If we're on a subdomain and tenant is valid, fetch the tenant ID from storage if not already set
    if (tenantSlug && isValidTenant && !tenantId) {
      const storedTenantId = localStorage.getItem('tenant_id');
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }
  }, [tenantSlug, tenantId, isValidTenant]);

  return (
    <TenantContext.Provider value={{ tenantSlug, tenantId, isSubdomain, isValidTenant, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};