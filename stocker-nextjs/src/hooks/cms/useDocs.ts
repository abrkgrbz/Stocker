/**
 * React Query hooks for CMS Documentation entities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  // Doc Categories
  getDocCategories,
  getActiveDocCategories,
  getDocCategoryList,
  getDocCategoryById,
  getDocCategoryBySlug,
  createDocCategory,
  updateDocCategory,
  deleteDocCategory,
  // Doc Articles
  getDocArticles,
  getActiveDocArticles,
  getPopularDocArticles,
  getDocArticlesByCategory,
  getDocArticleById,
  getDocArticleBySlug,
  searchDocArticles,
  createDocArticle,
  updateDocArticle,
  deleteDocArticle,
} from '@/lib/api/cms/docs';
import type {
  CreateDocCategoryRequest,
  UpdateDocCategoryRequest,
  CreateDocArticleRequest,
  UpdateDocArticleRequest,
} from '@/lib/api/cms/types';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
} from '@/lib/utils/sweetalert';

// Query Keys
export const DOCS_QUERY_KEYS = {
  categories: ['cms', 'doc-categories'] as const,
  articles: ['cms', 'doc-articles'] as const,
};

// ==================== Doc Categories ====================
export function useDocCategories() {
  return useQuery({ queryKey: DOCS_QUERY_KEYS.categories, queryFn: getDocCategories });
}

export function useActiveDocCategories() {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.categories, 'active'], queryFn: getActiveDocCategories });
}

export function useDocCategoryList() {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.categories, 'list'], queryFn: getDocCategoryList });
}

export function useDocCategory(id: string) {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.categories, id], queryFn: () => getDocCategoryById(id), enabled: !!id });
}

export function useDocCategoryBySlug(slug: string) {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.categories, 'slug', slug], queryFn: () => getDocCategoryBySlug(slug), enabled: !!slug });
}

export function useCreateDocCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocCategoryRequest) => createDocCategory(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories }); showCreateSuccess('dokümantasyon kategorisi'); },
    onError: (error: any) => { showError(error.message || 'Kategori oluşturulurken hata oluştu'); },
  });
}

export function useUpdateDocCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocCategoryRequest }) => updateDocCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories }); showUpdateSuccess('dokümantasyon kategorisi'); },
    onError: (error: any) => { showError(error.message || 'Kategori güncellenirken hata oluştu'); },
  });
}

export function useDeleteDocCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocCategory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories }); showDeleteSuccess('dokümantasyon kategorisi'); },
    onError: (error: any) => { showError(error.message || 'Kategori silinirken hata oluştu'); },
  });
}

// ==================== Doc Articles ====================
export function useDocArticles() {
  return useQuery({ queryKey: DOCS_QUERY_KEYS.articles, queryFn: getDocArticles });
}

export function useActiveDocArticles() {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.articles, 'active'], queryFn: getActiveDocArticles });
}

export function usePopularDocArticles() {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.articles, 'popular'], queryFn: getPopularDocArticles });
}

export function useDocArticlesByCategory(categoryId: string) {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.articles, 'category', categoryId], queryFn: () => getDocArticlesByCategory(categoryId), enabled: !!categoryId });
}

export function useDocArticle(id: string) {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.articles, id], queryFn: () => getDocArticleById(id), enabled: !!id });
}

export function useDocArticleBySlug(slug: string) {
  return useQuery({ queryKey: [...DOCS_QUERY_KEYS.articles, 'slug', slug], queryFn: () => getDocArticleBySlug(slug), enabled: !!slug });
}

export function useSearchDocArticles(query: string) {
  return useQuery({
    queryKey: [...DOCS_QUERY_KEYS.articles, 'search', query],
    queryFn: () => searchDocArticles(query),
    enabled: !!query && query.length >= 2
  });
}

export function useCreateDocArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocArticleRequest) => createDocArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories });
      showCreateSuccess('dokümantasyon makalesi');
    },
    onError: (error: any) => { showError(error.message || 'Makale oluşturulurken hata oluştu'); },
  });
}

export function useUpdateDocArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocArticleRequest }) => updateDocArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories });
      showUpdateSuccess('dokümantasyon makalesi');
    },
    onError: (error: any) => { showError(error.message || 'Makale güncellenirken hata oluştu'); },
  });
}

export function useDeleteDocArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.articles });
      queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEYS.categories });
      showDeleteSuccess('dokümantasyon makalesi');
    },
    onError: (error: any) => { showError(error.message || 'Makale silinirken hata oluştu'); },
  });
}
