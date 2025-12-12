import { ApiService } from '../api-service';
import type {
  DocCategory,
  DocCategoryList,
  CreateDocCategoryRequest,
  UpdateDocCategoryRequest,
  DocArticle,
  DocArticleList,
  CreateDocArticleRequest,
  UpdateDocArticleRequest,
} from './types';

const BASE_URL = '/api/cms/docs';

// ==================== Doc Categories ====================
export const getDocCategories = () =>
  ApiService.get<DocCategory[]>(`${BASE_URL}/categories`);

export const getActiveDocCategories = () =>
  ApiService.get<DocCategory[]>(`${BASE_URL}/categories/active`);

export const getDocCategoryList = () =>
  ApiService.get<DocCategoryList[]>(`${BASE_URL}/categories/list`);

export const getDocCategoryById = (id: string) =>
  ApiService.get<DocCategory>(`${BASE_URL}/categories/${id}`);

export const getDocCategoryBySlug = (slug: string) =>
  ApiService.get<DocCategory>(`${BASE_URL}/categories/slug/${slug}`);

export const createDocCategory = (data: CreateDocCategoryRequest) =>
  ApiService.post<DocCategory>(`${BASE_URL}/categories`, data);

export const updateDocCategory = (id: string, data: UpdateDocCategoryRequest) =>
  ApiService.put<DocCategory>(`${BASE_URL}/categories/${id}`, data);

export const deleteDocCategory = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/categories/${id}`);

// ==================== Doc Articles ====================
export const getDocArticles = () =>
  ApiService.get<DocArticle[]>(`${BASE_URL}/articles`);

export const getActiveDocArticles = () =>
  ApiService.get<DocArticleList[]>(`${BASE_URL}/articles/active`);

export const getPopularDocArticles = () =>
  ApiService.get<DocArticleList[]>(`${BASE_URL}/articles/popular`);

export const getDocArticlesByCategory = (categoryId: string) =>
  ApiService.get<DocArticleList[]>(`${BASE_URL}/articles/category/${categoryId}`);

export const getDocArticleById = (id: string) =>
  ApiService.get<DocArticle>(`${BASE_URL}/articles/${id}`);

export const getDocArticleBySlug = (slug: string) =>
  ApiService.get<DocArticle>(`${BASE_URL}/articles/slug/${slug}`);

export const searchDocArticles = (query: string) =>
  ApiService.get<DocArticleList[]>(`${BASE_URL}/articles/search?q=${encodeURIComponent(query)}`);

export const createDocArticle = (data: CreateDocArticleRequest) =>
  ApiService.post<DocArticle>(`${BASE_URL}/articles`, data);

export const updateDocArticle = (id: string, data: UpdateDocArticleRequest) =>
  ApiService.put<DocArticle>(`${BASE_URL}/articles/${id}`, data);

export const deleteDocArticle = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/articles/${id}`);
