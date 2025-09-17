import React from 'react';
import { List, Empty, Spin } from 'antd';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number | ((index: number) => number);
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
  emptyText?: string;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function VirtualList<T>({
  items,
  renderItem,
  loading = false,
  emptyText = 'No data',
  className,
  style,
  loadMore,
  hasMore
}: VirtualListProps<T>) {
  // For now, use Ant Design's List component instead of react-window
  // This is a temporary fix for build issues
  
  if (!items || items.length === 0) {
    return <Empty description={emptyText} />;
  }

  const handleLoadMore = () => {
    if (loadMore && hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <List
      className={className}
      style={style}
      loading={loading}
      dataSource={items}
      renderItem={(item, index) => (
        <List.Item key={index}>
          {renderItem(item, index)}
        </List.Item>
      )}
      onScroll={(e) => {
        const target = e.currentTarget as HTMLElement;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
          handleLoadMore();
        }
      }}
    />
  );
}

export default VirtualList;