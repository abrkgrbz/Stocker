import { apiClient } from './apiClient';

export interface EmailTemplate {
  id: string;
  tenantId?: string;
  templateKey: string;
  name: string;
  description?: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  language: string;
  category: string;
  variables: string[];
  sampleData?: string;
  isActive: boolean;
  isSystem: boolean;
  version: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface EmailTemplateListDto {
  items: EmailTemplate[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateEmailTemplateDto {
  templateKey: string;
  name: string;
  description?: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  language: string;
  category: string;
  variables: string[];
  sampleData?: string;
}

export interface UpdateEmailTemplateDto {
  name: string;
  description?: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  variables?: string[];
  sampleData?: string;
}

export interface EmailTemplatePreviewDto {
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  isSuccess: boolean;
  errorMessage?: string;
}

export interface EmailTemplateValidationDto {
  isValid: boolean;
  errors: string[];
  extractedVariables: string[];
}

export interface GetEmailTemplatesQuery {
  category?: string;
  language?: string;
  isActive?: boolean;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

class EmailTemplateService {
  private readonly baseUrl = '/api/master/emailtemplates';

  async getAll(query?: GetEmailTemplatesQuery): Promise<EmailTemplateListDto> {
    const params = new URLSearchParams();
    if (query?.category) params.append('category', query.category);
    if (query?.language) params.append('language', query.language);
    if (query?.isActive !== undefined) params.append('isActive', String(query.isActive));
    if (query?.searchTerm) params.append('searchTerm', query.searchTerm);
    if (query?.pageNumber) params.append('pageNumber', String(query.pageNumber));
    if (query?.pageSize) params.append('pageSize', String(query.pageSize));

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    return apiClient.get<EmailTemplateListDto>(url);
  }

  async getById(id: string): Promise<EmailTemplate> {
    return apiClient.get<EmailTemplate>(`${this.baseUrl}/${id}`);
  }

  async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.baseUrl}/categories`);
  }

  async create(data: CreateEmailTemplateDto): Promise<EmailTemplate> {
    return apiClient.post<EmailTemplate>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    return apiClient.put<EmailTemplate>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async toggleActive(id: string): Promise<EmailTemplate> {
    return apiClient.post<EmailTemplate>(`${this.baseUrl}/${id}/toggle-active`);
  }

  async preview(id: string, sampleData?: string): Promise<EmailTemplatePreviewDto> {
    return apiClient.post<EmailTemplatePreviewDto>(`${this.baseUrl}/${id}/preview`, { sampleData });
  }

  async validate(subject: string, htmlBody: string, plainTextBody?: string): Promise<EmailTemplateValidationDto> {
    return apiClient.post<EmailTemplateValidationDto>(`${this.baseUrl}/validate`, {
      subject,
      htmlBody,
      plainTextBody
    });
  }
}

export const emailTemplateService = new EmailTemplateService();
