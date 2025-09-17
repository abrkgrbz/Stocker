import React from 'react';
import { Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface VirtualTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  scroll?: { x?: number; y?: number };
  className?: string;
  style?: React.CSSProperties;
  emptyText?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: React.Key[]) => void;
  onRowClick?: (record: T) => void;
  rowHeight?: number;
  headerHeight?: number;
}

export function VirtualTable<T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  rowKey = 'id',
  scroll,
  className,
  style,
  emptyText = 'No data',
  selectable,
  onSelectionChange,
  onRowClick
}: VirtualTableProps<T>) {
  // For now, use Ant Design's Table component with virtual scrolling
  // This is a temporary fix for build issues
  
  const rowSelection = selectable ? {
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectionChange?.(selectedRowKeys);
    }
  } : undefined;

  return (
    <Table<T>
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      scroll={scroll || { y: 400 }}
      className={className}
      style={style}
      pagination={false}
      virtual
      rowSelection={rowSelection}
      onRow={onRowClick ? (record) => ({
        onClick: () => onRowClick(record)
      }) : undefined}
      locale={{
        emptyText: <Empty description={emptyText} />
      }}
    />
  );
}

export default VirtualTable;