/**
 * =====================================
 * CLASS NAME UTILITY
 * =====================================
 *
 * Combines clsx and tailwind-merge for intelligent class name handling.
 * Resolves Tailwind class conflicts (e.g., p-4 vs px-2).
 *
 * Usage:
 * ```tsx
 * cn('p-4', condition && 'bg-red-500', 'p-2') // → 'p-2 bg-red-500' (p-4 overridden)
 * ```
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
