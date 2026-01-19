'use client';

import React from 'react';

interface FormSectionProps {
  /** Section title text */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to show the bottom border under the title */
  showBorder?: boolean;
  /** Right side content (e.g., action buttons) */
  rightContent?: React.ReactNode;
}

export function FormSection({
  title,
  subtitle,
  children,
  className = '',
  showBorder = true,
  rightContent,
}: FormSectionProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className={`flex items-center justify-between pb-2 mb-4 ${showBorder ? 'border-b border-slate-100' : ''}`}>
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {rightContent && (
          <div className="flex-shrink-0">{rightContent}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export default FormSection;
