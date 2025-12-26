'use client';

/**
 * =====================================
 * TABS COMPONENT
 * =====================================
 *
 * Tab navigation with panels.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/cn';

// =====================================
// TYPES
// =====================================

export interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

// =====================================
// TABS CONTEXT
// =====================================

interface TabsContextType {
  variant: 'underline' | 'pills' | 'bordered';
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
}

const TabsContext = createContext<TabsContextType>({
  variant: 'underline',
  size: 'md',
  fullWidth: false,
});

// =====================================
// TABS PROPS
// =====================================

export interface TabsProps {
  /** Tab items */
  items: TabItem[];
  /** Active tab key (controlled) */
  activeKey?: string;
  /** Default active tab key */
  defaultActiveKey?: string;
  /** Change handler */
  onChange?: (key: string) => void;
  /** Visual variant */
  variant?: 'underline' | 'pills' | 'bordered';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional class names */
  className?: string;
  /** Tab list class names */
  tabListClassName?: string;
  /** Children (TabPanels) */
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

// =====================================
// TABS COMPONENT
// =====================================

export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
  tabListClassName,
  children,
}: TabsProps) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || items[0]?.key || ''
  );

  const currentKey = activeKey ?? internalActiveKey;
  const currentIndex = items.findIndex((item) => item.key === currentKey);

  const handleChange = useCallback(
    (index: number) => {
      const item = items[index];
      if (item && !item.disabled) {
        setInternalActiveKey(item.key);
        onChange?.(item.key);
      }
    },
    [items, onChange]
  );

  return (
    <TabsContext.Provider value={{ variant, size, fullWidth }}>
      <Tab.Group
        selectedIndex={currentIndex >= 0 ? currentIndex : 0}
        onChange={handleChange}
      >
        <Tab.List
          className={cn(
            'flex',
            variant === 'underline' && 'border-b border-slate-200',
            variant === 'pills' && 'gap-1 p-1 bg-slate-100 rounded-lg',
            variant === 'bordered' && 'gap-1',
            fullWidth && 'w-full',
            tabListClassName
          )}
        >
          {items.map((item) => (
            <Tab
              key={item.key}
              disabled={item.disabled}
              className={({ selected }) =>
                cn(
                  'relative outline-none transition-all duration-200',
                  'flex items-center gap-2',
                  sizeClasses[size],
                  fullWidth && 'flex-1 justify-center',

                  // Underline variant
                  variant === 'underline' && [
                    'font-medium -mb-px',
                    selected
                      ? 'text-slate-900 border-b-2 border-slate-900'
                      : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent',
                  ],

                  // Pills variant
                  variant === 'pills' && [
                    'rounded-md font-medium',
                    selected
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
                  ],

                  // Bordered variant
                  variant === 'bordered' && [
                    'rounded-lg font-medium border',
                    selected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  ],

                  // Disabled state
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                    'bg-slate-200 text-slate-600'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Tab>
          ))}
        </Tab.List>

        {children && (
          <Tab.Panels className="mt-4">
            {children}
          </Tab.Panels>
        )}
      </Tab.Group>
    </TabsContext.Provider>
  );
}

// =====================================
// TAB PANEL
// =====================================

export interface TabPanelProps {
  /** Panel content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <Tab.Panel
      className={cn(
        'outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 rounded-lg',
        className
      )}
    >
      {children}
    </Tab.Panel>
  );
}

// =====================================
// SIMPLE TABS (No panels, just navigation)
// =====================================

export interface SimpleTabsProps {
  /** Tab items */
  items: TabItem[];
  /** Active tab key */
  activeKey: string;
  /** Change handler */
  onChange: (key: string) => void;
  /** Visual variant */
  variant?: 'underline' | 'pills' | 'bordered';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional class names */
  className?: string;
}

export function SimpleTabs({
  items,
  activeKey,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
}: SimpleTabsProps) {
  return (
    <div
      className={cn(
        'flex',
        variant === 'underline' && 'border-b border-slate-200',
        variant === 'pills' && 'gap-1 p-1 bg-slate-100 rounded-lg',
        variant === 'bordered' && 'gap-1',
        fullWidth && 'w-full',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => !item.disabled && onChange(item.key)}
          disabled={item.disabled}
          className={cn(
            'relative outline-none transition-all duration-200',
            'flex items-center gap-2',
            sizeClasses[size],
            fullWidth && 'flex-1 justify-center',

            // Underline variant
            variant === 'underline' && [
              'font-medium -mb-px',
              activeKey === item.key
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent',
            ],

            // Pills variant
            variant === 'pills' && [
              'rounded-md font-medium',
              activeKey === item.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
            ],

            // Bordered variant
            variant === 'bordered' && [
              'rounded-lg font-medium border',
              activeKey === item.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ],

            // Disabled state
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                'bg-slate-200 text-slate-600'
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
