import axios from 'axios';
import type {
  Package,
  PackageListResponse,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageFilters,
  BulkPackageAction,
  PackageComparison,
  PackageMigration,
  PackageAnalytics,
  PackageStats,
} from '../types/package';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PackageService {
  private baseUrl = `${API_BASE_URL}/admin/packages`;

  // Get all packages with pagination and filters
  async getPackages(
    page: number = 1,
    pageSize: number = 25,
    filters: PackageFilters = {}
  ): Promise<PackageListResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          page,
          pageSize,
          ...filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  }

  // Get a single package by ID
  async getPackage(id: string): Promise<Package> {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch package ${id}:`, error);
      throw error;
    }
  }

  // Create a new package
  async createPackage(packageData: CreatePackageRequest): Promise<Package> {
    try {
      const response = await axios.post(`${this.baseUrl}`, packageData);
      return response.data;
    } catch (error) {
      console.error('Failed to create package:', error);
      throw error;
    }
  }

  // Update an existing package
  async updatePackage(id: string, updates: UpdatePackageRequest): Promise<Package> {
    try {
      const response = await axios.put(`${this.baseUrl}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update package ${id}:`, error);
      throw error;
    }
  }

  // Delete a package
  async deletePackage(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete package ${id}:`, error);
      throw error;
    }
  }

  // Bulk actions on multiple packages
  async bulkAction(action: BulkPackageAction): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/bulk`, action);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      throw error;
    }
  }

  // Get package statistics
  async getPackageStats(): Promise<PackageStats> {
    try {
      const response = await axios.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch package stats:', error);
      throw error;
    }
  }

  // Get package comparison data
  async getPackageComparison(packageIds: string[]): Promise<PackageComparison> {
    try {
      const response = await axios.post(`${this.baseUrl}/compare`, {
        packageIds,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch package comparison:', error);
      throw error;
    }
  }

  // Get migration paths between packages
  async getMigrationPaths(fromPackageId: string, toPackageId: string): Promise<PackageMigration> {
    try {
      const response = await axios.get(`${this.baseUrl}/migration`, {
        params: { fromPackageId, toPackageId },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch migration paths:', error);
      throw error;
    }
  }

  // Get package analytics
  async getPackageAnalytics(
    packageId: string,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<PackageAnalytics> {
    try {
      const response = await axios.get(`${this.baseUrl}/${packageId}/analytics`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch analytics for package ${packageId}:`, error);
      throw error;
    }
  }

  // Clone an existing package
  async clonePackage(id: string, newName: string): Promise<Package> {
    try {
      const response = await axios.post(`${this.baseUrl}/${id}/clone`, {
        name: newName,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to clone package ${id}:`, error);
      throw error;
    }
  }

  // Export packages data
  async exportPackages(filters: PackageFilters = {}): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/export`, {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export packages:', error);
      throw error;
    }
  }

  // Preview pricing for a package configuration
  async previewPricing(packageConfig: Partial<CreatePackageRequest>): Promise<{
    monthly: number;
    yearly: number;
    savings: number;
    estimatedRevenue: number;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/preview-pricing`, packageConfig);
      return response.data;
    } catch (error) {
      console.error('Failed to preview pricing:', error);
      throw error;
    }
  }

  // Validate package slug availability
  async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/validate-slug`, {
        params: { slug, excludeId },
      });
      return response.data.available;
    } catch (error) {
      console.error('Failed to validate slug:', error);
      throw error;
    }
  }
}

export default new PackageService();