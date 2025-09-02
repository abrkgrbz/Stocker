import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Checkbox, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import * as ReactWindow from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const List = ReactWindow.FixedSizeList;

interface VirtualTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: string | ((record: T) => string);
  rowHeight?: number;
  headerHeight?: number;
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  onRowClick?: (record: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function VirtualTable<T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey,
  rowHeight = 54,
  headerHeight = 55,
  loading = false,
  selectable = false,
  onSelectionChange,
  onRowClick,
  className,
  style,
}: VirtualTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  
  const getRowKey = useCallback(
    (record: T) => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return record[rowKey];
    },
    [rowKey]
  );
  
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortOrder) {
      return dataSource;
    }
    
    return [...dataSource].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'ascend' ? comparison : -comparison;
    });
  }, [dataSource, sortColumn, sortOrder]);
  
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortOrder === 'ascend') {
        setSortOrder('descend');
      } else if (sortOrder === 'descend') {
        setSortOrder(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortOrder('ascend');
    }
  }, [sortColumn, sortOrder]);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allKeys = sortedData.map(record => getRowKey(record));
      setSelectedRowKeys(allKeys);
      onSelectionChange?.(allKeys);
    } else {
      setSelectedRowKeys([]);
      onSelectionChange?.([]);
    }
  }, [sortedData, getRowKey, onSelectionChange]);
  
  const handleSelectRow = useCallback((key: React.Key, checked: boolean) => {
    const newSelectedKeys = checked
      ? [...selectedRowKeys, key]
      : selectedRowKeys.filter(k => k !== key);
    
    setSelectedRowKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  }, [selectedRowKeys, onSelectionChange]);
  
  const renderHeader = () => (
    <div 
      className="virtual-table-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: headerHeight,
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        fontWeight: 500,
        padding: '0 16px',
      }}
    >
      {selectable && (
        <div style={{ width: 50, flexShrink: 0 }}>
          <Checkbox
            checked={selectedRowKeys.length === sortedData.length && sortedData.length > 0}
            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < sortedData.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        </div>
      )}
      {columns.map((column, index) => {
        const columnKey = column.dataIndex as string;
        const isSorted = sortColumn === columnKey;
        
        return (
          <div
            key={columnKey || index}
            style={{
              flex: column.width ? `0 0 ${column.width}px` : 1,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: column.sorter ? 'pointer' : 'default',
            }}
            onClick={() => column.sorter && handleSort(columnKey)}
          >
            <span>{column.title as React.ReactNode}</span>
            {column.sorter && (
              <Space size={4}>
                {isSorted && sortOrder === 'ascend' && <SortAscendingOutlined />}
                {isSorted && sortOrder === 'descend' && <SortDescendingOutlined />}
              </Space>
            )}
          </div>
        );
      })}
    </div>
  );
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const record = sortedData[index];
    const key = getRowKey(record);
    const isSelected = selectedRowKeys.includes(key);
    
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          cursor: onRowClick ? 'pointer' : 'default',
          backgroundColor: isSelected ? '#f5f5f5' : undefined,
        }}
        className="virtual-table-row"
        onClick={() => onRowClick?.(record)}
      >
        {selectable && (
          <div style={{ width: 50, flexShrink: 0 }}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => handleSelectRow(key, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {columns.map((column, colIndex) => {
          const dataIndex = column.dataIndex as string;
          const value = record[dataIndex];
          
          return (
            <div
              key={dataIndex || colIndex}
              style={{
                flex: column.width ? `0 0 ${column.width}px` : 1,
                padding: '0 8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {column.render ? column.render(value, record, index) : value}
            </div>
          );
        })}
      </div>
    );
  };
  
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [dataSource]);
  
  return (
    <div className={className} style={{ height: '100%', width: '100%', ...style }}>
      {renderHeader()}
      <div style={{ height: `calc(100% - ${headerHeight}px)` }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={sortedData.length}
              itemSize={rowHeight}
              width={width}
              overscanCount={10}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export default VirtualTable;