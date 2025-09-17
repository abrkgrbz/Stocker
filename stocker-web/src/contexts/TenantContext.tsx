import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTenantSlugFromDomain, isTenantDomain } from '@/utils/tenant';

interface TenantFeature {
  name: string;
  enabled: boolean;
}

interface TenantSettings {
  theme?: string;
  language?: string;
  features?: TenantFeature[];
  [key: string]: any;
}

interface TenantContextType {
  tenantSlug: string | null;
  tenantId: string | null;
  isSubdomain: boolean;
  isValidTenant: boolean | null; // null = checking, true = valid, false = invalid
  setTenantId: (id: string | null) => void;
  tenantSettings?: TenantSettings;
  hasFeature: (featureName: string) => boolean;
  switchTenant: (newSlug: string) => Promise<void>;
  updateTenantSettings: (settings: Partial<TenantSettings>) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantSlug, setTenantSlug] = useState<string | null>(getTenantSlugFromDomain());
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isValidTenant, setIsValidTenant] = useState<boolean | null>(null);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | undefined>(undefined);
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
          // Store tenant settings if available
          if (data.settings) {
            setTenantSettings(data.settings);
            localStorage.setItem('tenant_settings', JSON.stringify(data.settings));
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
      
      // Load tenant settings from storage
      const storedSettings = localStorage.getItem('tenant_settings');
      if (storedSettings && !tenantSettings) {
        try {
          setTenantSettings(JSON.parse(storedSettings));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            // Error handling removed for production
          }
        }
      }
    }
  }, [tenantSlug, tenantId, isValidTenant]);

  const hasFeature = (featureName: string): boolean => {
    if (!tenantSettings?.features) return false;
    const feature = tenantSettings.features.find((f) => f.name === featureName);
    return feature?.enabled ?? false;
  };

  const switchTenant = async (newSlug: string): Promise<void> => {
    // Clear current tenant data
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_settings');
    setTenantId(null);
    setTenantSettings(undefined);
    setTenantSlug(newSlug);
    setIsValidTenant(null);
    
    // Validate new tenant
    if (newSlug) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.stoocker.app';
        const response = await fetch(`${apiUrl}/api/public/tenants/check/${newSlug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setIsValidTenant(true);
            if (data.id) {
              setTenantId(data.id);
              localStorage.setItem('tenant_id', data.id);
            }
            if (data.settings) {
              setTenantSettings(data.settings);
              localStorage.setItem('tenant_settings', JSON.stringify(data.settings));
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
    }
  };

  const updateTenantSettings = (settings: Partial<TenantSettings>): void => {
    const newSettings = { ...tenantSettings, ...settings };
    setTenantSettings(newSettings);
    localStorage.setItem('tenant_settings', JSON.stringify(newSettings));
  };

  return (
    <TenantContext.Provider value={{ 
      tenantSlug, 
      tenantId, 
      isSubdomain, 
      isValidTenant, 
      setTenantId,
      tenantSettings,
      hasFeature,
      switchTenant,
      updateTenantSettings
    }}>
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