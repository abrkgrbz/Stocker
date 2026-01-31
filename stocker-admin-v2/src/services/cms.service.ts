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
    type: string;
    size: number;
    createdAt: string;
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

// Helper to handle the type mismatch between Axios return type and our Interceptor's unwrapped return
const request = <T>(promise: Promise<any>): Promise<T> => promise as Promise<T>;

// Service
export const cmsService = {
    // Pages
    getPages: (params?: any) => request<Page[]>(apiClient.get('/cms/pages', { params })),
    getPage: (id: string) => request<Page>(apiClient.get(`/cms/pages/${id}`)),
    createPage: (data: Partial<Page>) => request<Page>(apiClient.post('/cms/pages', data)),
    updatePage: (id: string, data: Partial<Page>) => request<Page>(apiClient.put(`/cms/pages/${id}`, data)),
    deletePage: (id: string) => request<void>(apiClient.delete(`/cms/pages/${id}`)),
    checkPageSlug: (slug: string) => request<{ available: boolean }>(apiClient.post('/cms/pages/check-slug', { slug })),

    // Blog
    getPosts: (params?: any) => request<BlogPost[]>(apiClient.get('/cms/posts', { params })),
    getPost: (id: string) => request<BlogPost>(apiClient.get(`/cms/posts/${id}`)),
    createPost: (data: Partial<BlogPost>) => request<BlogPost>(apiClient.post('/cms/posts', data)),
    updatePost: (id: string, data: Partial<BlogPost>) => request<BlogPost>(apiClient.put(`/cms/posts/${id}`, data)),
    deletePost: (id: string) => request<void>(apiClient.delete(`/cms/posts/${id}`)),
    getCategories: () => request<string[]>(apiClient.get('/cms/categories')),

    // Docs
    getDocs: () => request<DocItem[]>(apiClient.get('/cms/docs')),
    getDoc: (id: string) => request<DocItem>(apiClient.get(`/cms/docs/${id}`)),
    createDoc: (data: Partial<DocItem>) => request<DocItem>(apiClient.post('/cms/docs', data)),
    updateDoc: (id: string, data: Partial<DocItem>) => request<DocItem>(apiClient.put(`/cms/docs/${id}`, data)),
    deleteDoc: (id: string) => request<void>(apiClient.delete(`/cms/docs/${id}`)),

    // Media
    getMedia: (params?: any) => request<MediaItem[]>(apiClient.get('/cms/media', { params })),
    uploadMedia: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return request<{ url: string }>(apiClient.post('/cms/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
    deleteMedia: (id: string) => request<void>(apiClient.delete(`/cms/media/${id}`)),

    // Stats
    getStats: () => request<CMSStats>(apiClient.get('/cms/stats')),
};
