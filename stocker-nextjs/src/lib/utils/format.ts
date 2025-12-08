/**
 * Common formatting utilities for the application
 * Centralized formatting functions to avoid duplication
 */

/**
 * Format a number as Turkish currency (TRY)
 */
export const formatCurrency = (value: number | undefined | null, currency: string = 'TRY'): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a number as Turkish currency with decimals
 */
export const formatCurrencyWithDecimals = (value: number | undefined | null, currency: string = 'TRY', decimals: number = 2): string => {
  if (value === undefined || value === null) return '₺0,00';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a number with Turkish locale
 */
export const formatNumber = (value: number | undefined | null, decimals?: number): string => {
  if (value === undefined || value === null) return '0';
  if (decimals !== undefined) {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat('tr-TR').format(value);
};

/**
 * Format a number as percentage
 */
export const formatPercentage = (value: number | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null) return '%0';
  return `%${value.toFixed(decimals)}`;
};

/**
 * Format a number as compact (K, M, B)
 */
export const formatCompact = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

/**
 * Format bytes to human readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format date to Turkish locale
 */
export const formatDate = (date: string | Date | undefined | null, format: 'short' | 'long' | 'datetime' = 'short'): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'long':
      return d.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'datetime':
      return d.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString('tr-TR');
  }
};
