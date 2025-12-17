'use client';

/**
 * Enterprise Design System Components
 * Following Linear/Raycast/Vercel/Stripe design principles
 *
 * Core Principles:
 * - Clean white cards with subtle borders (border-slate-200)
 * - No colored backgrounds on cards
 * - Accent colors only on icons and critical elements
 * - Sticky action bars instead of scattered buttons
 * - max-w-5xl/max-w-7xl containers for readability
 * - Stacked list layouts for settings
 */

import React from 'react';
import { Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// ============================================
// PAGE LAYOUTS
// ============================================

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  withStickyBar?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'w-full',
};

export function PageContainer({
  children,
  maxWidth = '5xl',
  className = '',
  withStickyBar = false
}: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-slate-50 ${withStickyBar ? 'pb-20' : ''} ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 py-8`}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// HEADERS
// ============================================

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backUrl, actions }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backUrl && (
              <button
                onClick={() => router.push(backUrl)}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ArrowLeftOutlined />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ListPageHeaderProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  description?: string;
  itemCount?: number;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: React.ReactNode;
}

export function ListPageHeader({
  icon,
  iconColor = '#6366f1',
  title,
  description,
  itemCount,
  primaryAction,
  secondaryActions,
}: ListPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <span style={{ color: iconColor }} className="text-lg">
            {icon}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            {itemCount !== undefined && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {secondaryActions}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CARDS
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CardHeader({ title, description, actions }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-medium text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

// ============================================
// SECTIONS
// ============================================

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-sm font-medium text-slate-900">{title}</h2>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================
// STICKY ACTION BAR
// ============================================

interface StickyActionBarProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
}

export function StickyActionBar({ children, leftContent }: StickyActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {leftContent}
          </div>
          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BUTTONS
// ============================================

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const buttonVariants = {
  primary: 'text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400',
  secondary: 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
    >
      {loading ? <Spin size="small" /> : icon}
      {children}
    </button>
  );
}

// ============================================
// LIST ITEMS (Stacked List Pattern)
// ============================================

interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export function ListItem({ children, onClick, className = '', hoverable = true }: ListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-between py-3 px-4 border-b border-slate-100 last:border-b-0
        ${hoverable ? 'hover:bg-slate-50 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ListContainer({ children, className = '' }: ListContainerProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// BADGES & TAGS
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const badgeVariants = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${badgeVariants[variant]} ${badgeSizes[size]}`}>
      {children}
    </span>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============================================
// LOADING STATE
// ============================================

export function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
}

// ============================================
// COLLAPSIBLE SECTION (Accordion Pattern)
// ============================================

interface CollapsibleSectionProps {
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function CollapsibleSection({
  icon,
  iconColor = '#6366f1',
  title,
  subtitle,
  badge,
  isExpanded,
  onToggle,
  children,
  headerActions,
}: CollapsibleSectionProps) {
  return (
    <div className="mb-4">
      {/* Header */}
      <div
        className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
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
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          {headerActions}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="mt-1 bg-white border border-slate-200 rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// DATA TABLE WRAPPER
// ============================================

interface DataTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableWrapper({ children, className = '' }: DataTableWrapperProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// STAT CARD (for dashboard metrics)
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ label, value, icon, iconColor = '#6366f1', trend }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
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
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// ICON COLORS FOR MODULES
// ============================================

export const MODULE_COLORS: Record<string, string> = {
  CORE: '#6366f1',
  INVENTORY: '#8b5cf6',
  SALES: '#10b981',
  PURCHASE: '#f59e0b',
  CRM: '#3b82f6',
  HR: '#ec4899',
  FINANCE: '#14b8a6',
  CMS: '#f97316',
  SETTINGS: '#64748b',
  DEPARTMENTS: '#8b5cf6',
  ROLES: '#6366f1',
  USERS: '#3b82f6',
};

export function getModuleColor(moduleCode: string): string {
  return MODULE_COLORS[moduleCode.toUpperCase()] || '#6366f1';
}
