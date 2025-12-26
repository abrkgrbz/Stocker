'use client';

/**
 * =====================================
 * TABLE COMPONENT
 * =====================================
 *
 * Enterprise data table with sorting and pagination.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// TYPES
// =====================================

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  /** Unique key for the column */
  key: string;
  /** Header label */
  header: string;
  /** Accessor function or key path */
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number;
  /** Column width (CSS value) */
  width?: string;
  /** Minimum width */
  minWidth?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  cell?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Header cell className */
  headerClassName?: string;
  /** Body cell className */
  cellClassName?: string;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row key accessor */
  rowKey: keyof T | ((row: T, index: number) => string);
  /** Enable sorting */
  sortable?: boolean;
  /** Controlled sort state */
  sort?: SortState;
  /** Sort change handler */
  onSortChange?: (sort: SortState) => void;
  /** Enable pagination */
  pagination?: boolean | PaginationState;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Empty state content */
  emptyContent?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Compact size */
  compact?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Selected row keys */
  selectedRowKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[]) => void;
  /** Additional class names */
  className?: string;
}

// =====================================
// TABLE COMPONENT
// =====================================

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  sortable = false,
  sort: controlledSort,
  onSortChange,
  pagination = false,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  emptyContent,
  loading = false,
  striped = false,
  hoverable = true,
  compact = false,
  stickyHeader = false,
  onRowClick,
  selectedRowKeys,
  onSelectionChange,
  className,
}: TableProps<T>) {
  // Internal sort state
  const [internalSort, setInternalSort] = useState<SortState>({
    key: '',
    direction: null,
  });

  // Internal pagination state
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(pageSizeOptions[0]);

  // Use controlled or internal state
  const sortState = controlledSort ?? internalSort;
  const handleSortChange = onSortChange ?? setInternalSort;

  // Pagination config
  const isPaginated = pagination !== false;
  const paginationConfig =
    typeof pagination === 'object'
      ? pagination
      : {
          page: internalPage,
          pageSize: internalPageSize,
          total: data.length,
        };

  // Get row key
  const getRowKey = useCallback(
    (row: T, index: number): string => {
      if (typeof rowKey === 'function') {
        return rowKey(row, index);
      }
      return String(row[rowKey]);
    },
    [rowKey]
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortState.key || !sortState.direction) {
      return data;
    }

    const column = columns.find((c) => c.key === sortState.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      let result: number;

      if (column.sortFn) {
        result = column.sortFn(a, b);
      } else {
        const accessor = column.accessor;
        const aVal =
          typeof accessor === 'function' ? accessor(a) : a[accessor as keyof T];
        const bVal =
          typeof accessor === 'function' ? accessor(b) : b[accessor as keyof T];

        if (aVal === bVal) result = 0;
        else if (aVal === null || aVal === undefined) result = 1;
        else if (bVal === null || bVal === undefined) result = -1;
        else result = aVal < bVal ? -1 : 1;
      }

      return sortState.direction === 'desc' ? -result : result;
    });
  }, [data, sortable, sortState, columns]);

  // Paginate data (only for client-side pagination)
  const paginatedData = useMemo(() => {
    if (!isPaginated || typeof pagination === 'object') {
      // Server-side pagination - data is already paginated
      return sortedData;
    }

    const start = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const end = start + paginationConfig.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, isPaginated, pagination, paginationConfig]);

  // Handle sort click
  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: SortDirection;
    if (sortState.key !== columnKey) {
      newDirection = 'asc';
    } else if (sortState.direction === 'asc') {
      newDirection = 'desc';
    } else {
      newDirection = null;
    }

    handleSortChange({ key: columnKey, direction: newDirection });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  // Selection handling
  const isSelectable = onSelectionChange !== undefined;
  const allSelected =
    selectedRowKeys &&
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) =>
      selectedRowKeys.includes(getRowKey(row, idx))
    );

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(paginatedData.map((row, idx) => getRowKey(row, idx)));
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange || !selectedRowKeys) return;

    if (selectedRowKeys.includes(key)) {
      onSelectionChange(selectedRowKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedRowKeys, key]);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(paginationConfig.total / paginationConfig.pageSize);
  const showPagination = isPaginated && totalPages > 1;

  // Cell value accessor
  const getCellValue = (row: T, column: ColumnDef<T>, index: number) => {
    const accessor = column.accessor;
    const rawValue =
      typeof accessor === 'function' ? accessor(row) : row[accessor as keyof T];

    if (column.cell) {
      return column.cell(rawValue, row, index);
    }

    return rawValue as React.ReactNode;
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse">
          <thead
            className={cn(
              'bg-slate-50 border-b border-slate-200',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {/* Selection checkbox */}
              {isSelectable && (
                <th className="w-12 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                  className={cn(
                    'px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
                    compact ? 'py-2' : 'py-3',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable && 'cursor-pointer select-none hover:bg-slate-100',
                    column.headerClassName
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    <span>{column.header}</span>
                    {sortable && column.sortable && (
                      <span className="flex flex-col">
                        <ChevronUpIcon
                          className={cn(
                            'h-3 w-3 -mb-1',
                            sortState.key === column.key &&
                              sortState.direction === 'asc'
                              ? 'text-slate-900'
                              : 'text-slate-300'
                          )}
                        />
                        <ChevronDownIcon
                          className={cn(
                            'h-3 w-3',
                            sortState.key === column.key &&
                              sortState.direction === 'desc'
                              ? 'text-slate-900'
                              : 'text-slate-300'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {emptyContent || 'Veri bulunamadı'}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const key = getRowKey(row, rowIndex);
                const isSelected = selectedRowKeys?.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    className={cn(
                      'bg-white transition-colors',
                      striped && rowIndex % 2 === 1 && 'bg-slate-50/50',
                      hoverable && 'hover:bg-slate-50',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-slate-100'
                    )}
                  >
                    {/* Selection checkbox */}
                    {isSelectable && (
                      <td className="w-12 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 text-sm text-slate-700',
                          compact ? 'py-2' : 'py-3',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.cellClassName
                        )}
                      >
                        {getCellValue(row, column, rowIndex)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Sayfa başına:</span>
            <select
              value={paginationConfig.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded border-slate-300 text-sm focus:border-slate-900 focus:ring-slate-900"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-600 mr-2">
              {(paginationConfig.page - 1) * paginationConfig.pageSize + 1}-
              {Math.min(
                paginationConfig.page * paginationConfig.pageSize,
                paginationConfig.total
              )}{' '}
              / {paginationConfig.total}
            </span>

            <button
              onClick={() => handlePageChange(paginationConfig.page - 1)}
              disabled={paginationConfig.page === 1}
              className={cn(
                'p-1 rounded transition-colors',
                'hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => handlePageChange(paginationConfig.page + 1)}
              disabled={paginationConfig.page >= totalPages}
              className={cn(
                'p-1 rounded transition-colors',
                'hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
