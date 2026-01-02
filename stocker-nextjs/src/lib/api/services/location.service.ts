import { ApiService } from '../api-service';
import logger from '../../utils/logger';
import type {
  CountryDto,
  CityDto,
  DistrictDto,
  CacheInvalidationResult,
} from './location.types';

/**
 * GeoLocation Service
 * Handles all location-related API calls (Countries, Cities, Districts)
 * Uses HybridCache on backend for optimal performance
 */
class LocationService {
  private readonly basePath = '/public/locations';

  // =====================================
  // COUNTRIES
  // =====================================

  /**
   * Get all active countries
   * Cached for 24 hours on backend
   */
  async getCountries(): Promise<CountryDto[]> {
    try {
      const response = await ApiService.get<CountryDto[]>(`${this.basePath}/countries`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch countries', { error });
      throw error;
    }
  }

  /**
   * Get country by ID
   */
  async getCountryById(id: string): Promise<CountryDto> {
    try {
      const response = await ApiService.get<CountryDto>(`${this.basePath}/countries/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch country', { id, error });
      throw error;
    }
  }

  /**
   * Get country by code (ISO 3166-1 alpha-2)
   */
  async getCountryByCode(code: string): Promise<CountryDto> {
    try {
      const response = await ApiService.get<CountryDto>(`${this.basePath}/countries/by-code/${code}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch country by code', { code, error });
      throw error;
    }
  }

  // =====================================
  // CITIES (States/Provinces)
  // =====================================

  /**
   * Get cities by country ID (cascade dropdown)
   * Cached for 24 hours on backend with tag: geo:country:{countryId}
   */
  async getCitiesByCountry(countryId: string): Promise<CityDto[]> {
    try {
      const response = await ApiService.get<CityDto[]>(`${this.basePath}/countries/${countryId}/cities`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch cities', { countryId, error });
      throw error;
    }
  }

  /**
   * Get city by ID
   */
  async getCityById(id: string): Promise<CityDto> {
    try {
      const response = await ApiService.get<CityDto>(`${this.basePath}/cities/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch city', { id, error });
      throw error;
    }
  }

  // =====================================
  // DISTRICTS
  // =====================================

  /**
   * Get districts by city ID (cascade dropdown)
   * Cached for 24 hours on backend with tag: geo:city:{cityId}
   */
  async getDistrictsByCity(cityId: string): Promise<DistrictDto[]> {
    try {
      const response = await ApiService.get<DistrictDto[]>(`${this.basePath}/cities/${cityId}/districts`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch districts', { cityId, error });
      throw error;
    }
  }

  /**
   * Get district by ID
   */
  async getDistrictById(id: string): Promise<DistrictDto> {
    try {
      const response = await ApiService.get<DistrictDto>(`${this.basePath}/districts/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch district', { id, error });
      throw error;
    }
  }

  // =====================================
  // CACHE MANAGEMENT (Admin only)
  // =====================================

  /**
   * Clear all geo location cache
   * Requires MasterAccess policy
   */
  async clearAllCache(): Promise<CacheInvalidationResult> {
    try {
      const response = await ApiService.post<CacheInvalidationResult>(`${this.basePath}/cache/clear`);
      return response.data;
    } catch (error) {
      logger.error('Failed to clear geo cache', { error });
      throw error;
    }
  }

  /**
   * Clear cache for specific country and its cities
   * Requires MasterAccess policy
   */
  async clearCountryCache(countryId: string): Promise<CacheInvalidationResult> {
    try {
      const response = await ApiService.post<CacheInvalidationResult>(
        `${this.basePath}/cache/clear/country/${countryId}`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to clear country cache', { countryId, error });
      throw error;
    }
  }

  /**
   * Clear cache for specific city and its districts
   * Requires MasterAccess policy
   */
  async clearCityCache(cityId: string): Promise<CacheInvalidationResult> {
    try {
      const response = await ApiService.post<CacheInvalidationResult>(
        `${this.basePath}/cache/clear/city/${cityId}`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to clear city cache', { cityId, error });
      throw error;
    }
  }
}

export const locationService = new LocationService();
