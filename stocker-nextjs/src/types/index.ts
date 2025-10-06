// Common types used across the application

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  identifier: string;
  name: string;
  domain?: string;
  isActive: boolean;
  packageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  isActive: boolean;
}
