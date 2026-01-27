export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message?: string;
    errors?: string[];
    timestamp: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AlternativePaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}
