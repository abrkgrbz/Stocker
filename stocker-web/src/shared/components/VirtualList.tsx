import React, { useCallback, useRef, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as ReactWindow from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';

const List = ReactWindow.FixedSizeList;
const VariableSizeList = ReactWindow.VariableSizeList;

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
  itemHeight = 100,
  loadMore,
  hasMore = false,
  loading = false,
  emptyText = 'No data',
  overscan = 5,
  className,
  style,
}: VirtualListProps<T>) {
  const listRef = useRef<List>(null);
  const infiniteLoaderRef = useRef<InfiniteLoader>(null);
  
  const itemCount = hasMore ? items.length + 1 : items.length;
  
  const isItemLoaded = useCallback(
    (index: number) => !hasMore || index < items.length,
    [hasMore, items.length]
  );
  
  const loadMoreItems = useCallback(
    async () => {
      if (!loading && loadMore) {
        await loadMore();
      }
    },
    [loading, loadMore]
  );
  
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (!isItemLoaded(index)) {
        return (
          <div style={style} className="virtual-list-loading">
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
            />
          </div>
        );
      }
      
      return (
        <div style={style} className="virtual-list-item">
          {renderItem(items[index], index)}
        </div>
      );
    },
    [isItemLoaded, renderItem, items]
  );
  
  useEffect(() => {
    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [items]);
  
  if (items.length === 0 && !loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty description={emptyText} />
      </div>
    );
  }
  
  const ListComponent = typeof itemHeight === 'function' ? VariableSizeList : List;
  
  return (
    <div className={className} style={{ height: '100%', width: '100%', ...style }}>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <ListComponent
                ref={(list: any) => {
                  ref(list);
                  listRef.current = list;
                }}
                height={height}
                width={width}
                itemCount={itemCount}
                itemSize={itemHeight as any}
                onItemsRendered={onItemsRendered}
                overscanCount={overscan}
                className="virtual-list-container"
              >
                {Row}
              </ListComponent>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualList;