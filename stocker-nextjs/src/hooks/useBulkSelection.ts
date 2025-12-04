'use client';

import { useState, useCallback, useMemo } from 'react';

export interface BulkSelectionConfig<T> {
  items: T[];
  getItemId: (item: T) => string | number;
  maxSelections?: number;
}

export interface BulkSelectionState<T> {
  selectedIds: Set<string | number>;
  selectedItems: T[];
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectionCount: number;
}

export interface BulkSelectionActions {
  select: (id: string | number) => void;
  deselect: (id: string | number) => void;
  toggle: (id: string | number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  selectRange: (startId: string | number, endId: string | number) => void;
  isSelected: (id: string | number) => boolean;
  clear: () => void;
}

export function useBulkSelection<T>(
  config: BulkSelectionConfig<T>
): BulkSelectionState<T> & BulkSelectionActions {
  const { items, getItemId, maxSelections } = config;
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Compute derived state
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && items.every((item) => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  const isPartiallySelected = useMemo(() => {
    const selectedCount = items.filter((item) => selectedIds.has(getItemId(item))).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [items, selectedIds, getItemId]);

  const selectionCount = selectedIds.size;

  // Actions
  const select = useCallback(
    (id: string | number) => {
      setSelectedIds((prev) => {
        if (maxSelections && prev.size >= maxSelections) {
          return prev;
        }
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    },
    [maxSelections]
  );

  const deselect = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback(
    (id: string | number) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (maxSelections && next.size >= maxSelections) {
            return prev;
          }
          next.add(id);
        }
        return next;
      });
    },
    [maxSelections]
  );

  const selectAll = useCallback(() => {
    const allIds = items.map(getItemId);
    if (maxSelections) {
      setSelectedIds(new Set(allIds.slice(0, maxSelections)));
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [items, getItemId, maxSelections]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, deselectAll]);

  const selectRange = useCallback(
    (startId: string | number, endId: string | number) => {
      const startIndex = items.findIndex((item) => getItemId(item) === startId);
      const endIndex = items.findIndex((item) => getItemId(item) === endId);

      if (startIndex === -1 || endIndex === -1) return;

      const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
      const rangeItems = items.slice(from, to + 1);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        rangeItems.forEach((item) => {
          if (!maxSelections || next.size < maxSelections) {
            next.add(getItemId(item));
          }
        });
        return next;
      });
    },
    [items, getItemId, maxSelections]
  );

  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  );

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    // State
    selectedIds,
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    selectionCount,

    // Actions
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectRange,
    isSelected,
    clear,
  };
}

// Hook for bulk actions with confirmation and progress tracking
export interface BulkActionConfig<T, R = void> {
  action: (items: T[]) => Promise<R>;
  onSuccess?: (result: R, items: T[]) => void;
  onError?: (error: Error, items: T[]) => void;
  onProgress?: (completed: number, total: number) => void;
  confirmMessage?: string | ((items: T[]) => string);
  successMessage?: string | ((result: R, items: T[]) => string);
  errorMessage?: string | ((error: Error, items: T[]) => string);
}

export interface BulkActionState {
  isExecuting: boolean;
  progress: number;
  total: number;
  error: Error | null;
}

export function useBulkAction<T, R = void>(config: BulkActionConfig<T, R>) {
  const [state, setState] = useState<BulkActionState>({
    isExecuting: false,
    progress: 0,
    total: 0,
    error: null,
  });

  const execute = useCallback(
    async (items: T[]): Promise<R | undefined> => {
      if (items.length === 0) return undefined;

      setState({
        isExecuting: true,
        progress: 0,
        total: items.length,
        error: null,
      });

      try {
        const result = await config.action(items);
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          progress: items.length,
        }));
        config.onSuccess?.(result, items);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({
          ...prev,
          isExecuting: false,
          error: err,
        }));
        config.onError?.(err, items);
        return undefined;
      }
    },
    [config]
  );

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      progress: 0,
      total: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
