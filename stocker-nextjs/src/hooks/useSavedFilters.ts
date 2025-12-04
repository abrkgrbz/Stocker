'use client';

import { useState, useEffect, useCallback } from 'react';

// Filter types for different entities
export interface SavedFilter {
  id: string;
  name: string;
  entityType: FilterEntityType;
  filters: Record<string, unknown>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FilterEntityType =
  | 'stock-movements'
  | 'stock-transfers'
  | 'stock-counts'
  | 'stock-reservations'
  | 'products'
  | 'warehouses'
  | 'suppliers'
  | 'lot-batches'
  | 'serial-numbers';

// Predefined filter templates
export interface FilterTemplate {
  id: string;
  name: string;
  description: string;
  entityType: FilterEntityType;
  filters: Record<string, unknown>;
  icon?: string;
}

// Storage key prefix
const STORAGE_KEY_PREFIX = 'stocker_saved_filters_';
const ACTIVE_FILTER_KEY_PREFIX = 'stocker_active_filter_';

// Get storage key for entity type
const getStorageKey = (entityType: FilterEntityType) => `${STORAGE_KEY_PREFIX}${entityType}`;
const getActiveFilterKey = (entityType: FilterEntityType) => `${ACTIVE_FILTER_KEY_PREFIX}${entityType}`;

// Predefined templates for common filter scenarios
export const filterTemplates: FilterTemplate[] = [
  // Stock Movements Templates
  {
    id: 'movements-today',
    name: 'Bugünün Hareketleri',
    description: 'Son 24 saatteki tüm stok hareketleri',
    entityType: 'stock-movements',
    filters: { datePreset: 'today' },
    icon: '📅',
  },
  {
    id: 'movements-week',
    name: 'Bu Hafta',
    description: 'Son 7 günün stok hareketleri',
    entityType: 'stock-movements',
    filters: { datePreset: 'week' },
    icon: '📆',
  },
  {
    id: 'movements-month',
    name: 'Bu Ay',
    description: 'Son 30 günün stok hareketleri',
    entityType: 'stock-movements',
    filters: { datePreset: 'month' },
    icon: '🗓️',
  },
  {
    id: 'movements-purchases',
    name: 'Satın Almalar',
    description: 'Sadece satın alma hareketleri',
    entityType: 'stock-movements',
    filters: { movementType: 'Purchase' },
    icon: '📥',
  },
  {
    id: 'movements-sales',
    name: 'Satışlar',
    description: 'Sadece satış hareketleri',
    entityType: 'stock-movements',
    filters: { movementType: 'Sales' },
    icon: '📤',
  },
  {
    id: 'movements-transfers',
    name: 'Transferler',
    description: 'Sadece transfer hareketleri',
    entityType: 'stock-movements',
    filters: { movementType: 'Transfer' },
    icon: '🔄',
  },
  {
    id: 'movements-adjustments',
    name: 'Düzeltmeler',
    description: 'Stok düzeltme hareketleri',
    entityType: 'stock-movements',
    filters: { movementTypes: ['AdjustmentIncrease', 'AdjustmentDecrease'] },
    icon: '⚖️',
  },

  // Stock Transfers Templates
  {
    id: 'transfers-pending',
    name: 'Bekleyen Transferler',
    description: 'Onay bekleyen transferler',
    entityType: 'stock-transfers',
    filters: { status: 'Pending' },
    icon: '⏳',
  },
  {
    id: 'transfers-intransit',
    name: 'Yolda Olan Transferler',
    description: 'Şu an yolda olan transferler',
    entityType: 'stock-transfers',
    filters: { status: 'InTransit' },
    icon: '🚚',
  },
  {
    id: 'transfers-completed-week',
    name: 'Bu Hafta Tamamlanan',
    description: 'Son 7 günde tamamlanan transferler',
    entityType: 'stock-transfers',
    filters: { status: 'Completed', datePreset: 'week' },
    icon: '✅',
  },

  // Stock Counts Templates
  {
    id: 'counts-inprogress',
    name: 'Devam Eden Sayımlar',
    description: 'Şu an devam eden sayımlar',
    entityType: 'stock-counts',
    filters: { status: 'InProgress' },
    icon: '🔄',
  },
  {
    id: 'counts-with-differences',
    name: 'Farklı Olan Sayımlar',
    description: 'Fark bulunan sayımlar',
    entityType: 'stock-counts',
    filters: { hasDifferences: true },
    icon: '⚠️',
  },
  {
    id: 'counts-pending-approval',
    name: 'Onay Bekleyenler',
    description: 'Onay bekleyen sayımlar',
    entityType: 'stock-counts',
    filters: { status: 'Completed' },
    icon: '📋',
  },

  // Products Templates
  {
    id: 'products-low-stock',
    name: 'Düşük Stoklu Ürünler',
    description: 'Minimum stok seviyesinin altındaki ürünler',
    entityType: 'products',
    filters: { stockLevel: 'low' },
    icon: '📉',
  },
  {
    id: 'products-out-of-stock',
    name: 'Stokta Olmayan',
    description: 'Stok miktarı 0 olan ürünler',
    entityType: 'products',
    filters: { stockLevel: 'zero' },
    icon: '❌',
  },
  {
    id: 'products-active',
    name: 'Aktif Ürünler',
    description: 'Sadece aktif ürünler',
    entityType: 'products',
    filters: { isActive: true },
    icon: '✅',
  },

  // Lot Batches Templates
  {
    id: 'lots-expiring-soon',
    name: 'SKT Yaklaşanlar',
    description: 'Son kullanma tarihi yaklaşan lotlar',
    entityType: 'lot-batches',
    filters: { expiryPreset: 'soon' },
    icon: '⏰',
  },
  {
    id: 'lots-expired',
    name: 'Süresi Dolanlar',
    description: 'Son kullanma tarihi geçmiş lotlar',
    entityType: 'lot-batches',
    filters: { expiryPreset: 'expired' },
    icon: '🚫',
  },
];

// Generate unique ID
const generateId = () => `filter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Hook for managing saved filters
export function useSavedFilters(entityType: FilterEntityType) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilter, setActiveFilterState] = useState<SavedFilter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get templates for this entity type
  const templates = filterTemplates.filter((t) => t.entityType === entityType);

  // Load saved filters from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const storageKey = getStorageKey(entityType);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(parsed);
      } else {
        setSavedFilters([]);
      }

      // Load active filter
      const activeKey = getActiveFilterKey(entityType);
      const activeStored = localStorage.getItem(activeKey);
      if (activeStored) {
        const activeParsed = JSON.parse(activeStored) as SavedFilter;
        setActiveFilterState(activeParsed);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
      setSavedFilters([]);
    } finally {
      setIsLoading(false);
    }
  }, [entityType]);

  // Save filters to localStorage
  const persistFilters = useCallback(
    (filters: SavedFilter[]) => {
      try {
        const storageKey = getStorageKey(entityType);
        localStorage.setItem(storageKey, JSON.stringify(filters));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    },
    [entityType]
  );

  // Save active filter to localStorage
  const persistActiveFilter = useCallback(
    (filter: SavedFilter | null) => {
      try {
        const activeKey = getActiveFilterKey(entityType);
        if (filter) {
          localStorage.setItem(activeKey, JSON.stringify(filter));
        } else {
          localStorage.removeItem(activeKey);
        }
      } catch (error) {
        console.error('Error saving active filter:', error);
      }
    },
    [entityType]
  );

  // Save a new filter
  const saveFilter = useCallback(
    (name: string, filters: Record<string, unknown>, isDefault = false): SavedFilter => {
      const now = new Date().toISOString();
      const newFilter: SavedFilter = {
        id: generateId(),
        name,
        entityType,
        filters,
        isDefault,
        createdAt: now,
        updatedAt: now,
      };

      // If this is default, remove default from others
      let updatedFilters = savedFilters;
      if (isDefault) {
        updatedFilters = savedFilters.map((f) => ({ ...f, isDefault: false }));
      }

      const newFilters = [...updatedFilters, newFilter];
      setSavedFilters(newFilters);
      persistFilters(newFilters);

      return newFilter;
    },
    [entityType, savedFilters, persistFilters]
  );

  // Update an existing filter
  const updateFilter = useCallback(
    (id: string, updates: Partial<Pick<SavedFilter, 'name' | 'filters' | 'isDefault'>>): SavedFilter | null => {
      const index = savedFilters.findIndex((f) => f.id === id);
      if (index === -1) return null;

      let updatedFilters = [...savedFilters];

      // If setting as default, remove default from others
      if (updates.isDefault) {
        updatedFilters = updatedFilters.map((f) => ({ ...f, isDefault: false }));
      }

      const updatedFilter: SavedFilter = {
        ...updatedFilters[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      updatedFilters[index] = updatedFilter;
      setSavedFilters(updatedFilters);
      persistFilters(updatedFilters);

      // Update active filter if it's the one being updated
      if (activeFilter?.id === id) {
        setActiveFilterState(updatedFilter);
        persistActiveFilter(updatedFilter);
      }

      return updatedFilter;
    },
    [savedFilters, activeFilter, persistFilters, persistActiveFilter]
  );

  // Delete a filter
  const deleteFilter = useCallback(
    (id: string): boolean => {
      const index = savedFilters.findIndex((f) => f.id === id);
      if (index === -1) return false;

      const newFilters = savedFilters.filter((f) => f.id !== id);
      setSavedFilters(newFilters);
      persistFilters(newFilters);

      // Clear active filter if it's the one being deleted
      if (activeFilter?.id === id) {
        setActiveFilterState(null);
        persistActiveFilter(null);
      }

      return true;
    },
    [savedFilters, activeFilter, persistFilters, persistActiveFilter]
  );

  // Set active filter
  const setActiveFilter = useCallback(
    (filter: SavedFilter | null) => {
      setActiveFilterState(filter);
      persistActiveFilter(filter);
    },
    [persistActiveFilter]
  );

  // Apply a template as active filter
  const applyTemplate = useCallback(
    (templateId: string): SavedFilter | null => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return null;

      const tempFilter: SavedFilter = {
        id: `template_${templateId}`,
        name: template.name,
        entityType: template.entityType,
        filters: template.filters,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveFilterState(tempFilter);
      // Don't persist template filters - they're temporary
      return tempFilter;
    },
    [templates]
  );

  // Clear active filter
  const clearActiveFilter = useCallback(() => {
    setActiveFilterState(null);
    persistActiveFilter(null);
  }, [persistActiveFilter]);

  // Get default filter
  const getDefaultFilter = useCallback((): SavedFilter | null => {
    return savedFilters.find((f) => f.isDefault) || null;
  }, [savedFilters]);

  // Check if a filter with the same name exists
  const filterExists = useCallback(
    (name: string): boolean => {
      return savedFilters.some((f) => f.name.toLowerCase() === name.toLowerCase());
    },
    [savedFilters]
  );

  return {
    // State
    savedFilters,
    activeFilter,
    templates,
    isLoading,

    // Actions
    saveFilter,
    updateFilter,
    deleteFilter,
    setActiveFilter,
    applyTemplate,
    clearActiveFilter,
    getDefaultFilter,
    filterExists,
  };
}

// Helper to convert date presets to actual dates
export function resolveDatePreset(preset: string): { start: Date; end: Date } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        start: today,
        end: now,
      };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: yesterday,
        end: today,
      };
    }
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        start: weekAgo,
        end: now,
      };
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return {
        start: monthAgo,
        end: now,
      };
    }
    case 'quarter': {
      const quarterAgo = new Date(today);
      quarterAgo.setDate(quarterAgo.getDate() - 90);
      return {
        start: quarterAgo,
        end: now,
      };
    }
    case 'year': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return {
        start: yearAgo,
        end: now,
      };
    }
    default:
      return null;
  }
}

// Helper to resolve expiry presets
export function resolveExpiryPreset(preset: string): { start: Date | null; end: Date | null } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'expired':
      return {
        start: null,
        end: today,
      };
    case 'soon': {
      const soonDate = new Date(today);
      soonDate.setDate(soonDate.getDate() + 30);
      return {
        start: today,
        end: soonDate,
      };
    }
    case 'this-month': {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: today,
        end: endOfMonth,
      };
    }
    case 'this-quarter': {
      const quarterEnd = new Date(today);
      quarterEnd.setDate(quarterEnd.getDate() + 90);
      return {
        start: today,
        end: quarterEnd,
      };
    }
    default:
      return { start: null, end: null };
  }
}
