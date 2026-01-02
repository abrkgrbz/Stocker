// =====================================
// GeoLocation Module - TypeScript Type Definitions
// Aligned with Backend LocationController DTOs
// =====================================

export type Guid = string;

// =====================================
// COUNTRY
// =====================================

export interface CountryDto {
  id: Guid;
  name: string;
  code: string;        // ISO 3166-1 alpha-2 (e.g., "TR", "US")
  code3: string;       // ISO 3166-1 alpha-3 (e.g., "TUR", "USA")
  phoneCode: string;   // e.g., "+90", "+1"
  currencyCode: string;
  currencySymbol: string;
  continent: string;
  isActive: boolean;
}

// =====================================
// CITY (State/Province)
// =====================================

export interface CityDto {
  id: Guid;
  countryId: Guid;
  name: string;
  code: string;        // e.g., "34" for Istanbul, "CA" for California
  plateCode?: string;  // For countries with plate codes (Turkey: 34, 06, etc.)
  phoneCode?: string;  // Area code
  region?: string;     // Geographic region (e.g., "Marmara", "West Coast")
  isActive: boolean;
}

// =====================================
// DISTRICT
// =====================================

export interface DistrictDto {
  id: Guid;
  cityId: Guid;
  name: string;
  code?: string;
  postalCode?: string;
  isActive: boolean;
}

// =====================================
// LOCATION SELECT OPTIONS
// For use in Select/Dropdown components
// =====================================

export interface CountryOption {
  value: Guid;
  label: string;
  code: string;
  phoneCode: string;
}

export interface CityOption {
  value: Guid;
  label: string;
  code: string;
  region?: string;
}

export interface DistrictOption {
  value: Guid;
  label: string;
  postalCode?: string;
}

// =====================================
// SELECTED LOCATION STATE
// For cascade dropdown state management
// =====================================

export interface SelectedLocation {
  countryId?: Guid;
  countryName?: string;
  countryCode?: string;
  cityId?: Guid;
  cityName?: string;
  region?: string;
  districtId?: Guid;
  districtName?: string;
}

// =====================================
// CACHE INVALIDATION
// =====================================

export interface CacheInvalidationResult {
  success: boolean;
  message: string;
  keysInvalidated: number;
}
