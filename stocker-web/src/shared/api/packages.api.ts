import { api } from './client';

export interface MoneyDto {
  amount: number;
  currency: string;
}

export interface PackageFeatureDto {
  featureCode: string;
  featureName: string;
  isEnabled: boolean;
}

export interface PackageModuleDto {
  moduleCode: string;
  moduleName: string;
  isIncluded: boolean;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  basePrice: MoneyDto;
  currency: string;
  type?: string;
  billingCycle: 'Monthly' | 'Yearly';
  maxUsers: number;
  maxStorage: number;
  trialDays?: number;
  isActive: boolean;
  isPublic?: boolean;
  displayOrder: number;
  createdAt?: string;
  features: PackageFeatureDto[];
  modules: PackageModuleDto[];
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number;
  isActive?: boolean;
  features?: PackageFeatureDto[];
  modules?: PackageModuleDto[];
}

export interface UpdatePackageRequest {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
}

export const packagesApi = {
  getAll: (params?: { isActive?: boolean; search?: string }) => 
    api.get<any>('/api/master/Packages', { params }),
    
  getById: (id: string) => 
    api.get<any>(`/api/master/Packages/${id}`),
    
  create: (data: CreatePackageRequest) => 
    api.post<any>('/api/master/Packages', data),
    
  update: (id: string, data: UpdatePackageRequest) => 
    api.put<any>(`/api/master/Packages/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/master/Packages/${id}`),
};