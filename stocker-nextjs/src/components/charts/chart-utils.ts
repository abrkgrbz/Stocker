/**
 * Chart color palettes for consistent theming
 */
export const chartColors = {
  primary: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
  secondary: ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  info: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
  pink: ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'],
  cyan: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  amber: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  red: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
};

/**
 * Multi-series color palette
 */
export const multiSeriesColors = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
];

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

/**
 * Format currency (Turkish Lira)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get color by index from a palette
 */
export function getColor(index: number, palette: string[] = multiSeriesColors): string {
  return palette[index % palette.length];
}

/**
 * Get gradient fill colors for area charts
 */
export function getGradientColors(baseColor: string, opacity: number = 0.2): {
  stroke: string;
  fill: string;
} {
  return {
    stroke: baseColor,
    fill: `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  };
}

/**
 * Generate data for demo/testing purposes
 */
export function generateDemoData(
  count: number,
  keys: string[],
  range: [number, number] = [0, 100]
): any[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    const item: any = {
      name: `Item ${i + 1}`,
    };
    keys.forEach((key) => {
      const [min, max] = range;
      item[key] = Math.floor(Math.random() * (max - min + 1)) + min;
    });
    data.push(item);
  }
  return data;
}

/**
 * Generate time-series data
 */
export function generateTimeSeriesData(
  days: number,
  keys: string[],
  range: [number, number] = [0, 100]
): any[] {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const item: any = {
      name: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      date: date.toISOString(),
    };

    keys.forEach((key) => {
      const [min, max] = range;
      item[key] = Math.floor(Math.random() * (max - min + 1)) + min;
    });

    data.push(item);
  }

  return data;
}

/**
 * Calculate trend (positive or negative percentage change)
 */
export function calculateTrend(current: number, previous: number): {
  value: number;
  isPositive: boolean;
  percentage: number;
} {
  const diff = current - previous;
  const percentage = previous !== 0 ? (diff / previous) * 100 : 0;

  return {
    value: diff,
    isPositive: diff >= 0,
    percentage: Math.abs(percentage),
  };
}
