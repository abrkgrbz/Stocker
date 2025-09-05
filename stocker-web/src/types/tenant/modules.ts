export interface ModuleDto {
  id: string;
  moduleName: string;
  moduleCode: string;
  description?: string;
  isEnabled: boolean;
  enabledDate?: string;
  disabledDate?: string;
  configuration?: string;
  userLimit?: number;
  storageLimit?: number;
  recordLimit?: number;
  expiryDate?: string;
  isTrial: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ModulesSummaryDto {
  totalModules: number;
  enabledModules: number;
  disabledModules: number;
  trialModules: number;
  expiredModules: number;
  modules: ModuleDto[];
}