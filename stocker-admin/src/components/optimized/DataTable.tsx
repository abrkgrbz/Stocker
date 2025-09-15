import React, { memo, useCallback, useMemo } from 'react';
import { Table, Tag, Space, Button } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps extends TableProps<any> {
  data: any[];
  loading?: boolean;
  onRowAction?: (action: string, record: any) => void;
}

// Memoized table component with optimized callbacks
export const DataTable = memo<DataTableProps>(({ 
  data, 
  columns, 
  loading = false,
  onRowAction,
  ...restProps 
}) => {
  // Memoize row key function
  const rowKey = useCallback((record: any) => record.id || record.key, []);
  
  // Memoize pagination config
  const pagination = useMemo(() => ({
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total: number) => `Toplam ${total} kayıt`,
    ...restProps.pagination
  }), [restProps.pagination]);

  // Memoize columns with actions if needed
  const finalColumns = useMemo(() => {
    if (!onRowAction) return columns;
    
    return [
      ...(columns || []),
      {
        title: 'İşlemler',
        key: 'action',
        render: (_: any, record: any) => (
          <Space size="small">
            <Button 
              type="link" 
              size="small"
              onClick={() => onRowAction('view', record)}
            >
              Görüntüle
            </Button>
            <Button 
              type="link" 
              size="small"
              onClick={() => onRowAction('edit', record)}
            >
              Düzenle
            </Button>
          </Space>
        ),
      },
    ];
  }, [columns, onRowAction]);

  return (
    <Table
      {...restProps}
      columns={finalColumns}
      dataSource={data}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
    />
  );
});

DataTable.displayName = 'DataTable';