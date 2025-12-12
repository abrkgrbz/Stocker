import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  cmsService,
  PageDto,
  CreatePageDto,
  UpdatePageDto,
  BlogCategoryDto,
  BlogCategoryListDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  BlogPostDto,
  BlogPostListDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  FAQCategoryDto,
  FAQCategoryListDto,
  CreateFAQCategoryDto,
  UpdateFAQCategoryDto,
  FAQItemDto,
  CreateFAQItemDto,
  UpdateFAQItemDto,
  CMSSettingDto,
  CreateSettingDto,
} from '../services/api/cmsService';

// Query Keys
export const cmsQueryKeys = {
  // Pages
  pages: ['cms', 'pages'] as const,
  pageById: (id: string) => ['cms', 'pages', id] as const,
  pageBySlug: (slug: string) => ['cms', 'pages', 'slug', slug] as const,

  // Blog
  blogCategories: ['cms', 'blog', 'categories'] as const,
  blogCategoryById: (id: string) => ['cms', 'blog', 'categories', id] as const,
  blogPosts: (categoryId?: string) => ['cms', 'blog', 'posts', { categoryId }] as const,
  blogPostById: (id: string) => ['cms', 'blog', 'posts', id] as const,
  blogPostBySlug: (slug: string) => ['cms', 'blog', 'posts', 'slug', slug] as const,

  // FAQ
  faqCategories: ['cms', 'faq', 'categories'] as const,
  faqCategoryById: (id: string) => ['cms', 'faq', 'categories', id] as const,
  faqItems: (categoryId?: string) => ['cms', 'faq', 'items', { categoryId }] as const,
  faqItemById: (id: string) => ['cms', 'faq', 'items', id] as const,

  // Settings
  settings: (group?: string) => ['cms', 'settings', { group }] as const,
  settingByKey: (key: string) => ['cms', 'settings', key] as const,
};

// ================== Pages Hooks ==================

export function usePages() {
  return useQuery({
    queryKey: cmsQueryKeys.pages,
    queryFn: () => cmsService.getPages(),
  });
}

export function usePageById(id: string) {
  return useQuery({
    queryKey: cmsQueryKeys.pageById(id),
    queryFn: () => cmsService.getPageById(id),
    enabled: !!id,
  });
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: cmsQueryKeys.pageBySlug(slug),
    queryFn: () => cmsService.getPageBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageDto) => cmsService.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pages });
      message.success('Sayfa oluşturuldu');
    },
    onError: () => {
      message.error('Sayfa oluşturulamadı');
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageDto }) =>
      cmsService.updatePage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pages });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pageById(variables.id) });
      message.success('Sayfa güncellendi');
    },
    onError: () => {
      message.error('Sayfa güncellenemedi');
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pages });
      message.success('Sayfa silindi');
    },
    onError: () => {
      message.error('Sayfa silinemedi');
    },
  });
}

export function usePublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.publishPage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pages });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pageById(id) });
      message.success('Sayfa yayınlandı');
    },
    onError: () => {
      message.error('Sayfa yayınlanamadı');
    },
  });
}

export function useUnpublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.unpublishPage(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pages });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.pageById(id) });
      message.success('Sayfa yayından kaldırıldı');
    },
    onError: () => {
      message.error('Sayfa yayından kaldırılamadı');
    },
  });
}

// ================== Blog Category Hooks ==================

export function useBlogCategories() {
  return useQuery({
    queryKey: cmsQueryKeys.blogCategories,
    queryFn: () => cmsService.getBlogCategories(),
  });
}

export function useBlogCategoryById(id: string) {
  return useQuery({
    queryKey: cmsQueryKeys.blogCategoryById(id),
    queryFn: () => cmsService.getBlogCategoryById(id),
    enabled: !!id,
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogCategoryDto) => cmsService.createBlogCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      message.success('Kategori oluşturuldu');
    },
    onError: () => {
      message.error('Kategori oluşturulamadı');
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogCategoryDto }) =>
      cmsService.updateBlogCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategoryById(variables.id) });
      message.success('Kategori güncellendi');
    },
    onError: () => {
      message.error('Kategori güncellenemedi');
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deleteBlogCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      message.success('Kategori silindi');
    },
    onError: () => {
      message.error('Kategori silinemedi');
    },
  });
}

// ================== Blog Post Hooks ==================

export function useBlogPosts(categoryId?: string) {
  return useQuery({
    queryKey: cmsQueryKeys.blogPosts(categoryId),
    queryFn: () => cmsService.getBlogPosts(categoryId),
  });
}

export function useBlogPostById(id: string) {
  return useQuery({
    queryKey: cmsQueryKeys.blogPostById(id),
    queryFn: () => cmsService.getBlogPostById(id),
    enabled: !!id,
  });
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: cmsQueryKeys.blogPostBySlug(slug),
    queryFn: () => cmsService.getBlogPostBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogPostDto) => cmsService.createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'posts'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      message.success('Yazı oluşturuldu');
    },
    onError: () => {
      message.error('Yazı oluşturulamadı');
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostDto }) =>
      cmsService.updateBlogPost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'posts'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogPostById(variables.id) });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      message.success('Yazı güncellendi');
    },
    onError: () => {
      message.error('Yazı güncellenemedi');
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'posts'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogCategories });
      message.success('Yazı silindi');
    },
    onError: () => {
      message.error('Yazı silinemedi');
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.publishBlogPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'posts'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogPostById(id) });
      message.success('Yazı yayınlandı');
    },
    onError: () => {
      message.error('Yazı yayınlanamadı');
    },
  });
}

export function useUnpublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.unpublishBlogPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'blog', 'posts'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.blogPostById(id) });
      message.success('Yazı yayından kaldırıldı');
    },
    onError: () => {
      message.error('Yazı yayından kaldırılamadı');
    },
  });
}

// ================== FAQ Category Hooks ==================

export function useFAQCategories() {
  return useQuery({
    queryKey: cmsQueryKeys.faqCategories,
    queryFn: () => cmsService.getFAQCategories(),
  });
}

export function useFAQCategoryById(id: string) {
  return useQuery({
    queryKey: cmsQueryKeys.faqCategoryById(id),
    queryFn: () => cmsService.getFAQCategoryById(id),
    enabled: !!id,
  });
}

export function useCreateFAQCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQCategoryDto) => cmsService.createFAQCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      message.success('Kategori oluşturuldu');
    },
    onError: () => {
      message.error('Kategori oluşturulamadı');
    },
  });
}

export function useUpdateFAQCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFAQCategoryDto }) =>
      cmsService.updateFAQCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategoryById(variables.id) });
      message.success('Kategori güncellendi');
    },
    onError: () => {
      message.error('Kategori güncellenemedi');
    },
  });
}

export function useDeleteFAQCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deleteFAQCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      message.success('Kategori silindi');
    },
    onError: () => {
      message.error('Kategori silinemedi');
    },
  });
}

// ================== FAQ Item Hooks ==================

export function useFAQItems(categoryId?: string) {
  return useQuery({
    queryKey: cmsQueryKeys.faqItems(categoryId),
    queryFn: () => cmsService.getFAQItems(categoryId),
  });
}

export function useFAQItemById(id: string) {
  return useQuery({
    queryKey: cmsQueryKeys.faqItemById(id),
    queryFn: () => cmsService.getFAQItemById(id),
    enabled: !!id,
  });
}

export function useCreateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQItemDto) => cmsService.createFAQItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faq', 'items'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      message.success('SSS eklendi');
    },
    onError: () => {
      message.error('SSS eklenemedi');
    },
  });
}

export function useUpdateFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFAQItemDto }) =>
      cmsService.updateFAQItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faq', 'items'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqItemById(variables.id) });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      message.success('SSS güncellendi');
    },
    onError: () => {
      message.error('SSS güncellenemedi');
    },
  });
}

export function useDeleteFAQItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cmsService.deleteFAQItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'faq', 'items'] });
      queryClient.invalidateQueries({ queryKey: cmsQueryKeys.faqCategories });
      message.success('SSS silindi');
    },
    onError: () => {
      message.error('SSS silinemedi');
    },
  });
}

export function useFAQFeedback() {
  return useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      cmsService.submitFAQFeedback(id, helpful),
    onSuccess: () => {
      message.success('Geri bildiriminiz için teşekkürler');
    },
  });
}

// ================== Settings Hooks ==================

export function useCMSSettings(group?: string) {
  return useQuery({
    queryKey: cmsQueryKeys.settings(group),
    queryFn: () => cmsService.getSettings(group),
  });
}

export function useCMSSettingByKey(key: string) {
  return useQuery({
    queryKey: cmsQueryKeys.settingByKey(key),
    queryFn: () => cmsService.getSettingByKey(key),
    enabled: !!key,
  });
}

export function useUpsertCMSSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettingDto) => cmsService.upsertSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'settings'] });
      message.success('Ayar kaydedildi');
    },
    onError: () => {
      message.error('Ayar kaydedilemedi');
    },
  });
}

export function useDeleteCMSSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => cmsService.deleteSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'settings'] });
      message.success('Ayar silindi');
    },
    onError: () => {
      message.error('Ayar silinemedi');
    },
  });
}

export function useInitializeCMSSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cmsService.initializeDefaultSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms', 'settings'] });
      message.success('Varsayılan ayarlar oluşturuldu');
    },
    onError: () => {
      message.error('Varsayılan ayarlar oluşturulamadı');
    },
  });
}
