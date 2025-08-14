import React from 'react';
import { Table, TableProps, Card, Input, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { EmptyState } from '../EmptyState';
import './style.css';

interface DataTableProps<T> extends Omit<TableProps<T>, 'title'> {
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  showCard?: boolean;
  emptyStateProps?: {
    title?: string;
    description?: string;
    showAction?: boolean;
    actionText?: string;
    onAction?: () => void;
  };
  extra?: React.ReactNode;
}

export function DataTable<T extends object>({
  title,
  searchable = false,
  searchPlaceholder = 'Ara...',
  onSearch,
  onRefresh,
  showCard = true,
  emptyStateProps,
  extra,
  locale,
  ...tableProps
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const tableLocale = locale || {
    emptyText: <EmptyState {...emptyStateProps} />,
  };

  const headerContent = (
    <>
      {(title || searchable || onRefresh || extra) && (
        <div className="data-table-header">
          <div className="data-table-header-left">
            {title && <h3 className="data-table-title">{title}</h3>}
          </div>
          <div className="data-table-header-right">
            <Space size="middle">
              {searchable && (
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                  allowClear
                />
              )}
              {onRefresh && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onRefresh}
                  title="Yenile"
                />
              )}
              {extra}
            </Space>
          </div>
        </div>
      )}
    </>
  );

  const tableContent = (
    <Table<T>
      {...tableProps}
      locale={tableLocale}
      className={`data-table ${tableProps.className || ''}`}
    />
  );

  if (!showCard) {
    return (
      <>
        {headerContent}
        {tableContent}
      </>
    );
  }

  return (
    <Card className="data-table-card" bordered={false}>
      {headerContent}
      {tableContent}
    </Card>
  );
}

export default DataTable;