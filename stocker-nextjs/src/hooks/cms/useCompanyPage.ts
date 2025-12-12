/**
 * React Query hooks for CMS Company Page entities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  // Team Members
  getTeamMembers,
  getActiveTeamMembers,
  getLeadershipTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  // Company Values
  getCompanyValues,
  getActiveCompanyValues,
  getCompanyValueById,
  createCompanyValue,
  updateCompanyValue,
  deleteCompanyValue,
  // Contact Info
  getContactInfo,
  getActiveContactInfo,
  getContactInfoByType,
  getContactInfoById,
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
  // Social Links
  getSocialLinks,
  getActiveSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '@/lib/api/cms/company';
import type {
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  CreateCompanyValueRequest,
  UpdateCompanyValueRequest,
  CreateContactInfoRequest,
  UpdateContactInfoRequest,
  CreateSocialLinkRequest,
  UpdateSocialLinkRequest,
} from '@/lib/api/cms/types';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
} from '@/lib/utils/sweetalert';

// Query Keys
export const COMPANY_QUERY_KEYS = {
  teamMembers: ['cms', 'team-members'] as const,
  companyValues: ['cms', 'company-values'] as const,
  contactInfo: ['cms', 'contact-info'] as const,
  socialLinks: ['cms', 'social-links'] as const,
};

// ==================== Team Members ====================
export function useTeamMembers() {
  return useQuery({ queryKey: COMPANY_QUERY_KEYS.teamMembers, queryFn: getTeamMembers });
}

export function useActiveTeamMembers() {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.teamMembers, 'active'], queryFn: getActiveTeamMembers });
}

export function useLeadershipTeamMembers() {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.teamMembers, 'leadership'], queryFn: getLeadershipTeamMembers });
}

export function useTeamMember(id: string) {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.teamMembers, id], queryFn: () => getTeamMemberById(id), enabled: !!id });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamMemberRequest) => createTeamMember(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.teamMembers }); showCreateSuccess('ekip üyesi'); },
    onError: (error: any) => { showError(error.message || 'Ekip üyesi oluşturulurken hata oluştu'); },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberRequest }) => updateTeamMember(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.teamMembers }); showUpdateSuccess('ekip üyesi'); },
    onError: (error: any) => { showError(error.message || 'Ekip üyesi güncellenirken hata oluştu'); },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.teamMembers }); showDeleteSuccess('ekip üyesi'); },
    onError: (error: any) => { showError(error.message || 'Ekip üyesi silinirken hata oluştu'); },
  });
}

// ==================== Company Values ====================
export function useCompanyValues() {
  return useQuery({ queryKey: COMPANY_QUERY_KEYS.companyValues, queryFn: getCompanyValues });
}

export function useActiveCompanyValues() {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.companyValues, 'active'], queryFn: getActiveCompanyValues });
}

export function useCompanyValue(id: string) {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.companyValues, id], queryFn: () => getCompanyValueById(id), enabled: !!id });
}

export function useCreateCompanyValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyValueRequest) => createCompanyValue(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.companyValues }); showCreateSuccess('şirket değeri'); },
    onError: (error: any) => { showError(error.message || 'Şirket değeri oluşturulurken hata oluştu'); },
  });
}

export function useUpdateCompanyValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyValueRequest }) => updateCompanyValue(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.companyValues }); showUpdateSuccess('şirket değeri'); },
    onError: (error: any) => { showError(error.message || 'Şirket değeri güncellenirken hata oluştu'); },
  });
}

export function useDeleteCompanyValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompanyValue(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.companyValues }); showDeleteSuccess('şirket değeri'); },
    onError: (error: any) => { showError(error.message || 'Şirket değeri silinirken hata oluştu'); },
  });
}

// ==================== Contact Info ====================
export function useContactInfo() {
  return useQuery({ queryKey: COMPANY_QUERY_KEYS.contactInfo, queryFn: getContactInfo });
}

export function useActiveContactInfo() {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.contactInfo, 'active'], queryFn: getActiveContactInfo });
}

export function useContactInfoByType(type: string) {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.contactInfo, 'type', type], queryFn: () => getContactInfoByType(type), enabled: !!type });
}

export function useContactInfoById(id: string) {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.contactInfo, id], queryFn: () => getContactInfoById(id), enabled: !!id });
}

export function useCreateContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContactInfoRequest) => createContactInfo(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.contactInfo }); showCreateSuccess('iletişim bilgisi'); },
    onError: (error: any) => { showError(error.message || 'İletişim bilgisi oluşturulurken hata oluştu'); },
  });
}

export function useUpdateContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactInfoRequest }) => updateContactInfo(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.contactInfo }); showUpdateSuccess('iletişim bilgisi'); },
    onError: (error: any) => { showError(error.message || 'İletişim bilgisi güncellenirken hata oluştu'); },
  });
}

export function useDeleteContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContactInfo(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.contactInfo }); showDeleteSuccess('iletişim bilgisi'); },
    onError: (error: any) => { showError(error.message || 'İletişim bilgisi silinirken hata oluştu'); },
  });
}

// ==================== Social Links ====================
export function useSocialLinks() {
  return useQuery({ queryKey: COMPANY_QUERY_KEYS.socialLinks, queryFn: getSocialLinks });
}

export function useActiveSocialLinks() {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.socialLinks, 'active'], queryFn: getActiveSocialLinks });
}

export function useSocialLink(id: string) {
  return useQuery({ queryKey: [...COMPANY_QUERY_KEYS.socialLinks, id], queryFn: () => getSocialLinkById(id), enabled: !!id });
}

export function useCreateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSocialLinkRequest) => createSocialLink(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.socialLinks }); showCreateSuccess('sosyal medya linki'); },
    onError: (error: any) => { showError(error.message || 'Sosyal medya linki oluşturulurken hata oluştu'); },
  });
}

export function useUpdateSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSocialLinkRequest }) => updateSocialLink(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.socialLinks }); showUpdateSuccess('sosyal medya linki'); },
    onError: (error: any) => { showError(error.message || 'Sosyal medya linki güncellenirken hata oluştu'); },
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSocialLink(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.socialLinks }); showDeleteSuccess('sosyal medya linki'); },
    onError: (error: any) => { showError(error.message || 'Sosyal medya linki silinirken hata oluştu'); },
  });
}
