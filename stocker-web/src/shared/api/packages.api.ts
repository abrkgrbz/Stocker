import { api } from './client';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod: 'Monthly' | 'Yearly';
  features: string[];
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
  isPopular?: boolean;
  sortOrder: number;
  createdDate?: string;
  modifiedDate?: string;
}

export const packagesApi = {
  getAll: (params?: { isActive?: boolean; search?: string }) => 
    api.get<any>('/api/master/Packages', { params }),
    
  getById: (id: string) => 
    api.get<any>(`/api/master/Packages/${id}`),
    
  create: (data: Partial<Package>) => 
    api.post<any>('/api/master/Packages', data),
    
  update: (id: string, data: Partial<Package>) => 
    api.put<any>(`/api/master/Packages/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/api/master/Packages/${id}`),
};