'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layout, Layouts } from 'react-grid-layout';

import logger from '../lib/utils/logger';
const STORAGE_KEY = 'dashboard-layout';

export interface DashboardLayoutState {
  layouts: Layouts;
  setLayouts: (layouts: Layouts) => void;
  resetLayouts: () => void;
}

const defaultLayouts: Layouts = {
  lg: [
    { i: 'sales-chart', x: 0, y: 0, w: 6, h: 5 },
    { i: 'inventory-chart', x: 6, y: 0, w: 6, h: 5 },
    { i: 'customer-chart', x: 0, y: 5, w: 6, h: 5 },
    { i: 'financial-chart', x: 6, y: 5, w: 6, h: 5 },
  ],
  md: [
    { i: 'sales-chart', x: 0, y: 0, w: 10, h: 5 },
    { i: 'inventory-chart', x: 0, y: 5, w: 10, h: 5 },
    { i: 'customer-chart', x: 0, y: 10, w: 10, h: 5 },
    { i: 'financial-chart', x: 0, y: 15, w: 10, h: 5 },
  ],
  sm: [
    { i: 'sales-chart', x: 0, y: 0, w: 6, h: 5 },
    { i: 'inventory-chart', x: 0, y: 5, w: 6, h: 5 },
    { i: 'customer-chart', x: 0, y: 10, w: 6, h: 5 },
    { i: 'financial-chart', x: 0, y: 15, w: 6, h: 5 },
  ],
  xs: [
    { i: 'sales-chart', x: 0, y: 0, w: 4, h: 5 },
    { i: 'inventory-chart', x: 0, y: 5, w: 4, h: 5 },
    { i: 'customer-chart', x: 0, y: 10, w: 4, h: 5 },
    { i: 'financial-chart', x: 0, y: 15, w: 4, h: 5 },
  ],
  xxs: [
    { i: 'sales-chart', x: 0, y: 0, w: 2, h: 5 },
    { i: 'inventory-chart', x: 0, y: 5, w: 2, h: 5 },
    { i: 'customer-chart', x: 0, y: 10, w: 2, h: 5 },
    { i: 'financial-chart', x: 0, y: 15, w: 2, h: 5 },
  ],
};

export function useDashboardLayout(): DashboardLayoutState {
  const [layouts, setLayoutsState] = useState<Layouts>(defaultLayouts);

  // Load layouts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLayouts = localStorage.getItem(STORAGE_KEY);
      if (savedLayouts) {
        try {
          const parsed = JSON.parse(savedLayouts);
          setLayoutsState(parsed);
        } catch (error) {
          logger.error('Failed to parse saved layouts:', error);
        }
      }
    }
  }, []);

  // Save layouts to localStorage
  const setLayouts = useCallback((newLayouts: Layouts) => {
    setLayoutsState(newLayouts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayouts));
    }
  }, []);

  // Reset to default layouts
  const resetLayouts = useCallback(() => {
    setLayoutsState(defaultLayouts);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    layouts,
    setLayouts,
    resetLayouts,
  };
}
