import { apiClient } from './apiClient';

// Types
export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: 'published' | 'draft' | 'archived';
    metaTitle?: string;
    metaDescription?: string;
    featuredImage?: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    views: number;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category: string;
    tags: string[];
    status: 'published' | 'draft' | 'scheduled';
    publishDate: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    featuredImage?: string;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface DocItem {
    id: string;
    title: string;
    slug: string;
    type: 'folder' | 'file';
    parentId?: string | null;
    content?: string;
    order: number;
    lastModified: string;
    createdAt: string;
    updatedAt: string;
    children?: DocItem[];
}

export interface MediaItem {
    id: string;
    url: string;
    name: string;
    fileName: string;
    type: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    altText?: string;
    title?: string;
    folder?: string;
    createdAt: string;
}

export interface MediaUploadResult {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
}

export interface CMSStats {
    totalPages: { count: number; change: number; period: string };
    totalPosts: { count: number; change: number; period: string };
    totalVisitors: { count: number; changePercentage: number; period: string };
    storage: { usedBytes: number; fileCount: number };
    recentActivity: Array<{
        id: string;
        user: string;
        action: string;
        target: string;
        timestamp: string;
    }>;
}

export interface PaginatedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Helper to handle the type mismatch between Axios return type and our Interceptor's unwrapped return
const request = <T>(promise: Promise<any>): Promise<T> => promise as Promise<T>;

// Service
export const cmsService = {
    // Pages
    getPages: (params?: any) => request<PaginatedResult<Page>>(apiClient.get('/api/v1/cms/pages', { params })),
    getPage: (id: string) => request<Page>(apiClient.get(`/api/v1/cms/pages/${id}`)),
    createPage: (data: Partial<Page>) => request<Page>(apiClient.post('/api/v1/cms/pages', data)),
    updatePage: (id: string, data: Partial<Page>) => request<Page>(apiClient.put(`/api/v1/cms/pages/${id}`, data)),
    deletePage: (id: string) => request<void>(apiClient.delete(`/api/v1/cms/pages/${id}`)),
    checkPageSlug: (slug: string) => request<{ available: boolean }>(apiClient.post('/api/v1/cms/pages/check-slug', { slug })),

    // Blog
    getPosts: (params?: any) => request<BlogPost[]>(apiClient.get('/api/v1/cms/posts', { params })),
    getPost: (id: string) => request<BlogPost>(apiClient.get(`/api/v1/cms/posts/${id}`)),
    createPost: (data: Partial<BlogPost>) => request<BlogPost>(apiClient.post('/api/v1/cms/posts', data)),
    updatePost: (id: string, data: Partial<BlogPost>) => request<BlogPost>(apiClient.put(`/api/v1/cms/posts/${id}`, data)),
    deletePost: (id: string) => request<void>(apiClient.delete(`/api/v1/cms/posts/${id}`)),
    getCategories: () => request<BlogCategory[]>(apiClient.get('/api/v1/cms/categories')),
    createCategory: (data: { name: string; slug: string; description?: string }) =>
        request<BlogCategory>(apiClient.post('/api/v1/cms/categories', data)),

    // Docs
    getDocs: () => request<DocItem[]>(apiClient.get('/api/v1/cms/docs')),
    getDoc: (id: string) => request<DocItem>(apiClient.get(`/api/v1/cms/docs/${id}`)),
    createDoc: (data: Partial<DocItem>) => request<DocItem>(apiClient.post('/api/v1/cms/docs', data)),
    updateDoc: (id: string, data: Partial<DocItem>) => request<DocItem>(apiClient.put(`/api/v1/cms/docs/${id}`, data)),
    deleteDoc: (id: string) => request<void>(apiClient.delete(`/api/v1/cms/docs/${id}`)),

    // Media
    getMedia: (params?: { type?: string; search?: string; page?: number; pageSize?: number }) =>
        request<MediaItem[]>(apiClient.get('/api/v1/cms/media', { params })),
    uploadMedia: (file: File, options?: { altText?: string; title?: string; folder?: string }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (options?.altText) formData.append('altText', options.altText);
        if (options?.title) formData.append('title', options.title);
        if (options?.folder) formData.append('folder', options.folder);
        return request<MediaUploadResult>(apiClient.post('/api/v1/cms/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
    deleteMedia: (id: string) => request<void>(apiClient.delete(`/api/v1/cms/media/${id}`)),

    // Stats
    getStats: () => request<CMSStats>(apiClient.get('/api/v1/cms/stats')),
};
