import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

// Date Formatters
export const formatDate = (date: string | Date | null | undefined, format = 'DD.MM.YYYY'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Number/Currency Formatters
export const formatCurrency = (
  amount: number | null | undefined,
  currency = 'TRY',
  locale = 'tr-TR'
): string => {
  if (amount === null || amount === undefined) return '₺0,00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (
  value: number | null | undefined,
  decimals = 0,
  locale = 'tr-TR'
): string => {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined) return '0%';
  return `${formatNumber(value, decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// String Formatters
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '-';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Turkish phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

export const formatEmail = (email: string | null | undefined): string => {
  if (!email) return '-';
  return email.toLowerCase();
};

export const truncateText = (text: string | null | undefined, maxLength = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

// Status Formatters
export const formatBoolean = (value: boolean | null | undefined, trueText = 'Evet', falseText = 'Hayır'): string => {
  if (value === null || value === undefined) return '-';
  return value ? trueText : falseText;
};

export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return '-';
  
  const statusMap: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    draft: 'Taslak',
    published: 'Yayında',
  };
  
  return statusMap[status.toLowerCase()] || status;
};