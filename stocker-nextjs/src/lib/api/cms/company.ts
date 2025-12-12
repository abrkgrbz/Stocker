import { ApiService } from '../api-service';
import type {
  TeamMember,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
  CompanyValue,
  CreateCompanyValueRequest,
  UpdateCompanyValueRequest,
  ContactInfo,
  CreateContactInfoRequest,
  UpdateContactInfoRequest,
  SocialLink,
  CreateSocialLinkRequest,
  UpdateSocialLinkRequest,
} from './types';

const BASE_URL = '/api/cms/company';

// ==================== Team Members ====================
export const getTeamMembers = () =>
  ApiService.get<TeamMember[]>(`${BASE_URL}/team-members`);

export const getActiveTeamMembers = () =>
  ApiService.get<TeamMember[]>(`${BASE_URL}/team-members/active`);

export const getLeadershipTeamMembers = () =>
  ApiService.get<TeamMember[]>(`${BASE_URL}/team-members/leadership`);

export const getTeamMemberById = (id: string) =>
  ApiService.get<TeamMember>(`${BASE_URL}/team-members/${id}`);

export const createTeamMember = (data: CreateTeamMemberRequest) =>
  ApiService.post<TeamMember>(`${BASE_URL}/team-members`, data);

export const updateTeamMember = (id: string, data: UpdateTeamMemberRequest) =>
  ApiService.put<TeamMember>(`${BASE_URL}/team-members/${id}`, data);

export const deleteTeamMember = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/team-members/${id}`);

// ==================== Company Values ====================
export const getCompanyValues = () =>
  ApiService.get<CompanyValue[]>(`${BASE_URL}/values`);

export const getActiveCompanyValues = () =>
  ApiService.get<CompanyValue[]>(`${BASE_URL}/values/active`);

export const getCompanyValueById = (id: string) =>
  ApiService.get<CompanyValue>(`${BASE_URL}/values/${id}`);

export const createCompanyValue = (data: CreateCompanyValueRequest) =>
  ApiService.post<CompanyValue>(`${BASE_URL}/values`, data);

export const updateCompanyValue = (id: string, data: UpdateCompanyValueRequest) =>
  ApiService.put<CompanyValue>(`${BASE_URL}/values/${id}`, data);

export const deleteCompanyValue = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/values/${id}`);

// ==================== Contact Info ====================
export const getContactInfo = () =>
  ApiService.get<ContactInfo[]>(`${BASE_URL}/contact-info`);

export const getActiveContactInfo = () =>
  ApiService.get<ContactInfo[]>(`${BASE_URL}/contact-info/active`);

export const getContactInfoByType = (type: string) =>
  ApiService.get<ContactInfo[]>(`${BASE_URL}/contact-info/type/${type}`);

export const getContactInfoById = (id: string) =>
  ApiService.get<ContactInfo>(`${BASE_URL}/contact-info/${id}`);

export const createContactInfo = (data: CreateContactInfoRequest) =>
  ApiService.post<ContactInfo>(`${BASE_URL}/contact-info`, data);

export const updateContactInfo = (id: string, data: UpdateContactInfoRequest) =>
  ApiService.put<ContactInfo>(`${BASE_URL}/contact-info/${id}`, data);

export const deleteContactInfo = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/contact-info/${id}`);

// ==================== Social Links ====================
export const getSocialLinks = () =>
  ApiService.get<SocialLink[]>(`${BASE_URL}/social-links`);

export const getActiveSocialLinks = () =>
  ApiService.get<SocialLink[]>(`${BASE_URL}/social-links/active`);

export const getSocialLinkById = (id: string) =>
  ApiService.get<SocialLink>(`${BASE_URL}/social-links/${id}`);

export const createSocialLink = (data: CreateSocialLinkRequest) =>
  ApiService.post<SocialLink>(`${BASE_URL}/social-links`, data);

export const updateSocialLink = (id: string, data: UpdateSocialLinkRequest) =>
  ApiService.put<SocialLink>(`${BASE_URL}/social-links/${id}`, data);

export const deleteSocialLink = (id: string) =>
  ApiService.delete<void>(`${BASE_URL}/social-links/${id}`);
