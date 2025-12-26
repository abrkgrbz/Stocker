'use client';

/**
 * =====================================
 * ENTERPRISE MODAL COMPONENT
 * =====================================
 *
 * Accessible modal dialog using Headless UI Dialog.
 * Features:
 * - Focus trap and keyboard navigation
 * - Multiple sizes
 * - Custom header/footer
 * - Backdrop click to close
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

export interface ModalProps {
  /** Open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Modal content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Show close button */
  showClose?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Additional class names for panel */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  showClose = true,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnBackdrop ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-lg',
                  'bg-white text-left align-middle shadow-xl',
                  'transition-all',
                  sizeClasses[size],
                  className
                )}
              >
                {/* Header */}
                {(title || showClose) && (
                  <div className="flex items-start justify-between p-4 border-b border-slate-100">
                    <div>
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-semibold text-slate-900"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-slate-500">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {showClose && (
                      <button
                        type="button"
                        className={cn(
                          'rounded-md p-1 text-slate-400',
                          'hover:text-slate-600 hover:bg-slate-100',
                          'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
                          'transition-colors'
                        )}
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Kapat</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-4">{children}</div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/**
 * Confirmation Modal for destructive actions
 */
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const confirmButtonClass = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-slate-900 hover:bg-slate-800 text-white',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      showClose={false}
    >
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            'text-slate-700 bg-white border border-slate-300',
            'hover:bg-slate-50',
            'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
            'transition-colors'
          )}
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            confirmButtonClass[variant],
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            variant === 'danger' && 'focus:ring-red-500',
            variant === 'warning' && 'focus:ring-amber-500',
            variant === 'info' && 'focus:ring-slate-900',
            'transition-colors',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'İşleniyor...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
