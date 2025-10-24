import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('tr');
dayjs.extend(relativeTime);

// Currency formatter
export function formatCurrency(amount: number, currency: string = '₺'): string {
  return `${currency}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Date formatters
export function formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

// Number formatters
export function formatNumber(num: number): string {
  return num.toLocaleString('tr-TR');
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `%${value.toFixed(decimals)}`;
}

// Phone number formatter
export function formatPhone(phone: string): string {
  // Format: (555) 123-4567
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Compact number formatter (1.5K, 2.3M, etc.)
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
