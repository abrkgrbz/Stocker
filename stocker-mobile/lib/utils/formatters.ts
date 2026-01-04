/**
 * Centralized formatting utilities for the Stocker Mobile app
 * Use these functions across the app to ensure consistent formatting
 */

// ============= CURRENCY FORMATTING =============

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyFormatOptions {
    currency?: CurrencyCode;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
}

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
    value: number | null | undefined,
    options: CurrencyFormatOptions = {}
): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '₺0';
    }

    const {
        currency = 'TRY',
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        showSymbol = true
    } = options;

    const formatted = new Intl.NumberFormat('tr-TR', {
        style: showSymbol ? 'currency' : 'decimal',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value);

    return formatted;
}

/**
 * Format currency with compact notation for large values (K, M, B)
 */
export function formatCurrencyCompact(
    value: number | null | undefined,
    currency: CurrencyCode = 'TRY'
): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '₺0';
    }

    if (value >= 1_000_000_000) {
        return `₺${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `₺${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `₺${(value / 1_000).toFixed(1)}K`;
    }

    return formatCurrency(value, { currency });
}

// ============= DATE FORMATTING =============

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full' | 'relative';

export interface DateFormatOptions {
    style?: DateFormatStyle;
    includeTime?: boolean;
    includeYear?: boolean;
}

/**
 * Format a date string or Date object
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
    date: string | Date | null | undefined,
    options: DateFormatOptions = {}
): string {
    if (!date) return '-';

    const {
        style = 'medium',
        includeTime = false,
        includeYear = true
    } = options;

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return '-';
    }

    // Relative formatting
    if (style === 'relative') {
        return formatRelativeDate(dateObj);
    }

    const formatOptions: Intl.DateTimeFormatOptions = {};

    switch (style) {
        case 'short':
            formatOptions.day = '2-digit';
            formatOptions.month = '2-digit';
            if (includeYear) formatOptions.year = '2-digit';
            break;
        case 'medium':
            formatOptions.day = 'numeric';
            formatOptions.month = 'short';
            if (includeYear) formatOptions.year = 'numeric';
            break;
        case 'long':
            formatOptions.day = 'numeric';
            formatOptions.month = 'long';
            if (includeYear) formatOptions.year = 'numeric';
            break;
        case 'full':
            formatOptions.weekday = 'long';
            formatOptions.day = 'numeric';
            formatOptions.month = 'long';
            if (includeYear) formatOptions.year = 'numeric';
            break;
    }

    if (includeTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('tr-TR', formatOptions).format(dateObj);
}

/**
 * Format relative date (e.g., "2 gün önce", "yarın")
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
    if (!date) return '-';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Future dates
    if (diffDays === 0 && diffHours >= 0 && diffHours < 24) {
        if (diffMinutes < 1) return 'şimdi';
        if (diffMinutes < 60) return `${diffMinutes} dakika sonra`;
        return `${diffHours} saat sonra`;
    }
    if (diffDays === 1) return 'yarın';
    if (diffDays === 2) return 'öbür gün';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} gün sonra`;
    if (diffDays > 7 && diffDays <= 30) return `${Math.ceil(diffDays / 7)} hafta sonra`;

    // Past dates
    if (diffDays === 0 && diffHours < 0 && diffHours > -24) {
        if (Math.abs(diffMinutes) < 1) return 'şimdi';
        if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)} dakika önce`;
        return `${Math.abs(diffHours)} saat önce`;
    }
    if (diffDays === -1) return 'dün';
    if (diffDays === -2) return 'önceki gün';
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} gün önce`;
    if (diffDays < -7 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)} hafta önce`;
    if (diffDays < -30 && diffDays >= -365) return `${Math.ceil(Math.abs(diffDays) / 30)} ay önce`;

    // Default to standard format
    return formatDate(dateObj, { style: 'medium' });
}

// ============= TIME FORMATTING =============

/**
 * Format time from a date string or Date object
 */
export function formatTime(
    time: string | Date | null | undefined,
    options: { includeSeconds?: boolean } = {}
): string {
    if (!time) return '--:--';

    const { includeSeconds = false } = options;
    const dateObj = typeof time === 'string' ? new Date(time) : time;

    if (isNaN(dateObj.getTime())) return '--:--';

    return dateObj.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: includeSeconds ? '2-digit' : undefined
    });
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(
    minutes: number | null | undefined,
    options: { compact?: boolean } = {}
): string {
    if (minutes === null || minutes === undefined || isNaN(minutes)) {
        return '-';
    }

    const { compact = false } = options;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (compact) {
        if (hours === 0) return `${mins}dk`;
        if (mins === 0) return `${hours}sa`;
        return `${hours}sa ${mins}dk`;
    }

    if (hours === 0) return `${mins} dakika`;
    if (mins === 0) return `${hours} saat`;
    return `${hours} saat ${mins} dakika`;
}

// ============= NUMBER FORMATTING =============

export interface NumberFormatOptions {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    useGrouping?: boolean;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(
    value: number | null | undefined,
    options: NumberFormatOptions = {}
): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        useGrouping = true
    } = options;

    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping
    }).format(value);
}

/**
 * Format number with compact notation (K, M, B)
 */
export function formatNumberCompact(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }

    return formatNumber(value);
}

/**
 * Format percentage
 */
export function formatPercent(
    value: number | null | undefined,
    options: { decimals?: number } = {}
): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '%0';
    }

    const { decimals = 0 } = options;
    return `%${value.toFixed(decimals)}`;
}

// ============= PHONE FORMATTING =============

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '-';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Turkish phone number formatting
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('90')) {
        return `+90 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }

    // Return original if no match
    return phone;
}

// ============= TEXT FORMATTING =============

/**
 * Truncate text with ellipsis
 */
export function truncate(
    text: string | null | undefined,
    maxLength: number,
    options: { suffix?: string } = {}
): string {
    if (!text) return '';

    const { suffix = '...' } = options;

    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string | null | undefined): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// ============= ID FORMATTING =============

/**
 * Format order/invoice/quote number for display
 */
export function formatDocumentNumber(
    prefix: string,
    number: number | string | null | undefined,
    padding: number = 6
): string {
    if (number === null || number === undefined) return '-';
    const numStr = String(number).padStart(padding, '0');
    return `${prefix}-${numStr}`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string | null | undefined, maxLength: number = 2): string {
    if (!name) return '';

    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, maxLength)
        .map(part => part[0].toUpperCase())
        .join('');
}
