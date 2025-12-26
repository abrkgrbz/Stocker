'use client';

/**
 * =====================================
 * ENTERPRISE BADGE COMPONENT
 * =====================================
 *
 * Status indicators and labels.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  outline?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

const variantClasses = {
  default: { filled: 'bg-slate-900 text-white', outline: 'bg-transparent text-slate-900 border border-slate-900' },
  success: { filled: 'bg-emerald-100 text-emerald-800', outline: 'bg-transparent text-emerald-700 border border-emerald-300' },
  warning: { filled: 'bg-amber-100 text-amber-800', outline: 'bg-transparent text-amber-700 border border-amber-300' },
  error: { filled: 'bg-red-100 text-red-800', outline: 'bg-transparent text-red-700 border border-red-300' },
  info: { filled: 'bg-blue-100 text-blue-800', outline: 'bg-transparent text-blue-700 border border-blue-300' },
  neutral: { filled: 'bg-slate-100 text-slate-700', outline: 'bg-transparent text-slate-600 border border-slate-300' },
};

const dotColors = {
  default: 'bg-slate-900',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
};

export function Badge({ variant = 'neutral', size = 'md', dot = false, outline = false, children, className }: BadgeProps) {
  const style = outline ? 'outline' : 'filled';

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap', sizeClasses[size], variantClasses[variant][style], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'published' | 'archived' | 'processing' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeProps['variant']; label: string }> = {
  active: { variant: 'success', label: 'Aktif' },
  inactive: { variant: 'neutral', label: 'Pasif' },
  pending: { variant: 'warning', label: 'Beklemede' },
  approved: { variant: 'success', label: 'Onaylandı' },
  rejected: { variant: 'error', label: 'Reddedildi' },
  draft: { variant: 'neutral', label: 'Taslak' },
  published: { variant: 'success', label: 'Yayında' },
  archived: { variant: 'neutral', label: 'Arşivlendi' },
  processing: { variant: 'info', label: 'İşleniyor' },
  completed: { variant: 'success', label: 'Tamamlandı' },
  cancelled: { variant: 'error', label: 'İptal Edildi' },
};

export function StatusBadge({ status, size = 'md', dot = true, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} dot={dot} className={className}>
      {label || config.label}
    </Badge>
  );
}

export default Badge;
