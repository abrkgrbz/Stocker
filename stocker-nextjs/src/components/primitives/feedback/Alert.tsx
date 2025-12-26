'use client';

/**
 * =====================================
 * ENTERPRISE ALERT COMPONENT
 * =====================================
 *
 * Alert/notification component with variants.
 * Features:
 * - Multiple variants (info, success, warning, error)
 * - Optional title and description
 * - Closable option
 * - Action button support
 */

import React, { useState } from 'react';
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

export interface AlertProps {
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Alert message/description */
  message?: string;
  /** Children content (alternative to message) */
  children?: React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Action element */
  action?: React.ReactNode;
  /** Show icon */
  showIcon?: boolean;
  /** Additional class names */
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-500',
    title: 'text-emerald-800',
    message: 'text-emerald-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-700',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
  },
};

const variantIcons = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
};

export function Alert({
  variant = 'info',
  title,
  message,
  children,
  closable = false,
  onClose,
  action,
  showIcon = true,
  className,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const content = children || message;

  return (
    <div
      role="alert"
      className={cn(
        'relative rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <div className="flex">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', styles.icon)} aria-hidden="true" />
          </div>
        )}

        {/* Content */}
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          {content && (
            <div className={cn('text-sm', styles.message, title && 'mt-1')}>
              {content}
            </div>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="ml-4 flex-shrink-0">{action}</div>
        )}

        {/* Close button */}
        {closable && (
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'inline-flex rounded-md p-1.5 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'info' && 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
                variant === 'success' && 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-600',
                variant === 'warning' && 'text-amber-500 hover:bg-amber-100 focus:ring-amber-600',
                variant === 'error' && 'text-red-500 hover:bg-red-100 focus:ring-red-600'
              )}
            >
              <span className="sr-only">Kapat</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
