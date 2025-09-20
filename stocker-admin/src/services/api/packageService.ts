import { apiClient } from './apiClient';

// Package DTOs matching backend
export interface PackageDto {
  id: string;
  name: string;
  description?: string;
  basePrice: MoneyDto;
  currency: string;
  type: string;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number; // In GB
  trialDays: number;
  isActive: boolean;
  isPublic: boolean;
  displayOrder: number;
  createdAt: string;
  features: PackageFeatureDto[];
  modules: PackageModuleDto[];
}

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

export interface CreatePackageCommand {
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
  features?: PackageFeatureDto[];
  modules?: PackageModuleDto[];
}

export interface UpdatePackageCommand {
  id?: string;
  name: string;
  description?: string;
  basePrice: number;
  billingCycle: string;
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
  features?: PackageFeatureDto[];
  modules?: PackageModuleDto[];
}

export interface GetPackagesListQuery {
  includeInactive?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

class PackageService {
  private readonly basePath = '/api/master/packages';

  /**
   * Get all packages
   */
  async getAll(query?: GetPackagesListQuery): Promise<PackageDto[]> {
    try {
      const params = new URLSearchParams();
      
      if (query) {
        if (query.includeInactive !== undefined) {
          params.append('includeInactive', query.includeInactive.toString());
        }
        if (query.sortBy) {
          params.append('sortBy', query.sortBy);
        }
        if (query.sortDirection) {
          params.append('sortDirection', query.sortDirection);
        }
        if (query.pageNumber) {
          params.append('pageNumber', query.pageNumber.toString());
        }
        if (query.pageSize) {
          params.append('pageSize', query.pageSize.toString());
        }
      }
      
      const queryString = params.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
      
      const response = await apiClient.get<PackageDto[]>(url);
      
      // Response might be wrapped in a data property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        return (response as any).data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  }

  /**
   * Get package by ID
   */
  async getById(id: string): Promise<PackageDto | null> {
    try {
      return await apiClient.get<PackageDto>(`${this.basePath}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch package ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new package
   */
  async create(command: CreatePackageCommand): Promise<PackageDto> {
    try {
      return await apiClient.post<PackageDto>(this.basePath, command);
    } catch (error) {
      console.error('Failed to create package:', error);
      throw error;
    }
  }

  /**
   * Update package information
   */
  async update(id: string, command: UpdatePackageCommand): Promise<boolean> {
    try {
      console.log('Sending update command:', JSON.stringify(command, null, 2));
      const response = await apiClient.put<boolean>(`${this.basePath}/${id}`, command);
      return response === true;
    } catch (error) {
      console.error(`Failed to update package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a package
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<boolean>(`${this.basePath}/${id}`);
      return response === true;
    } catch (error) {
      console.error(`Failed to delete package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get active packages for display
   */
  async getActivePackages(): Promise<PackageDto[]> {
    return this.getAll({ 
      includeInactive: false,
      sortBy: 'displayOrder',
      sortDirection: 'asc'
    });
  }

  /**
   * Get public packages for customer selection
   */
  async getPublicPackages(): Promise<PackageDto[]> {
    const packages = await this.getAll({ includeInactive: false });
    return packages.filter(p => p.isPublic);
  }

  /**
   * Convert backend PackageDto to frontend Package format
   */
  mapToFrontendPackage(dto: PackageDto): any {
    // Helper function to decode HTML entities
    const decodeHtmlEntities = (text: string): string => {
      if (!text) return text;
      const textArea = document.createElement('textarea');
      textArea.innerHTML = text;
      return textArea.value;
    };

    // Map billing cycle
    const billingCycleMap: { [key: string]: 'monthly' | 'yearly' | 'one-time' } = {
      'Monthly': 'monthly',
      'Yearly': 'yearly',
      'OneTime': 'one-time'
    };

    // Map package type to tier
    const tierMap: { [key: string]: 'starter' | 'professional' | 'enterprise' | 'custom' } = {
      'Basic': 'starter',
      'Starter': 'starter',
      'Professional': 'professional',
      'Pro': 'professional',
      'Enterprise': 'enterprise',
      'Custom': 'custom'
    };

    return {
      id: dto.id,
      name: dto.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: decodeHtmlEntities(dto.name),
      description: decodeHtmlEntities(dto.description || ''),
      price: dto.basePrice.amount,
      billingCycle: billingCycleMap[dto.billingCycle] || 'monthly',
      currency: dto.currency,
      status: dto.isActive ? 'active' : 'inactive',
      tier: tierMap[dto.type] || 'starter',
      isPopular: dto.displayOrder === 1, // First item is popular
      isBestValue: dto.displayOrder === 2, // Second item is best value
      trialDays: dto.trialDays,
      limits: {
        users: dto.maxUsers,
        storage: dto.maxStorage,
        apiCalls: 100000, // Default values for fields not in backend
        projects: 10,
        customDomains: 3,
        emailSupport: true,
        phoneSupport: dto.type !== 'Basic',
        prioritySupport: dto.type === 'Enterprise',
        sla: dto.type === 'Enterprise' ? 99.9 : dto.type === 'Professional' ? 99 : 95
      },
      features: dto.features
        .filter(f => f.isEnabled)
        .map(f => decodeHtmlEntities(f.featureName)),
      addons: dto.modules
        .filter(m => m.isIncluded)
        .map(m => m.moduleCode),
      subscriberCount: 0, // Will need separate API for this
      revenue: 0, // Will need separate API for this
      createdAt: dto.createdAt,
      updatedAt: dto.createdAt
    };
  }

  /**
   * Convert frontend Package to backend CreatePackageCommand
   */
  mapToCreateCommand(pkg: any): CreatePackageCommand {
    const billingCycleMap: { [key: string]: string } = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'one-time': 'OneTime'
    };

    return {
      name: pkg.displayName,
      description: pkg.description,
      basePrice: pkg.price,
      billingCycle: billingCycleMap[pkg.billingCycle] || 'Monthly',
      maxUsers: pkg.limits.users,
      maxStorage: pkg.limits.storage,
      isActive: pkg.status === 'active',
      features: pkg.features?.map((feature: string) => ({
        featureCode: feature.toLowerCase().replace(/\s+/g, '_'),
        featureName: feature,
        isEnabled: true
      })),
      modules: pkg.addons?.map((addon: string) => ({
        moduleCode: addon,
        moduleName: addon.charAt(0).toUpperCase() + addon.slice(1).replace(/-/g, ' '),
        isIncluded: true
      }))
    };
  }

  /**
   * Convert frontend Package to backend UpdatePackageCommand
   */
  mapToUpdateCommand(pkg: any): UpdatePackageCommand {
    return this.mapToCreateCommand(pkg) as UpdatePackageCommand;
  }
}

// Export singleton instance
export const packageService = new PackageService();