import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('tr');
dayjs.extend(relativeTime);

// Currency formatter
export function formatCurrency(amount: number | null | undefined, currency: string = '₺'): string {
  const safeAmount = amount ?? 0;
  return `${currency}${safeAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
export function formatNumber(num: number | null | undefined): string {
  const safeNum = num ?? 0;
  return safeNum.toLocaleString('tr-TR');
}

export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  const safeValue = value ?? 0;
  return `%${safeValue.toFixed(decimals)}`;
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
export function formatCompactNumber(num: number | null | undefined): string {
  const safeNum = num ?? 0;
  if (safeNum >= 1000000) {
    return `${(safeNum / 1000000).toFixed(1)}M`;
  }
  if (safeNum >= 1000) {
    return `${(safeNum / 1000).toFixed(1)}K`;
  }
  return safeNum.toString();
}
