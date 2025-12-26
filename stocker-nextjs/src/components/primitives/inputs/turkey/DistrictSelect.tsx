'use client';

/**
 * =====================================
 * TURKEY DISTRICT SELECT COMPONENT
 * =====================================
 *
 * District (ilçe) select linked to a city.
 * Uses react-select for Select2-like experience.
 */

import React, { useMemo, useEffect } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { cn } from '@/lib/cn';
import { getDistrictsByCity, hasDistrictsData } from './data/districts';
import { getCityByName } from './data/cities';

export interface DistrictOption {
  value: string;
  label: string;
}

export interface DistrictSelectProps {
  /** Selected city (code or name based on cityValueType) */
  cityCode: string | null;
  /** How to interpret cityCode - 'code' for plate code, 'name' for city name */
  cityValueType?: 'code' | 'name';
  /** Selected district name */
  value: string | null;
  /** Change handler */
  onChange: (district: string | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Allow custom district (when data not available) */
  allowCustom?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeConfig = {
  sm: { height: 32, fontSize: 14 },
  md: { height: 40, fontSize: 14 },
  lg: { height: 48, fontSize: 16 },
};

export function DistrictSelect({
  cityCode,
  cityValueType = 'code',
  value,
  onChange,
  placeholder = 'İlçe seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  allowCustom = false,
  className,
}: DistrictSelectProps) {
  // Convert city name to code if needed
  const resolvedCityCode = useMemo(() => {
    if (!cityCode) return null;
    if (cityValueType === 'name') {
      const city = getCityByName(cityCode);
      return city?.code || null;
    }
    return cityCode;
  }, [cityCode, cityValueType]);

  // Get districts for selected city
  const districts = useMemo(() => {
    if (!resolvedCityCode) return [];
    return getDistrictsByCity(resolvedCityCode);
  }, [resolvedCityCode]);

  const hasData = resolvedCityCode ? hasDistrictsData(resolvedCityCode) : false;

  // Convert districts to react-select options
  const options: DistrictOption[] = useMemo(
    () =>
      districts.map((district) => ({
        value: district,
        label: district,
      })),
    [districts]
  );

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  // Clear district when city changes
  useEffect(() => {
    if (value && resolvedCityCode) {
      const districtExists = districts.includes(value);
      if (!districtExists && hasData) {
        onChange(null);
      }
    }
  }, [resolvedCityCode, districts, value, hasData, onChange]);

  const handleChange = (option: SingleValue<DistrictOption>) => {
    if (option) {
      onChange(option.value);
    } else {
      onChange(null);
    }
  };

  const isDisabled = disabled || !resolvedCityCode;
  const showAsInput = !hasData && allowCustom && resolvedCityCode;

  const { height, fontSize } = sizeConfig[size];

  // Custom styles for react-select
  const customStyles: StylesConfig<DistrictOption, false> = {
    control: (base, state) => ({
      ...base,
      minHeight: height,
      height: height,
      fontSize: fontSize,
      backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc',
      borderColor: error
        ? '#ef4444'
        : state.isFocused
          ? '#0f172a'
          : '#cbd5e1',
      borderRadius: 6,
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #0f172a'
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : state.isFocused ? '#0f172a' : '#94a3b8',
      },
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      opacity: state.isDisabled ? 0.5 : 1,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
      height: height - 2,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: '#0f172a',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#0f172a',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      padding: '0 8px',
      color: '#94a3b8',
      '&:hover': {
        color: '#64748b',
      },
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
      transition: 'transform 0.2s ease',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      marginTop: 4,
      borderRadius: 6,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      maxHeight: 240,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: fontSize,
      padding: '8px 12px',
      borderRadius: 4,
      cursor: 'pointer',
      backgroundColor: state.isSelected
        ? '#f1f5f9'
        : state.isFocused
          ? '#f8fafc'
          : 'transparent',
      color: '#0f172a',
      fontWeight: state.isSelected ? 500 : 400,
      '&:active': {
        backgroundColor: '#e2e8f0',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: fontSize,
      color: '#64748b',
    }),
  };

  // If no district data and custom allowed, show simple input
  if (showAsInput) {
    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md px-3 outline-none transition-all duration-200',
            'bg-slate-50 border border-slate-300',
            'text-slate-900',
            'hover:border-slate-400',
            'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
            'placeholder:text-slate-400',
            size === 'sm' && 'h-8 text-sm',
            size === 'md' && 'h-10 text-sm',
            size === 'lg' && 'h-12 text-base',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100'
          )}
        />
        {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className={cn('relative', fullWidth && 'w-full', className)}>
      <Select<DistrictOption, false>
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={!resolvedCityCode ? 'Önce il seçiniz' : placeholder}
        isDisabled={isDisabled}
        isClearable
        isSearchable
        styles={customStyles}
        noOptionsMessage={() => 'Sonuç bulunamadı'}
        loadingMessage={() => 'Yükleniyor...'}
        classNamePrefix="district-select"
        menuPlacement="auto"
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      />
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default DistrictSelect;
