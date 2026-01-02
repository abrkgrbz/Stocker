'use client';

/**
 * Cascade Location Select Component
 * Country → City → District cascade dropdowns
 * Monochrome Enterprise Theme - Black/White/Gray
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { Select, Spin } from 'antd';
import { MapPinIcon, GlobeAltIcon, BuildingOffice2Icon, MapIcon } from '@heroicons/react/24/outline';
import { useCountries, useCities, useDistricts } from '@/lib/api/hooks/useLocations';
import type { SelectedLocation } from '@/lib/api/services/location.types';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CascadeLocationSelectProps {
  /** Current selected location state */
  value?: SelectedLocation;
  /** Callback when location changes */
  onChange?: (location: SelectedLocation) => void;
  /** Show district dropdown (default: true) */
  showDistrict?: boolean;
  /** Show region info in city label (default: true) */
  showRegion?: boolean;
  /** Disable all selects */
  disabled?: boolean;
  /** Custom class name for container */
  className?: string;
  /** Label for country field */
  countryLabel?: string;
  /** Label for city field */
  cityLabel?: string;
  /** Label for district field */
  districtLabel?: string;
  /** Placeholder for country */
  countryPlaceholder?: string;
  /** Placeholder for city */
  cityPlaceholder?: string;
  /** Placeholder for district */
  districtPlaceholder?: string;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Required field indicator */
  required?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CascadeLocationSelect({
  value,
  onChange,
  showDistrict = true,
  showRegion = true,
  disabled = false,
  className = '',
  countryLabel = 'Ülke',
  cityLabel = 'Şehir',
  districtLabel = 'İlçe',
  countryPlaceholder = 'Ülke seçin...',
  cityPlaceholder = 'Şehir seçin...',
  districtPlaceholder = 'İlçe seçin...',
  layout = 'grid',
  required = false,
}: CascadeLocationSelectProps) {
  // ─────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────

  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: cities, isLoading: citiesLoading } = useCities(value?.countryId);
  const { data: districts, isLoading: districtsLoading } = useDistricts(value?.cityId);

  // ─────────────────────────────────────────────────────────────
  // SELECT OPTIONS
  // ─────────────────────────────────────────────────────────────

  const countryOptions = useMemo(() => {
    return (countries || []).map(country => ({
      value: country.id,
      label: (
        <div className="flex items-center gap-2">
          <span className="text-base">{getCountryFlag(country.code)}</span>
          <span>{country.name}</span>
          <span className="text-slate-400 text-xs">({country.code})</span>
        </div>
      ),
      searchLabel: `${country.name} ${country.code}`,
      data: country,
    }));
  }, [countries]);

  const cityOptions = useMemo(() => {
    return (cities || []).map(city => ({
      value: city.id,
      label: (
        <div className="flex items-center justify-between w-full">
          <span>{city.name}</span>
          {showRegion && city.region && (
            <span className="text-slate-400 text-xs">{city.region}</span>
          )}
        </div>
      ),
      searchLabel: `${city.name} ${city.region || ''} ${city.code || ''}`,
      data: city,
    }));
  }, [cities, showRegion]);

  const districtOptions = useMemo(() => {
    return (districts || []).map(district => ({
      value: district.id,
      label: district.name,
      searchLabel: `${district.name} ${district.postalCode || ''}`,
      data: district,
    }));
  }, [districts]);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handleCountryChange = useCallback((countryId: string) => {
    const country = countries?.find(c => c.id === countryId);
    onChange?.({
      countryId,
      countryName: country?.name,
      countryCode: country?.code,
      // Reset city and district when country changes
      cityId: undefined,
      cityName: undefined,
      region: undefined,
      districtId: undefined,
      districtName: undefined,
    });
  }, [countries, onChange]);

  const handleCityChange = useCallback((cityId: string) => {
    const city = cities?.find(c => c.id === cityId);
    onChange?.({
      ...value,
      cityId,
      cityName: city?.name,
      region: city?.region,
      // Reset district when city changes
      districtId: undefined,
      districtName: undefined,
    });
  }, [cities, value, onChange]);

  const handleDistrictChange = useCallback((districtId: string) => {
    const district = districts?.find(d => d.id === districtId);
    onChange?.({
      ...value,
      districtId,
      districtName: district?.name,
    });
  }, [districts, value, onChange]);

  // ─────────────────────────────────────────────────────────────
  // FILTER FUNCTION
  // ─────────────────────────────────────────────────────────────

  const filterOption = useCallback((input: string, option: any) => {
    return (option?.searchLabel || '')
      .toLowerCase()
      .includes(input.toLowerCase());
  }, []);

  // ─────────────────────────────────────────────────────────────
  // LAYOUT CLASSES
  // ─────────────────────────────────────────────────────────────

  const containerClass = useMemo(() => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'vertical':
        return 'flex flex-col gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-12 gap-4';
    }
  }, [layout]);

  const fieldClass = useMemo(() => {
    switch (layout) {
      case 'horizontal':
        return 'flex-1 min-w-[200px]';
      case 'vertical':
        return 'w-full';
      case 'grid':
      default:
        return showDistrict ? 'col-span-4' : 'col-span-6';
    }
  }, [layout, showDistrict]);

  // ─────────────────────────────────────────────────────────────
  // SHARED SELECT STYLES
  // ─────────────────────────────────────────────────────────────

  const selectClassName = "!w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white";

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Country Select */}
      <div className={fieldClass}>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          <GlobeAltIcon className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          {countryLabel}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <Select
          showSearch
          value={value?.countryId}
          onChange={handleCountryChange}
          placeholder={countryPlaceholder}
          disabled={disabled}
          loading={countriesLoading}
          options={countryOptions}
          filterOption={filterOption}
          optionFilterProp="searchLabel"
          className={selectClassName}
          popupClassName="[&_.ant-select-item]:!py-2"
          notFoundContent={countriesLoading ? <Spin size="small" /> : 'Ülke bulunamadı'}
          allowClear
          onClear={() => onChange?.({})}
        />
      </div>

      {/* City Select */}
      <div className={fieldClass}>
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          <BuildingOffice2Icon className="w-4 h-4 inline-block mr-1 -mt-0.5" />
          {cityLabel}
        </label>
        <Select
          showSearch
          value={value?.cityId}
          onChange={handleCityChange}
          placeholder={cityPlaceholder}
          disabled={disabled || !value?.countryId}
          loading={citiesLoading}
          options={cityOptions}
          filterOption={filterOption}
          optionFilterProp="searchLabel"
          className={selectClassName}
          popupClassName="[&_.ant-select-item]:!py-2"
          notFoundContent={
            !value?.countryId ? 'Önce ülke seçin' :
            citiesLoading ? <Spin size="small" /> :
            'Şehir bulunamadı'
          }
          allowClear
          onClear={() => onChange?.({
            ...value,
            cityId: undefined,
            cityName: undefined,
            region: undefined,
            districtId: undefined,
            districtName: undefined,
          })}
        />
      </div>

      {/* District Select (Optional) */}
      {showDistrict && (
        <div className={fieldClass}>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            <MapIcon className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            {districtLabel}
          </label>
          <Select
            showSearch
            value={value?.districtId}
            onChange={handleDistrictChange}
            placeholder={districtPlaceholder}
            disabled={disabled || !value?.cityId}
            loading={districtsLoading}
            options={districtOptions}
            filterOption={filterOption}
            optionFilterProp="searchLabel"
            className={selectClassName}
            popupClassName="[&_.ant-select-item]:!py-2"
            notFoundContent={
              !value?.cityId ? 'Önce şehir seçin' :
              districtsLoading ? <Spin size="small" /> :
              'İlçe bulunamadı'
            }
            allowClear
            onClear={() => onChange?.({
              ...value,
              districtId: undefined,
              districtName: undefined,
            })}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Country Flag Emoji
// ═══════════════════════════════════════════════════════════════

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default CascadeLocationSelect;
