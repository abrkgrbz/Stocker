import { useState, useMemo, useCallback } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

interface UseSortResult<T> {
  sortedData: T[];
  sortConfig: SortConfig<T>;
  requestSort: (key: keyof T) => void;
  clearSort: () => void;
}

export function useSort<T>(
  data: T[],
  defaultSortKey?: keyof T,
  defaultDirection: SortDirection = 'asc'
): UseSortResult<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: defaultSortKey || null,
    direction: defaultSortKey ? defaultDirection : null,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  const requestSort = useCallback((key: keyof T) => {
    setSortConfig((prevConfig) => {
      let direction: SortDirection = 'asc';

      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          direction = 'desc';
        } else if (prevConfig.direction === 'desc') {
          direction = null;
        }
      }

      return { key: direction ? key : null, direction };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: null });
  }, []);

  return {
    sortedData,
    sortConfig,
    requestSort,
    clearSort,
  };
}

export default useSort;