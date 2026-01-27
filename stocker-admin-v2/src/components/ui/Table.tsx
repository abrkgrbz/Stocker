import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, CheckSquare, Square } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
    key?: string; // Key for sorting
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    pagination?: PaginationProps;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    // Selection props
    selectedIds?: (string | number)[];
    onSelectionChange?: (selectedIds: (string | number)[]) => void;
    idField?: keyof T; // Defaults to 'id'
}

export function Table<T extends { id?: string | number } & Record<string, any>>({
    columns,
    data,
    isLoading,
    onRowClick,
    pagination,
    sortColumn,
    sortDirection,
    onSort,
    selectedIds,
    onSelectionChange,
    idField = 'id'
}: TableProps<T>) {
    const handleHeaderClick = (column: Column<T>) => {
        if (!column.sortable || !column.key || !onSort) return;

        if (sortColumn === column.key) {
            onSort(column.key, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(column.key, 'asc');
        }
    };

    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedIds && selectedIds.length === data.length && data.length > 0) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map(item => item[idField] as string | number));
        }
    };

    const handleSelectRow = (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onSelectionChange || !selectedIds) return;

        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(itemId => itemId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const allSelected = data.length > 0 && selectedIds?.length === data.length;
    const someSelected = selectedIds && selectedIds.length > 0 && selectedIds.length < data.length;

    return (
        <div className="w-full overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface transition-all duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-subtle bg-indigo-500/5">
                            {onSelectionChange && (
                                <th className="px-8 py-5 w-[60px] text-text-muted">
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center justify-center w-5 h-5 rounded text-indigo-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {allSelected ? (
                                            <CheckSquare className="w-5 h-5" />
                                        ) : someSelected ? (
                                            <div className="w-4 h-4 rounded-sm border-2 border-indigo-400 bg-indigo-400 flex items-center justify-center">
                                                <div className="w-2 h-0.5 bg-white" />
                                            </div>
                                        ) : (
                                            <Square className="w-5 h-5 text-text-muted/50" />
                                        )}
                                    </button>
                                </th>
                            )}
                            {columns.map((column, i) => (
                                <th
                                    key={i}
                                    onClick={() => handleHeaderClick(column)}
                                    className={`px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted ${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-white/5 select-none' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && column.key === sortColumn && (
                                            sortDirection === 'asc'
                                                ? <ArrowUp className="w-3 h-3 text-indigo-400" />
                                                : <ArrowDown className="w-3 h-3 text-indigo-400" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {isLoading ? (
                            [1, 2, 3].map((n) => (
                                <tr key={n} className="animate-pulse">
                                    {onSelectionChange && <td className="px-8 py-6" />}
                                    {columns.map((_, i) => (
                                        <td key={i} className="px-8 py-6">
                                            <div className="h-4 bg-indigo-500/5 rounded-lg w-full" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="px-8 py-20 text-center">
                                    <p className="text-text-muted font-medium italic">Kayıt bulunamadı</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, i) => {
                                const itemId = item[idField] as string | number;
                                const isSelected = selectedIds?.includes(itemId);
                                return (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={itemId}
                                        onClick={() => onRowClick?.(item)}
                                        className={`group transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-indigo-500/5'} ${onRowClick ? 'cursor-pointer' : ''}`}
                                    >
                                        {onSelectionChange && (
                                            <td className="px-8 py-6 w-[60px]" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleSelectRow(itemId, e)}
                                                    className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${isSelected ? 'text-indigo-400' : 'text-text-muted/30 hover:text-indigo-400'}`}
                                                >
                                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        )}
                                        {columns.map((column, j) => (
                                            <td key={j} className={`px-8 py-6 text-sm font-medium text-text-main/80 ${column.className || ''}`}>
                                                {typeof column.accessor === 'function'
                                                    ? column.accessor(item)
                                                    : (item[column.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-8 py-4 border-t border-border-subtle bg-indigo-500/5 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Toplam <span className="text-indigo-400">{pagination.totalCount}</span> Kayıt |
                        Sayfa <span className="text-indigo-400">{pagination.currentPage}</span> / {pagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => pagination.onPageChange(1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-xl hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-xl hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum = pagination.currentPage;
                                if (pagination.currentPage <= 3) pageNum = i + 1;
                                else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                else pageNum = pagination.currentPage - 2 + i;

                                if (pageNum <= 0 || pageNum > pagination.totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => pagination.onPageChange(pageNum)}
                                        className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${pagination.currentPage === pageNum
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                            : 'hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2 rounded-xl hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.totalPages)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2 rounded-xl hover:bg-indigo-500/10 text-text-muted hover:text-indigo-400 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
