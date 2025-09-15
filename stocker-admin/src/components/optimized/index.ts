// Export all optimized components
export { StatCard } from './StatCard';
export { ChartCard } from './ChartCard';
export { DataTable } from './DataTable';

// Re-export with memo wrapper for commonly used components
import { memo } from 'react';
import { Card, Button, Badge, Tag } from 'antd';

// Memoized Ant Design components
export const MemoCard = memo(Card);
export const MemoButton = memo(Button);
export const MemoBadge = memo(Badge);
export const MemoTag = memo(Tag);