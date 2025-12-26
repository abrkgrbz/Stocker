'use client';

/**
 * =====================================
 * LIST PATTERN COMPONENTS
 * =====================================
 *
 * Enterprise list patterns following
 * Linear/Raycast/Vercel design principles.
 *
 * Features:
 * - Stacked list layouts
 * - Collapsible sections (accordion)
 * - Data table wrappers
 */

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// LIST CONTAINER
// =====================================

export interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}

export function ListContainer({
  children,
  className,
  divided = true,
}: ListContainerProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg',
        divided && 'divide-y divide-slate-100',
        className
      )}
    >
      {children}
    </div>
  );
}

// =====================================
// LIST ITEM
// =====================================

export interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
  active?: boolean;
  disabled?: boolean;
}

export function ListItem({
  children,
  onClick,
  className,
  hoverable = true,
  active = false,
  disabled = false,
}: ListItemProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'flex items-center justify-between py-3 px-4',
        hoverable && !disabled && 'hover:bg-slate-50',
        onClick && !disabled && 'cursor-pointer',
        active && 'bg-slate-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </div>
  );
}

// =====================================
// COLLAPSIBLE SECTION (Accordion)
// =====================================

export interface CollapsibleSectionProps {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  icon,
  iconColor = '#6366f1',
  title,
  subtitle,
  badge,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggle,
  children,
  headerActions,
  className,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newValue = !expanded;
    if (isControlled && onToggle) {
      onToggle(newValue);
    } else {
      setInternalExpanded(newValue);
    }
  };

  return (
    <div className={cn('mb-4', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between py-3 px-4',
          'bg-white border border-slate-200 rounded-lg',
          'cursor-pointer hover:bg-slate-50 transition-colors'
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <span style={{ color: iconColor }} className="text-sm">
                {icon}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{title}</span>
              {badge}
            </div>
            {subtitle && (
              <span className="text-xs text-slate-400">{subtitle}</span>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {headerActions}
          <ChevronDownIcon
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="mt-1 bg-white border border-slate-200 rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
}

// =====================================
// DATA TABLE WRAPPER
// =====================================

export interface DataTableWrapperProps {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

export function DataTableWrapper({
  children,
  className,
  noBorder = false,
}: DataTableWrapperProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg overflow-hidden',
        !noBorder && 'border border-slate-200',
        className
      )}
    >
      {children}
    </div>
  );
}

// =====================================
// SETTINGS LIST (Key-Value Pattern)
// =====================================

export interface SettingsListItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsListItem({
  label,
  description,
  children,
  className,
}: SettingsListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-4 px-4',
        className
      )}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default ListContainer;
