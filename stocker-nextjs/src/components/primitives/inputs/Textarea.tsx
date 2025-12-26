'use client';

/**
 * =====================================
 * ENTERPRISE TEXTAREA COMPONENT
 * =====================================
 *
 * Multi-line text input following CustomerForm styling pattern.
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'borderless' | 'filled';
  error?: boolean;
  errorMessage?: string;
  autoResize?: boolean;
  showCount?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  default: `
    bg-slate-50 border border-slate-300 rounded-md
    text-slate-900
    hover:border-slate-400
    focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
    placeholder:text-slate-400
  `,
  borderless: `
    bg-transparent border-0 border-b border-slate-200
    text-slate-900
    hover:border-slate-400
    focus:border-slate-900 focus:ring-0
    rounded-none
    placeholder:text-slate-400
  `,
  filled: `
    bg-slate-100 border border-transparent rounded-md
    text-slate-900
    hover:bg-slate-200
    focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900
    placeholder:text-slate-500
  `,
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      error = false,
      errorMessage,
      autoResize = false,
      showCount = false,
      fullWidth = true,
      className,
      disabled,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize, textareaRef]);

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <textarea
          ref={textareaRef}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          className={cn(
            'px-3 py-2.5 text-sm outline-none transition-all duration-200 resize-y min-h-[100px]',
            variantClasses[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100 resize-none',
            fullWidth && 'w-full',
            autoResize && 'resize-none overflow-hidden',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          {showCount && maxLength && (
            <p className={cn('text-xs ml-auto', currentLength >= maxLength ? 'text-red-500' : 'text-slate-400')}>
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
