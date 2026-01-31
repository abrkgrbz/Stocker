import { apiClient } from './apiClient';

export interface SecretInfo {
    name: string;
    createdOn?: string;
    updatedOn?: string;
    expiresOn?: string;
    enabled: boolean;
    tags: Record<string, string>;
    tenantShortId?: string;
    secretType: string;
}

export interface SecretsListResponse {
    provider: string;
    totalCount: number;
    secrets: SecretInfo[];
}

export interface SecretStoreStatus {
    provider: string;
    isAvailable: boolean;
}

export interface BulkDeleteResponse {
    deletedSecrets: string[];
    failedSecrets: { name: string; reason: string }[];
}

class SecretsService {
    private readonly baseUrl = '/api/admin/secrets';

    async getAll(): Promise<SecretsListResponse> {
        const response = await apiClient.get<SecretsListResponse>(this.baseUrl);
        // @ts-ignore
        return response;
    }

    async getStatus(): Promise<SecretStoreStatus> {
        const response = await apiClient.get<SecretStoreStatus>(`${this.baseUrl}/status`);
        // @ts-ignore
        return response;
    }

    async deleteSecret(secretName: string): Promise<boolean> {
        const response = await apiClient.delete(`${this.baseUrl}/${encodeURIComponent(secretName)}`);
        // @ts-ignore
        return response;
    }

    async deleteMultipleSecrets(secretNames: string[]): Promise<BulkDeleteResponse> {
        // @ts-ignore
        return apiClient.post(`${this.baseUrl}/delete-multiple`, { secretNames });
    }
}

export const secretsService = new SecretsService();
export type { SecretInfo as SecretDto }; // Keep compatibility with existing imports
