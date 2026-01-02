/**
 * React Query Hooks for GeoLocation Module
 * Cascade dropdown support for Countries → Cities → Districts
 * Optimized with HybridCache on backend (L1 Memory + L2 Redis)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../services/location.service';
import { queryOptions } from '../query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  CountryDto,
  CityDto,
  DistrictDto,
  CountryOption,
  CityOption,
  DistrictOption,
} from '../services/location.types';

// =====================================
// QUERY KEYS
// =====================================

export const locationKeys = {
  all: ['locations'] as const,
  countries: () => [...locationKeys.all, 'countries'] as const,
  country: (id: string) => [...locationKeys.countries(), id] as const,
  countryByCode: (code: string) => [...locationKeys.countries(), 'code', code] as const,
  cities: (countryId: string) => [...locationKeys.all, 'cities', countryId] as const,
  city: (id: string) => [...locationKeys.all, 'city', id] as const,
  districts: (cityId: string) => [...locationKeys.all, 'districts', cityId] as const,
  district: (id: string) => [...locationKeys.all, 'district', id] as const,
};

// =====================================
// QUERY HOOKS - COUNTRIES
// =====================================

/**
 * Fetch all active countries
 * Data is cached for 24 hours on backend (HybridCache)
 * Frontend cache: 1 hour stale time (reference data rarely changes)
 */
export function useCountries() {
  return useQuery<CountryDto[]>({
    queryKey: locationKeys.countries(),
    queryFn: () => locationService.getCountries(),
    staleTime: 1000 * 60 * 60, // 1 hour - reference data
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Fetch single country by ID
 */
export function useCountry(id: string) {
  return useQuery<CountryDto>({
    queryKey: locationKeys.country(id),
    queryFn: () => locationService.getCountryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetch country by ISO code (e.g., "TR", "US")
 */
export function useCountryByCode(code: string) {
  return useQuery<CountryDto>({
    queryKey: locationKeys.countryByCode(code),
    queryFn: () => locationService.getCountryByCode(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 60,
  });
}

// =====================================
// QUERY HOOKS - CITIES (Cascade from Country)
// =====================================

/**
 * Fetch cities by country ID (cascade dropdown)
 * Only fetches when countryId is provided
 */
export function useCities(countryId: string | undefined) {
  return useQuery<CityDto[]>({
    queryKey: locationKeys.cities(countryId || ''),
    queryFn: () => locationService.getCitiesByCountry(countryId!),
    enabled: !!countryId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Fetch single city by ID
 */
export function useCity(id: string) {
  return useQuery<CityDto>({
    queryKey: locationKeys.city(id),
    queryFn: () => locationService.getCityById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

// =====================================
// QUERY HOOKS - DISTRICTS (Cascade from City)
// =====================================

/**
 * Fetch districts by city ID (cascade dropdown)
 * Only fetches when cityId is provided
 */
export function useDistricts(cityId: string | undefined) {
  return useQuery<DistrictDto[]>({
    queryKey: locationKeys.districts(cityId || ''),
    queryFn: () => locationService.getDistrictsByCity(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Fetch single district by ID
 */
export function useDistrict(id: string) {
  return useQuery<DistrictDto>({
    queryKey: locationKeys.district(id),
    queryFn: () => locationService.getDistrictById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

// =====================================
// SELECT OPTIONS HELPERS
// =====================================

/**
 * Transform countries to Select options
 */
export function useCountryOptions() {
  const { data: countries, ...rest } = useCountries();

  const options: CountryOption[] = (countries || []).map(country => ({
    value: country.id,
    label: country.name,
    code: country.code,
    phoneCode: country.phoneCode,
  }));

  return { options, ...rest };
}

/**
 * Transform cities to Select options (cascade from country)
 */
export function useCityOptions(countryId: string | undefined) {
  const { data: cities, ...rest } = useCities(countryId);

  const options: CityOption[] = (cities || []).map(city => ({
    value: city.id,
    label: city.name,
    code: city.code,
    region: city.region,
  }));

  return { options, ...rest };
}

/**
 * Transform districts to Select options (cascade from city)
 */
export function useDistrictOptions(cityId: string | undefined) {
  const { data: districts, ...rest } = useDistricts(cityId);

  const options: DistrictOption[] = (districts || []).map(district => ({
    value: district.id,
    label: district.name,
    postalCode: district.postalCode,
  }));

  return { options, ...rest };
}

// =====================================
// CACHE MANAGEMENT MUTATIONS (Admin only)
// =====================================

/**
 * Clear all geo location cache
 */
export function useClearAllLocationCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => locationService.clearAllCache(),
    onSuccess: (result) => {
      // Invalidate all location queries
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      showSuccess('Konum önbelleği temizlendi', `${result.keysInvalidated} anahtar silindi`);
    },
    onError: (error) => {
      showApiError(error, 'Önbellek temizlenemedi');
    },
  });
}

/**
 * Clear cache for specific country
 */
export function useClearCountryCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (countryId: string) => locationService.clearCountryCache(countryId),
    onSuccess: (result, countryId) => {
      // Invalidate country and its cities
      queryClient.invalidateQueries({ queryKey: locationKeys.country(countryId) });
      queryClient.invalidateQueries({ queryKey: locationKeys.cities(countryId) });
      showSuccess('Ülke önbelleği temizlendi');
    },
    onError: (error) => {
      showApiError(error, 'Önbellek temizlenemedi');
    },
  });
}

/**
 * Clear cache for specific city
 */
export function useClearCityCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cityId: string) => locationService.clearCityCache(cityId),
    onSuccess: (result, cityId) => {
      // Invalidate city and its districts
      queryClient.invalidateQueries({ queryKey: locationKeys.city(cityId) });
      queryClient.invalidateQueries({ queryKey: locationKeys.districts(cityId) });
      showSuccess('Şehir önbelleği temizlendi');
    },
    onError: (error) => {
      showApiError(error, 'Önbellek temizlenemedi');
    },
  });
}
