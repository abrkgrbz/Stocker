/**
 * Accessible Input Component
 * Pre-configured input with ARIA attributes and accessibility best practices
 */

import React, { forwardRef } from 'react'

export interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  validationStatus?: 'idle' | 'validating' | 'valid' | 'invalid'
  showLabel?: boolean
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      validationStatus = 'idle',
      showLabel = true,
      className = '',
      id,
      type = 'text',
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasError = !!error
    const hasHelper = !!helperText

    return (
      <div className="w-full">
        {showLabel && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="gerekli">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            className={`
              w-full px-4 py-3.5 bg-white border rounded-xl
              focus:ring-2 focus:ring-violet-500 focus:border-transparent
              transition-all text-gray-900 placeholder-gray-400
              ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              ${validationStatus === 'valid' ? 'border-green-300' : ''}
              ${className}
            `}
            aria-label={label}
            aria-invalid={hasError}
            aria-describedby={
              [
                hasError ? errorId : null,
                hasHelper ? helperId : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-required={required}
            {...props}
          />

          {/* Validation Icon */}
          {validationStatus === 'validating' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" aria-label="Kontrol ediliyor" />
            </div>
          )}
          {validationStatus === 'valid' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Geçerli">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {validationStatus === 'invalid' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Geçersiz">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-2 text-sm text-red-600 flex items-start"
          >
            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {hasHelper && !hasError && (
          <p
            id={helperId}
            className="mt-2 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'
