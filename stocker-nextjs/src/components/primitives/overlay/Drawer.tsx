'use client';

/**
 * =====================================
 * ENTERPRISE DRAWER COMPONENT
 * =====================================
 *
 * Accessible slide-out panel using Headless UI Dialog.
 * Features:
 * - Slide from left or right
 * - Multiple sizes
 * - Custom header/footer
 * - Focus trap and keyboard navigation
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  /** Open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Drawer title */
  title?: string;
  /** Drawer description */
  description?: string;
  /** Slide direction */
  position?: 'left' | 'right';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Drawer content */
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
  full: 'max-w-2xl',
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  position = 'right',
  size = 'md',
  children,
  footer,
  showClose = true,
  closeOnBackdrop = true,
  className,
}: DrawerProps) {
  const isRight = position === 'right';

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnBackdrop ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* Drawer container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={cn(
                'pointer-events-none fixed inset-y-0 flex max-w-full',
                isRight ? 'right-0 pl-10' : 'left-0 pr-10'
              )}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={isRight ? 'translate-x-full' : '-translate-x-full'}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={isRight ? 'translate-x-full' : '-translate-x-full'}
              >
                <Dialog.Panel
                  className={cn(
                    'pointer-events-auto w-screen',
                    sizeClasses[size],
                    className
                  )}
                >
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b border-slate-100">
                      <div>
                        {title && (
                          <Dialog.Title className="text-lg font-semibold text-slate-900">
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {description}
                          </p>
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

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                      <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100">
                        {footer}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default Drawer;
