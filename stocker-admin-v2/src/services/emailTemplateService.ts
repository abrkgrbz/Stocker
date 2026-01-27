import { apiClient } from './apiClient';

export interface EmailTemplateDto {
    id: string;
    name: string;
    description?: string;
    templateKey: string;
    subject: string;
    htmlBody: string;
    plainTextBody?: string;
    category: string;
    language: string;
    version: number;
    isActive: boolean;
    isSystem: boolean;
    variables: string[];
    sampleData?: string;
    createdOn?: string;
}

export interface CreateEmailTemplateDto {
    name: string;
    description?: string;
    templateKey: string;
    subject: string;
    htmlBody: string;
    plainTextBody?: string;
    category: string;
    language: string;
    variables?: string[];
    sampleData?: string;
}

export interface UpdateEmailTemplateDto extends Partial<CreateEmailTemplateDto> { }

export interface EmailTemplateListDto {
    items: EmailTemplateDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface EmailTemplatePreviewDto {
    subject: string;
    htmlBody: string;
    plainTextBody?: string;
    isSuccess: boolean;
    errorMessage?: string;
}

class EmailTemplateService {
    private readonly baseUrl = '/api/master/emailtemplates';

    async getAll(params?: { category?: string; pageSize?: number }): Promise<EmailTemplateListDto> {
        const response = await apiClient.get<EmailTemplateListDto>(this.baseUrl, { params });
        // @ts-ignore
        return response;
    }

    async getById(id: string): Promise<EmailTemplateDto> {
        const response = await apiClient.get<EmailTemplateDto>(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response;
    }

    async create(data: CreateEmailTemplateDto): Promise<EmailTemplateDto> {
        const response = await apiClient.post<EmailTemplateDto>(this.baseUrl, data);
        // @ts-ignore
        return response;
    }

    async update(id: string, data: Partial<EmailTemplateDto>): Promise<boolean> {
        const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
        // @ts-ignore
        return response.success;
    }

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${id}`);
        // @ts-ignore
        return response.success;
    }

    async toggleActive(id: string): Promise<boolean> {
        const response = await apiClient.post(`${this.baseUrl}/${id}/toggle-active`);
        // @ts-ignore
        return response.success;
    }

    async preview(id: string, sampleData?: string): Promise<EmailTemplatePreviewDto> {
        const response = await apiClient.post<EmailTemplatePreviewDto>(`${this.baseUrl}/${id}/preview`, {
            sampleData
        });
        // @ts-ignore
        return response;
    }

    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<string[]>(`${this.baseUrl}/categories`);
        // @ts-ignore
        return response;
    }
}

export const emailTemplateService = new EmailTemplateService();
