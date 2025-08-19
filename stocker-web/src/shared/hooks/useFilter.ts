import { useState, useMemo, useCallback } from 'react';

type FilterFunction<T> = (item: T) => boolean;

interface FilterConfig {
  [key: string]: any;
}

interface UseFilterResult<T> {
  filteredData: T[];
  filters: FilterConfig;
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  applyCustomFilter: (filterFn: FilterFunction<T>) => void;
}

export function useFilter<T>(
  data: T[],
  initialFilters: FilterConfig = {}
): UseFilterResult<T> {
  const [filters, setFilters] = useState<FilterConfig>(initialFilters);
  const [customFilter, setCustomFilter] = useState<FilterFunction<T> | null>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply property-based filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter((item) => {
          const itemValue = (item as any)[key];

          // Handle different filter types
          if (typeof value === 'string') {
            // String search (case-insensitive)
            return String(itemValue).toLowerCase().includes(value.toLowerCase());
          } else if (Array.isArray(value)) {
            // Array includes filter
            return value.includes(itemValue);
          } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            // Range filter
            return itemValue >= value.min && itemValue <= value.max;
          } else if (typeof value === 'boolean') {
            // Boolean filter
            return itemValue === value;
          } else {
            // Exact match
            return itemValue === value;
          }
        });
      }
    });

    // Apply custom filter function if provided
    if (customFilter) {
      result = result.filter(customFilter);
    }

    return result;
  }, [data, filters, customFilter]);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCustomFilter(null);
  }, []);

  const applyCustomFilter = useCallback((filterFn: FilterFunction<T>) => {
    setCustomFilter(() => filterFn);
  }, []);

  return {
    filteredData,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    applyCustomFilter,
  };
}

export default useFilter;