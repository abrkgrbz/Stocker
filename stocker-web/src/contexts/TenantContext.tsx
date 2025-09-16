import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTenantSlugFromDomain, isTenantDomain } from '@/utils/tenant';

interface TenantContextType {
  tenantSlug: string | null;
  tenantId: string | null;
  isSubdomain: boolean;
  setTenantId: (id: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantSlug] = useState<string | null>(getTenantSlugFromDomain());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const isSubdomain = isTenantDomain();

  useEffect(() => {
    // If we're on a subdomain, we need to fetch the tenant ID from the slug
    if (tenantSlug && !tenantId) {
      // This will be set when user logs in or from stored auth
      const storedTenantId = localStorage.getItem('tenant_id');
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }
  }, [tenantSlug, tenantId]);

  return (
    <TenantContext.Provider value={{ tenantSlug, tenantId, isSubdomain, setTenantId }}>
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