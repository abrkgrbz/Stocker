import { apiClient } from './apiClient';

// DTOs matching backend
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

export interface BulkDeleteResponse {
  tenantShortId: string;
  deletedCount: number;
  failedCount: number;
  deletedSecrets: string[];
  failedSecrets: string[];
}

export interface SecretStoreStatus {
  provider: string;
  isAvailable: boolean;
}

class SecretsService {
  private readonly basePath = '/api/admin/secrets';

  /**
   * Get secret store status
   */
  async getStatus(): Promise<SecretStoreStatus> {
    return apiClient.get<SecretStoreStatus>(`${this.basePath}/status`);
  }

  /**
   * List all secrets with optional prefix filter
   */
  async listSecrets(prefix: string = 'tenant-'): Promise<SecretsListResponse> {
    return apiClient.get<SecretsListResponse>(this.basePath, { prefix });
  }

  /**
   * Get secret metadata (without value)
   */
  async getSecretMetadata(secretName: string): Promise<SecretInfo> {
    return apiClient.get<SecretInfo>(`${this.basePath}/${encodeURIComponent(secretName)}`);
  }

  /**
   * Delete a single secret
   */
  async deleteSecret(secretName: string): Promise<{ message: string; provider: string }> {
    return apiClient.delete<{ message: string; provider: string }>(
      `${this.basePath}/${encodeURIComponent(secretName)}`
    );
  }

  /**
   * Delete all secrets for a specific tenant
   */
  async deleteTenantSecrets(tenantShortId: string): Promise<BulkDeleteResponse> {
    return apiClient.delete<BulkDeleteResponse>(`${this.basePath}/tenant/${tenantShortId}`);
  }

  /**
   * Group secrets by tenant
   */
  groupSecretsByTenant(secrets: SecretInfo[]): Map<string, SecretInfo[]> {
    const grouped = new Map<string, SecretInfo[]>();

    secrets.forEach(secret => {
      const tenantId = secret.tenantShortId || 'unknown';
      if (!grouped.has(tenantId)) {
        grouped.set(tenantId, []);
      }
      grouped.get(tenantId)!.push(secret);
    });

    return grouped;
  }
}

// Export singleton instance
export const secretsService = new SecretsService();
