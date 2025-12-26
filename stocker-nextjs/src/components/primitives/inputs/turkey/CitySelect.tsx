'use client';

/**
 * =====================================
 * TURKEY CITY SELECT COMPONENT
 * =====================================
 *
 * Searchable city (il) select with Turkey's 81 provinces.
 * Uses react-select for Select2-like experience.
 */

import React, { useMemo } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { cn } from '@/lib/cn';
import { TURKEY_CITIES, type City } from './data/cities';

export interface CityOption {
  value: string;
  label: string;
  city: City;
}

export interface CitySelectProps {
  /** Selected city (name or code based on valueType) */
  value: string | null;
  /** Change handler - returns name or code based on valueType */
  onChange: (value: string | null, city: City | null) => void;
  /** What to use as value - 'name' for city name, 'code' for plate code */
  valueType?: 'name' | 'code';
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
  /** Show plate code */
  showPlateCode?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeConfig = {
  sm: { height: 32, fontSize: 14 },
  md: { height: 40, fontSize: 14 },
  lg: { height: 48, fontSize: 16 },
};

export function CitySelect({
  value,
  onChange,
  valueType = 'name',
  placeholder = 'İl seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  showPlateCode = false,
  className,
}: CitySelectProps) {
  // Convert cities to react-select options
  const options: CityOption[] = useMemo(
    () =>
      TURKEY_CITIES.map((city) => ({
        value: valueType === 'code' ? city.code : city.name,
        label: showPlateCode ? `${city.code} - ${city.name}` : city.name,
        city,
      })),
    [valueType, showPlateCode]
  );

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  const handleChange = (option: SingleValue<CityOption>) => {
    if (option) {
      onChange(option.value, option.city);
    } else {
      onChange(null, null);
    }
  };

  const { height, fontSize } = sizeConfig[size];

  // Custom styles for react-select
  const customStyles: StylesConfig<CityOption, false> = {
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

  return (
    <div className={cn('relative', fullWidth && 'w-full', className)}>
      <Select<CityOption, false>
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable
        styles={customStyles}
        noOptionsMessage={() => 'Sonuç bulunamadı'}
        loadingMessage={() => 'Yükleniyor...'}
        classNamePrefix="city-select"
        menuPlacement="auto"
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
      />
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default CitySelect;
